import User from '../models/user.model';
import SocketMessages from '../models/socketMessages.model';


/**
 * insert socketMessages
 * @returns {socketMessages}
 */
async function insertSocketMessages(req) {

  let socketMessages = new SocketMessages();
  if (req.eventName) {
    socketMessages.eventName = req.eventName;
  }
  if (req.response) {
    socketMessages.response = req.response;
  }
  if (req.body) {
    socketMessages.request = req.body;
  }
  if (req.contextId) {
    socketMessages.contextId = req.contextId;
  }
  if (req.description) {
    socketMessages.description = req.description;
  }
  if (req.pair) {
    socketMessages.pair = req.pair;
  }
  if (req.changeOrders) {
    socketMessages.changeOrders = req.changeOrders;
  }
  if (req.userId) {
    let user = await User.get(req.userId);
    if (user) {
      socketMessages.userEmail = user.emailid;
    }

  }
  // if (req.toAll) {
  //   socketMessages.toAll = req.toAll;
  // }
  // if (req.toSingle) {
  //   socketMessages.toSingle = req.toSingle;
  // }
  await SocketMessages.save(socketMessages);
  return true;
}

export default {

  insertSocketMessages,
};