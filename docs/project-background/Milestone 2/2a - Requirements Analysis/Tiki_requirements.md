
# Tiki realtime technical requirements

## Context and previous state

Tiki has been in development for over two decades.  From a mostly PostBack architecture system, it is slowly transitioning to a modern frontend architecture.  The trackers, which are the core of tiki haven't been transitioned yet, which gives a lot of implementation flexibility.

However, some overarching architectural requirements considerations must be met:

Single source of truth, which is the tiki mysql database, for which the REST API is a proxy.  Because other interfaces ultimately interact with this data model, as a last resort, any conflict must be able to be resolved in favour of the database.  Stated differently, a non realtime aware interaction must be guaranteed that the content of write to the API will never be lost or silently overwritten.

Data the user does not have read access to must not leak in the API.

### What we mean by realtime

It turns out that because of the breath of tiki features users think of different, only partially overlapping, features when they hear realtime collaboration in the context of tiki trackers:

1. Seeing what other people change (across tiki instances or on the same instance) without reloading the page, and being able to edit in this context.  This is what we are focussing on in this current project.
1. Collaborative drafting.  That is:  for several users to get together for a realtime collaboration session on a tracker item, and only have their (collective) changes visible by other users once they are done editing.  While a very interesting use case, it is just a standard draft/publish interaction.  It is not the focus of this current effort.  It is to be noted that since tracker are extremely highly relational structures with dynamic permissions, this would actually be very hard problem to implement collective changesets for tracker items.
1. Realtime collaborative text editing (google docs or etherpad syle).  While conceptually no different than any other change, in practice both the tooling and interface expectations to implement this are wildly different.

## Technical epics

For developer collaboration is makes more sense to group work by technical epics and tasks, rather than user stories.

1. Data safety/reliable change notification.
    1. Tiki field values are ultimately stored as a simple (itemId, fieldId, value) structure.   Make sure written tracker field values are validated before writing.  This will require refactoring so each format can be validated by it's respective class before write, and that EVERY part of tiki goes through that code, not just the public APIs.
    1. Make event notifications available from a uniform API.  Several tables are used in tiki to store data containing last version, history and action logs.  Those are:
        * tiki_actionlog (Currently adds one item for each change, this will not scale)
        * tiki_tracker_item (maintains a last modified date that may not be up to date in all cases)
        * tiki_tracker_item_fields (does NOT currently maintain a last modified date)
        * tiki_tracker_item_field_logs (some duplication with tiki_actionlog)
        * tiki_history (only used by pages)
        * tiki_pages_changes (used by QuantifyLib, not relevant for realtime sync)

        There is a normalization effort to be done, but this is out of scope for this project.  However while tiki_actionlog and tiki_tracker_item_field_logs currently have all the information required to implement this.  HOWEVER, in practice they cannot be used unmodified.  Two issues must be managed:

        1. Performance.  To implement these user stories, upon every field read and writes,  the last modified date or revision number of every field must be sent to every active subscriber.  The database isn't currently optimized for this access pattern.
        1. Data size management (also related to performance).  For some clients these are audit logs.  While the realtime access patterns will foster more frequent modifications, it's unlikely to cause an order of magnitude increase.  But maintaining performance, these logs may require more sophisticated management to retain their usefulness (audit, change history).  They cannot be simply pruned (looses audit capability) nor collapse all updated by a user into one if there are no intervening changes by another user (looses usefulness as history, the "significant" changes may be between two trivial ones).  It may be that optimizing queries for this new usage is enough for now, but the implementation must be such that it can be fixed in the future without API rework.
  
1. Implement JS realtime widgets for the different tracker field types.

1. Solve the UX issues for the real-time collaborative editing of tracker items in a single tiki use case:  
    1. Immediate update of individual fields on page, while making visible that someone else just edited them (and who).
    1. The current model is to lock the whole tracker item at the application level, but that is already only a soft lock. Extend the interface to warn the user that someone else is editing the same tracker item, and clear the warning when that user disconnected or didn't edit the tracker item for a long time.  This implies having a reliable modification date computed.

1. Real-time synchronization between Tiki trackers, phase 1.  Bounding the problem, that’s a one way per field sync, implemented as a new tracker field type:  remote tracker.  Phase 1 is a read-only implementation,  with an interface element that hyperlinks the remote instance for editing.  But in practice it requires the technical work of the previous effort to be viable.  The field uses the same API as the frontend above, with as stored user token.

1. External systems (namely GitLab).  GitLab provides webhooks, so we’d get near real-time updates that internal Tiki data need to be updated.  But if Tiki does updates it’s local data in reaction, the previous work on Milestone 1 should provide real-time update in every interface that supports it, without additional work on the sync side.
