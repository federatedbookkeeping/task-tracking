# Feasibility Study: Live multi-homed (task tracking) data without a CRDT

Report for NLnet request-for-payment for milestone 1c of the "Federated Task Tracking with Live Data" project

# CRDT, P4P and Local-Fist Research
During this research phase, which took roughly from summer 2023 to summer 2024, Michiel had long conversations with especially George about whether it would
even be possible to achieve live data
without use of a formal CRDT. Our first conclusion was that it would be practically impossible to link various CRDTs together if their merge algorithms
don't match. That was not even taking into account the existing of multiple database schemas. After a pointer from George, Michiel got in touch with Michael
Toomim and investigated [Braid](https://braid.org), which does claim that it can successfully bridge between Sync9 and DiamondTypes CRDTs. It also turned out that
the incompatibility between different CRDT algorithms mainly arises in maximum non-interleaving (formatted) text fields, they are probably more alike in their available
merge strategies in more structured data like counters and dictionaries.

After studying [more material on CRDT theory](https://github.com/federatedbookkeeping/research/issues/41), [experimenting with Braid](https://braid.org/meeting-86),
studying [an interesting article about schema change challenges](https://github.com/federatedbookkeeping/research/issues/42) and [contributing some documentation
to the Cambria Project](https://github.com/inkandswitch/cambria-project/pull/13), which keeps being mentioned as "the best we have" in terms of translating live
multi-homed data, our conclusion can be summarized as:

> It has never been done before, so we think we should definitely be able to do that.
>
> -- adapted from Pippi Longstocking ;)

It is worth noting that Cambria also has a [binding to Automerge](https://github.com/inkandswitch/cambria-automerge) so if we can use that then technically,
it would not be 'without a CRDT', but rather 'a translating CRDT'.

Michiel also investigated the signature chains (authentication and integrity), other patterns used in local-first and P4P protocols, and authorization flows for
what we might call 'Semantic Sub Shares', and this feels like a field where indeed very little working open source software exists, but that would be very valuable
both for single-app local-first software engineering, and for multi-app data portability (and thus user freedom).

# Extract Entity - Lenses are not enough
The [Extract Entity](https://github.com/federatedbookkeeping/research/issues/43) challenge is related to [scalar-array conversions](https://www.inkandswitch.com/cambria/#appendix-iii-on-scalar-array-conversions)
as discussed by the Cambria Project a couple of years ago. At first it seemed that an ExtractEntity Lens could be built as an extension of Cambria, but it soon became
apparent that this wouldn't work, because when extracting certain columns from a database table and putting them in a new table, the new table would need to have identifiers
which the first table references, and the introduction of these would be non-deterministic.

When translating a new object, it's not enough to create a new entry in the second
table, the algorithm actually needs to do a lookup to see if that item already exists. And this is something that the LRI mapping mechanism which we designed in milestone 1a
can already do, even when translating between two representations that both have just one database table. Here is an example:

GitHub issues:

| id | title | assignee_name | assignee_class
|----|-------|---------------|------------
| 1 | get bread   | Michiel | Person
| 2 | toast bread | Toaster | Machine
| 3 | eat toast   | Michiel | Person

Jira issues:

| id | title | assignee_name | assignee_class
|----|-------|---------------|------------
| 7 | get bread   | Michiel | Person
| 8 | toast bread | Toaster | Machine
| 9 | eat toast   | Michiel | Person

Solid OS issues:

| id | title | assignee |
|----|-------|---------------|
| #abc | get bread   | #me |
| #def | toast bread | #toaster |
| #ghi | eat toast   | #me |
 
Solid OS actors:

| id | name | class |
|----|-------|---------------|
| #me | Michiel   | Person |
| #toaster | Toaster | Machine |


The difficulty is that Solid OS in this example extracts `assignee.name` and `assignee.class` to
a different entity, with its own database table (or RDF document) `actors`.
We can now solve this translation puzzle with the following LRI Mapping:

| GitHub | Jira | Solid OS |
|----|-------|---------------|
| 1 | 7 | [#abc, #me] |
| 2 | 8 | [#def, #toaster] |
| 3 | 9 | [#ghi, #me] |

This way we can handle both the problem of local identifiers and the Extract Entity problem, which so far no project, including Cambria, has been able to solve.

This concludes milestone 1c of this project, and we look forward to trying this out in milestone 3, which we will start with right away, and try to complete
as much as possible before the 11 June 2024 deadline of this project.

# Investigation of data formats
We take task tracking as an example here. Compare the Jira and the GitHub issue formats,
as well as Solid OS and Projectron.

One interesting observation is there is data at several levels:
* issue state (title, description, status, time spent, current list of comments)
* issue change log (date of change, events, version number)
* authors (assignee, owner, commenter)
* some support for dynamic access control (e.g. 'locked', 'is_admin')

So a general model is that authors update objects over time. None of them (not so surprisingly) support contradicting versions. I do want to support that in Liquid Data Framework though.

Anyway, from what I'm seeing here it feel totally feasible to sync between these. Maybe I should just make a start with the [Solid Data Module for Tasks](https://github.com/solid-contrib/data-modules/issues/73) and see how far I get before I run into restrictions. The main problem I haven't thought a lot about yet may be [author mapping](https://github.com/federatedbookkeeping/task-tracking/issues/25), but that feels doable too.


## GitHub Issue GET
[docs](https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#get-an-issue)

* "Issues" endpoints may return both issues and pull requests in the response. You can identify pull requests by the pull_request key. Be aware that the id of a pull request returned from "Issues" endpoints will be an issue id. To find out the pull request id, use the "List pull requests" endpoint.
* Solid OS issue tracker can only display the issue-related attributes of a PR, but e.g. not its diff. So all Solid OS issues will become non-PR issues when synced to gh-issues, and GH PRs will maybe have a label on Solid OS showing a link to the GH web interface where full PR details would be viewable
* Response schema has both `id` e.g. `1` and `node_id` e.g. `"MDQ6VXNlcjU4MzIzMQ=="` - latter is [related to GraphQL](https://docs.github.com/en/graphql/guides/using-global-node-ids)
* an issue has:
  * several identifiers (`id`, `node_id`, `url`, `number`)
  * repository (map this to 'project' in other trackers!)
  * labels
  * comments
  * events (interesting!)
  * title
  * state ('open' / 'closed')
  * body
  * user
    * several identifiers (`login`, `id`, `node_id`, `url`, `html_url`)
    * avatar / gravatar
    * followers, following, gists, starred, organizations, repos, events, received events, all URLs for more info about this user
    * type ('User') / `site_admin`
  * asignee, asignees (why both?)
  * closed_by
  * "author_association": "COLLABORATOR"
  * "state_reason": "completed"
  * milestone
  * locked true/false, active_lock_created e.g. 'too_heated'
  * comments
  * pull_request
  * created_at / updated_at / closed_at
* a label has:
  * several identifiers
  * name
  * description
  * color
  * default true/false
* example:

```json
{
  "id": 1,
  "node_id": "MDU6SXNzdWUx",
  "url": "https://api.github.com/repos/octocat/Hello-World/issues/1347",
  "repository_url": "https://api.github.com/repos/octocat/Hello-World",
  "labels_url": "https://api.github.com/repos/octocat/Hello-World/issues/1347/labels{/name}",
  "comments_url": "https://api.github.com/repos/octocat/Hello-World/issues/1347/comments",
  "events_url": "https://api.github.com/repos/octocat/Hello-World/issues/1347/events",
  "html_url": "https://github.com/octocat/Hello-World/issues/1347",
  "number": 1347,
  "state": "open",
  "title": "Found a bug",
  "body": "I'm having a problem with this.",
  "user": {
    "login": "octocat",
    [...]
  },
  "labels": [
    {
      "id": 208045946,
      "node_id": "MDU6TGFiZWwyMDgwNDU5NDY=",
      "url": "https://api.github.com/repos/octocat/Hello-World/labels/bug",
      "name": "bug",
      "description": "Something isn't working",
      "color": "f29513",
      "default": true
    }
  ],
  "assignee": {
    "login": "octocat",
    [...]
  },
  "assignees": [
    {
      "login": "octocat",
      [...]
    }
  ],
  "milestone": {
    [...]
  },
  "locked": true,
  "active_lock_reason": "too heated",
  "comments": 0,
  "pull_request": {
    "url": "https://api.github.com/repos/octocat/Hello-World/pulls/1347",
    "html_url": "https://github.com/octocat/Hello-World/pull/1347",
    "diff_url": "https://github.com/octocat/Hello-World/pull/1347.diff",
    "patch_url": "https://github.com/octocat/Hello-World/pull/1347.patch"
  },
  "closed_at": null,
  "created_at": "2011-04-22T13:33:48Z",
  "updated_at": "2011-04-22T13:33:48Z",
  "closed_by": {
    "login": "octocat",
    [...]
  },
  "author_association": "COLLABORATOR",
  "state_reason": "completed"
}
```

## Jira Issue GET
[docs](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-get)
* In Jira, issues can have watchers. Nice feature!
* attachments are listed separately
* there can be sub-tasks
* Description in the example has type 'paragraph', I wonder if other description types exist
* description version number is explicitly tracked
* linked to a project (like repo for GH)
* linked issues ('dependent')
* worklog separate from comments, nice!
* `"updated": 1` - is this a version number?
* time tracking (original estimate, spent, remaining)
* identifiers (`id`, `key`, `self` URL)

## Solid OS Issue GET
[repo](https://github.com/solidos/issue-pane)
[docs](https://pdsinterop.org/conventions/tasks/#solid-os)

## Projectron Issue GET
[repo](https://github.com/janeirodigital/sai-js/tree/main/examples/vuejectron)
[task model](https://github.com/janeirodigital/sai-js/blob/main/examples/vuejectron/src/models.ts#L24)
[task shape](https://github.com/janeirodigital/sai-js/blob/main/packages/css-storage-fixture/shapetrees/shapes/Task%24.shex)
[newer (using LDO)](https://github.com/elf-pavlik/sai-js/tree/sai-ldo/examples%2Fvuejectron)
[older (not using Vue)](https://github.com/hackers4peace/projectron/blob/main/src/app/models/task.model.ts#L4)
