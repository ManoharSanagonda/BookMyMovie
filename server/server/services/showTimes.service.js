
import session from '../utils/session.util';

import ShowTimes from '../models/showTimes.model';
/**
 * set showTimes variables
 * @returns {showTimes}
 */

function setCreateShowTimesVaribles(req, showTimes) {

  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'employee') {
      showTimes.createdBy = session.getSessionLoginID(req);
    }

  }
  return showTimes;
}

/**
 * set showTimes update variables
 * @returns {user}
 */
function setUpdateShowTimesVaribles(req, showTimes) {
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'employee') {
      showTimes.updatedBy = session.getSessionLoginID(req);
    }
  }
  showTimes.updated = Date.now();
  return showTimes;
}

async function updateGlobalShowTimes() {
  let showTimes = await ShowTimes.findOne({ active: true });
  if (showTimes) {
    global.showTimes = showTimes;
  }
}
updateGlobalShowTimes();

export default {
  setCreateShowTimesVaribles,
  setUpdateShowTimesVaribles,
  updateGlobalShowTimes
}