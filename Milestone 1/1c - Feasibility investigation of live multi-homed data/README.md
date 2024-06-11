# Feasibility Study: Live multi-homed (task tracking) data without a CRDT

We take task tracking as an example here. Compare the Jira and the GitHub issue formats:

## GitHub Issue GET
[docs](https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#get-an-issue)

* "Issues" endpoints may return both issues and pull requests in the response. You can identify pull requests by the pull_request key. Be aware that the id of a pull request returned from "Issues" endpoints will be an issue id. To find out the pull request id, use the "List pull requests" endpoint.
* Solid OS issue tracker can only display the issue-related attributes of a PR, but e.g. not its diff. So all Solid OS issues will become non-PR issues when synced to gh-issues, and GH PRs will maybe have a label on Solid OS showing a link to the GH web interface where full PR details would be viewable
* 

## Jira Issue GET
[docs](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-get)

## Solid OS Issue GET

## Projectron Issue GET