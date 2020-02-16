import config from '../config/config';


import Activity from '../models/activity.model';
import Employee from '../models/employee.model';
import User from '../models/user.model';
import Settings from '../models/settings.model';

import activityService from '../services/activity.service';
import EmailService from '../services/email.service';
// import socketBeforeService from '../services/socket.before.service';
import tokenService from '../services/token.service';


import dateUtil from '../utils/date.util';
import i18nUtil from '../utils/i18n.util';
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
import sessionUtil from '../utils/session.util';

const emailService = new EmailService();

/**
 * login response
 * @param req
 * @param res
 * @param user
 * @returns {*}
 */
async function loginResponse(req, res, user) {
  // remove exisisting token and save new token
  await tokenService.removeTokenAndSaveNewToken(req);

  // adding login activity
  await activityService.insertActivity(req);
  return res.json(respUtil.loginSuccessResponse(req));
}

/**
 * login response
 * @param req
 * @param res
 * @param user
 * @returns {*}
 */
async function sendLoginResponse(req, res) {
  req.entityType = 'user';
  // adding login activity
  await activityService.insertActivity(req);


  // send login user count to admin users by socket
  // if (req.entityType === 'user') {
  //   socketBeforeService.sendStatsForAdminDashboard({ data: { sendLiveUsers: true } });
  // };
  return res.json(respUtil.loginSuccessResponse(req));
}

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
async function login(req, res, next) {
  logger.info('auth', 'Log:Auth Controller:login: body :' + JSON.stringify(req.body));
  let details, token;
  req.i18nKey = 'loginError';
  let settings = await Settings.findOne({ active: true });

  // check email from datbase
  if (req.body.entityType === config.commonRole.employee) {
    details = await Employee.findUniqueEmail(req.body.email);
  } else if (req.body.entityType === config.commonRole.user) {
    details = await User.findUniqueEmail(req.body.email);
  } else {
    req.i18nKey = 'invalidLoginType';
    return res.json(respUtil.getErrorResponse(req));
  }

  req.entityType = `${req.body.entityType}`;
  req.activityKey = `${req.body.entityType}LoginSuccess`;

  if (!details) {
    req.i18nKey = 'invalidEmail';
    return res.json(respUtil.getErrorResponse(req));
  }
  if (details && details.status && details.status !== 'Active') {
    req.i18nKey = 'activateYourAcount';
    return res.json(respUtil.getErrorResponse(req));
  }

  req.i18nKey = `${req.body.entityType}InactiveStatusMessage`;
  // check inactive status
  if (details && details.status && details.status === config.commonStatus.Inactive) {
    logger.error('auth', 'Error:auth Controller:loginResponse:' + i18nUtil.getI18nMessage(req.i18nKey));
    return res.json(respUtil.getErrorResponse(req));
  }

  // compare authenticate password 
  if (!details.authenticate(req.body.password)) {
    req.i18nKey = 'invalidPassword';
    logger.error('auth', 'Error:auth Controller:login:' + i18nUtil.getI18nMessage(req.i18nKey));
    return res.json(respUtil.getErrorResponse(req));
  }


  details.password = undefined;
  details.salt = undefined;
  req[req.body.entityType] = details;
  req.i18nKey = 'loginSuccessMessage';

  loginResponse(req, res, details);

}


/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

//log out for Admin and User
async function logout(req, res) {
  logger.info('auth', 'Log:Auth Controller:logout: query :' + JSON.stringify(req.query));
  let responseJson = {};
  let activity = new Activity();
  activity.type = 'LOGOUT';
  if (req.tokenInfo.loginType === 'user') {
    activity.userId = req.tokenInfo._id;
    req.activityKey = 'userLogoutSuccess';
  } else if (req.tokenInfo.loginType === 'employee') {
    activity.employeeId = req.tokenInfo._id;
    req.activityKey = 'employeeLogoutSuccess';
  }
  await activityService.insertActivity(req);
  responseJson = {
    details: req.Activity
  };

  // send login user count to admin users by socket
  // if (req.tokenInfo.loginType === 'user') {
  //   socketBeforeService.sendStatsForAdminDashboard({ data: { sendLiveUsers: true } });
  // }
  //return res.json(responseJson);
  req.i18nKey = 'logoutMessage';
  logger.info('auth', 'Log:auth Controller:logout:' + i18nUtil.getI18nMessage("logoutMessage"));
  return res.json(respUtil.logoutSuccessResponse(req));
}

/**
 * 
 *Sends the Email for the forgot password. 
 */
