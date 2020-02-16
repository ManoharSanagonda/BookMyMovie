// Create the socket configuration for trades
export default function(io, socket) {

    return {
      sendStats: (type, response) => {
        io.emit(type, response);
      }
  
    };
  
  };