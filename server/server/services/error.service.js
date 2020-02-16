import Error from '../models/errors.model';

import ErrorUtil from '../utils/error.util';


/**
 * insert activity
 * @returns {activity}
 */
async function insertActivity(req) {
  let errorConfig = ErrorUtil.errorConfig;
  let error = new Error(errorConfig[req.errorKey]);
  if (req.contextId) {
    error.contextId = req.contextId;
  }
  if (req.description) {
    error.description = req.description;
  }
  if (errorConfig && errorConfig[req.errorKey]) {
    if (req.key === '401') {
      if (!req.body.type) {
        req.body.type = "web";
      }
      error.loginFrom = req.body.type;
    }
    if (req && req.tokenInfo && req.tokenInfo.loginType === 'employee') {
        error.createdBy.employee = req.tokenInfo._id;
        error.type = 'employee';

    } else if (req && req.tokenInfo && req.tokenInfo.loginType === 'user') {
        error.createdBy.user = req.tokenInfo._id;
        error.type = 'user';

    } else if (req && req.user && req.user._id) {
        error.contextId = req.user._id;
        error.createdBy.user = req.user._id;
        error.type = 'user';

    } else if (req && req.employee && req.employee._id) {
        error.contextId = req.employee._id;
        error.createdBy.employee = req.employee._id;
        error.type = 'employee';

    }
    await Error.save(error);
    return true;
  } else {
    return true;
  }
}

export default {
  insertActivity
};