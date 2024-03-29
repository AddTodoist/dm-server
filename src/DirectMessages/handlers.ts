import TEXTS, { generateConfigText, generateInitText, generateInvalidDMText, getRandomAddedToAccountText } from './texts';
import { getTodoistProjects, getTodoistUserData, revokeAccessToken, addTodoistTask } from 'services/todoist-api';
import { getProjectNumFromMessage, getDefaultTaskContent, getUserCustomTaskContent } from 'services/texts';
import { decryptString } from 'services/crypto';
import Bugsnag from 'services/bugsnag';
import { getOriginalTweet, getThread, sendDirectMessage } from 'services/twitter-api';

const handleConfig: DMHandlerFunction = async (message, user) => {
  const userId = message.sender_id;

  const { todoistToken, todoistProjectId: projectId } = user;
  const apiToken = decryptString(todoistToken);

  const projects = await getTodoistProjects(apiToken);
  const projectName = projects.find((p) => p.id === projectId)?.name;

  if (!projectName) {
    return sendDirectMessage(userId, 'Couldn\'t find your project. Please, try again later.');
  }

  const { email, username, error, errorCode } = await getTodoistUserData(apiToken);

  if (error) {
    if (errorCode >= 500) {
      return sendDirectMessage(userId, 'Couldn\'t connect to Todoist. Please, try again later.', {
        type: 'options',
        options: [ { label: '/config' } ]
      });
    }
    return sendDirectMessage(userId, TEXTS.BAD_TOKEN + '\nErr: CONFIG_TDS_ERROR', {
      type: 'options', options: [ { label: '/init' } ]
    });
  }
  
  sendDirectMessage(userId, generateConfigText({email, username, projectName, projectId}));
};
  
const handleDelete: DMHandlerFunction = async (message) => {
  const userId = message.sender_id;
  
  sendDirectMessage(userId, TEXTS.ALERT_DELETE);
};
  
const handleDeleteAll: DMHandlerFunction = async (message, user) => {
  const userId = message.sender_id;

  const apiToken = decryptString(user.todoistToken);
  
  try {
    await Promise.all([
      revokeAccessToken(apiToken),
      user.delete()
    ]);
  
  } catch (err) {
    Bugsnag.notify(err);
    return sendDirectMessage(userId, TEXTS.CANT_DELETE + '\n Err: DELETE_ERROR');
  }
    
  sendDirectMessage(userId, TEXTS.DELETED_ACCOUNT);
};
  
const handleProject: DMHandlerFunction = async (message, user) => {
  const userId = message.sender_id;
  const { text } = message.message_data;
  const projectNum = getProjectNumFromMessage(text);
  
  if (projectNum === null) return sendDirectMessage(userId, TEXTS.INVALID_PROJECT_NUM, {
    type: 'options',
    options: [
      { label: '/project 0' }
    ]   
  });
  
  const { todoistToken, todoistProjectId: projectId } = user;
  const apiToken = decryptString(todoistToken);
  
  const projects = await getTodoistProjects(apiToken);

  if (projects.length === 0) {
    return sendDirectMessage(userId, '🔴 Something went wrong getting your projects. Please, try again later.', {
      type: 'options',
      options: [ { label: `/project ${projectNum}`}, { label: '/init' } ]
    });
  }
  
  const currentProject = projects.find(
    (project) => project.id === projectId,
  )?.name;
  
  if (projectNum >= projects.length) {
    return sendDirectMessage(
      userId,
      `${TEXTS.INVALID_PROJECT_NUM}Current project is:\n${currentProject}`,
      {
        type: 'options',
        options: [
          { label: '/project 0' },
          { label: `/project ${projects.length - 1}` }
        ]
      }
    );
  }
  
  const project = projects[projectNum];
  
  user.todoistProjectId = project.id;
  await user.save();
  
  sendDirectMessage( userId, `${TEXTS.TWEETS_SAVED_TO}${project.name}`);
};
  
/**
   * Check if recieved a tweet message
   * If true, adds to account
   * If false, does nothing
   */