async function forgotPassword(req, res) {
  let templateInfo = JSON.parse(JSON.stringify(config.mailSettings));

  //check for the account type if the account type does not exists throws the error.
  if (req.body.entityType === 'employee') {
    //Email exists check
    req.details = await Employee.findUniqueEmail(req.query.email);
    req.url = templateInfo.adminUrl;
  } else if (req.body.entityType === 'user') {
    req.details = await User.findUniqueEmail(req.query.email);
    req.url = templateInfo.adminUrl;
  } else {
    req.i18nKey = 'invalidLoginType';
    return res.json(respUtil.getErrorResponse(req));
  }
  if (!req.details) {
    req.i18nKey = 'emailNotExist';
    logger.error('auth', `Error:${req.body.entityType}:forgotPassword:'${i18nUtil.getI18nMessage('emailNotExist')}`);
    return res.json(respUtil.getErrorResponse(req));
  }

  //Account status check
  if (req.details && req.details.status === config.commonStatus.Inactive) {
    logger.error('auth', `Error:${req.body.entityType}:forgotPassword:'${i18nUtil.getI18nMessage('employeeInactiveStatusMessage')}`);
    req.i18nKey = `${req.body.entityType}InactiveStatusMessage`;
    return res.json(respUtil.getErrorResponse(req));
  }
  req.enEmail = serviceUtil.encodeString(req.details.email);

  //Send email link to reset the password

  // emailService.sendEmailviaGrid({
  //   templateName: config.emailTemplates.adminForgetPassword,
  //   emailParams: {
  //     to: req.details.email,
  //     displayName: req.details.displayName,
  //     link: `${req.url}changeRecoverPassword/${req.enEmail}`
  //   }
  // });
  req.entityType = `${req.body.entityType}`;
  req.activityKey = `${req.body.entityType}ForgotPassword`;
  activityService.insertActivity(req);
  req.i18nKey = 'mailSuccess';
  logger.info('auth', `Log:${req.body.entityType}:forgotPassword:${i18nUtil.getI18nMessage('mailSuccess')}`);
  return res.json(respUtil.successResponse(req));
}

/** 
 * Change the recover password or activate the account by setting the password.
 */
async function changeRecoverPassword(req, res) {
  if (req.body.enEmail) {
    req.body.deEmail = serviceUtil.decodeString(req.body.enEmail);
    logger.info('auth', `Log:${req.body.entityType}:changeRecoverPassword: body :${req.body.deEmail}`);
  }
  if (req.body.entityType === 'employee') {
    // converted encode string to decode
    req.details = await Employee.findUniqueEmail(req.body.deEmail);
  } else if (req.body.entityType === 'user') {
    req.details = await User.findUniqueEmail(req.body.deEmail);
  } else {
    req.i18nKey = 'invalidLoginType';
    return res.json(respUtil.getErrorResponse(req));
  }
  // email not exists
  if (!req.details) {
    req.i18nKey = 'emailNotExist';
    logger.error('auth', `Error:${req.body.entityType}:changeRecoverPassword:${i18nUtil.getI18nMessage('emailNotExist')}`);
    return res.json(respUtil.getErrorResponse(req));
  }
  let passwordDetails = req.body;

  // active account response
  if (req.query.active) {
    if (req.details.status === config.commonStatus.Active) {
      req.i18nKey = `${req.body.entityType}AlreadyActivated`;
      logger.error('auth', `Error:${req.body.entityType}:changeRecoverPassword:${i18nUtil.getI18nMessage('employeeAlreadyActivated')}`);
      return res.json(respUtil.getErrorResponse(req));
    } else if (req.details && req.details.status === config.commonStatus.Inactive) {
      req.i18nKey = `${req.body.entityType}InactiveStatusMessage`;
      logger.error('auth', `Error:${req.body.entityType}:changeRecoverPassword:${i18nUtil.getI18nMessage('employeeInactiveStatusMessage')}`);
      return res.json(respUtil.getErrorResponse(req));
    } else {
      req.details.activatedDate = dateUtil.getTodayDate();
      req.details.status = config.commonStatus.Active;
    }
  }

  if (passwordDetails.newPassword && !(passwordDetails.newPassword === passwordDetails.confirmPassword)) {
    req.i18nKey = 'passwordsNotMatched';
    logger.error('auth', `Error:${req.body.entityType}:changeRecoverPassword:${i18nUtil.getI18nMessage('passwordsNotMatched')}`);
    return res.json(respUtil.getErrorResponse(req));
  } else if (!passwordDetails.newPassword) {
    req.i18nKey = 'newPassword';
    logger.error('auth', `Error:${req.body.entityType}:changeRecoverPassword:${i18nUtil.getI18nMessage('newPassword')}`);
    return res.json(respUtil.getErrorResponse(req));
  }
  req.details.password = passwordDetails.newPassword;
  if (req.body.entityType === 'employee') {
    await Employee.save(req.details);
  } else if (req.body.entityType === 'user') {
    await User.save(req.details);
  }
  req.activityKey = `${req.body.entityType}ChangePassword`;
  req.entityType = `${req.body.entityType}`;
  activityService.insertActivity(req);
  if (req.query.active) {
    req.i18nKey = 'accountactivate';
  }
  else {
    req.i18nKey = 'passwordReset';
  }
  return res.json(respUtil.successResponse(req));
}

