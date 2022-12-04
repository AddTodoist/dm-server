const deployWebhooksURL = process.env.DEPLOY_ENDPOINT_WEBHOOKS;

if (deployWebhooksURL) await fetch(deployWebhooksURL);
