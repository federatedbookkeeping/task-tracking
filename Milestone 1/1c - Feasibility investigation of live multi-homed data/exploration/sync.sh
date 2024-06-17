#!/bin/bash

gh api /issues --method GET | python -m json.tool > gh.json
deno run -A ./sync.ts > jira.json
curl --request POST \
  --url 'https://fedtt.atlassian.net/rest/api/3/issue' \
  --user "michiel@unhosted.org:$ATLASSIAN" \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --data @jira-example.json > jira-api-response-example.json

# curl --request GET \
#   --url 'https://fedtt.atlassian.net/rest/api/3/issue/KAN-1' \
#   --user "michiel@unhosted.org:$ATLASSIAN" \
#   --header 'Accept: application/json'
