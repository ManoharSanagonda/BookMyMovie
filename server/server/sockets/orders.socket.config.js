// Create the socket configuration for Orders
export default function(io, socket) {

  return {
    sendStats: (type, response) => {
      // Emit the 'orderStats' event
      // io.emit('orderStats', response);
      io.emit(type, response);
    }

  };

};