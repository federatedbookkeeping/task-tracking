import { readFileSync, writeFileSync } from "node:fs";

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

let githubArr: { node_id: string, title: string }[] = [];

async function readGitHub() {
  const command = new Deno.Command("gh", {
    args: [
      "api",
      "/issues",
      "--method", "GET",
    ],
  });
  const { code, stdout, stderr } = await command.output();
  console.log('GH API call process completed with code', code);
  console.log('stderr from GH API call:', new TextDecoder().decode(stderr));
  const text = new TextDecoder().decode(stdout); 
  githubArr = JSON.parse(text);
  console.log(`Imported ${githubArr.length} issues from GitHub`);
}

let lriMapping: {
  'gh-to-jira': {
    [ghNodeId: string]: string,
  },
  'jira-to-gh': {
    [jiraId: string]: string,
  }
} = {
  'gh-to-jira': {
  },
  'jira-to-gh': {
  }
};

function loadLriMapping() {
  try {
    const lriMappingText = readFileSync('./lri-mapping.json').toString();
    lriMapping = JSON.parse(lriMappingText);
  } catch (e) {
    console.log('could not read ./lri-mapping.json', e.message);
  }
}
function saveLriMapping() {
  console.log('Writing to disk', lriMapping);
  writeFileSync('./lri-mapping.json', JSON.stringify(lriMapping, null, 2));
}

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

async function ensureJira(issue: { node_id: string, title: string }) {
  if (lriMapping['gh-to-jira'][issue.node_id]) {
    console.log(`Nothing to do for ${issue.node_id}`);
    return;
  }
  console.log(`Adding ${issue.node_id} gh->jira`);
  const result = await postToJira(issue);
  lriMapping['gh-to-jira'][issue.node_id] = result.self;
  lriMapping['jira-to-gh'][result.self] = issue.node_id;
  console.log(`New mapping ${issue.node_id} - ${result.self} added`);
}

async function run() {
  loadLriMapping();
  await readGitHub();
  const promises = githubArr.map(issue => ensureJira(issue));
  // const promises = [ ensureJira(githubArr[0])];
  await Promise.all(promises);
  saveLriMapping();
}

// ...
run();