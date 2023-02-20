# Project Details
* Thematic Call: NGI Assure
* Proposed Name: Federated Task-Tracking with Live Data
* Website / wiki: https://github.com/federatedbookkeeping/task-tracking
* Primary Contact: Victor

# Abstract
In the “Federated Timesheets” research project we learned a lot about how to federate sovereign systems into a network with rapid data portability. Three systems (WikiSuite, timeld, and Prejournal) were linked into a two-way sync network, and integrated with the APIs of existing time-tracking apps.

We will apply those learnings and ideas, as detailed in the ‘Technical Challenges’ section of this proposal. To bring the network closer to production deployment and sustainability, and make alpha testing with our own real data less cumbersome, we will add to the network time-tracking apps that we use ourselves.

Then, we will expand the scope of our data-sharing network from just time-tracking to issue-tracking as well - another type of machine-readable data that needs to be freed from silos! There, the data models will be more complex, and latency much more critical. This domain will also bring into play collaborative editing of information, not only in a single system, but also across systems.

And finally, we want to research further how transparency of data provenance can be ensured and reported to users and auditors.

# Relevant Previous Projects
The Federated Timesheets project funded by NGI Assure is a natural predecessor of the proposed project, involving most of the same people (Michiel de Jong, Victor Emanouilov, George Svarovsky, and Angus McAllister). We have built a federated "club" of systems able to communicate with each other transferring timesheet data. The relation to the current project is the plan to extend sharing capabilities to Issue or Bug Trackers involving external and well-known systems like Github, and also improve the liveness of the data. Federated Timesheets use import/export operations triggered manually or semi-automatically, whereas we want to be able to share these data in real-time - e.g. collaborative editing of an issue/bug entry in an issue tracker or automated update and merge of information when the same issue is tracked in multiple places. The Federated Timesheets project will also benefit from federating issue trackers, in that timesheet entries often need to be associated with an existing issue.

In the project "Securing Shared Decentralised Live Information with m-ld" (2021-02-035) the m-ld team have been researching modifications to the primitives of the m-ld core protocol to natively support strong assurance of data integrity and traceability. This has expanded our general approach to concurrency, which is 'live by default', with extensibility to integrate coordination - say, of security and schema changes. This relates closely to this project’s need for m-ld to cohabit with diverse systems and protocols, including the proposed federation protocol. We hope to learn a great deal further in this project, and also be able to prioritise concurrency model extensions in future.

In the Solid-Nextcloud project Michiel de Jong implemented the Solid specification including the (still experimental) Webhooks feature. This will be a crucial feature for the integration of Solid pods and Solid OS Issue Trackers into the federation.

# Budget
The budget is primarily for human labour to realise the project's goals.  The work will build on the foundations of the prior Federated Timesheets project, by establishing a federation involving several systems for issue-tracking (in addition to time-tracking), with the added capability of live data-sharing between a subset of those systems.

## Milestone 1
To underpin this, Milestone 1 will deliver the vital prerequisite work of thinking through the theoretical grounding of the federation, addressing the technical challenges captured below (including the implications for privacy and transparency), and specifying explicitly a follow-on iteration of the “federation protocol” described there.  Estimated effort: 210 hours (MdeJ: 112,5h, AGM: 75h, GS: 22,5h).

## Milestone 2
This involves the analysis and development work to incorporate live data-sharing capabilities into one of the tracking tools, comprising two parts.  The first is live data-sharing between clients of a single instance of that tool (such that data may be simultaneously edited by multiple users of that system, with conflicts elegantly resolved using conflict-free replicated data types), and the second is live data-sharing between different instances of the tool (including their clients; enabling data to be edited simultaneously by users of different instances).  Estimated effort: 270 hours (VE: 157,5h, GS: 112,5h).

## Milestone 3
This milestone runs in parallel with 2, and updates the federation, using the protocol established in Milestone 1, of the multiple task-tracking systems.  It also integrates additional third-party systems, both open- and closed-source, Prejournal, timeld, and Tiki (multiple instances), integrating with additional external systems GitHub, SolidOS, Google Calendar, and Google Sheets as a minimum, with a stretch goal of GitLab, Toggl, and InvoiceNinja if achievable within the budget.  This breaks down as follows:

### 3a
Apply updated federation protocol with additional capabilities to Tiki federation with Prejournal, timeld and additional Tiki instance.  Estimated effort: 37,5h (VE: 30h, GS: 7,5h)

### 3b
Apply updated federation protocol with additional capabilities to Prejournal federation with timeld and Tiki (multi-instance).  Estimated effort: 22,5h (MdeJ: 15h, GS: 7,5h)

### 3c
Integrate Federation with suitably popular third-party task-tracking systems (e.g. GitHub).  Estimated effort: 60h (MdeJ: 60h)

### 3d
Integrate other systems as appropriate; complete testing and trouble-shooting.  Estimated effort: 30h.

Total estimated effort: 150h (VE: 30h, MdeJ: 75h, GS: 15h, Testing & trouble-shooting: 30h).

## Milestone 4
This combines the accomplishments of the previous two milestones, by bringing together all of the systems into one federation, such that tracking data are shared both live (with multi-party edit) and conventionally (where data originating in one system propagate across all the others in the federation).  Estimated effort: 75h (VE: 37,5h, MdeJ: 37,5h)

## Milestone 5
Finally, this delivers the documentation of the project's findings, including a slide presentation describing the beneficial outcomes and their applicability not only to the participants of this collaboration, but any collective endeavour involving time- and issue-tracking.  Project management efforts, conducted throughout, are included under the banner of this milestone.  Estimated effort: 60h (AGM: 60h).

