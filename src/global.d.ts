import type { Task } from '@doist/todoist-api-typescript';
import type { Document } from 'mongoose';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TODOIST_CLIENT_ID: string;
      TODOIST_CLIENT_SECRET: string;
      TWITTER_CONSUMER_KEY: string;
      TWITTER_CONSUMER_SECRET: string;
      TWITTER_ACCESS_TOKEN: string;
      TWITTER_ACCESS_TOKEN_SECRET: string;
      BUGSNAG_API_KEY: string;
      TW_ACC_ID: string;
      MONGO_DB: string;
      DB_SECRET: string;
    }
  }
  type DBUserInstance = Document<unknown, any, IUserInfo> & IUserInfo & Required<{ _id: string }>

  type URLEntity = {
    url: string,
    expanded_url: string,
    display_url: string,
    indices: [number, number]
  }
  type TWDirectMessage = {
    target: Record<string, unknown>;
    sender_id: string;
    sender_name: string;
    message_data: {
      text: string;
      entities: {
        hashtags: { text: string, indices: any[] }[];
        symbols: any[];
        user_mentions: any[];
        urls: URLEntity[];
      };
    };
  };

  type CustomTask = {content: string, token: string, projectId?: string, labels?: string[], parentId?: string, order?: number }

  type TodoistTaskAdder = (task: CustomTask) => Promise<Task>;

  type DMHandlerFunction = (message: TWDirectMessage, user: DBUserInstance) => Promise<void>;

  interface IUserInfo {
    /**
     * Unique user id
     */
    _id: string;
    /**
     * Todoist **encrypted** token
     */
    todoistToken: string;
    /**
     * The todoist projectId to add tasks to
     */
    todoistProjectId: string;
    /**
     * If true, the user will not receive any response from the bot when saving a tweet
     */
    noResponse?: true;
    /**
     * The label to add to the task when added from thread
     */
    threadLabel?: string | null;
    /**
     * The label to add to the task when added from normal tweet
     */
    tweetLabel?: string | null;
  }

}

export { };
