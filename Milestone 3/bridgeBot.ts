import { Client } from "@dxos/client";
import { create, Expando } from "@dxos/client/echo";

// create a client

const main = async () => {
  const client = new Client();
  await client.initialize();
  if (!client.halo.identity.get()) await client.halo.createIdentity();
  await client.spaces.isReady.wait();
  const space = client.spaces.default;
  const object = create(Expando, { type: 'task', title: 'buy milk' });
  await space.db.add(object);
  const tasks = await space.db.query({ type: 'task' }).run();
  tasks.objects[0].isCompleted = true;
  console.log(tasks.results);
  client.destroy();
};

main().then(() => {
  console.log("done, but process doesn't exit?");
});