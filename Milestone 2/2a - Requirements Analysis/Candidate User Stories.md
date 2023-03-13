# Candidate User Stories for Milestone 2

Following the detailed analysis described elsewhere in this directory, the user stories below have been identified for concrete implementation.

## Personae
### Public Tiki User
Alice - a person adding or editing tasks in the public-facing instance of Tiki

### Evoludata Tiki User
Bob - an employee or associate of Evoludata adding or editing tasks in the internal instance of Tiki

### Customer Tiki User
Claire - an employee or associate of one of Evoludata's customers adding or editing tasks in their own internal instance of Tiki

## User Stories
### User Story 1 - Issue propagation from Public to Internal instance
"As a Public Tiki User, I can add a new Tracker Item to the Public Tiki and be confident that a corresponding Tracker Item will be automatically created in the Evoludata Tiki instance."

- Represents asynchronous, yet automated synchronisation
- Pre-requisites:
    - The Tracker in the Public Tiki instance must be associated with its equivalent in the internal instance.
- Acceptance criteria - verify that:
    - A corresponding new Tracker Item is automatically created in the Evoludata Tiki instance after the Item in the Public Tiki instance is created:
        - Alice clicks 'Create Item'.
        - Alice enters data into all mandatory fields of the Item.
        - Alice saves the Item.
        - Bob refreshes his Tracker.
        - Bob sees the new Item created by Alice.
        - Bob attempts to edit the Item's fields.
        - Bob's permissions enable him to change a subset of the Item's fields.
        - Bob's permissions prevent him from changing other fields in the Item.

    - Changes made to a Tracker Item in one Tiki instance appear in the other:
        - Alice attempts to edit the fields of a Tracker Item.
        - Alice's permissions enable her to change a subset of the Item's fields.
        - Alice's permissions prevent her from changing other fields in the Item.
        - Alice confirms that all changes to the Item have been saved.
        - Bob clicks 'Edit' on the corresponding Tracker Item in his instance.
        - Bob sees the changes that Alice made.
        - Bob updates fields in the Item and ensures they are saved.
        - Alice refreshes her Tracker and sees the changes that Bob made.
