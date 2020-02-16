
import Employee from '../models/employee.model';
import User from '../models/user.model';

import uploadeService from '../services/upload.service';

import i18nUtil from '../utils/i18n.util';
import respUtil from '../utils/resp.util';
import sessionUtil from '../utils/session.util';


/** 
 * Upload pictures and documents
 */
async function upload(req, res, next) {
    logger.info('upload', 'Log:Upload Controller :body:' + JSON.stringify(req.body));
    if (sessionUtil.checkTokenInfo(req, "_id") && sessionUtil.checkTokenInfo(req, "loginType")) {
        req.entityType = sessionUtil.getLoginType(req);
        if (req.entityType === "employee") {
            req.details = await Employee.get(sessionUtil.getSessionLoginID(req));
        } else if (req.entityType === "user") {
            req.details = await User.get(sessionUtil.getSessionLoginID(req));
        } else {
            req.i18nKey = 'invalidLoginType';
            return res.json(respUtil.getErrorResponse(req));
        }
    } else {
        req.i18nKey = 'invalidLoginType';
        return res.json(respUtil.getErrorResponse(req));
    }
    req.uploadFile = [];
    req.uploadPath = req.query.uploadPath;
    req.details.updatedBy[req.entityType] = sessionUtil.getSessionLoginID(req);
    req.details.updated = Date.now();
    //Calling the activity of uploading the required file
    console.log(req.entityType)
    uploadeService.upload(req, res, async (err) => {
        console.log(req.entityType)
        console.log(sessionUtil.getLoginType(req))
        if (err) {
            logger.error('upload', `Error:Upload Controller: Change ${req.entityType} Logo: Error:' + JSON.stringify(err)`);
            req.i18nKey = "Upload Directory not Found";
            return res.json(respUtil.getErrorResponse(req));
        } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
            req.image = req.uploadFile[0].name;
            req.details.photo = req.uploadFile[0].name;
            console.log(req.details)
            //Saving the changes of the entityType 
            console.log(req.entityType)
            if (req.entityType === 'employee') {
                await Employee.save(req.details);
            } else if (req.entityType === 'user') {
                await User.save(req.details);
            }
            req.entityType = `${req.entityType}`;
            console.log(req.entityType)
            req.activityKey = `${req.entityType}Upload`;
            logger.info('upload', `Log:Upload Controller:Change ${req.entityType} logo:${i18nUtil.getI18nMessage(req.activityKey)}`);
            return res.json(respUtil.uploadLogoSucessResponse(req))
        } else {
            req.i18nKey = `${req.entityType}LogoUploadedErrorMessage`;
            logger.error('upload', `Error:Upload:Change ${req.entityType} Logo: Error : ${req.entityType} Logo not uploded.`);
            return res.json(respUtil.getErrorResponse(req));
        }
    })
}


export default {
    upload
}