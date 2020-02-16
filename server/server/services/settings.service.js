
import session from '../utils/session.util';

import Settings from '../models/settings.model';
/**
 * set settings variables
 * @returns {settings}
 */

function setCreateSettingsVaribles(req, settings) {

  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'employee') {
      settings.createdBy = session.getSessionLoginID(req);
    }

  }
  return settings;
}

/**
 * set settings update variables
 * @returns {user}
 */
function setUpdateSettingsVaribles(req, settings) {
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'employee') {
      settings.updatedBy = session.getSessionLoginID(req);
    }
  }
  settings.updated = Date.now();
  return settings;
}

async function updateGlobalSettings() {
  let settings = await Settings.findOne({ active: true });
  if (settings) {
    global.settings = settings;
  }
}
updateGlobalSettings();

export default {
  setCreateSettingsVaribles,
  setUpdateSettingsVaribles,
  updateGlobalSettings
}