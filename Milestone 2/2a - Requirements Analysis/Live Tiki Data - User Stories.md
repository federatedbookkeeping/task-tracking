# Milestone 2: Live Tiki Data: User Stories

_Initially captured 2023-01-30 by @peeja; updated following analysis call 2023-02-07 by @mcalligator._

## Context 1 - single Tiki instance

This context was considered less immediately useful as a requirements starting point; attention is now on [Context 2 - two separate Tiki instances](#context-2---multiple-tiki-instances), Use Case A.

Two or more people are using the same Tiki Tracker instance and desire tighter in-band collaboration within Tiki itself.  The user stories identified consider collaborative editing of Tracker Items in particular.

### User Story 1

The Tiki participant says, “I need to edit a tracker item, but someone else is already editing it, so I want to be able to edit at the same time as someone else.”

* Intentional case: people geographically separated using the same Tiki instance need to edit the same Tracker item collaboratively.
* Incidental case: people from different departments have different reasons to edit, and happen to try at the same time.
* The software shouldn’t block you from doing the obvious thing at the obvious time
* Two things to solve for:
    * Editing separate fields (easy to merge)
    * Editing the same field (trickier to merge)
* Acceptance Criteria: _Verify that…_
    * I can change a ticket as normal:
        * Alice clicks “Edit”
        * Alice sees the same values of the ticket’s fields as in non-edit view
        * Alice changes a field
        * Alice clicks “Save”
        * Alice see that the value has changed in the non-edit view
    * I can see when another user opens a ticket for edit:
        * Alice clicks “Edit”
        * Alice sees the same values of the ticket’s fields as in non-edit view
        * Bob opens the same ticket read-only
        * Bob sees that Alice already has the ticket open for edit
        * Alice sees that Bob has opened the ticket read-only
        * Alice changes a field
        * Bob sees the new value Alice has set
        * Alice clicks “Save”
        * Bob sees that Alice has saved the ticket with its new value
    * I can edit a ticket while another user has it in edit mode:
        * Alice clicks “Edit”
        * Alice sees the same values of the ticket’s fields as in non-edit view
        * Bob clicks “Edit”
        * Bob sees the same values of the ticket’s fields as in non-edit view
        * Bob sees that Alice already has the ticket open for edit
        * Alice sees that Bob has now opened the ticket for edit
        * Bob changes a field
        * Bob clicks “Save”
        * Bob sees that the value has changed in the non-edit view
        * Alice sees that Bob has saved the ticket with its new value
    * I can see and save another user’s unsaved changes:
        * Alice clicks “Edit”
        * Alice sees the same values of the ticket’s fields as in the non-edit view
        * Bob clicks “Edit”
        * Bob sees that Alice already has the ticket open for edit
        * Bob sees the same values of the ticket’s fields as in non-edit view
        * Alice sees that Bob has now opened the ticket for edit
        * Bob selects a field with a view to changing its value
        * Alice sees the field Bob has selected
        * Bob changes a field
        * Alice sees the new value Bob has set
        * Alice clicks “Save”
        * Alice sees that the value has changed in the non-edit view
        * Bob sees that Alice has saved the ticket with its new value
    * Two users can edit different fields concurrently:
        * Alice clicks “Edit”
        * Alice sees the same values of the ticket’s fields as in non-edit view
        * Alice selects a field with a view to changing its value
        * Bob clicks “Edit”
        * Bob sees that Alice already has the ticket open for edit
        * Bob sees the current values of the ticket’s fields
        * Bob sees which field Alice has selected
        * Bob selects a field with a view to changing its value
        * Alice sees the field Bob has selected
        * Bob changes the field
        * Alice sees the new value Bob has set
        * Alice changes a field
        * Bob sees the new value Alice has set
        * Bob clicks “Save”
        * Bob sees that both values have changed in the non-edit view
        * Alice sees that Bob has saved the ticket with its new values
* Locking behaviour when Tracker Item opened for Edit:
    * New m-ld domain created (if not already in existence)
    * Optimistic lock created on database record
    * Tracker Item considered to be in “perpetual draft”
    * When Item Saved, incremental development stages are:
        * Initial: updates written immediately to database with no conflict checks (MVP)
        * Next: Tiki server code checks database for published Item changes via different path, exposes conflicts before save possible
        * Final: all code paths write to database via m-ld and source of truth for each Tracker Item becomes its m-ld domain
* Questions:
    * What happens if two users edit the _same_ field concurrently?  Options:
        * Immediately: Do nothing, and blow away some data.
            * Resolution: last user to unselect the field has their value preserved
        * Near future:
            * “Lock” the field if it’s being edited?
            * Offer a diff for the user to resolve?
        * Far future: Enhance [m-ld to support text field merging](https://github.com/m-ld/m-ld-spec/issues/35) better (possibly embedding Yjs?)
    * What happens if the “published” version changes behind the draft’s back?
        * Is that possible/allowed?
        * Is the record locked while there’s a draft?
            * Is the draft perpetual? Is the lock perpetual?
                * Idea: Optimistic lock

What is “Live”?

* In the single instance case, “Live” editing can be:
    * One person editing entire ticket, everyone sees updates live
    * One person editing a particular field, others may be editing other fields, but see updates to that field live
    * Multiple writers edit a single field collaboratively

## Context 2 - Multiple Tiki instances

Two or more people are using Trackers on _different_ Tiki instances and wish for better in-band collaboration with one another through Tiki.

### Use Case A - Development Tasks in multiple environments{#use-case-a-development-tasks-in-multiple-environments}

Evoludata has an internal Tiki instance used for Task-Tracking.  There is an associated public-facing instance in which Tasks are tracked as well.  Public Tasks (which are common to both) are synchronised periodically.  Additionally, there is another Tiki instance used by an Evoludata customer, with matching Tasks.  Information relating to common tasks is also synchronised from time to time.  These common tasks are ultimately synchronised to GitLab - although it is acceptable for this to remain asynchronous, rather than live (hence this will not be considered further in Milestone 2).  Task synchronisation between the three Tiki instances needs to be improved, which would be achieved by making this live.

#### Participants
Evoludata User (Alice)
Public User (Bob)
Customer User (Charlotte)

#### User Story 1
The Evoludata User says, “I need changes that I make to Public Tasks in the Evoludata instance to appear immediately in the corresponding Tasks in the Public Tiki instance, so that I can collaborate effectively on fulfilling them”.

* This is an intentional collaboration: the users working on the Tasks are setting out to collaborate, rather than randomly opening the same task at the same time.
* The set of fields used in each instance overlaps, but they are not identical.
* Acceptance criteria…_verify that_:
    * The Public User sees changes made by the Evoludata User in the Form view immediately:
        * Alice opens a Task for Edit in the Form view.
        * Bob views a Task for Read in the Form view.
        * Alice changes the value of a field in the Form view.
        * Alice clicks “Save”.
        * Bob sees the updated value.
    * The Public User sees changes made by the Evoludata User in the Tracker view immediately:
        * Alice opens a Task in the Tracker view.
        * Bob views a Task for Read in the Tracker view.
        * Alice changes the value of a field in the Tracker view and saves it.
        * Bob sees the updated value.
    * The Public User does not see changes made by the Evoludata User on non-Public Tasks:
        * Alice opens a Task for Edit in any view.
        * Alice changes the value of a field.
        * Alice clicks “Save”.
        * Bob searches for the Task in the Public instance, but does not find it.

#### User Story 2
The Public User says, “I need changes that I make to Public Tasks to appear immediately in the corresponding Tasks in the Evoludata Tiki instance, so that I can collaborate effectively on fulfilling them”.

* Acceptance criteria…_verify that_:
    * The Evoludata User sees changes made by the Public User in the Form view immediately:
        * Bob opens a Task for Edit in the Form view.
        * Alice views a Task for Read in the Form view.
        * Bob changes the value of a field in the Form view.
        * Bob clicks “Save”.
        * Alice sees the updated value.
    * The Evoludata User sees changes made by the Public User in the Tracker view immediately:
        * Bob opens a Task in the Tracker view.
        * Alice views a Task for Read in the Tracker view.
        * Bob changes the value of a field in the Tracker view and saves it.
        * Alice sees the updated value.

#### User Story 3
The Evoludata User says, “I need Tasks that I create in the Evoludata instance that are set to Public to appear immediately in the Public Tiki instance, so that I can collaborate effectively on fulfilling them”.

* Acceptance criteria…_verify that_:
    * The Public User sees Tasks created by the Evoludata User in the Form view immediately:
        * Alice creates a new Task in the Form view.
        * Alice enters values for all mandatory fields in the Form view.
        * Alice sets the Task’s visibility to “Public”.
        * Alice clicks “Save”.
        * Bob sees the new Public Task.
    * The Public User sees Tasks created by the Evoludata User in the Tracker view immediately:
        * Alice creates a new Task in the Tracker view.
        * Alice enters values for all mandatory fields in the Tracker view.
        * Alice sets the Task’s visibility to “Public”.
        * Alice clicks “Save”.
        * Bob sees the new Public Task.
    * The Public User does not see new non-Public Tasks created by the Evoludata User:
        * Alice creates a new Task for Edit in any view.
        * Alice enters values for all mandatory fields in the Tracker view.
        * Alice clicks “Save”.
        * Bob searches for the Task in the Public instance, but does not find it.

#### User Story 4
The Public User says, “I need Tasks that I create in the Public instance to appear immediately in the Evoludata Tiki instance, so that I can collaborate effectively on fulfilling them”.

* Acceptance criteria…_verify that_:
    * The Evoludata User sees Tasks created by the Public User in the Form view immediately:
        * Bob creates a new Task in the Form view.
        * Bob enters values for all mandatory fields in the Form view.
        * Bob clicks “Save”.
        * Alice sees the new Public Task.
    * The Evoludata User sees Tasks created by the Public User in the Tracker view immediately:
        * Bob creates a new Task in the Tracker view.
        * Bob enters values for all mandatory fields in the Tracker view.
        * Bob clicks “Save”.
        * Alice sees the new Public Task.

### Use Case B - Service Incident
A customer organisation has contracted a service provider to provide managed services to them.  The service provider has engaged a subcontractor for certain specialised services.  All three organisations use Tiki to capture issues, including both service incidents and operational tasks, as well as to track time.  The three Tiki instances are federated such that data are exchanged between them.  How this happens differs by use case.

When a service incident occurs, the customer organisation raises a ticket in their own Tiki instance and reports it to the prime service provider.  In the event that services the subcontractor is responsible for are implicated in the incident, the incident is reported to that organisation as well.

##### User Story 1
A Tiki user in the customer organisation (CO) says, “I have raised an incident in my Tiki instance related to the service my managed service provider (MSP) manages, and need that ticket synchronised with the MSP’s Tiki instance, so that we can collaborate effectively on resolving it.”

* This user story involves the Tiki instances of just these two organisations, not that of the subcontractor.
* A new ticket in the CO instance should be synchronised with the MSP instance only If the incident involves services managed by the MSP.
* Acceptance Criteria: _verify that_…
    * A ticket raised in the CO Tiki instance relating to the MSP’s service automatically appears in the MSP instance:
        * Alice creates a new ticket in the CO Tiki instance relating to an incident involving the MSP service and clicks “Save”
        * Bob can see a corresponding new ticket appear in the MSP instance within [x] timescale, containing the information in the CO ticket.
        * Bob can see the identifier for the ticket in the CO Tiki instance in the ticket in the MSP instance.
        * Alice can see the identifier for the ticket created in MSP Tiki instance in the ticket in the CO instance.
    * A ticket raised in the customer organisation’s Tiki instance _not_ relating to the MSP’s service is not replicated to the MSP’s instance:
        * Alice creates a new ticket relating to an incident _not_ involving the MSP service and clicks “Save”.
        * No corresponding ticket is created in the MSP Tiki instance
    * Changes to the ticket in the CO instance are replicated asynchronously to the MSP instance:
        * Alice clicks “Edit” on an existing ticket in the CO instance.
        * Alice changes information in one or more fields.
        * Alice clicks “Save”.
        * Bob is able to see the changes in the ticket in the MSP instance.
        * Bob clicks “Edit” on that ticket.
        * Bob changes information in one or more fields.
        * Bob clicks “Save”.
        * Alice is able to see the changes in the ticket in the CO instance.

##### User Story 2
A Tiki user in the Managed Service Provider (MSP) says, “My organisation has experienced a service incident and raised an ticket in our Tiki instance related to the Customer Organisation (CO) we serve; I need that ticket synchronised with the CO’s Tiki instance, so that we can collaborate effectively on resolving it.”

* This user story also involves the Tiki instances of just these two organisations, not that of the subcontractor.
* A new ticket in the MSP instance should be synchronised with the CO instance only if the incident involves a service used by the CO.
* Acceptance Criteria: _verify that_…
    * A ticket raised in the MSP Tiki instance relating to a service the CO uses automatically appears in the CO instance:
        * Bob creates a new ticket in the MSP Tiki instance relating to an incident involving the MSP service and clicks “Save”
        * Alice can see a corresponding new ticket appear in the CO instance within [x] timescale, containing the information in the MSP ticket.
        * Alice can see the identifier for the ticket in the MSP Tiki instance in the ticket in the CO instance.
        * Bob can see the identifier for the ticket created in CO Tiki instance in the ticket in the MSP instance.
    * A ticket raised in the MSP Tiki instance _not_ relating to a service used by the CO is not replicated to the CO instance:
        * Bob creates a new ticket relating to an incident involving a service _not_ used by the CO and clicks “Save”.
        * No corresponding ticket is created in the CO Tiki instance.

##### User Story 3
A Tiki user in the Subcontractor Organisation (SO) says, “My organisation has experienced a service incident and raised an ticket in our Tiki instance related to the Managed Service Provider (MSP) we serve; I need that ticket synchronised with the upstream MSP Tiki instance, so that we can collaborate effectively on resolving it.”

* This user story involves the Tiki instances of just these two organisations, not that of the CO.
* A new ticket in the SO instance should be synchronised with the MSP instance only if the incident involves a service used by the MSP.
* Acceptance Criteria: _verify that_…
    * A ticket raised in the SOTiki instance relating to a service the MSP contracts in automatically appears in the MSP instance:
        * Charlotte creates a new ticket in the SO Tiki instance relating to an incident involving the SO service and clicks “Save”
        * Bob can see a corresponding new ticket appear in the MSP instance within [x] timescale, containing the information in the SO ticket.
        * Charlotte can see the identifier for the ticket in the MSP Tiki instance in the ticket in the SO instance.
        * Bob can see the identifier for the ticket created in SO Tiki instance in the ticket in the MSP instance.
    * A ticket raised in the SO Tiki instance _not_ relating to a service used by the MSP is not replicated to the MSP instance:
        * Charlotte creates a new ticket relating to an incident involving a service _not_ used by the MSP and clicks “Save”.
        * No corresponding ticket is created in the MSP Tiki instance.
    * …(presence of user editing same ticket in other system is visible - to be elaborated)
    * Changes to a particular subset of the fields in the ticket in the SO instance are replicated live to the MSP instance:
        * Bob clicks “Edit” in his client on the MSP instance.
        * Bob sees the same values of the ticket’s fields as in non-edit view.
        * Charlotte clicks “Edit” in her client on the SO instance.
        * Charlotte sees the same values of the ticket’s fields as in non-edit view.
        * Charlotte sees that Bob already has the ticket open for edit.
        * Bob sees that Charlotte has now opened the ticket for edit.
        * Charlotte changes a field.
        * Charlotte clicks “Save”.
        * Charlotte sees that the value has changed in the non-edit view.
        * Bob sees that Charlotte has saved the ticket with its new value.
    * Changes to a particular subset of the fields in the ticket in the MSP instance are replicated live to the SO instance:
        * Charlotte clicks “Edit” in her client on the SO instance.
        * Charlotte sees the same values of the ticket’s fields as in non-edit view.
        * Bob clicks “Edit” in his client on the MSP instance.
        * Bob sees the same values of the ticket’s fields as in non-edit view.
        * Bob sees that Charlotte already has the ticket open for edit.
        * Charlotte sees that Bob has now opened the ticket for edit.
        * Bob changes a field.
        * Bob clicks “Save”.
        * Bob sees that the value has changed in the non-edit view.
        * Charlotte sees that Bob has saved the ticket with its new value.
    * Changes to the the remaining fields in the ticket in the SO instance are replicated asynchronously to the MSP instance:
        * Charlotte clicks “Edit” on an existing ticket in the SO instance.
        * Charlotte changes information in one or more fields.
        * Charlotte clicks “Save”.
        * Bob is able to see the changes in the ticket in the MSP instance.
        * Bob clicks “Edit” on that ticket.
        * Bob changes information in one or more fields.
        * Bob clicks “Save”.
        * Charlotte is able to see the changes in the ticket in the SO instance.
     
#### Use Case B - Match independently-raised tickets{#use-case-b-match-independently-raised-tickets}

##### User Story 1
* A participant in the customer organisation (CO) says, “I have a ticket in my Tiki instance related to the service my managed service provider (MSP) manages, and it corresponds to a ticket the MSP has independently raised in their Tiki instance, and I need to keep them in sync, so I want changes to automatically sync between them.”
* To be elaborated…

# User Experience

## Tenets
**Preserve user intentions** - the design of the software should reflect what users are actually trying to achieve through their actions.
**Maintain subtle user visibility of collaboration** - the software should provide unintrusive indicators of collaboration on shared information.
**Align collaboration indicators with trust levels** - the greater the trust between collaborators, the more real-time information should be shared.

# Considerations
Ensure user stories:
* Articulate any required changes to the current user experience in the software
* Describe system behaviour when a Tracker Item is opened for read
* Describe system behaviour when a Tracker Item is opened for write
* Describe system locking behaviour when a Tracker Item is opened for write
* Describe system behaviour when a Tracker Item is saved by the original user
* Describe system behaviour when a Tracker Item is saved by a different user
