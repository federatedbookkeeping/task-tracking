# Comparative Approaches to Federation
There have been several federation initiatives over the years tackling particular domains and classes of problem.  This Federated Task-tracking project examines issue-tracking as an exemplar for the more general considerations of data federation and live information sharing.  Unlike some of the projects listed below, it does not represent a full-blown formal protocol specification, but rather a higher-level conceptual guide to approaching federation, with practical guidance drawn from the implementations it has encompassed.  A future project may expand upon that, incorporating complementary efforts in related projects.

## Data Transfer Initiative
The [Data Transfer Initiative](https://dtinit.org/) (DTI) addresses the problem of social media data portability.  Its commonality with Federated Task-tracking is the liberation of personal data from proprietary management. 

## Remote Storage
Philosophically very closely aligned with Federated Task-tracking, this project defines a [specification](https://github.com/remotestorage/spec) and a [protocol](https://remotestorage.io/protocol/) for a data storage abstraction for apps to use, providing developers with a solution to certain classes of data storage problem, and giving users freedom to choose where the data they generate and use in those apps physically reside. 

## ForgeFed
[ForgeFed](https://forgefed.org/spec/) is a project of particular note, focussing on the specific information subdomain of source code forges, in the same vein as this project does with task-tracking.

## WS-Federation
The [Web Services Federation Language](http://docs.oasis-open.org/wsfed/federation/v1.2/os/ws-federation-1.2-spec-os.html) standard went to significant lengths to standardise the federation of different security realms for systems using SOAP Web Services.  Whilst a great deal of thought and care was clearly put into it, the standard has not seen wide adoption, and has been superseded by OAuth 2.0 and OpenID Connect.