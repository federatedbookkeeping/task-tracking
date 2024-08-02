# Federated Task Tracking

[![Join the chat at https://gitter.im/federatedbookkeeping/task-tracking](https://badges.gitter.im/federatedbookkeeping/task-tracking.svg)](https://gitter.im/federatedbookkeeping/task-tracking?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Applications and data are usually tightly coupled: the format, structure, and meaning of data are almost inseparable from the application generating and using them, hindering data portability between disparate applications. Sharing data between applications entails mastering complex and proprietary APIs or export formats, and transforming output data into the necessary structure and meaning for use elsewhere.  These are time-consuming and error-prone things to do.

Federation is a way of linking different systems together so they are 'connected, but sovereign', and so users can share data between them. The precursor [Federated Timesheets project](https://github.com/federatedbookkeeping/timesheets) successfully pioneered this approach for time-tracking data, bringing together [WikiSuite](https://wikisuite.org/Software), [timeld](https://github.com/m-ld/timeld), and [Prejournal](https://prejournal.org/) such that timesheet data entered into one are easily made available in others.

Federated Task-Tracking builds on that foundation, with a more generalised approach applicable to a broader range of real-world scenarios, including live collaborative editing of latency-critical data shared between the systems involved.

## Introduction
The intention of data federation is to free up information from the silos of proprietary software.  Commercial Software as a Service providers store and manage the information they bring in and generate on their users' behalf.  This makes it much harder for users to share that information with others, since SaaS providers are reluctant to facilitate it.  This is either because they are benefiting commercially from aggregating the data for analysis and machine learning, or because they are concerned about customer churn - or both.  Shareholders in SaaS companies demand growth in revenues and profits, which means that losing customers is bad for business, and so providers often go out of their way to make this difficult.  

This conflicts with the desire of their customers to be able to use their data in the way they see fit, in software tools of their choosing, which means being able to move their data between systems.  Data federation seeks to provide a technical mechanism to address this misalignment of interests.

## Use Cases
There are many different scenarios making federation useful.  The categories below aim to capture these, together with some real-world examples.

### Collaborate on the Same Data in Different Instances of the Same Application
<details>
Several companies jointly delivering a project that have all standardised on the same application will need to share data between their instances of the application, and all edit the data too.  Providers of SaaS-delivered instances _may_ make that available as a feature between different tenants, but this is not widespread.  It is even less common for software vendors to make data shareable between on-premises and SaaS deployments.

Federating these instances makes it possible to share data between them in a read-write fashion.

#### Real-world Example
This project includes an implementation of federation between two different instances of the Tiki issue-tracker.  See [here](./Milestone%202/2a%20-%20Requirements%20Analysis/Live%20Tiki%20Data%20-%20User%20Stories.md) (specifically _Context 2 - Multiple Tiki instances_) for details.
</details>

### Collaborate on the Same Data in Different Applications
<details>
This is the most likely scenario, with multiple companies jointly delivering a project using their own preferred applications for managing shared project data.  Sometimes SaaS providers will make connectors available to their competitors' software, but since this runs contrary to their commercial interests, these are not often effective or well-maintained.  Third-party integration tools can be helpful to achieve collaborative data-sharing, although this does entail a cost (usually licensing).

Federation can achieve the same goal, although the approach very much depends on how much influence or control there is over the systems involved.

#### Real-world Example
The exemplar implementation in this project federates Tiki Tracker with GitHub, using [BridgeBot](https://github.com/federatedbookkeeping/bridgeBot) as a proxy for the latter.  See the [Accessing Federation Demos](./docs/demo-instructions.md) for details of how this is set up.
</details>

### Use Case Variants - Asynchronous vs. Real-time Collaboration
<details>
Each of the above categories of use case sits on a spectrum of how immediate and synchronous the collaboration needs to be.  The most common variant of these cases is asynchronous, in which changes made in one instance of an application are propagated to other instances once complete.  However, there is also a real-time variant, in which changes are streamed between instances and visible in them as they happen.  This may even require multiple users to edit the same data in different application instances simultaneously.
</details>

### Conflict Management
<details>
Wherever it is possible to make changes to the same data in multiple places, conflicts are likely to occur.  There are many different ways of handling these, and the project examines this [here](./Milestone%202/2a%20-%20Requirements%20Analysis/Tiki_requirements.md).
</details>


## How to Federate Applications
See the [practical guide](./docs/federation-guide.md) to learn how to do this.

## Original Project Plan and Structure
For details of the project's original plan and structure, see the [NGI Assure proposal](./ngi-assure-application.md).
