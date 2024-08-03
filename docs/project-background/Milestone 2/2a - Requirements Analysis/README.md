# background

The artefacts in this directory chart the development of our thinking and analysis as the project progressed. The dates of original sharing or publication are as follows:

* [Original architecture mind-map](./img/architecture.svg) *(2022-10-04)*
* [Live Tiki Data - User Stories](./Live%20Tiki%20Data%20-%20User%20Stories.md) *(2023-01-30)*
* [Partial Representations in m-ld](Partial%20Representations%20in%20m-ld.md) *(2023-02-08)*
* [Milestone 2 Conversation 2023-02-09](./Conversation%202023-02-09.md) *(2023-02-09)*
* [Would Milestone 2 work better without m-ld?](./Would%20Milestone%202%20work%20better%20without%20m-ld.md) *(2023-02-14)*

# summary

When we began Milestone 2, we had reason to believe that **m-ld** [[1]](http://m-ld.org/) was a perfect fit for Tiki's goals: Tiki wanted to add "liveness", and **m-ld** excels at being "live" [[2]](/ngi-assure-application.md#milestone-2-collaborative-tiki). As we dug into details, however, we discovered that there are many kinds of "liveness", and what Tiki was most interested in didn't really mesh with **m-ld**'s approach.

## live data sharing between client devices

Our initial designs focused on a shared editing experience for multiple users [[3]](./Live%20Tiki%20Data%20-%20User%20Stories.md#user-story-1). We knew that the most important use case was multiple individuals in a synchronous meeting, like a planning or standup meeting, editing the same ticket at the same time. We knew that users currently often solve this problem by copying values out of Tiki and into Google Docs, editing it there, and then copying it back.

Thus it seemed natural that some kind of shared draft would be most useful to users. It seemed that **m-ld** would be a perfect fit for this design. Whereas currently only one user can open a Tracker Item at a time, locking out other users, under this model several users could open the same Tracker Item and share a view of draft data within a **m-ld** domain. This is analogous to copying the values into Google Docs, but seamless. Changes on one user's Tiki screen would immediately propagate to other users editing at the same time. When the group is finished editing, one user can press a Save button (just as in Tiki today) and commit those changes to the "actual" database, making the changes visible to non-editing viewers. This is analogous to copying the values back *from* Google Docs into Tiki, but again, is seamless and integrated into the application.

With this as a starting point, we began having deeper conversations about the users' true needs [[4]](./Would%20Milestone%202%20work%20better%20without%20m-ld.md#part-a-server-to-client). What we discovered was that these pre-arranged collective editing sessions were not necessarily the most crucial user story, and the drastically different security models cause major engineering challenges (more on this later) . 

Instead, it may well be more valuable to have an easier way to edit a *single field* and, on completion, save that change directly to the "actual" database. That is, there is (in our current understanding) no strong need for a shared draft incorporating multiple fields. The "liveness" we arrived at is then composed of two things:

1. **An better experience editing a single field in a Tracker Item.** This is possible today, but is actually implemented by locking the entire Tracker Item while the field is edited. Two people cannot currently edit separate Tracker Item fields at the same time, though there is no intrinsic reason this should be the case.
2. **Immediate updates to values on the screen.** That is, when a value is shown on a user's screen, and then that value is changed in the database by another user (or the same user in a different window), the value should update with the new value. We determined that, while **m-ld** *could* be a part of this mechanism, it wouldn't provide much value, and in fact would probably be more complex than other solutions. In particular, because **m-ld** would not be the actual database, the actual database would still have to notify **m-ld** of changes. We therefore decided that Tiki would be best served by implementing data pushing within its own code directly.

During this analysis we also considered the security requirements of Tiki, in which individual users have fine-grained _read_ access control to specific fields [[5]](Partial%20Representations%20in%20m-ld.md). **m-ld** supports fine-grained _write_ access controls, but it always replicates datasets (or "domains") in full to every peer. While complex combinations of field read-access rights in a shared editing session are rare, they are theoretically possible. Such combinations would require **m-ld** features that do not yet exist: either to allow for _partial_ replication of domains, or to provide encryption schemes that prevent unauthorised reading of data when replicated.

One remaining aspect of "liveness" is not addressed here: **realtime multiplayer editing within a single field** (such as a large description field). This is of particular interest to Tiki, where it could also be applied to the wiki page editor. Currently, **m-ld** does not support operations within a single value. That is, every update to a value is represented as deleting the entire value and inserting an entire new one. However, supporting operations *within* values is of interest to **m-ld** and in its near-future plans [[6]](https://github.com/m-ld/m-ld-spec/issues/35). When that becomes possible, it may be that **m-ld** is more useful to Tiki. Until then, we've decided that using **m-ld** here would be the wrong tool for the job, and result in more complexity than the value is worth.

## live data sharing between separate Tiki deployments

Our second considered set of use-cases involved live data-sharing between different instances of the Tiki tracker tool [[7]](Live%20Tiki%20Data%20-%20User%20Stories.md#context-2---multiple-tiki-instances). Here, we learned that the desired synchronisation scheme was actually one-way, at least for each field, and usually for a whole ticket. In this understanding, federating this data is much simpler: one Tiki instance owns the field entirely and simply must inform other interested instances.

Similarly to the argument above, while each change is preferably as 'live' as possible, having **m-ld** as an intermediary would only add complexity. Since the owner instance's database is the source of truth, every change has to transition through all other state-management locations. With **m-ld**, there are two **m-ld** clones in addition to the target Tiki instance. While these automatically synchronise between each other, adapter code needs to be written to synchronise with the Tiki databases.

For this scenario, we propose a simpler architecture with a refresh-signal pattern [[8]](Would%20Milestone%202%20work%20better%20without%20m-ld.md#part-b-server-to-server), not involving **m-ld**.

The above lead to the [Tiki realtime technical requirements](Tiki_requirements.md) document on the tiki side.

---

<br>[1] http://m-ld.org/
<br>[2] [/ngi-assure-application.md §milestone-2-collaborative-tiki](/ngi-assure-application.md#milestone-2-collaborative-tiki)
<br>[3] [Live Tiki Data - User Stories §Context 1 - single Tiki instance](Live%20Tiki%20Data%20-%20User%20Stories.md#context-1---single-tiki-instance)
<br>[4] [Would Milestone 2 work better without m-ld? §Part (a): server-to-client](./Would%20Milestone%202%20work%20better%20without%20m-ld.md#part-a-server-to-client)
<br>[5] [Partial Representations in m-ld](Partial%20Representations%20in%20m-ld.md)
<br>[6] [https://github.com/m-ld/m-ld-spec/issues/35: Text merge support](https://github.com/m-ld/m-ld-spec/issues/35)
<br>[7] [Live Tiki Data - User Stories §Context 2 - Multiple Tiki instances](Live%20Tiki%20Data%20-%20User%20Stories.md#context-2---multiple-tiki-instances)
<br>[8] [Would Milestone 2 work better without m-ld? §Part (b): server-to-server](./Would%20Milestone%202%20work%20better%20without%20m-ld.md#part-b-server-to-server)
