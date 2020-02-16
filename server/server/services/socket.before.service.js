// "use strict";

// import config from '../config/config';

// import socketIo from '../config/socket.io';

// import sampleChartData from '../config/SampleChartData.json';

// import cacheService from './cache.service';
// import dashboardService from './dashboard.service';
// import exchangeratesService from './exchangerates.service';
// import orderService from './orders.service';
// import socketService from './socket.service';
// import socketMessageService from './socketMessages.service';
// import tokenService from '../services/token.service';
// import tradeService from './trade.service';
// import tradeSummaryService from '../services/tradeSummary.service';
// import userService from './user.services';

// import serviceUtil from '../utils/service.util';
// import tradeUtil from '../utils/trade.util';

// function modifyPairData({ pairStatsObj, data }) {
//   // change trade history
//   if (data.changeTrade) {
//     if (!pairStatsObj.tradeHistory) {
//       pairStatsObj.tradeHistory = [];
//     }
//     if (pairStatsObj.tradeHistory.length > 0) {
//       pairStatsObj.tradeHistory.unshift(data.response[0]);
//     } else {
//       pairStatsObj.tradeHistory.push(data.response[0]);
//     }
//   }
//   // change orders
//   if (data.changeOrders) {
//     if (!pairStatsObj.buyOrdersSummary) {
//       pairStatsObj.buyOrdersSummary = [];
//     }
//     if (!pairStatsObj.sellOrdersSummary) {
//       pairStatsObj.sellOrdersSummary = [];
//     }
//     let ordersSummary = (data.type === 'BUY') ? pairStatsObj.buyOrdersSummary : pairStatsObj.sellOrdersSummary;
//     if (ordersSummary.length === 0) {
//       ordersSummary.push(data.response);
//     } else if (ordersSummary.length > 0) {
//       let index = -1;
//       ordersSummary.forEach((val, key) => {
//         if (val[1] === data.response[1]) {
//           val = data.response;
//           index = key;
//         }
//       });
//       if (index > -1) {
//         if (data.response && data.response[0] === 0) {
//           ordersSummary.splice(index, 1);
//         } else {
//           ordersSummary[index] = data.response;
//         }
//       }
//       if (index === -1) {
//         ordersSummary.unshift(data.response);
//       }
//     }
//   }
// }

// /**
//  * send Navbar stats by pair
//  * @param socket
//  * @param data { pair: 'BTC/USD' }
//  * @returns Promise
//  */
// async function sendNavbarStatsByPair({ io, socket, data }) {
//   if (data.token) {
//     data.userId = await getUserdetailsFromToakenForSockets(data.token);
//   }
//   // console.log('Send navbar pair data ------------ **** -----')
//   let navBarStats = await tradeService.getNavBarStatsByPair(data.pair);
//   let tradeObjResponse = {
//     pair: data.pair,
//     navBarStats: navBarStats
//   };
//   // logger.info('trade change event ' + data.pair + ' ---- ' + JSON.stringify(tradeObjResponse));
//   data.eventName = 'tradeChangeEvent';
//   socketMessageService.insertSocketMessages(data);
//   socketService.init(io, socket).sendResponse({
//     eventName: 'tradeChangeEvent',
//     response: tradeObjResponse,
//     roomName: data.pair // only send to pair connection sockets
//   });
// }


// /**
//  * send candle chart data by pair
//  * @param socket
//  * @param data { pair: 'BTC/USD' }
//  * @returns Promise
//  */
// async function sendCandleChartDataByPair({ io, socket, data }) {
//   let candleChartObj = {};
//   let pairCandleKey = serviceUtil.getRedisKey(data.pair, '/candleStats');
//   // candle chart information
//   let candleChartData = await cacheService.getRecord(pairCandleKey);
//   if (candleChartData) {
//     // candleChartData is an string and parse the string
//     if (typeof candleChartData === 'string') {
//       try {
//         candleChartData = JSON.parse(candleChartData);
//       } catch (err) {
//         throw err;
//       }
//     }
//   }

