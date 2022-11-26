import axios from 'axios';

const deployWebhooksURL = process.env.DEPLOY_ENDPOINT_WEBHOOKS;

if (deployWebhooksURL) await  axios.get(deployWebhooksURL);