/**
* Change Password
* @param req
* @param res
*/
async function changePassword(req, res) {
  logger.info('auth', `Log:auth Controller:changePassword: query :${JSON.stringify(req.query)}`);

  //Password change by the acount 
  if (!req.query.adminReset && sessionUtil.checkTokenInfo(req, "_id") && sessionUtil.checkTokenInfo(req, "loginType")) {
    req.body.entityType = sessionUtil.getLoginType(req);
    if (req.body.entityType === "employee") {
      req.details = await Employee.get(sessionUtil.getSessionLoginID(req));
    } else if (req.body.entityType === 'user') {
      req.details = await User.get(sessionUtil.getSessionLoginID(req));
    } else {
      req.i18nKey = 'invalidLoginType';
      return res.json(respUtil.getErrorResponse(req));
    }
  } else if (req.query.adminReset) {
    //Password reset by the Admin.
    if (req.body.entityType === "employee") {
      req.details = await Employee.get(req.query._id);
    } else if (req.body.entityType === "user") {
      req.details = await User.get(req.query._id);
    } else {
      req.i18nKey = 'invalidLoginType';
      return res.json(respUtil.getErrorResponse(req));
    }
  } else {
    req.i18nKey = 'invalidLoginType';
    return res.json(respUtil.getErrorResponse(req));
  }
  let passwordDetails = req.body;
  if (!req.details) {
    req.i18nKey = "detailsNotFound";
    return res.json(respUtil.getErrorResponse(req));
  }
  let collection = req.details;
  // check new password exists
  if (passwordDetails.newPassword) {

    // check current password and new password are same
    if (passwordDetails.currentPassword && (passwordDetails.currentPassword === passwordDetails.newPassword)) {
      req.i18nKey = 'currentOldSameMsg';
      logger.error('auth', `Error:${req.body.entityType} Controller:changePassword:' ${i18nUtil.getI18nMessage('currentOldSameMsg')}`);
      return res.json(respUtil.getErrorResponse(req));
    }
    // authenticate current password
    if (collection.authenticate(passwordDetails.currentPassword)) {
      if (passwordDetails.newPassword === passwordDetails.confirmPassword) {
        collection.password = passwordDetails.newPassword;
        if (req.body.entityType === "employee") {
          collection = await Employee.save(collection);
        } else if (req.body.entityType === 'user') {
          collection = await User.save(collection);
        }
        req.activityKey = `${req.body.entityType}ChangePassword`;
        req.i18nKey = 'passwordSuccess';
        logger.info('auth', `Log:${req.body.entityType} Controller:changePassword: ${i18nUtil.getI18nMessage('passwordSuccess')}`);
        return res.json(respUtil.successResponse(req));
      } else {
        req.i18nKey = 'passwordsNotMatched';
        logger.error('auth', `Error:${req.body.entityType} Controller:changePassword:' ${i18nUtil.getI18nMessage('passwordsNotMatched')}`);
        return res.json(respUtil.getErrorResponse(req));
      }
    } else {
      req.i18nKey = 'currentPasswordError';
      logger.error('auth', `Error:${req.body.entityType} Controller:changePassword:' ${i18nUtil.getI18nMessage('currentPasswordError')}`);
      return res.json(respUtil.getErrorResponse(req));
    }
  } else {
    req.i18nKey = 'newPassword';
    logger.error('auth', `Error:${req.body.entityType} Controller:changePassword:' ${i18nUtil.getI18nMessage('newPassword')}`);
    return res.json(respUtil.getErrorResponse(req));
  }
}

export default {
  login,
  getRandomNumber,
  logout,
  loginResponse,
  sendLoginResponse,
  forgotPassword,
  changeRecoverPassword,
  changePassword
};