const handleDefaultDM: DMHandlerFunction = async (message, user) => {
  const urls = message.message_data.entities.urls as URLEntity[];
  const tweetURLEntity = urls.find(url => url.display_url.startsWith('twitter.com/')); // is or not a tweet DM
  if (!tweetURLEntity) return handleInvalidDM(message);
  
  const userId = message.sender_id;
  
  const { todoistToken, todoistProjectId: projectId } = user;
  const apiToken = decryptString(todoistToken);
  
  // get task content (just a tweet or custom text)
  const taskContent = tweetURLEntity.indices[0] === 0
    ? await getDefaultTaskContent(tweetURLEntity.expanded_url)
    : getUserCustomTaskContent(message, tweetURLEntity);
  
  try {
    const labels = user.tweetLabel === null ? [] : user.tweetLabel === undefined ? ['🧵Thread'] : [user.tweetLabel];
    await addTodoistTask({
      labels,
      token: apiToken,
      content: taskContent,
      projectId
    });
  } catch (e) {
    Bugsnag.notify(e);
    return sendDirectMessage(userId, TEXTS.BAD_TOKEN + '\nErr: TDS_ERROR');
  }
  
  if (user.noResponse) return;

  sendDirectMessage(userId, getRandomAddedToAccountText());
};
  
const handleInvalidDM = async (message) => {
  const userId = message.sender_id;
  sendDirectMessage(userId, generateInvalidDMText(message.sender_name), {
    type: 'options',
    options: [
      { label: '/help' },
      { label: '/init' },
    ]
  });
};

const handleInit: DMHandlerFunction = async (message) => {
  const userId = message.sender_id;
  sendDirectMessage(userId, generateInitText(userId));
};

const handleHelp: DMHandlerFunction = async (message) => {
  const userId = message.sender_id;
  sendDirectMessage(userId, TEXTS.HELP, {
    type: 'options',
    options: [
      { label: '/init' },
      { label: '/project 0' },
      { label: '/config' },
    ]
  });
};

const handleMain: DMHandlerFunction = async (message: TWDirectMessage, user) => {
  const urls = message.message_data.entities.urls as URLEntity[];
  const tweetURLEntity = urls.find(url => url.display_url.startsWith('twitter.com/')); // is or not a tweet DM
  if (!tweetURLEntity) return handleInvalidDM(message);

  const userId = message.sender_id;
  
  const { todoistToken, todoistProjectId: projectId } = user;
  const apiToken = decryptString(todoistToken);
  
  // get the head tweet of a thread
  const mainTweetURL = tweetURLEntity.expanded_url;
  const mainTweetId = mainTweetURL.split('/').pop() as string;
  const originalTweet = await getOriginalTweet(mainTweetId);
  if (!originalTweet) return; // TODO - handle this

  const content = await getDefaultTaskContent(originalTweet.url); // TODO - improve this as we already have the content and is not necessary to get it again

  try {
    const labels = user.threadLabel === null ? [] : user.threadLabel === undefined ? ['🧵Thread'] : [user.threadLabel];
    await addTodoistTask({
      token: apiToken,
      labels,
      content,
      projectId
    });
  } catch (e) {
    Bugsnag.notify(e);
    return sendDirectMessage(userId, TEXTS.BAD_TOKEN + '\nErr: TDS_ERROR');
  }

  if (user.noResponse) return;
  
  sendDirectMessage(userId, getRandomAddedToAccountText());
};

const handleThread: DMHandlerFunction = async (message: TWDirectMessage, user) => {
  const urls = message.message_data.entities.urls as URLEntity[];
  const tweetURLEntity = urls.find(url => url.display_url.startsWith('twitter.com/')); // is or not a tweet DM
  if (!tweetURLEntity) return handleInvalidDM(message);

  const userId = message.sender_id;
  
  const { todoistToken, todoistProjectId: projectId } = user;
  const apiToken = decryptString(todoistToken);
  
  // get the head tweet of a thread
  const mainTweetURL = tweetURLEntity.expanded_url;
  const mainTweetId = mainTweetURL.split('/').pop() as string;
  const thread = await getThread(mainTweetId);

  if (!thread) return; // TODO - Add tweet as a task (it can fail if the tweet is not public or if it is more than 7 days old [see twitter api docs])

  const labels = user.threadLabel === null ? [] : user.threadLabel === undefined ? ['🧵Thread'] : [user.threadLabel];
  const mainTask = await addTodoistTask({
    token: apiToken,
    projectId,
    labels,
    content: thread[0].text
  });

  const addTasksPromise = thread.slice(1, 5).map((tweet, index) => addTodoistTask({
    token: apiToken,
    projectId,
    content: tweet.text,
    parentId: mainTask.id,
    order: index
  }));

  try {
    await Promise.all(addTasksPromise);
  } catch (e) {
    return sendDirectMessage(userId, TEXTS.BAD_TOKEN + '\nErr: TDS_ERROR');
  }

  if (user.noResponse) return;
  
  sendDirectMessage(userId, getRandomAddedToAccountText());

};

export {
  handleInit,
  handleHelp,
  handleConfig,
  handleDelete,
  handleDeleteAll,
  handleProject,
  handleDefaultDM,
  handleMain,
  handleThread
};
