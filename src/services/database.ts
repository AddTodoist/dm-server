import UserInfo from './mongoose-conection';
import { hashId } from './crypto';

/**
 * Finds a user by twitter id *(not hashed)*
 */
export const findUser = async (userId: string) => {
  const user = await UserInfo.findOne({ _id: hashId(userId) });
  return user;
};
