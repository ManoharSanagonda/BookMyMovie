
import session from '../utils/session.util';

import Theater from '../models/theater.model';
/**
 * set theater variables
 * @returns {theater}
 */

function setCreateTheaterVaribles(req, theater) {

  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'employee') {
      theater.createdBy = session.getSessionLoginID(req);
    }

  }
  return theater;
}

/**
 * set theater update variables
 * @returns {user}
 */
function setUpdateTheaterVaribles(req, theater) {
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'employee') {
      theater.updatedBy = session.getSessionLoginID(req);
    }
  }
  theater.updated = Date.now();
  return theater;
}

async function updateGlobalTheater() {
  let theater = await Theater.findOne({ active: true });
  if (theater) {
    global.theater = theater;
  }
}
updateGlobalTheater();

export default {
  setCreateTheaterVaribles,
  setUpdateTheaterVaribles,
  updateGlobalTheater
}