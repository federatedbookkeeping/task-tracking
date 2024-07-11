# Draft Federation Protocol Specification

## Introduction
The intention of data federation is to free up information from the silos of proprietary software.  In an increasingly SaaS-orientated age, in which applications provided as an internet service store and manage the information they bring in and generate on their users' behalf, the ability to share that information with others is constrained by the reluctance of those providers to facilitate that sharing.  This is because they regard it as a commercial risk of customer churn, which they need to minimise so they can continue to grow their revenues in line with shareholder requirements.  The question of data ownership is complex, and outside this specification's scope, but customers of SaaS providers nevertheless desire to be able to use their data in the way they see fit, in software tools of their choosing, and this means being able to move their data between systems.  Data federation seeks to provide a technical mechanism to address this misalignment of interests.

There are several promising initiatives in this sphere, among which [ForgeFed](https://forgefed.org/spec/) is a project of particular note, and to a lesser extent the [Data Transfer Initiative](https://dtinit.org/) (DTI).  Those each focus on a specific information subdomain - source code forges and social media respectively.  The Federated Task-Tracking project takes a somewhat different approach - whilst it also addresses some of the same concerns as ForgeFed (namely issue-tracking), it also considers the general case of data federation, and live information sharing.

This project has built on the foundations laid in its predecessor [Federated Timesheets](https://github.com/federatedbookkeeping/timesheets).  That did not attempt to define any kind of protocol around federation, but rather to demonstrate the concept for a very specific subdomain.

A full-blown formal protocol specification is also beyond the scope of this project, since it forms a relatively small part of that scope, so the content of this specification is high-level and conceptual.  A future project may expand upon this, taking into account complementary efforts in related projects.

## Definitions
### Federation
A group of systems which share data in peer to-peer transmissions where information flows from a node to its neighbours, while ensuring each individual node maintains
data sovereignty, or the ability to choose the access rights of other nodes in federation, thus being able to arbitrarily veto external accesses and modifications to its own data.

It is in essence a loose collection of systems that choose to support only those data formats and interaction protocols of systems that they wish to connect to, for their own benefit.
### Home System
Data are assumed to originate in one system, and be propagated to others via federation.  The system in which they originate is referred to as the Home System.
### Multi-Homed Data
This refers to data that are shared through federation, and that can be edited in more than system (either live or asynchronously).
### Live Data
This either means data propagated to other systems for edit upon being committed to the data store of their Home System, or data that can be edited in real-time in multiple applications.
### Identifier
A series of digits and/or characters that is used to uniquely identify an entity within one domain or system.
### Identity
Also called a Security Principal, this is the digital representation of a person, application service, or system that requires certain privileges for operating on data, with associated constraints on those privileges and audit of their use.

## Goals
These may be summed up in the pithy phrase 'Connected, but sovereign', referring to applications participating in a data-sharing federation.
### Data Sovereignty
This means being able to use data in a system of one's choosing, rather than solely in the one(s) where they were created.  Historically, this was primarily through export as a one-way migration, but expectations have latterly grown to being able to do so more interactively, maintaining the same data in different systems for various purposes.

### Enable More Seamless Information Sharing
One of those purposes is to be able to share information of common interest between different people using software tools of their choice, either within the same organisation, or across multiple organisations.  Federation needs to enable that.

### Enable More Effective Collaboration
Whilst the majority of use cases pertaining to information sharing are asynchronous in nature, a subset benefit from real-time sharing.  These fall into the category of collaborative editing, where information needs to be shared real-time.  This has also been considered within this specification.

## Trade-offs and Constraints
The first and third goals above are in tension, and give rise to certain trade-offs being necessary in the protocol design.
### System Sovereignty vs. Real-Time Sharing
One implication of _system_ sovereignty (by contrast with data sovereignty) is that any demands upon it for change in order to interact with other systems should be minimised - or even zero.  Live information sharing, however, requires much closer and deeper integration between participating applications, which requires substantive changes to each to enable.  This applies not only technically (where modifications are needed to support real-time data exchange) but also philosophically, in that those applications need to cede control of the metadata describing the data they wish to share to an agreed common structure.  See the m-ld article [Sustaining Truth across Integrated Applications - converge physical sources into one logical source](https://m-ld.org/news/) for a more in-depth treatment of this topic.

There is hence a continuum between maximal system sovereignty on one hand (i.e. where they admit of no change to accommodate other federation members' needs), and full real-time data sharing at the other, with degrees of flexibility inbetween.

The impact of this trade-off is that multiple variants of the protocol therefore apply, depending on where on that continuum the participating systems sit.

![System Sovereignty Continuum](./system-sovereignty-continuum.png)

### Non-duplication of Data
The propagation of data between Participating Systems must not result in the same data being stored by any one of them; each system (or Proxy) receiving data from another must verify that the data in question have not previousy been received.

## Core Protocol Logic
### Actors
The diagram below depicts the main Actors comprising a federation in this iteration of the protocol.

![Federation Actors](./federation-actors.png)

#### Participating Systems
These are the applications actually participating in the federation, in whatever capacity.  These may be maximally sovereign, or more flexible, catering for different schemata in other systems.
#### Proxies
For maximally sovereign Participating Systems, proxies read and write data on their behalf from and to other systems.
#### Agents
These software components in flexible Participating Systems or Proxies have the following responsibilities:
 - Detect data changes from elsewhere;
 - Determine whether they need to be passed on to other systems in the federation; and if so
 - Initiate that task.
### High-Level Logical Operations
#### Read
Almost self-expanatory in nature, this requests data from another system in a federation - either directly or via a proxy.
#### Write
Similarly, this writes data to another participating system, either directly or via a proxy.
#### Trigger
Akin to an event in a Pub-Sub architecture, a Trigger detects a change to data relevant to the federation, prompting a particular Agent to carry out an Operation.
#### Propagation Check
Specific to federation, this Operation occurs in an Agent immediately in response to a Trigger, and determines whether the change detected is new, or has been received previously from another Particpating System.
### Propagation Mechanisms
#### Polling
Participating Systems (or their Proxies) may poll others for changes in data.
#### Publish-Subscribe
Participating Systems (or their Proxies) may publish changes to data on a message queue for others subscribing to that queue to collect.
#### Webhooks
The federation connectivity between Participating Systems may permit the configuration of WebHooks - essentially callback URLs - for other systems to use to retrieve changed data upon being notified of their existence (via a notification-only variant of the above Publish-Subscribe mechanism).
## Schemata and Identifiers
### Schema Agreement
Participating Systems (or their Proxies) need to be able to agree on the schema used for the relevant domain of shared information.  This may be accomplished in one of the two following ways, depending on where they sit on the System Sovereignty Continuum:
 - Metadata mapping; or
 - Shared schema in a CRDT domain representing common metadata
### Entity Identifiers
Each entity requires an LRI (Local Resource Identifier) which is mapped to its ORI (Original Resource Identifier), the identifier assigned to the entity in its Home System.

This may be accomplished in one of the two following ways, depending on the Systems' position on the Sovereignty Continuum:
- Add metadata to suitable fields in each Participating System, showing equivalent records in other systems; or
- Uniquely identify entities with URIs in the m-ld domain used for live data sharing.
## Security
### Authentication and Authorization
Participating Systems or their Proxies use and cache the credentials required to access other Participating Systems.  These can take any of the follosing forms, depending on what those systems require:
- Username and password (with corresponding permissions set in the target system);
- JSON Web Tokens (with authorization scopes set in the JWT);
- X.509 client certificates;
- Federated identities, if these are common to more than one of the Participating Systems.
### Encryption
#### Data at Rest
This is beyond this specification's scope.
#### Data in Flight
To ensure the confidentiality (and hence privacy) of the information exchanged, this specification strongly recommends that network traffic be encrypted using X.509 server certificates.