//   // apply limit to candlechart data which comes from cache
//   if (candleChartData && candleChartData.length >= 300) {
//     candleChartData.splice(0, candleChartData.length - 300);
//     let candleChart = [];
//     // Convert list to array of arrays
//     for (let i = 0; i <= candleChartData.length - 1; i++) {
//       candleChart.push([
//         candleChartData[i].created,
//         candleChartData[i].first,
//         candleChartData[i].max,
//         candleChartData[i].min,
//         candleChartData[i].last,
//         candleChartData[i].volume
//       ]);
//     }
//     candleChartData = candleChart;
//   }
//   // get candlechart data from database if it is not found in cache
//   if (!candleChartData || candleChartData.length < 300) {
//     candleChartData = await tradeSummaryService.getTradeSummaryByPair(data.pair);
//     // store candle chart info based on pair
//     cacheService.setRecord(pairCandleKey, JSON.stringify(candleChartData));

//     // apply limit to candlechart data which comes from database
//     if (candleChartData && candleChartData.length > 0) {
//       let candleChart = [];
//       // Convert list to array of arrays
//       for (let i = 0; i <= candleChartData.length - 1; i++) {
//         candleChart.push([
//           candleChartData[i].created,
//           candleChartData[i].first,
//           candleChartData[i].max,
//           candleChartData[i].min,
//           candleChartData[i].last,
//           candleChartData[i].volume
//         ]);
//       }
//       candleChartData = candleChart;
//     }
//   }

//   candleChartObj.candleChartData = candleChartData;
//   //console.log(candleChartObj.candleChartData)
//   candleChartObj.pair = data.pair;
//   data.eventName = 'candleChart';
//   socketMessageService.insertSocketMessages(data);
//   socketService.init(io, socket).sendResponse({
//     eventName: 'candleChart',
//     response: candleChartObj,
//     // roomName: candleChartObj.pair
//     socketOnly: true
//   });
// }

// /**
//  * send stats summary by pair
//  * @param socket
//  * @param data { pair: 'BTC/USD' }
//  * @returns Promise
//  */
// async function sendStatsSummaryByPair({ io, socket, data }) {
//   if (data.token) {
//     data.userId = await getUserdetailsFromToakenForSockets(data.token);
//   }
//   // when trade event changes
//   if (data.changeTrade) {
//     //  let navBarStats = await tradeService.getNavBarStatsByPair(data.pair);
//     let tradeObjResponse = {
//       pair: data.pair,
//       trade: data.response
//       // navBarStats: navBarStats
//     };
//     // logger.info('trade change event ' + data.pair + ' ---- ' + JSON.stringify(tradeObjResponse));
//     data.eventName = 'tradeChangeEvent'
//     socketMessageService.insertSocketMessages(data);
//     socketService.init(io, socket).sendResponse({
//       eventName: 'tradeChangeEvent',
//       response: tradeObjResponse,
//       roomName: data.pair // only send to pair connection sockets
//     });
//     setTimeout(() => {
//       sendNavbarStatsByPair({ data: data });
//     }, 500);
//   } else if (data.changeOrders) { // when order event changes
//     let orderObjResponse = {
//       pair: data.pair
//     };
//     // logger.info('Order type -------> ' + data.type);
//     if (data.type === 'BUY') {
//       orderObjResponse["SBO"] = data.response;
//     } else if (data.type === 'SELL') {
//       orderObjResponse["SSO"] = data.response;
//     }
//     // logger.info('change orderevent ' + data.pair + ' ---- ' + JSON.stringify(orderObjResponse));
//     data.eventName = 'updateOrderEvent'
//     socketMessageService.insertSocketMessages(data);
//     socketService.init(io, socket).sendResponse({
//       eventName: 'updateOrderEvent',
//       response: orderObjResponse,
//       roomName: data.pair // only send to pair connection sockets
//     });
//   } else {
//     let pairStatsKey = serviceUtil.getRedisKey(data.pair, '/allStats');
//     // let pairCandleKey = serviceUtil.getRedisKey(data.pair, '/candleStats');

//     // first check pair stats in redis or not
//     let pairStatsObj = await cacheService.getRecord(pairStatsKey);
//     if (pairStatsObj) {
//       // pairStatsObj is an string and parse the string
//       if (typeof pairStatsObj === 'string') {
//         try {
//           pairStatsObj = JSON.parse(pairStatsObj);
//         } catch (err) {
//           throw err;
//         }
//       }
//     }

