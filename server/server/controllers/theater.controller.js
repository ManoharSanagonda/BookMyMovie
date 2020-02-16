import Theater from '../models/theater.model';

import theaterService from '../services/theater.service';

import i18nUtil from '../utils/i18n.util';
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';


/**
 * Load Theater and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.theater = await Theater.get(req.params.theaterId);
  return next();
}


/**
 * Get theater
 * @param req
 * @param res
 * @returns {details: theater}
 */

async function get(req, res) {
  logger.info('theater', 'Log:theater Controller:get: query :' + JSON.stringify(req.query));
  req.query = await serviceUtil.generateListQuery(req);
  let theater = req.theater;
  logger.info('theater', 'Log:theater Controller:get:' + i18nUtil.getI18nMessage('recordFound'));
  let responseJson = {
    respCode: respUtil.getDetailsSuccessResponse().respCode,
    details: theater
  };
  return res.json(responseJson);
}
/**
 * Create new theater
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('theater', 'Log:theater Controller:cretae: body :' + JSON.stringify(req.body));
  let theater = new Theater(req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      theater.createdBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('theater', 'Error:theater Controller:create:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  req.theater = await Theater.save(theater);
  req.entityType = 'theater'; 
  logger.info('theater', 'Log:theater Controller:create:' + i18nUtil.getI18nMessage('theaterCreate'));
  return res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing theater
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('theater', 'Log:theater Controller:update: body :' + JSON.stringify(req.body));
  let theater = req.theater;
  theater = Object.assign(theater, req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      theater.updatedBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('theater', 'Error:theater Controller:update:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  theater.updated = Date.now();
  req.theater = await Theater.save(theater);
  req.entityType = 'theater';
  logger.info('theater', 'Log:theater Controller:update:' + i18nUtil.getI18nMessage('theaterUpdate'));
  return res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Get theater list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {theater: theater, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('theater', 'Log:theater Controller:list: query :' + JSON.stringify(req.query));
  let responseJson = {};
  const query = await serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    //  total count;
    query.pagination.totalCount = await Theater.totalCount(query);
  }
  //get total theater
  const theater = await Theater.list(query);
  logger.info('theater', 'Log:theater Controller:list:' + i18nUtil.getI18nMessage('recordsFound'));
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.theater = theater;
  responseJson.pagination = query.pagination;
  return res.json(responseJson)
}

/**
 * Delete theater.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('theater', 'Log:theater Controller:remove: query :' + JSON.stringify(req.query));
  const theater = req.theater;
  theater.active = false;
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      theater.updatedBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('theater', 'Error:theater Controller:remove:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  theater.updated = Date.now();
  req.theater = await Theater.save(theater);
  req.entityType = 'theater';
  logger.info('theater', 'Log:theater Controller:remove:' + i18nUtil.getI18nMessage('theaterDelete'));
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
