import { Autohook } from "twitter-autohook";
import {
  handleDirectMessage,
  directMessageRecieved,
  getMessage,
} from "./DirectMessages.js";

export async function setupAutohookServer() {
  const autohook = await createAutohook();
  configureListeners(autohook);

  return autohook;
}

async function createAutohook() {
  try {
    const webhook = new Autohook();

    await webhook.removeWebhooks();
    await webhook.start();

    // Subscribes to your own user's activity
    await webhook.subscribe({
      oauth_token: process.env.TWITTER_ACCESS_TOKEN || "",
      oauth_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
    });

    return webhook;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function configureListeners(webhook) {
  webhook.on("event", async (event) => {
    if (directMessageRecieved(event)) {
      const message = getMessage(event);
      return handleDirectMessage(message);
    }
  });
}