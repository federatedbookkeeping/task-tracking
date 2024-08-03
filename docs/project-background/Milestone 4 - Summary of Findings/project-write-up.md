# Project Write-up
## Executive Summary
The Federated Task-Tracking project may be regarded as a partial success, with the majority of the milestones achieved either fully or in part.  The exceptions relate to the use of m-ld in Tiki, the extension of timeld to incorporate task-tracking, and a full protocol specification for federation (using task-tracking as a foundation).  It did achieve the federation of multiple sovereign systems using the principles established as groundwork for that protocol, and two-way exchange of data between them.

## Milestone 1: Theoretical Groundwork and requirements analysis
### 1a: Theoretical foundation of federation
This was completed and written up [here](https://github.com/federatedbookkeeping/research/tree/main/Article).
### 1b: Federation protocol specification
The project has built on the foundations laid in its predecessor [Federated Timesheets](https://github.com/federatedbookkeeping/timesheets), which did not attempt to define any kind of protocol around federation, but rather to demonstrate the concept for a very specific subdomain.

The original approach to federation laid out in that project was re-examined in the light of the more complex data structures inherent in the task-tracking domain, and formalised to a certain extent in iterative fashion alongside the experimental implementation forming Milestone 2.

However, it was not possible to fulfil the original intention of creating a formal specification: with the benefit of hindsight, that was too ambitious a goal for a project of this nature.

Nevertheless, the analysis and discussion relating to this milestone brought to light the following useful insights:
#### Varying motivations for System Sovereignty
The analysis of data sovereignty necessarily examined *system* sovereignty as well, and it emerged that there are two main motivations for system maintainers desiring that sovereignty, which vary primarily with power dynamics.

The first motivation was discussed in the Introduction to the protocol specification, that of SaaS providers being reluctant to facilitate easy data export or federation, on commercial risk grounds.  Providers with a lot of power tend to establish de facto standards for data structures and ontologies (implicit or explicit), and then tend to dominate those domains.  Whilst this has the benefit of minimising fragmentation in their domains of operation (which also militates against straightforward data sharing), it also increasingly locks customers in to those providers, constraining choice, and bringing in the risk of monopolies with unconstrained costs, reduced innovation, and other ills.  System federation, which enables data federation, is an antidote to this.

The second motivation is for organisations at the opposite end of the power scale - small maintainers of niche software.  Having much less in the way of research and development resources, they need to focus these on innovation, rather than on having to cater for the idiosyncracies of other systems that might benefit from the data available in them.

#### Trade-off: Sovereignty against Ease of Federation
The less flexible a Participating System, the more difficult it is to federate it with others.  The reasons for this are obvious: most systems use different schemata (and ontologies, whether explicit or not) to represent data in the domain they have in common, and thus the data in question need to be transformed when exchanged, through metadata mapping, format changes, etc.

For federation to be possible among sovereign systems, either some compromise of that sovereignty is necessary (to adapt to the needs of other Participating Systems), or additional federation components are required, acting as Proxies for maximally sovereign systems, writing data to and from them on their behalf.

One of the systems used in the project, Tiki, reduced the impact of this trade-off considerably, spanning a good deal of the System Sovereignty Continuum.  It is able to remain sovereign in the sense of maintaining its own schemata and data handling operations, whilst accommodating the data structures of other systems through configuration, rather than changes to its source code.  This introduced a second trade-off, however.

#### Trade-off: Flexibility against Maintainability
Whilst a system with a flexible schema brings great convenience to federation for the reasons described, it has drawbacks in the realm of maintainability.  A schema that is easily changed through configuration is far more likely to *be* changed, and this has an impact on data stored - not only in that system itself, but also on others in the federation.  Data need to be associated with a particular schema version, which makes comparing and aggregating them for reporting purposes much more difficult.

#### Potential Future Work
The research and experimentation undertaken in this project have signposted to additional areas of exploration that would improve the robustness and utility of this approach to federation.  One area of further work that could form part of a follow-on project is as follows.

To improve the above trade-off of Flexibility against Maintainability, and to cater for site-specific and project-specific templates governing free-text data (such as issue descriptions), it would be helpful to expand on the semantic layer of federation.  This would enable arbitrary extension of schema definitions to support greater flexibility whilst retaining control of the metadata.  One benefit would be to support increasingly granular analytics of federated data.  An example of where this would be useful is where issue templates in issue-trackers generally unstructured text, so it would be useful to be able to incorporate these into a more formal structure with semantic definition of the sub-fields in question, and their relationships with other elements of the schema.
### 1c: Investigate feasibility of supporting live multi-homed data among federated systems without CRDT
This investigation was conducted, concluding that for a looser definition of 'live', this would be feasible.  That definition represented a point of disagreement between m-ld and the other consortium members.

For m-ld, 'live' refers not only to data automatically propagated between systems, but also:
 - Displayed automatically without user intervention being required; and
 - With conflicts from simultaneous changes in multiple source systems automatically identified (and ideally resolved).

For the remainder of the consortium, 'live' has the less stringent meaning of being automatically replicated between Participating Systems, with conflicts either overwriting earlier instances of the same data, or being rejected.
## Milestone 2: Collaborative Tiki
The detailed write-up for this milestone may be found in the relevant [README](https://github.com/federatedbookkeeping/task-tracking/blob/main/Milestone%202/2a%20-%20Requirements%20Analysis/README.md) file.
## Milestone 3: Federation of Issue-trackers
This was partially achieved, enhancing Tiki to federate with other Participating Systems to exchange task-tracking and comment data.  This was demonstrated with BridgeBot (Prejournal's replacement - see **3b** below for details).  
### 3a: Extend federation of Tiki with Prejournal and timeld
This was mostly achieved, between Tiki and BridgeBot (proxying GitHub).  Expansion of the existing federation with timeld to exchange task-tracking data was omitted due to development capacity constraints on George Svarovsky's part.  

One useful insight from this part of the project was that it was especially important to be able to map identifiers pertaining to the same records to their counterparts in other Participating Systems.
### 3b: Extend federation of Prejournal with multi-instance Tiki and timeld
This was also achieved in part, extending **3a** to federating multiple instances of both GitHub (via BridgeBot) and Tiki.  BridgeBot was built to replace Prejournal, to proxy other fully sovereign systems.  An existing project, Cambria, was initially considered, but it lacks the ability to track and map identifiers between systems (in addition to metadata fields), so it was decided to create a new solution to address that additional requirement.

This milestone also omitted timeld, for the same reason as in **3a**.
### 3c: Integrate federation of consortium issue-trackers with ConnectYourBooks
This milestone encompassed the bulk of the effort involved in connecting to GitHub, in conjunction with **3b**.
### 3d: Federate SolidOS, Google Calendar, Google Sheets
This was not achieved in the time available, but may still be pursued as a curiosity after the project concludes.
### 3e: Implement live task-tracking data sync between federated systems
This milestone sought to demonstrate in practice the findings from **1c**.  It delivered two-way data exchange within the federation established in **3b**, showing that issues and comments on those issues created in one GitHub repo could be replicated in another repo, and in two disparate instances of Tiki with different schemata.  This was achieved using two different application-layer transports: REST API request/response, and WebHooks.

One notable achievement of this sub-milestone was being able to map disparate identifiers referring to the same data in different Participating Systems, a key characteristic of the federation protocol.  This was accomplished by adding hidden reference metadata to the corresponding record in each of the other systems to appropriate text fields in them.
## Milestone 4: Documentation & Project Management
This summary write-up, together with other contributions to this repository comprise the documentation aspect of this Milestone.  Project management was concentrated in the early stages of the collaboration, co-ordinating the calls, discussions, requirements analysis, software development and testing, and other activities in that phase.  The project has since been generally characterised by asynchronous contributions by the various individuals involved, due to competing priorities arising from other commitments, and so the project management required dropped significantly.