# Minutes

## Present

Petra, Benoit, George, Angus

## Technical Notes
_Captured by @peeja_

**Summary: It looks like m-ld is a good fit for server-client, but less useful server-server.**

Here's what we're thinking:

Consider two Tiki instances, Tiki A and Tiki B.

* Tiki A "exports" certain Fields of a Tracker A.
* Tiki B "subscribes" to any of those Fields by adding them to its own Tracker B.
* Tracker B has a Field (or some way of associating a value with an Item) which can be assigned the identity (perhaps a URL?) of a Field in Item in Tracker A.
* When an Item in Tracker B has such a pointer to an Item in Tracker A, the "subscribed" fields in that Item are populated, read-only, with the corresponding values of the Item in Tracker A.
* When one of those Fields in the Item in Tracker A changes value, that change is immediately reflected in Tracker B's corresponding Item.

Some notes:

* The synchronization is solely one-way, so B can bring itself up to date at any time by fetching the latest values from A.

We propose the following solution:

* Tiki A provides a PubSub system in which Tiki B can dynamically subscribe to a topic—in this case, corresponding to a Tracker Item.
* When a value changes in Tracker A's Item, Tiki A posts a message to the topic. The message contains no data—it's just a signal.
* When Tiki B reads this message, it fetches the latest values for the entire Item from Tiki A.

Some notes:

* It might make sense to send the actual data in the message instead, but the refresh-signal pattern here is more resilient to things arriving out of order. You can't end up with the wrong data if you always end up just fetching whatever is latest.
* The PubSub mechanism could be implemented by running a separate service (such as RabbitMQ or MQTT), or by implementing it within Tiki's code and database, whichever is most effective for Tiki's architecture.
* Because m-ld isn't involved in this leg, we propose that EvoluData works on this part.
* Since we'll already be serializing Tracker Items into JSON for the server-client leg, we propose that we use the same serialization for this leg.

---

* Alice clicks Edit on a Tracker Item.
* Alice's client requests a m-ld connection from Tiki.
* Tiki asks the Gateway to create a new domain for the Item.
* Tiki loads all of the Item data into that domain.
* Tiki returns the info required to connect to the domain to Alice's client.
* Alice's client clones the domain.
* The client displays an Edit form to Alice, backed with data from the clone.
* Alice changes a value.
* The update is transmitted to the Gateway clone.
* The Gateway informs Tiki of the change, including that Alice made it.
* Tiki commits that change to the database.

Some notes:

* If Bob edits at the same time, he joins the same domain and edits the same data.
* If there is an error committing the change from the Gateway to the database, Tiki informs the Gateway, putting data into the domain that the client(s?) can display to the user(s?) to explain what happened and give them a way to proceed.
* **Important:** Read permissions are implemented *client-side*. Data is transmitted to clients of people who shouldn't see it, and hidden from the UI. This is a security compromise to implement a non-production-ready proof-of-concept.
    * We have (at least) two options for implementing production-ready read security, but they require changes will be out of the scope of this POC. They are both things m-ld is interested in implementing anyhow:
        * We can filter the data sent to the client to only include the data that user should see.
        * We can encrypt the data so that only people holding appropriate keys can read it. This results in more data on the client, but fits m-lds architecture better, and we expect it to be a reasonable amount of data given the relatively small scope of a single Tracker Item.

---

## Proceedings
_Captured by @angusmca_

BG: m-ld has come at a good time - Tiki isn’t yet an SPA, so the proj hasn’t yet committed to a particular approach.  Lots of work to do for the proj that will go beyond budget of grant, but well worth while.

PJ: m-ld’s use of LD opens up opportunities for integrating with a lot of other different data types.

BG: hasn’t worked closely on graph data projects, but is overseeing some.  Doesn’t yet see the benefits, but doesn’t see it as a problem.

PJ: Sense is that to do integration with Tiki, need lots of API calls, whereas with a SPARQL endpoint, much easier to write a single query over the data.  For such a data-driven application, could be really useful.

BG: only a computer science researcher would say that a graph interface is better to use than SQL 🙂.  Tiki (esp. plugins) depends heavily on full-text databases, so a SPARQL interface as the middle man doesn’t really make sense.  Also don’t want to expose the raw data, even over SPARQL, since they need to be mutated.  Vision: server would be connected to m-ld and receive change events.

BG: there isn’t really an API for Tiki yet - haven’t committed to a way of doing it.

PJ: could be useful to have a RESTful API returning linked data in JSON format, which could help with interoperability.  Would also enable clients to use the data easily.

BG: several years since last touched linked data code, but transactions and schema are painful, as he recalls.  But for this proj, that doesn’t matter so much, since it’s only Tiki involved.

PJ: What about Milestone 3 of this project?

BG: Tiki plug-ins are still internal.  Tiki does want to integrate with other things, albeit with different transaction models.  No expectation of a specific data format.  RDF was the next big thing 20 years ago, and he suspects that there will be a lot more work to represent data as RDF rather than something simpler.  But for Tiki, m-ld is interesting, since it could have a big impact.  Integrating with other systems is more about reacting to inbound data in events - 2-way master-slave replication.

&lt;gap>…

BG: what if a client’s write to its clone is rejected on the server’s clone for some reason?

PJ: a m-ld client represents state - only 2 scenarios for database write to fail: 1) unexpected system failure, and 2) data integrity - m-ld and database have conflicting models.

