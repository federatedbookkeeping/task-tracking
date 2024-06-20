# Federation of Issue-trackers

## First script

This milestone builds on the findings from milestones [1a](https://github.com/federatedbookkeeping/task-tracking/tree/main/Milestone%201/1a%20-%20Theoretical%20foundation%20of%20federated%20task-tracking) and [1c](https://github.com/federatedbookkeeping/task-tracking/blob/main/Milestone%201/1c%20-%20Feasibility%20investigation%20of%20live%20multi-homed%20data/README.md#feasibility-study-live-multi-homed-task-tracking-data-without-a-crdt).

We start with the `sync.ts` script from milestone 1c's exploration.

To use it on your own issues:

* For GitHub, install the [command-line tool](https://github.com/cli/cli?tab=readme-ov-file#installation) and run `gh auth login`
* For Jira, create a token on [here](https://id.atlassian.com/manage-profile/security/api-tokens) and set it as the `ATLASSIAN` env var. This demo assumes you have access to create issues in https://fedtt.atlassian.net/jira/.
* From this folder, run `deno run -A ./sync.ts` to sync your top GH issues to https://fedtt.atlassian.net/jira/software/projects/KAN/boards/1 (more sync directions to follow soon!)

## Using DXOS
```
pnpm install @dxos/client
npm install -g ts-node
ts-node ./bridgeBot.ts
```