//     // if not exists and get the records from mongodb (orderBook, tradeHistory and navbar stats)
//     if (!pairStatsObj) {
//       pairStatsObj = await orderService.getOrdersSummaryByPair({ pair: data.pair });
//       pairStatsObj.tradeHistory = await tradeService.getTradeHistoryByPair({ pair: data.pair });
//       pairStatsObj.navBarStats = await tradeService.getNavBarStatsByPair(data.pair);

//       // set last trade price by pair 
//       if (pairStatsObj.navBarStats) {
//         tradeUtil.setLastTradePrice({ pair: data.pair, price: pairStatsObj.navBarStats.Last });
//       }
//       // store all stats based on pair
//       cacheService.setRecord(pairStatsKey, JSON.stringify(pairStatsObj));
//     }


//     // candle chart information
//     // let candleChartData = await cacheService.getRecord(pairCandleKey);
//     // if (candleChartData) {
//     //   // pairStatsObj is an string and parse the string
//     //   if (typeof candleChartData === 'string') {
//     //     try {
//     //       candleChartData = JSON.parse(candleChartData);
//     //     } catch (err) {
//     //       throw err;
//     //     }
//     //   }
//     // }

//     // // apply limit to candlechart data which comes from cache
//     // if (candleChartData && candleChartData.length >= 90) {
//     //   candleChartData.splice(0, candleChartData.length - 90);
//     //   let candleChart = [];
//     //   // Convert list to array of arrays
//     //   for (let i = 0; i <= candleChartData.length - 1; i++) {
//     //     candleChart.push(candleChartData[i]);
//     //   }
//     //   candleChartData = candleChart;
//     // }

//     // if (!candleChartData || candleChartData.length < 90) {
//     //   candleChartData = await tradeSummaryService.getTradeSummaryByPair(data.pair);
//     //   // store candle chart info based on pair
//     //   cacheService.setRecord(pairCandleKey, JSON.stringify(candleChartData));
//     //   // apply limit to candlechart data which comes from database
//     //   if (candleChartData && candleChartData.length > 0) {
//     //     let candleChart = [];
//     //     // Convert list to array of arrays
//     //     for (let i = 0; i <= candleChartData.length - 1; i++) {
//     //       candleChart.push([
//     //         candleChartData[i].created.getTime(),
//     //         candleChartData[i].first,
//     //         candleChartData[i].max,
//     //         candleChartData[i].min,
//     //         candleChartData[i].last,
//     //         candleChartData[i].volume
//     //       ]);
//     //     }
//     //     candleChartData = candleChart;
//     //   }
//     // }

//     // pairStatsObj.candleChartData = candleChartData;
//     pairStatsObj.tradePair = await exchangeratesService.getExchangerateByPair(data.pair);
//     pairStatsObj.depthChartData = sampleChartData.depthChartData;

//     // passing userId (when connect to room)
//     if (data.userId) {
//       sendStatsSummaryByUser({ io: io, socket: socket, data: data });
//     }

//     pairStatsObj.pair = data.pair;
//     // logger.info('room connected ' + data.pair + ' ---- first state repsonse initial connected');
//     // based send stats by pair 
//     data.eventName = 'statRecordsByPair';
//     socketMessageService.insertSocketMessages(data);
//     socketService.init(io, socket).sendResponse({
//       eventName: 'statRecordsByPair',
//       response: pairStatsObj,
//       socketOnly: true
//     });
//   }
// }

// /**
//  * send stats summary by user { pendingOrders, tradeHistory }
//  * @param io
//  * @param socket
//  * @param data { userId: '5444587544', pair: 'BTC/USD' }
//  * @returns Promise
//  */
// async function sendStatsSummaryByUser({ io, socket, data }) {
//   if (data.token) {
//     data.userId = await getUserdetailsFromToakenForSockets(data.token);
//     // get user stats record by user based
//     let userStatsObj = {
//       pair: data.pair
//     };

//     userStatsObj.openOrders = await orderService.getOpenOrders({ pair: data.pair, userId: data.userId });
//     userStatsObj.ordersHistory = await orderService.getOrdersHistory({ userId: data.userId, type: '1day', pair: data.pair, amount: { $gt: 0.00000001 } });
//     userStatsObj.tradeHistory = await orderService.getTradeHistory({ userId: data.userId, type: '1day', pair: data.pair, amount: { $gt: 0.00000001 } });
//     userStatsObj.funds = await orderService.getFunds({ userId: data.userId, pair: data.pair });
//     // logger.info('user connected ' + data.userId + ' ---- ' + JSON.stringify(userStatsObj));
//     // userStatsObj.funds = {};
//     // based send stats by user 
//     data.eventName = 'statRecordsByUser';
//     socketMessageService.insertSocketMessages(data);

