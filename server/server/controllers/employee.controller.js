
import Employee from '../models/employee.model';

import activityService from '../services/activity.service';
import EmailService from '../services/email.service';
import EmployeeService from '../services/employee.service';

import i18nUtil from '../utils/i18n.util';
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
import sessionUtil from '../utils/session.util';

import Sms from '../services/sms.service';

const employeeService = new EmployeeService();
const emailService = new EmailService();
const smsService = new Sms();
/**
 * Load Employee and append to req.
 * @param req
 * @param res
 * @param next
 */

async function load(req, res, next) {
  req.employee = await Employee.get(req.params.employeeId);
  return next();
}

/**
 * Get Employee
 * @param req
 * @param res
 * @returns {details: employee}
 */

async function get(req, res) {
  logger.info('employee', 'Log:Employee Controller:get: query :' + JSON.stringify(req.query));
  req.query = await serviceUtil.generateListQuery(req);
  let employee = req.employee;
  logger.info('employee', 'Log:employee Controller:get:' + i18nUtil.getI18nMessage('recordFound'));
  let responseJson = {
    respCode: respUtil.getDetailsSuccessResponse().respCode,
    details: employee
  };

  return res.json(responseJson);
}

/**
 * Create new employee
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('employee', 'Log:Employee Controller:create: body :' + JSON.stringify(req.body));
  let employee = new Employee(req.body);
  if (sessionUtil.checkTokenInfo(req, "loginType") && sessionUtil.getLoginType(req) !== 'employee') {
    req.i18nKey = 'not_an_admin';
    logger.error('employee', 'Error:employee Controller:create:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }

  //check email exists or not
  const uniqueEmail = await Employee.findUniqueEmail(employee.email);
  if (uniqueEmail) {
    req.i18nKey = 'emailExists';
    logger.error('employee', 'Error:employee Controller:create:' + i18nUtil.getI18nMessage('emailExists'));
    return res.json(respUtil.getErrorResponse(req));
  }
  employee = await employeeService.setCreateEmployeeVariables(req, employee)
  req.employee = await Employee.save(employee);
  req.employee.password = req.employee.salt = undefined;
  req.entityType = 'employee';
  req.activityKey = 'employeeCreate';
  req.enEmail = serviceUtil.encodeString(req.employee.email);
  activityService.insertActivity(req);
  //send email to employee
  // emailService.sendEmail(req, res);
  // let templateInfo = JSON.parse(JSON.stringify(config.mailSettings));
  // emailService.sendEmailviaGrid({
  //   templateName: config.emailTemplates.employeeWelcome,
  //   emailParams: {
  //     to: employee.email,
  //     displayName: employee.displayName,
  //     Id: req.employee._id,
  //     link: templateInfo.adminUrl
  //   }
  // });
  logger.info('employee', 'Log:employee Controller:create:' + i18nUtil.getI18nMessage('employeeCreate'));
  return res.json(respUtil.createSuccessResponse(req));
}

/**
* Get employee list. based on criteria
* @param req
* @param res
* @param next
* @returns {employees: employees, pagination: pagination}
*/
async function list(req, res, next) {
  let responseJson = {};
  logger.info('employee', 'log:Employee Controller:list:query :' + JSON.stringify(req.query));
  const query = await serviceUtil.generateListQuery(req);

  if (query.page === 1) {
    // total count
    query.pagination.totalCount = await Employee.totalCount(query);
  }
  //get employee records
  const employees = await Employee.list(query);
  logger.info('employee', 'Log:employee Controller:list:' + i18nUtil.getI18nMessage('recordsFound'));
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.employees = employees;
  responseJson.pagination = query.pagination;
  return res.json(responseJson);
}


/**
 * Update existing employee
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  req.query = await serviceUtil.generateListQuery(req);
  logger.info('employee', 'Log:Employee Controller:update: body :' + JSON.stringify(req.body));
  let employee = req.employee;
  if (sessionUtil.checkTokenInfo(req, "loginType") && sessionUtil.getLoginType(req) !== 'employee') {
    req.i18nKey = 'not_an_admin';
    logger.error('employee', 'Error:employee Controller:create:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  // check unique email
  if (req.body.email && employee.email !== req.body.email) {
    req.i18nKey = 'emailCannotChange';
    logger.error('employee', 'Error:employee Controller:update:' + i18nUtil.getI18nMessage('emailExists'));
    return res.json(respUtil.getErrorResponse(req));
  }

  employee = Object.assign(employee, req.body);
  employee = await employeeService.setUpdateEmployeeVariables(req, employee)
  req.employee = await Employee.save(employee);
  req.entityType = 'employee';
  req.activityKey = 'employeeUpdate';
  activityService.insertActivity(req);
  logger.info('employee', 'Log:employee Controller:update:' + i18nUtil.getI18nMessage('employeeUpdate'));
  return res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Delete employee.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('employee', 'Log:Employee Controller:remove: query :' + JSON.stringify(req.query));
  let employee = req.employee;
  if (sessionUtil.checkTokenInfo(req, "loginType") && sessionUtil.getLoginType(req) !== 'employee') {
    req.i18nKey = 'not_an_admin';
    logger.error('employee', 'Error:employee Controller:create:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  employee = await employeeService.setUpdateEmployeeVariables(req, employee)
  employee.active = false;
  req.employee = await Employee.save(employee);
  req.entityType = 'employee';
  req.activityKey = 'employeeDelete';
  activityService.insertActivity(req);
  logger.info('employee', 'Log:employee Controller:remove:' + i18nUtil.getI18nMessage('employeeDelete'));
  res.json(respUtil.removeSuccessResponse(req));
}


export default {
  create,
  list,
  get,
  load,
  update,
  remove,
};
