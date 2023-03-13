# Would Milestone 2 work better without m-ld?

_Feb 14, 2023_

On Feb 10, 2023 and Feb 13, 2023, George, Angus, and Petra talked through what we learned last week about Milestone 2 of the Federated Task-Tracking with Live Data project and Tiki’s needs from our conversations with Marc, Victor, and Benoît. What we discovered was that m-ld, the software package, may not actually be the best fit for (most of) what we’re trying to accomplish.

**_Milestone 2 (original): Enhance Tiki to Incorporate live data sharing, initially of bug-tracking core information:_**

1. _between client devices connecting to one Tiki deployment; and_
2. _between separate deployments of Tiki (system-system collaboration)_

## tl;dr
m-ld may not align well with what Tiki wants to implement in this project, which is the first part of a journey to enhance its live-collaboration features. The mismatch may cause more pain than benefit, in particular as a result of duplicating data between m-ld’s domains and the existing database. Instead, we propose architectures which **keep the data in the existing database** and implement only the desired “liveness”, using architecture patterns that allow for the use of m-ld in future phases.

## What is m-ld for?
m-ld’s strength is keeping multiple copies of the same dataset up to date and in sync:

* Multiple peers can make concurrent changes and still converge on a single consistent state.
* Conflicts can often be handled automatically, and when they can’t, can be gracefully presented to and handled by the users themselves.
* Clones can go offline, continue to accept edits, and resynchronize after rejoining the network.

The main “cost” for this is keeping track of which operations are built on which. m-ld does this by modeling its data as a CRDT. If m-ld “owns” the data it moves around, this cost is trivial, and an implementation detail. But synchronizing this data between m-ld and an external database, which doesn’t know about m-ld’s internal model, is harder. It can certainly work, but it’s not worth it unless there’s something to be gained. We’ve become concerned that there isn’t much to gain.

## Part (a): server-to-client
We learned some things last week which have made us think that m-ld may not offer as much as we hoped:

1. **Tiki offers per-field read security.** A given user may only be allowed to read a subset of the fields in a Tracker. Thus, we cannot sync the entire state of a Tracker Item to every user’s client, and must implement read security within or on top of m-ld.
2. **Tiki wants to commit each field change directly to the database.** In our initial planning sessions, we discussed m-ld as the source of truth for a _draft_ of the Tracker Item being edited. When an edit session begins, we’d move a copy of the Item into m-ld, and each editing user would then clone it. All users would see the same draft with changes updating in real time. At the end of the edit session, the users would commit the draft to the Tiki database, and the m-ld domain would be removed. As discussed last week, this use case is not very interesting to Tiki and EvoluData, and there’s no reason not to persist each field change _immediately_ to the database proper.
3. **Tiki is quite interested in _single-field_ multi-user drafting.** As a separate (but related) use case, it’s valuable to have multiple users collaborate on a single large field, such as a Description field in a Tracker Item, or the entire page in the wiki. This would operate like a mini embedded Google Docs editor—in fact, today people often implement this for themselves by copying the value to Google Docs to edit collaboratively and then copying it back at the end. The intermediate states as people type would be purely draft: they would not be immediately stored in the database or visible to people not editing the Item, but they would be shared among the editors. At the end of the edit session, the users would save the field value to the database.

All of this can be accomplished with m-ld, but given Tiki’s immediate needs and m-ld’s current state of development, the costs may outweigh the benefits right now:

1. **Tiki would have to keep m-ld’s authorization information in sync with its own.** m-ld has multiple read security solutions in mind, but to use them would require the application to sync authorization information with m-ld’s domain.
2. **Tiki would have to keep m-ld’s data in sync with its own.** Since we’re no longer talking about keeping a draft copy in m-ld but the latest saved version, we have to duplicate the data between the database and m-ld. As with authorization information, this is cumbersome. Notably, since the database does not track its data within m-ld’s CRDT, syncing data between the two has all the difficulty and conflict-prone-ness of traditional two-way syncing.
3. **m-ld does not yet support single-field multi-user editing optimally.** Currently, m-ld’s CRDT does not accommodate operations which modify parts of a single value; instead, the entire text value would be replaced on every edit, breaking live collaboration. However, this support is on the roadmap, and m-ld would be interested in spending this effort on that.

Thus, our recommendation is that we don’t use m-ld for most server-to-client communication. Instead, the architecture we recommend is:

* In the UI, each Item field can be edited and submitted independently.
* When a field’s value changes in the database, it publishes an event to a PubSub system within Tiki (in PHP).
* When an Item is on screen, the page subscribes to a PubSub topic for each visible field and listens for updated values for that field. The PubSub system runs over Websockets.
* The pessimistic locking for Items is removed, and either replaced with optimistic locking (in which conflicts are given to the user to handle) or no locking at all (in which the last person to submit a value wins). The theory here is that the locking mechanism is less necessary when each field can be submitted separately and the values become visible immediately.
* Later (out of the scope of this project), some field types could implement a live edit session, making conflicts even rarer. This could be implemented with m-ld or with another tool, depending on details we haven’t discussed yet.

## Part (b): server-to-server
We also learned more about the server-to-server case: **Inter-Tiki fields should belong to a single “host” instance, and should be read-only on “foreign” instances.** We had envisioned all the complexity of multiple Tiki instances managing concurrent edits to the same field. In our new understanding, federating this data is much simpler: one Tiki instance owns the field entirely and simply must inform other interested instances.

Again, this can be accomplished with m-ld, but once again: **Tiki would have to keep m-ld’s data in sync with its own.** As in the server-to-client case, all of the data would have to be synchronized to and kept in a m-ld domain. In this case, the changes will always come from the “host” instance, so there’s really no substantial value gained from using m-ld.

Thus, we recommend:
* Tiki A marks certain Fields of a Tracker A as "exported".
* Tiki B "subscribes" to any of those Fields by adding them to its own Tracker B.
    * The Field configuration has a reference to Tracker A’s URL.
* Each Item in Tracker B can be associated with an Item in Tracker A.
    * This might be a new Field which stores the id or URL of an item from Tracker A.
* When an Item in Tracker B is identified with an Item in Tracker A:
    * Tiki B “subscribes” to the Item at Tracker A, either by opening a persistent socket connection or by registering a webhook.
    * Tiki B fetches the Item from Tracker A and populates the subscribed fields.
* When one of those Fields in the Item in Tracker A changes value, it publishes a notification. Tracker B sees the notification and fetches the latest values again.

Note:
* It might make sense to send the actual data in the message instead, but the refresh-signal pattern here is more resilient to things arriving out of order. You can't end up with the wrong data if you always end up just fetching whatever is latest.
* The PubSub mechanism could be implemented by running a separate service (such as RabbitMQ or MQTT), or by implementing it within Tiki's code and database as either a socket connection or a webhook, whichever is most effective for Tiki's architecture.