//     // send live users count to admin users by socket
//     data.sendLiveUsers = true;
//     sendStatsForAdminDashboard({ io: io, socket: socket, data: data });

//     socketService.init(io, socket).sendResponse({
//       eventName: 'statRecordsByUser',
//       response: userStatsObj,
//       socketOnly: true
//     });
//   }
// }

// /**
//  * send dashboard stats summary for admin { pendingOrders, tradeHistory }
//  * @param io
//  * @param socket
//  * @param data { userId: '5444587544', pair: 'BTC/USD' }
//  * @returns Promise
//  */
// async function sendStatsForAdminDashboard({ io, socket, data }) {
//   let dashBoardStatObj = {};
//   if (!io) {
//     io = socketIo.getIo();
//   }
//   // when open orders create
//   if (data.allDashboardStats || data.sendOpenOrders) {
//     // logger.info('Admin dashboard -> Open orders');
//     dashBoardStatObj.openOrders = await dashboardService.getAllOpenOrdersForAdmin();
//   }

//   // when trade change 
//   if (data.allDashboardStats || data.sendTrades) {
//     // logger.info('Admin dashboard -> Send trades');
//     dashBoardStatObj.trades = await tradeService.getAllTradesForAdmin(data);
//   }

//   // when new user create
//   if (data.allDashboardStats || data.sendTotalUsers) {
//     // logger.info('Admin dashboard -> Send total users');
//     dashBoardStatObj.totalUsers = await userService.getAllUsersForAdmin();
//   }

//   // get total unverified users count
//   if (data.allDashboardStats || data.totalUnverifiedUsers) {
//     // logger.info('Admin dashboard -> Send total unverified users count');
//     dashBoardStatObj.unverifiedUsers = await userService.getAllUnverifiedUsersForAdmin();
//   }

//   // when new user connect
//   if (data.allDashboardStats || data.sendLiveUsers) {
//     // logger.info('Admin dashboard -> Send live users');
//     let userSocketMap = socketIo.getUserSocketMap();
//     dashBoardStatObj.totalLiveUsers = Object.keys(userSocketMap).length;
//   }

//   // last minute data stats
//   if (data.allDashboardStats || (data.orders && data.trades) || data.lastHourOrdersAndTrades) {
//     // logger.info('Admin dashboard -> Send last hour open orders and trades stats');
//     if (data.orders && data.trades) {
//       dashBoardStatObj.hourOrders = data.orders;
//       dashBoardStatObj.hourTrades = data.trades;
//     } else {
//       let type = 'socketCall';
//       let hourData = await dashboardService.getLastHourOrdersAndTradesCount(type);
//       dashBoardStatObj.hourOrders = hourData.orders;
//       dashBoardStatObj.hourTrades = hourData.trades;
//     }
//   }

//   // last 24 hours trade stats
//   if (data.allDashboardStats || data.last24HoursTrades || data.sendLast24HoursTrades) {
//     // logger.info('Admin dashboard -> Send last 24 hours trade stats');
//     if (data.last24HoursTrades) {
//       dashBoardStatObj.last24HoursTrades = data.last24HoursTrades;
//     } else {
//       let type = 'socketCall';
//       let hoursData = await dashboardService.getLast24HoursTradeStatsForAdmin(type);
//       dashBoardStatObj.last24HoursTrades = hoursData.last24HoursTrades;
//     }
//   }

//   // last 24 hours exchange stats
//   if (data.allDashboardStats || data.exchanges) {
//     // logger.info('Admin dashboard -> Send last 24 hours exchange stats');
//     if (data.totalExchanges) {
//       dashBoardStatObj.last24HoursExchanges = data.exchanges;
//     } else {
//       let type = 'socketCall';
//       let hoursData = await dashboardService.getAllLast24HoursExchangeForAdmin(type);
//       dashBoardStatObj.last24HoursExchanges = hoursData.exchanges;
//     }
//   }

//   // get all pending deposits and total deposits counts
//   if (data.allDashboardStats || data.getDeposits) {
//     // logger.info('Admin dashboard -> deposits');
//     dashBoardStatObj.deposits = await dashboardService.getDeposits();
//   }

