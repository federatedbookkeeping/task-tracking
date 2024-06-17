import { readFileSync } from "node:fs";
import * as base64 from "jsr:@std/encoding/base64";

const JIRA_ORG = `fedtt`;
const JIRA_USER = `michiel@unhosted.org`;
const JIRA_TOKEN = Deno.env.get(`ATLASSIAN`);

const JIRA_CREATE_ISSUE_URL = `https://${JIRA_ORG}.atlassian.net/rest/api/3/issue`;
const JIRA_CREATE_ISSUE_OPTIONS = {
  method: "POST",
  headers: {
    Authorization: `Basic ${btoa(JIRA_USER + ":" + JIRA_TOKEN)}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: 'fill me in'
};

const text = readFileSync("./gh.json").toString();
const obj = JSON.parse(text);

async function postToJira(issue: { title: string }) {
  const options = JIRA_CREATE_ISSUE_OPTIONS;
  options.body = JSON.stringify({
    "fields": {
        "project": {
            "id": "10000"
        },
        "issuetype": {
            "id": "10001"
        },
        "summary": issue.title
    }
  });
  console.log("POSTING to JIRA", JSON.parse(options.body));
  const res = await fetch(JIRA_CREATE_ISSUE_URL, options);
  return res.json();
}

console.log(await postToJira(obj[0]));