Ideally, all rules replicated in m-ld, but a lot to ask, so need to resolve that in some way.

GS: 2 baseline things to emphasise: 1) m-ld is about state, so if the server clone receives something it doesn’t like, the application will never see the bad state (all sorts of things to discuss in that scenario), and 2) if application receives something it doesn’t like, it can revert that operation via its clone, so the database doesn’t need to be updated with that information.  Now how do you know which operation caused that?  Need to tell other clones (esp. One that made the change originally).  How to do that?  One way is to add something to m-ld to enable that functionality.  Relatively easy to do, since every update has security principal attached, so user who made the offending change is identifiable.  Alternative approach is an out-of-band notification (e.g. via push notifications to user in question).

BG: Second possibility wouldn’t work in Tiki case; need code to deal with it.  Two possibilities: 1) similar to the first described above, and 2) metadata to be sent in addition to actual data - such as telling consumer whether they are allowed to write to the data being sent.  E.g. letting them know about an erroneous write.  Difficulty is that the metadata would be sent to everyone on all clones.

PJ: Since it relates to one user, should be possible to replicate across the domain, since it applies only to one user.

GS: the domain embeds the rules in it, like a schema is embedded in a database.  Access control would govern which rules people would see.  m-ld reads the rules and uses them as data arrive.

BG: Taking it from the other side, from a conceptual perspective, what’s needed on the server?  Bounds the problem, since impossible for server to compute all the rules for every user in every circumstance.  Instead, would lazily compute them for each message.  Perhaps separate channel.

GS: No, not separate channel, since security principals embedded within domain as well.  Hence only the users looking at the domain need see the domain data.  Depends on a) principal identity, and b) domain permissions.

BG: Can see how that works when clone complete, but if clone contains only a subset of data, would be very hard.

GS: Definitely proposing a server-side clone.  For user to get page for Edit mode, server would notify local clone and add user permissions to domain representing the data for the page.

PJ: pessimistic by default; server explicitly grants access to the clone for the user to interact with it.

BG: A client opens a domain (whatever its scope, e.g. a ticket or a set of tickets).  Some other client inserts a new ticket, possibly in a different filtered view.  First client may or may not have view access.  If it does, then server receives write from that client, and has to maintain exhaustive list of the _tickets_ in that Tracker, but hopefully not all the data.  It would lazily fill the information in other domains involved.  Not realistic to fill all possible domains with all IDs.  Can m-ld’s future partial clone tolerate the server not knowing whether that triple exists or not?

GS: in the future, there would be one domain, i.e. the whole of the current Tiki, on disk (like a database in that respect).  A user has a subdomain of containing a subset of the tickets, and a new ticket could be added to that subdomain.  For today, if we decide on the boundaries, we can make progress.  E.g. we could decide to have one domain per ticket, recognising the limitations.

PJ: Could we roll back to serialisation?  Ultimately, everythin is serialised, since there’s a database.  But that’s not actually true - there are 2, 3 or 4 databases, since we’re operating across Tikis.  Also we don’t have a close world view of all the tickets.  We also haven’t totally defined what the interaction would be between these different Tiki instances.  There is also not exact replication of data between them, since they have different Tracker definitions.

BG: only one serialisation that’s authoritative, since the fields in question are read-only for every other instance.

PJ: what about people writing to tickets in other Tiki instances?

BG: those tickets are local to those Tiki instances - e.g. the Public Tiki instance is authoritative, and it replicates data to the Evoludata instance.  That instance has additional, local fields that are are specific to that instance.

PJ: how are tickets related between instances?

BG: they’re manually mapped - although that could be automated.  Server connects as a remote client and retrieves data.

BG: Doing it this way means not having to share user identities.

PJ: reason why this hasn’t been done yet is because it’s unrealistically scoped?  Is it actually valuable to do this?

BG: It’s 95% of the value.  Having live write from another instance would be nice, but writing data in an unknown context would be problematic.

PJ: It’s not clear from the milestone conversations that that’s where the value is.

BG: key nugget from this conversation is that if we bound to one domain to ticket, m-ld thinks it’s possible to achieve what we need to.  From Evoludata’s PoV, it means dozens of domain needs to be instantiated - is this normal?

GS: Yes, intended to be normal.

BG: We won’t know there’s a new ticket created by someone else - we can live with that - which means a server can lazily create domains that people request.

PJ: Cost of creating is orders of magnitude less than the data.

BG: Does external clone API enable client to request domains of servers it doesn’t know about?

PJ: You’d do that via the existing connection to the server, which would then reply, having created the domain for the data in question.

BG: example is for tickets 1, 2 and 3 to be requested, when the server doesn’t yet know about them.

PJ: you’d ask the application server to create the domains for you.

GS: We recommend not using the m-ld clone API on the client side for the domains; rather, have the client request the data from the server via the existing interaction, which then creates the domains in question, lazily, and returns the domain information to the clients.

GS: You’d avoid creating one domain per user, otherwise you’d have difficulty sharing them.

BG: With partial domains, you’d have them shareable among multiple users then.  Server would still have to get the subdomains for a specific user, lazily.

GS: That would happen server-side.

PJ: In response to a client-originated request.

BG: Has to be an out-of-band communication with the client to say which subdomain is associated with the data it can see.
