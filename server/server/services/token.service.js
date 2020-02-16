import requestIp from 'request-ip';

import config from '../config/config';

import Token from '../models/token.model';
import Settings from '../models/settings.model';

import serviceUtil from '../utils/service.util';

/**
 * Get unique token details by accessToken
 * @returns {token}
 */
function getTokenDetails(token) {
  return Token
    .findOne({ accessToken: token }).populate('user').populate('employee')
    .then((token) => token);
}

/**
 * set token variables
 * @returns {token}
 */
function setTokenVariables(req) {
  let token = new Token();
  token.accessToken = serviceUtil.generateUUID5();
  token.refreshToken = serviceUtil.generateUUID5();
  if (req.entityType) {
    token.loginType = req.entityType;
  }
  if (token.loginType === config.commonRole.user) {
    token.user = req.user._id;
  } else if (token.loginType === config.commonRole.employee) {
    token.employee = req.employee._id;
  }

  token.expires = new Date().getTime() + config.expireTokenTime;
  if (req.body && req.body.type) {
    token.loginFrom = req.body.type;
  } else {
    token.loginFrom = 'web';
  }
  if (req.body && req.body.deviceId) {
    token.deviceId = req.body.deviceId;
  }
  if (req.body && req.body.app_version && req.body.type === 'ios') {
    token.iosMobileAppVersion = req.body.app_version;
    if (req.body.IOSVersion) {
      token.IOSVersion = req.body.IOSVersion;
    }
    if (req.body.Model) {
      token.IOSModel = req.body.Model;
    }
  } else if (req.body && req.body.app_version && req.body.type === 'android') {
    token.androidMobileAppVersion = req.body.app_version;
    if (req.body.dev_version) {
      token.dev_version = req.body.dev_version;
    }
    if (req.body.Model) {
      token.AndroidModel = req.body.Model;
    }
  }
  req.token = token;
  req.isOTPEnabled = config.isOTPEnabled;
  // matching deviceId to users deviceInfo
  if (token && token.loginFrom && token.deviceId && req.user && req.user[token.loginFrom + 'DeviceId']) {
    if (req.user[token.loginFrom + 'DeviceId'] === token.deviceId) {
      req.isOTPEnabled = false;
    }
  }

  if (req && token && token.loginFrom && token.loginFrom === 'web') {
    token.deviceId = requestIp.getClientIp(req);
  }
}

/**
 * remove exisisting token and save new token
 * @param req
 * @returns {}
 */
async function removeTokenAndSaveNewToken(req) {
  let settings = await Settings.findOne({ active: true });
  if (settings && settings.disableMultipleLogin) {
    let token;
    let entityType = req.entityType || req.body.entityType;

    if (entityType === config.commonRole.user) {
      token = await Token.findUniqueUserToken(req.user._id);
      req.user.password = undefined;
      req.user.salt = undefined;
    } else if (entityType === config.commonRole.employee) {
      token = await Token.findUniqueEmployeeToken(req.employee._id);
      req.employee.password = undefined;
      req.employee.salt = undefined;
    }
    if (token && token.loginType) {
      if (token && token.loginType) {
        await Token.deleteOne(token)
      }

    }
  }

  // set token variables
  setTokenVariables(req);
  // save the token
  Token.save(req.token);
}

export default {
  getTokenDetails,
  setTokenVariables,
  removeTokenAndSaveNewToken
}