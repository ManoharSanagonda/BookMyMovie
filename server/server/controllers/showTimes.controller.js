import Settings from '../models/showTimes.model';

import showTimesService from '../services/showTimes.service';

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
  req.showTimes = await Settings.get(req.params.showTimesId);
  return next();
}


/**
 * Get showTimes
 * @param req
 * @param res
 * @returns {details: showTimes}
 */

async function get(req, res) {
  logger.info('showTimes', 'Log:showTimes Controller:get: query :' + JSON.stringify(req.query));
  req.query = await serviceUtil.generateListQuery(req);
  let showTimes = req.showTimes;
  logger.info('showTimes', 'Log:showTimes Controller:get:' + i18nUtil.getI18nMessage('recordFound'));
  let responseJson = {
    respCode: respUtil.getDetailsSuccessResponse().respCode,
    details: showTimes
  };
  return res.json(responseJson);
}
/**
 * Create new showTimes
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('showTimes', 'Log:showTimes Controller:cretae: body :' + JSON.stringify(req.body));
  let showTimes = new Settings(req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      showTimes.createdBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('showTimes', 'Error:showTimes Controller:create:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  req.showTimes = await Settings.save(showTimes);
  req.entityType = 'showTimes';
  logger.info('showTimes', 'Log:showTimes Controller:create:' + i18nUtil.getI18nMessage('showTimesCreate'));
  return res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing showTimes
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('showTimes', 'Log:showTimes Controller:update: body :' + JSON.stringify(req.body));
  let showTimes = req.showTimes;
  showTimes = Object.assign(showTimes, req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      showTimes.updatedBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('showTimes', 'Error:showTimes Controller:update:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  showTimes.updated = Date.now();
  req.showTimes = await Settings.save(showTimes);
  req.entityType = 'showTimes';
  logger.info('showTimes', 'Log:showTimes Controller:update:' + i18nUtil.getI18nMessage('showTimesUpdate'));
  return res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Get showTimes list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {showTimes: showTimes, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('showTimes', 'Log:showTimes Controller:list: query :' + JSON.stringify(req.query));
  let responseJson = {};
  const query = await serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    //  total count;
    query.pagination.totalCount = await Settings.totalCount(query);
  }
  //get total showTimes
  const showTimes = await Settings.list(query);
  logger.info('showTimes', 'Log:showTimes Controller:list:' + i18nUtil.getI18nMessage('recordsFound'));
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.showTimes = showTimes;
  responseJson.pagination = query.pagination;
  return res.json(responseJson)
}

/**
 * Delete showTimes.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('showTimes', 'Log:showTimes Controller:remove: query :' + JSON.stringify(req.query));
  const showTimes = req.showTimes;
  showTimes.active = false;
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      showTimes.updatedBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('showTimes', 'Error:showTimes Controller:remove:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  showTimes.updated = Date.now();
  req.showTimes = await Settings.save(showTimes);
  req.entityType = 'showTimes';
  logger.info('showTimes', 'Log:showTimes Controller:remove:' + i18nUtil.getI18nMessage('showTimesDelete'));
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
