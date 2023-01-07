import { sendDirectMessage } from 'services/twitter-api';
import { findUser } from 'services/database';
import { getRandomUserNotFoundMessage } from './texts';
import { handleConfig, handleProject, handleDefaultDM, handleDelete, handleDeleteAll, handleInit, handleMain, handleHelp, handleThread } from './handlers';
import { handleSettings } from './settings/handleSettings';

// a decorator that checks if the user has an account in the db
function withUser() {
  return function (_target: DMHandler, _propertyKey: string, descriptor: PropertyDescriptor) {
    const mainFunc = descriptor.value;
    descriptor.value = async function (message: TWDirectMessage) {
      const userId = message.sender_id;

      const user = await findUser(userId);
      if (!user) return sendDirectMessage(userId, getRandomUserNotFoundMessage(), {
        type: 'options',
        options: [ { label: '/init' } ]
      });

      return mainFunc(message, user);
    };

    return descriptor;
  };
}

export default class DMHandler {
  static '/delete' = handleDelete;
  static '/init' = handleInit;
  static '/help' = handleHelp;

  @withUser()
  static async '/project'(message: TWDirectMessage, user: DBUserInstance) {
    return handleProject(message, user);
  }

  @withUser()
  static async '/config'(message: TWDirectMessage, user: DBUserInstance) {
    return handleConfig(message, user);
  }

  @withUser()
  static async DEFAULT(message: TWDirectMessage, user: DBUserInstance | null) {
    return handleDefaultDM(message, user!);
  }

  @withUser()
  static async '/deleteall'(message: TWDirectMessage, user: DBUserInstance) {
    return handleDeleteAll(message, user);
  }

  @withUser()
  static async '/settings'(message: TWDirectMessage, user: DBUserInstance) {
    return handleSettings(message, user);
  }

  @withUser()
  static async '#main'(message: TWDirectMessage, user: DBUserInstance) {
    return handleMain(message, user);
  }

  @withUser()
  static async '#thread'(message: TWDirectMessage, user: DBUserInstance) {
    return handleThread(message, user);
  }
 
}
