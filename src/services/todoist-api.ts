/**
 * This module includes tools to interact with the Todoist API.
 */

import { TodoistApi } from '@doist/todoist-api-typescript';
import Bugsnag from 'services/bugsnag';

export const getTodoistUserData = async (token: string) => {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const body = JSON.stringify({ sync_token: '*', resource_types: '["user"]' });
  const requestConfig = { method: 'POST', headers, body };
  
  try {
    const { user } = await fetch('https://api.todoist.com/sync/v9/sync', requestConfig ).then(res => {
      if (res.ok) return res.json();
      Promise.reject(res);
    });

    const { email, full_name: username } = user;
    return { email, username } as const;
  } catch (e) {
    Bugsnag.notify(e);
    console.log({ error: await e.json(), status: e.status });
    return { error: true, errorCode: e.status } as const;
  }
  
};

export const addTodoistTask: TodoistTaskAdder = (task) => {
  const { content, token, projectId, labels, parentId, order } = task;
  
  const tdsClient = new TodoistApi(token);
  return tdsClient.addTask({
    labels,
    content,
    projectId,
    parentId,
    order
  });
};

export const getTodoistProjects = async (token: string) => {
  try {
    const tdsClient = new TodoistApi(token);
    const projects = await tdsClient.getProjects();
    return projects;
  } catch (e) {
    return [];
  }

};
  
export const revokeAccessToken = async (token: string) => {
  const revokeUrl = 'https://api.todoist.com/sync/v9/access_tokens/revoke';

  const status = await fetch(revokeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      client_id: process.env.TODOIST_CLIENT_ID,
      client_secret: process.env.TODOIST_CLIENT_SECRET,
      access_token: token,
    })
  }).then(res =>  res.status);
  
  if (status === 204) return true;
  return false;
};
  
