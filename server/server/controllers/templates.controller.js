import config from '../config/config';
import Templates from '../models/templates.model';

import activityService from '../services/activity.service';
import errorService from '../services/error.service';

import i18nUtil from '../utils/i18n.util';
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

import fs from 'fs';

/**
 * Load Templates and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.templates = await Templates.get(req.params.templatesId);
  return next();
}
/**
 * Get templates
 * @param req
 * @param res
 * @returns {details: templates}
 */

async function get(req, res) {
  logger.info('templates', 'Log:templates Controller:get: query :' + JSON.stringify(req.query));
  req.query = await serviceUtil.generateListQuery(req);
  let templates = req.templates;
  logger.info('templates', 'Log:templates Controller:get:' + i18nUtil.getI18nMessage('recordFound'));
  let responseJson = {
    respCode: respUtil.getDetailsSuccessResponse().respCode,
    details: templates
  };
  return res.json(responseJson);
}
/**
 * Create new templates
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('templates', 'Log:templates Controller:create: body :' + JSON.stringify(req.body));
  let templates = new Templates(req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      templates.createdBy = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('templates', 'Error:settings Controller:update:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  req.templates = await Templates.save(templates);
  req.entityType = 'templates';
  req.activityKey = 'templatesCreate';
  activityService.insertActivity(req);
  req.errorKey = 'templatesCreate';
  errorService.insertActivity(req);
  logger.info('templates', 'Log:templates Controller:create:' + i18nUtil.getI18nMessage('templatesCreate'));
  return res.json(respUtil.createSuccessResponse(req));
  // for creating employee activity

}
/**
 * Update existing templates
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('templates', 'Log:templates Controller:update: body :' + JSON.stringify(req.body));
  let templates = req.templates;
  templates = Object.assign(templates, req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      templates.updatedBy = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('templates', 'Error:settings Controller:update:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  templates.updated = new Date();

  let path = config.path;
  let fileName = templates.name;
  req.templates = await Templates.save(templates);
  fs.writeFile(`${path}${fileName}`, templates.templateText, function (err) {
    if (err) throw err;
    console.log('Replaced!');
  });
  req.entityType = 'templates';
  req.activityKey = 'templatesUpdate';
  activityService.insertActivity(req);
  req.errorKey = 'templatesUpdate';
  errorService.insertActivity(req);
  logger.info('templates', 'Log:templates Controller:update:' + i18nUtil.getI18nMessage('templatesUpdate'));
  return res.json(respUtil.updateSuccessResponse(req));
  // for updating employee activity
}

/**
 * Get templates list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {templates: templates, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('templates', 'Log:templates Controller:list: query :' + JSON.stringify(req.query));
  let responseJson = {};
  const query = await serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    //  total count;
    query.pagination.totalCount = await Templates.totalCount(query);
  }
  //get total templatess
  const templatess = await Templates.list(query);
  logger.info('templates', 'Log:templates Controller:list:' + i18nUtil.getI18nMessage('recordsFound'));
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.templates = templatess;
  responseJson.pagination = query.pagination;
  return res.json(responseJson)
}

/**
 * Delete templates.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('templates', 'Log:templates Controller:remove: query :' + JSON.stringify(req.query));
  const templates = req.templates;
  templates.active = false;
  templates.updated = new Date();
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      templates.updatedBy = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('templates', 'Error:settings Controller:update:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  req.templates = await Templates.save(templates);
  req.entityType = 'templates';
  req.activityKey = 'templatesDelete';
  activityService.insertActivity(req);
  req.errorKey = 'templatesDelete';
  errorService.insertActivity(req);
  logger.info('templates', 'Log:templates Controller:Delete:' + i18nUtil.getI18nMessage('templatesDelete'));
  return res.json(respUtil.removeSuccessResponse(req));
  // for deleting employee activity
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove
};
