#!/bin/bash

gh api /issues --method GET | python -m json.tool > gh.json
deno run -A ./sync.ts
