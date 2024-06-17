#!/bin/bash

gh api /issues --method GET | python -m json.tool > gh.json
deno run -A ./sync.ts > jira.json
curl --request POST \
  --url 'https://fedtt.atlassian.net/rest/api/3/issue' \
  --user 'michiel@unhosted.org:$ATLASSIAN' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --data @jira-example.json