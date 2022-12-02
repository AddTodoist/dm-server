
export const getRandomAddedToAccountText = () => {
  const texts = [
    '🔴 Added to your account',
    '🔴 Tweet added to your account',
    '🔴 I\'ve added that to your account',
    '🔴 The tweet\'s been added to your account',
    '🚀 Tweet added to your account',
    '🚀 Added to your account',
    '🚀 I\'ve added that to your account',
    '🚀 The tweet\'s been added to your account'] as const;
  return texts[Math.floor(Math.random() * texts.length)];
};

export const getRandomUserNotFoundMessage = () => {
  const texts = [
    '🔴 User not found. Please send \'/init\' to start using this bot',
    '❌ User not found. Please send \'/init\' to start using this bot',
    '🔴 I couldn\'t find you in my database. Please send \'/init\' to start using this bot',
    '❌ I couldn\'t find you in my database. Please send \'/init\' to start using this bot',
    '❓ User Not Found. Who are you? Please send \'/init\' to start using this bot',
    '❓ I couldn\'t find you in my database. Who are you? Please send \'/init\' to start using this bot',
    '🔴 User Not Found. Who are you? Please send \'/init\' to start using this bot'
  ] as const;
  return texts[Math.floor(Math.random() * texts.length)];
};

const TWHookServerTexts = {
  USER_NOT_FOUND: '🔴 User Not Found.\nPlease use\n/init\nto initialize your account',
  INVALID_PROJECT_NUM: '🔴 Invalid project number\n',
  BAD_TOKEN: '🔴 Something is wrong with your account configuration.\nPlease run\n/init\ncommand',
  TWEETS_SAVED_TO: '🔴 Now tweets will be saved to:\n',
  CANT_DELETE: '🔴 Can\'t delete your account. Maybe your account has already been deleted?',
  DELETED_ACCOUNT: '🔴 All your account data has been deleted',
  ALERT_DELETE: '🔴 Are you sure you want to delete your account? This action CAN NOT be undone. \nType\n/deleteall\nto continue',
  HELP: '🔴 Available Commands:\n\n/init - Set up your account\n/config - Get your account data\n/delete - Delete your account\n/project <number> - Set up your default project\n/help - Shows this message\n\n⚠️ Don\'t forget the slash (/) before the command'
} as const;

export const generateInitText = (userId: string) => {
  const HEADER_EMOJIS = ['🔴', '👋', '🚀', '📒'] as const;
  const headerEmoji = HEADER_EMOJIS[Math.floor(Math.random() * HEADER_EMOJIS.length)];
  return `
${headerEmoji} Hi there!\n\
I'm AddTodoist bot and I'm here to help you save tweets and threads to your Todoist account.\n\
\nFirst of all, you must cofigure me for making me able to access your account.\n\n\
Follow this steps:\n\
1. Go to https://todoist.com/oauth/authorize?client_id=${process.env.TODOIST_CLIENT_ID}&scope=data:read_write&state=${userId}\n\
2. Grant app permissions.\n\
3. When you are done I will come back to set up your projects cofiguration.`;
};

export const generateConfigText = ({
  username,
  email,
  projectName,
  projectId,
}) => {
  const HEADER_EMOJIS = ['🔴', '⚙️', '⬇️', '🔎'] as const;
  const headerEmoji = HEADER_EMOJIS[Math.floor(Math.random() * HEADER_EMOJIS.length)];
  return `
${headerEmoji} This is your current configuration:\n\
- Username: ${username}\n\
- Email: ${email}\n\
- Project: ${projectName} (id: ${projectId})`;
};

export const generateInvalidDMText = (username: string) => {
  const HEADER_EMOJIS = ['🔴', '🚫', '❌', '❓'] as const;
  const headerEmoji = HEADER_EMOJIS[Math.floor(Math.random() * HEADER_EMOJIS.length)];
  return `
${headerEmoji} Hi ${username}!\n\n\
It seems like you have sent me an invalid message.\n\n\
Please, send me a valid command or type\n\
'/init'\n\
to start your account configuration.\n\n\
For more information type\n\
'/help'\n\n\
⚠️ Don't forget the slash (/) before the commands`;
};

export default TWHookServerTexts;
