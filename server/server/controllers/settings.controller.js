import Settings from '../models/settings.model';

import activityService from '../services/activity.service';
import errorService from '../services/error.service';
import settingsService from '../services/settings.service';

import i18nUtil from '../utils/i18n.util';
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';


/**
 * Load Settings and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.settings = await Settings.get(req.params.settingsId);
  return next();
}


/**
 * Get settings
 * @param req
 * @param res
 * @returns {details: settings}
 */

async function get(req, res) {
  logger.info('settings', 'Log:settings Controller:get: query :' + JSON.stringify(req.query));
  req.query = await serviceUtil.generateListQuery(req);
  let settings = req.settings;
  logger.info('settings', 'Log:settings Controller:get:' + i18nUtil.getI18nMessage('recordFound'));
  let responseJson = {
    respCode: respUtil.getDetailsSuccessResponse().respCode,
    details: settings
  };
  return res.json(responseJson);
}
/**
 * Create new settings
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('settings', 'Log:settings Controller:cretae: body :' + JSON.stringify(req.body));
  let settings = new Settings(req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      settings.createdBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('settings', 'Error:settings Controller:create:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  req.settings = await Settings.save(settings);
  req.entityType = 'settings';
  req.activityKey = 'settingsCreate';
  activityService.insertActivity(req);
  req.errorKey = 'settingsCreate';
  errorService.insertActivity(req);
  logger.info('settings', 'Log:settings Controller:create:' + i18nUtil.getI18nMessage('settingsCreate'));
  return res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing settings
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('settings', 'Log:settings Controller:update: body :' + JSON.stringify(req.body));
  let settings = req.settings;
  settings = Object.assign(settings, req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      settings.updatedBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('settings', 'Error:settings Controller:update:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  settings.updated = Date.now();
  req.settings = await Settings.save(settings);
  req.entityType = 'settings';
  req.activityKey = 'settingsUpdate';
  activityService.insertActivity(req);
  req.errorKey = 'settingsUpdate';
  errorService.insertActivity(req);
  logger.info('settings', 'Log:settings Controller:update:' + i18nUtil.getI18nMessage('settingsUpdate'));
  return res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Get settings list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {settings: settings, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('settings', 'Log:settings Controller:list: query :' + JSON.stringify(req.query));
  let responseJson = {};
  const query = await serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    //  total count;
    query.pagination.totalCount = await Settings.totalCount(query);
  }
  //get total settings
  const settings = await Settings.list(query);
  logger.info('settings', 'Log:settings Controller:list:' + i18nUtil.getI18nMessage('recordsFound'));
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.settings = settings;
  responseJson.pagination = query.pagination;
  return res.json(responseJson)
}

/**
 * Delete settings.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('settings', 'Log:settings Controller:remove: query :' + JSON.stringify(req.query));
  const settings = req.settings;
  settings.active = false;
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      settings.updatedBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('settings', 'Error:settings Controller:remove:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  settings.updated = Date.now();
  req.settings = await Settings.save(settings);
  req.entityType = 'settings';
  req.activityKey = 'settingsDelete';
  activityService.insertActivity(req);
  req.errorKey = 'settingsDelete';
  errorService.insertActivity(req);
  logger.info('settings', 'Log:settings Controller:remove:' + i18nUtil.getI18nMessage('settingsDelete'));
  return res.json(respUtil.removeSuccessResponse(req));
}



export default {
  load,
  get,
  create,
  update,
  list,
  remove
};
