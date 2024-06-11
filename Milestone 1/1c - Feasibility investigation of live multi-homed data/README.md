# Feasibility Study: Live multi-homed (task tracking) data without a CRDT

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