//   // get all pending withdrawals and total withdrawals counts
//   if (data.allDashboardStats || data.getWithdrawals) {
//     // logger.info('Admin dashboard -> withdrawals');
//     dashBoardStatObj.withdrawals = await dashboardService.getWithdrawals();
//   }


//   socketService.init(io, socket).sendResponse({
//     eventName: 'dashboardStatsForAdmin',
//     response: dashBoardStatObj,
//     roomName: config.adminRoomName
//   });
// }

// /**
//  * send stats summary by user { pendingOrders, tradeHistory, ****** }
//  * @param io
//  * @param socket
//  * @param data { userId: '5444587544', pair: 'BTC/USD', type: '1day', fromdate: '2018-05-30', todate: '2018-05-31' }
//  * @returns Promise
//  */
// async function sendUserData({ io, socket, data }) {
//   if (data.token) {
//     data.userId = await getUserdetailsFromToakenForSockets(data.token);
//     let userStatsObj = {
//       pair: data.pair
//     };
//     let userData;
//     let name = serviceUtil.jsUcfirst(data.name);
//     if (name.indexOf('Trade') > -1) {
//       userData = await orderService[`get${name}`](data);
//     } else if (name.indexOf('Order') > -1) {
//       userData = await orderService[`get${name}`](data);
//     } else if (name.indexOf('Funds') > -1) {
//       userData = await orderService[`get${name}`](data);
//     }
//     userStatsObj[data.name] = userData;
//     // logger.info('send user data individual ' + data.userId + ' ---- ' + JSON.stringify(userStatsObj));
//     // based send stats by user 

//     data.eventName = 'getUserData';
//     socketMessageService.insertSocketMessages(data);
//     socketService.init(io, socket).sendResponse({
//       eventName: 'getUserData',
//       response: userStatsObj,
//       socketOnly: true
//     });
//   }
// }

// /**
//  * When trade created event changes
//  * @param data {  pair: 'BTC/USD', response: ["2018-05-22T10:15:11.379Z",8122.58,1] }
//  * @returns Promise
//  */
// function tradeChangeEvent(data) {
//   sendStatsSummaryByPair({
//     data: Object.assign(data, { changeTrade: true })
//   });
// }


// /**
//  * order event create/update/delete
//  * @param data {  pair: 'BTC/USD', response: *********** }
//  * @returns Promise
//  */
// function updateOrderEvent(data) {
//   sendStatsSummaryByPair({
//     data: Object.assign(data, { changeOrders: true })
//   });
// }


// /**
//  * user update events
//  * @param data {  userId: '5aface6e4332c84e480fe0bc', response: *********** }
//  * @returns Promise
//  */
// async function userUpdateEvent(data) {
//   if (data.token) {
//     data.userId = await getUserdetailsFromToakenForSockets(data.token);
//   }
//   if (data.name === 'funds' && data.response && data.response.pair) {
//     data.response.funds = await orderService.getFunds({ userId: data.userId, pair: data.response.pair });
//   }
//   // logger.info('user update event ' + data.userId + ' ---- ' + JSON.stringify(data.response));
//   data.eventName = 'userUpdateEvent';
//   socketMessageService.insertSocketMessages(data);
//   socketService.init().sendResponse({
//     eventName: 'userUpdateEvent',
//     response: data.response,
//     userId: data.userId // only send to pair connection sockets
//   });
// }

// /**
//  * get user details from token
//  * @param token
//  * @returns userId
//  */
// async function getUserdetailsFromToakenForSockets(token) {
//   let userId;
//   if (token) {
//     let tokenData = await tokenService.getTokenDetails(token);
//     if (tokenData && tokenData.accessToken) {
//       if (!(tokenData.expires < new Date().getTime())) {
//         if (tokenData.loginType === 'user') {
//           let user = tokenData.user;
//           if (user.crmStatus === 'Active') {
//             userId = user._id;
//           }
//         }
//       }
//     }
//   }
//   return userId;
// }

// export default {
//   sendStatsSummaryByPair,
//   sendStatsSummaryByUser,
//   sendUserData,
//   tradeChangeEvent,
//   updateOrderEvent,
//   userUpdateEvent,
//   sendStatsForAdminDashboard,
//   getUserdetailsFromToakenForSockets,
//   sendCandleChartDataByPair
// }