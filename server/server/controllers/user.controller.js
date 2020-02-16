import config from '../config/config';

import User from '../models/user.model';

import activityService from '../services/activity.service';
import EmailService from '../services/email.service';
import UserService from '../services/user.service';

import i18nUtil from '../utils/i18n.util';
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

const userService = new UserService();
const emailService = new EmailService();
/**
 * Load User and append to req.
 * @param req
 * @param res
 * @param next
 */

async function load(req, res, next) {
    req.user = await User.get(req.params.userId);
    return next();
}

/**
 * Get User
 * @param req
 * @param res
 * @returns {details: user}
 */

async function get(req, res) {
    logger.info('user', 'Log:User Controller:get: query :' + JSON.stringify(req.query));
    req.query = await serviceUtil.generateListQuery(req);
    let user = req.user;
    logger.info('user', 'Log:user Controller:get:' + i18nUtil.getI18nMessage('recordFound'));
    let responseJson = {
        respCode: respUtil.getDetailsSuccessResponse().respCode,
        details: user
    };

    return res.json(responseJson);
}

/**
 * Create new user
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
    logger.info('user', 'Log:User Controller:create: body :' + JSON.stringify(req.body));
    let user = new User(req.body);
    //check email exists or not
    const uniqueEmail = await User.findUniqueEmail(user.email);
    if (uniqueEmail) {
        req.i18nKey = 'emailExists';
        logger.error('user', 'Error:user Controller:create:' + i18nUtil.getI18nMessage('emailExists'));
        return res.json(respUtil.getErrorResponse(req));
    }
    user = await userService.setCreateUserVariables(req, user)
    req.user = await User.save(user);
    req.user.password = req.user.salt = undefined;
    req.entityType = 'user';
    req.activityKey = 'userCreate';
    req.enEmail = serviceUtil.encodeString(req.user.email);
    activityService.insertActivity(req);
    //send email to user
    // emailService.sendEmail(req, res);
    // let templateInfo = JSON.parse(JSON.stringify(config.mailSettings));
    // emailService.sendEmailviaGrid({
    //   templateName: config.emailTemplates.userWelcome,
    //   emailParams: {
    //     to: user.email,
    //     displayName: user.displayName,
    //     Id: req.user._id,
    //     link: templateInfo.adminUrl
    //   }
    // });
    logger.info('user', 'Log:user Controller:create:' + i18nUtil.getI18nMessage('userCreate'));
    return res.json(respUtil.createSuccessResponse(req));
}

/**
* Get user list. based on criteria
* @param req
* @param res
* @param next
* @returns {users: users, pagination: pagination}
*/
async function list(req, res, next) {
    let responseJson = {};
    logger.info('user', 'log:User Controller:list:query :' + JSON.stringify(req.query));
    const query = await serviceUtil.generateListQuery(req);

    if (query.page === 1) {
        // total count
        query.pagination.totalCount = await User.totalCount(query);
    }
    //get user records
    const users = await User.list(query);
    logger.info('user', 'Log:user Controller:list:' + i18nUtil.getI18nMessage('recordsFound'));
    responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
    responseJson.users = users;
    responseJson.pagination = query.pagination;
    return res.json(responseJson);
}


/**
 * Update existing user
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
    req.query = await serviceUtil.generateListQuery(req);
    logger.info('user', 'Log:User Controller:update: body :' + JSON.stringify(req.body));
    let user = req.user;
    // check unique email
    if (req.body.email && user.email !== req.body.email) {
        req.i18nKey = 'emailCannotChange';
        logger.error('user', 'Error:user Controller:update:' + i18nUtil.getI18nMessage('emailExists'));
        return res.json(respUtil.getErrorResponse(req));
    }
    user = Object.assign(user, req.body);
    user = await userService.setUpdateUserVariables(req, user)
    req.user = await User.save(user);
    req.entityType = 'user';
    req.activityKey = 'userUpdate';
    activityService.insertActivity(req);
    logger.info('user', 'Log:user Controller:update:' + i18nUtil.getI18nMessage('userUpdate'));
    return res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Delete user.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
    logger.info('user', 'Log:User Controller:remove: query :' + JSON.stringify(req.query));
    let user = req.user;
    user = await userService.setUpdateUserVariables(req, user)
    user.active = false;
    req.user = await User.save(user);
    req.entityType = 'user';
    req.activityKey = 'userDelete';
    activityService.insertActivity(req);
    logger.info('user', 'Log:user Controller:remove:' + i18nUtil.getI18nMessage('userDelete'));
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