The hourly rate applicable is €65/h.
Total budget: €49 725

The project does not have other funding sources.

# Comparison
This project builds on  and extends the earlier NGI-Assure funded “Federated Timesheets” project. An analysis of historical efforts in the area of timesheet federation is provided there (https://github.com/federatedbookkeeping/timesheets/blob/main/ngi-assure-grant.md#compare-your-own-project-with-existing-or-historical-efforts-max-5000-characters).

For this project we investigated the existing landscape of federated issue tracker projects. We looked for existing systems that enable data exchange between issue trackers, and found one open source sync engine, “OctoSync” that syncs between GitHub and Jira. This may be worth contributing to as part of milestone 3, as there may be a role for an integration tool to abstract the third-party integrations. We have already contacted the author.

See https://github.com/federatedbookkeeping/timesheets/issues/58 for the full list, including closed-source solutions, and those that require the end-user to set up the synchronisation manually using a GUI for drag-and-drop and data transformation, or that only do unidirectional point-to-point integration.

# Technical Challenges
In the Federated Timesheets project we established desirable characteristics of "federation", as distinct from "integration" [1], and used these to propose and implement a means of federation that was practical for our exemplar systems to implement while continuing to have sovereign control over their own data and technology choices. In this project we will carry forward this balance of characteristics, as a more formalised "federation protocol", while addressing, theoretically and practically, both the main findings from the prior project and new challenges arising from the requirements of task tracking.

- Codification of the meaning of important entity classes (e.g. in Timesheets: system users, workers, timesheets, timesheet entries, projects, clients, providers, and systems), appears essential for integrity; but this is balanced against the expense of centrally authoring a comprehensive ontology [2].
- Ensuring that the identities of important entities are tracked through federation links, to prevent data duplication, while allowing for systems to use their choice of local identifiers.
- Controlling security of personal data across trust boundaries, with a verifiable & auditable trust model that allows for dynamic changes to the federation, allowing, for example, users to change their 'home system' [3]. This will also extend the prior research into the use of cryptographic signatures in the protocol [4].
- Assurance of data integrity in the face of sovereign systems' different concurrency models (including real-time user collaboration, see below), and also network latency and network failures – this may require the federation protocol to have concurrency-control features (e.g. if-match headers) [3].
- Allowance for conflict resolution in case of real-world disputes over federated data content.
- Scalability of the protocol in practice as the network grows – we propose to test this by scaling the number of participating system instances, rather than radically changing the number of different systems involved.
- Resilience of the protocol, for example to 'message storms' [5], in which messages are retransmitted repeatedly, or suddenly in response to a routing change; and to general message delivery failures.
- Efficiency of the protocol, to accommodate the additional liveness requirements of task-tracking, requiring preferably real-time updates across systems.
- Monitoring of the federation, not only for system administration and auditing purposes, but also for user feedback. For the latter we have the opportunity to offer a significant improvement over the status quo, in which users must manually trace problems and hold-ups across systems, even within the same enterprise [6].

In parallel, we will also prototype the use of a technology developed specifically for real-time user collaboration (m-ld), integrated into one of our systems, demonstrating an upgraded user experience both between users of the same system install but also across multiple differently-configured installations. An important challenge that we intend to address is how such a choice of higher-layer protocol cohabits with the general federation protocol, maintaining data integrity.

1. https://github.com/federatedbookkeeping/timesheets/wiki/Project-Write-up-and-Analysis#characteristics-of-federated-systems
2. https://github.com/federatedbookkeeping/timesheets/wiki/Project-Write-up-and-Analysis#understanding-metadata
3. https://github.com/federatedbookkeeping/timesheets/wiki/Project-Write-up-and-Analysis#impacts-of-data-retransmission-by-intermediate-systems
4. https://github.com/federatedbookkeeping/timesheets#milestone-6-digital-signatures
5. https://github.com/federatedbookkeeping/timesheets/issues/51
6. https://michielbdejong.com/blog/28.html

# Ecosystem
The project’s core ecosystem includes the three collaborating organisations m-ld, Ponder Source and EvoluData.  Ponder Source intends to use the resulting artefacts commercially in their ConnectYourBooks offering, and Evoludata will use the time-tracking integration in production, with a view to adopting the live data-sharing capabilities progressively for internal deployments, and ultimately client deployments, once sufficiently stable.

In addition, the project will also provide value for the Solid community, should the SolidOS issue tracker be integrated with the federation.  To publicise the project’s outcomes, we will engage directly with the Solid community via its public fora, and request the opportunity to present at Solid World.

More broadly, the project has the potential for positive impact on a much greater population of software engineers and the organisations they work for, not only by enabling issues tracked in siloed tools to be propagated to say, GitHub’s Issues feature, and vice versa, but also between currently siloed systems in separate collaborating organisations.  We see specific applications for this in and between organisations in multi-tier contracts to provide development and managed services, which are subject to SLAs, and which handle time-critical issues such as security vulnerabilities and breaches.  These issues need multiple individuals across organisations collaborating on them simultaneously to be resolved, and would benefit greatly from the live data-sharing this project will demonstrate.

We will engage more generally with this larger group of developers, software engineers, and software architects with the need for this technology through publication on our respective websites, relevant communities’ public-facing tools (e.g. Gitter, Discord, Slack, etc.), and speaking engagements at events where possible.
