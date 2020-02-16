import socketIo from '../config/socket.io';
import config from '../config/config';

// Prepare service configuration
export default {
  /**
    * @param {Object} io
    * @param {Object} socket
    * @returns {Function () sendResponse, ......}
    * init (send socket to individual user or all users)
    */
  init: (io, socket) => {
    function sendSocketsData(data) {
      // must set this inProcess flag as true before going async proccessing
      global.inProcess = true;
      async function socketsDataProcessing(data) {
        // set io if not available
        if (!io) {
          io = socketIo.getIo();
        }
        if (data) {
          // encrypt the socket data
          if (config.encryptionStatus === '1') {
            data.response = JSON.stringify(data.response);
            let encryptedData = new Buffer(data.response);
            let encryptedObj = encryptedData.toString('base64');
            data.response = { encryptedObj: encryptedObj, a: config.encryptionStatus };
          }
          // check userId is passed or not
          if (data.userId) {
            // logger.info("Only send to user: " + data.userId);
            let userId = data.userId;
            let userSocketMap = socketIo.getUserSocketMap();
            if (userSocketMap[userId] && userSocketMap[userId].length > 0) {
              userSocketMap[userId].forEach((socketId) => {
                if (io && io.sockets && io.sockets.sockets && io.sockets.sockets[socketId]) {
                  // logger.info("Send to user successfully: " + data.userId);
                  io.sockets.sockets[socketId].emit(data.eventName, data.response);
                }
              });
            }
          } else if (data.roomName) {
            // logger.info("Only send to roomname: " + data.roomName);
            let roomName = data.roomName;
            // check io validation
            if (io && io.sockets) {
              if (data.toAll) {
                // logger.info("Send to room successfully: " + data.roomName);
                io.sockets.in(roomName).emit(data.eventName, data.response);
              } else {
                // logger.info("Send to room successfully: " + data.roomName);
                io.sockets.in(roomName).emit(data.eventName, data.response);
              }
            }
          } else if (data.socketOnly) {
            // logger.info("Send socket only: " + socket.id);
            if (socket && socket.emit) {
              // logger.info("Socket send individual successfully: " + socket.id);
              socket.emit(data.eventName, data.response);
            }
          } else {
            // if not passed send all resposne to all connected socket clients
            if (io && io.sockets) {
              io.emit(data.eventName, data.response);
            }
          }
        }
        if (global.socketQueue && global.socketQueue.length) {
          while (global.socketQueue.length > 0) {
            // pull out oldest data and process it
            let data = socketQueue.shift();
            await socketsDataProcessing(data);
          }
          global.inProcess = false;
        }
      };

      // call the socket data processing function to emit data to sockets
      socketsDataProcessing(data);
    }

    // call the socket data processing function to emit data to sockets
    sendSocketsData();

    return {
      /**
        * @param {Object} data { eventName, response, userId, roomName, toAll }
        * @returns {}
        * send socket to individual user or all users
        */
      sendResponse: (data) => {
        if (!global.inProcess) {
          // not currently processing anything so just process the message
          sendSocketsData(data);
        } else {
          // place socket data into queue
          global.socketQueue.push(data);
        }
      }
    };
  }
}