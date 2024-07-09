_Summary: It looks like m-ld is a good fit for server-client, but less useful server-server._

Captured by @peeja

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