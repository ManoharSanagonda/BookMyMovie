
import i18nService from './i18n.util';
import httpStatus from 'http-status';
import config from '../config/config';
/**
 * get error response
 * @param req
 * @returns {responseObj}
 */
function getErrorResponse(req) {
  let errorMessage = i18nService.getI18nMessage(req.i18nKey);
  let createErrObj = {
    errorCode: '9001',
    errorMessage: req.errorMessage || errorMessage
  };
  if (req.duplicates && req.duplicates.length > 0) {
    createErrObj.duplicates = req.duplicates;
  }
  return createErrObj;
};

/**
 * create success response
 * @param req
 * @returns {responseObj}
 */
function createSuccessResponse(req) {
  let createSucObj = {
    respCode: httpStatus.NO_CONTENT, // 204
    respMessage: i18nService.getI18nMessage(req.entityType + 'Create')
  };
  if (req.entityType) {
    createSucObj[req.entityType + 'Id'] = req[req.entityType] ? req[req.entityType]._id : '';
  }
  if (req.query && req.query.response && req.query.response === 'true') {
    createSucObj.details = req[req.entityType];
  }
  return createSucObj;
}



function updateSuccessResponse(req) {
  let createSucObj = {
    respCode: httpStatus.RESET_CONTENT, // 205
    respMessage: i18nService.getI18nMessage(req.entityType + 'Update')
  }
  if (req.entityType) {
    createSucObj[req.entityType + 'Id'] = req[req.entityType] ? req[req.entityType]._id : '';
  }
  if (req.query.response === 'true') {
    createSucObj.details = req[req.entityType];
  }
  return createSucObj;
}
/**
 * remove success response
 * @param req
 * @returns {responseObj}
 */
function removeSuccessResponse(req) {
  let createSucObj = {
    respCode: httpStatus.PARTIAL_CONTENT, // 206
    respMessage: i18nService.getI18nMessage(req.entityType + 'Delete')
  };
  if (req.entityType) {
    createSucObj[req.entityType + 'Id'] = req[req.entityType] ? req[req.entityType]._id : '';
  }
  if (req.query.response === 'true') {
    createSucObj.details = req[req.entityType];
  }
  return createSucObj;
}
/**
 * success response
 * @param req
 * @returns {responseObj}
 */
function successResponse(req) {
  let createSucObj = {
    respCode: httpStatus.OK,
    respMessage: i18nService.getI18nMessage(req.i18nKey)
  };
  return createSucObj;
}
/**
 * success response when get details/get details by id
 * 
 * @returns {responseObj}
 */
function getDetailsSuccessResponse() {
  let createSucObj = {
    respCode: httpStatus.OK
  };
  return createSucObj;
}
/**
 * login success response
 * @param req
 * @returns {responseObj}
 */
function loginSuccessResponse(req) {
  let createSucObj = {
    respCode: httpStatus.OK,
    respMessage: i18nService.getI18nMessage(req.i18nKey),
    accessToken: req.token.accessToken,
    refreshToken: req.token.refreshToken,
    details: req.user || req.employee
  };
  return createSucObj;
}

/**
 * logout success response
 * @param req
 * @returns {responseObj}
 */
function logoutSuccessResponse(req) {
  let createSucObj = {
    respCode: httpStatus.OK,
    respMessage: i18nService.getI18nMessage(req.i18nKey)
  };
  return createSucObj;
}

/**
 * update logo response
 * @param req
 * @returns {responseObj}
 */
function uploadLogoSucessResponse(req) {
  let responseObj = {
    respCode: httpStatus.NO_CONTENT,
    respMessage: i18nService.getI18nMessage(req.entityType + 'Upload'),
    fileName: req.image
  };
  return responseObj;
}

/**
 * prepare trade history reponse
 * @param Object { tradeHistories }
 * @returns {responseObj}
 */
export default {
  getErrorResponse,
  createSuccessResponse,
  updateSuccessResponse,
  removeSuccessResponse,
  successResponse,
  loginSuccessResponse,
  logoutSuccessResponse,
  uploadLogoSucessResponse,
  getDetailsSuccessResponse
};
