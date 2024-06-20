import { Client } from "@dxos/client";
import { create, Expando } from "@dxos/client/echo";
import { exec } from 'child_process';

interface GitHubIssue {
  node_id: string,
  comments_url: string,
  title: string
  comments: object[]
}

async function readGitHub(): Promise<GitHubIssue[]> {
  const result: { code: any, stdout: string, stderr: string } = await new Promise((resolve) => {
    exec(`gh api /issues --method GET`, (code, stdout, stderr) => {
      resolve({ code, stdout, stderr });
    });
  });
  const { code, stdout, stderr } = result;
  console.log('GH API call process completed with code', code);
  console.log('stderr from GH API call:', stderr);
  const text = stdout;
  const githubArr = JSON.parse(text);
  // const promises: Promise<GitHubIssue>[] = issues.map(async (issue: GitHubIssue): Promise<GitHubIssue> => {
  //   console.log(`Fetching ${issue.comments_url}`);
    
  //   const command = new Deno.Command("gh", {
  //     args: [
  //       "api",
  //       issue.comments_url,
  //       "--method", "GET",
  //     ],
  //   });
  //   const { code, stdout, stderr } = await command.output();
  //   console.log('GH API call process completed with code', code);
  //   console.log('stderr from GH API call:', new TextDecoder().decode(stderr));
  //   const text = new TextDecoder().decode(stdout); 
  //   issue.comments = JSON.parse(text);
  //   return issue;
  // });
  // const githubArr = await Promise.all(promises);
  console.log(`Imported ${githubArr.length} issues from GitHub`);
  return githubArr;
}

async function update(client: Client, githubArr: GitHubIssue[]) {
  console.log('start update');
  const promises = githubArr.map(async (issue: GitHubIssue) => {
    console.log(`exists query start ${issue.node_id}`);
    const exists = await client.spaces.default.db.query({ node_id: issue.node_id }).run();
    console.log(`exists query done ${issue.node_id}`);
    if (exists.results.length == 0) {
      console.log(`Adding ${issue.node_id}`, issue.title, issue.node_id);
      await client.spaces.default.db.add(create(Expando, { type: 'task', title: issue.title, node_id: issue.node_id, isCompleted: false }));
    } else if ((exists.results[0] as unknown as { object: { title: string } }).object.title !== issue.title) {
      console.log(`Updating ${issue.node_id}`, (exists.results[0] as unknown as { object: { title: string } }).object, issue.title);
      (exists.results[0] as unknown as { object: { title: string } }).object.title = issue.title      
    } else {
      console.log(`Nothing to do for ${issue.node_id}`);
    }
  });
  console.log('awaiting promises');
  await Promise.all(promises);
  console.log('update done');
}

const main = async () => {
  const client = new Client();
  await client.initialize();
  if (!client.halo.identity.get()) await client.halo.createIdentity();
  await client.spaces.isReady.wait();
  const githubArr = await readGitHub();
  console.log('First run');
  await update(client, githubArr);  
  console.log('Second run');
  await update(client, githubArr);  
  client.destroy();
};

main().then(() => {
  // console.log('Second run');
  // return main();
}).then(() => {
  // FIXME: https://discord.com/channels/837138313172353095/1253303287998976030/1253303287998976030 
  console.log("done, but process doesn't exit?");
});