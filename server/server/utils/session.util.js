
/**
 * 
 * @return { ID}
 *  
 */
function getSessionLoginID(req) {
  return req.tokenInfo._id;
}

/**
 * 
 * @return { Email}
 *  
 */
function getSessionLoginID(req) {
  return req.tokenInfo._id;
}

/**
 * 
 * @return { Name}
 *  
 */
function getSessionLoginName(req) {
  return req.tokenInfo.displayName;
}

/**
 * 
 * @return {Comapany Name}
 *  
 */
function getSessionLoginCompanyName(req) {
  return req.tokenInfo.companyName
}

/**
 * 
 * @return {Comapany ID}
 *  
 */
function getSessionLoginCompanyID(req) {
  return req.tokenInfo.companyId;
}

/**
 * 
 * @return {Boolean}
 *  
 */
function checkPhoneNumberExists(req) {
  return req.tokenInfo && req.tokenInfo.phone;
}

/**
 * 
 * @return {Boolean}
 *  
 */
function checkUseTwoFactorEnable(req) {
  return req.tokenInfo && req.tokenInfo.twoFactor === "enable";
}

function checkTokenInfo(req, filed) {
  if (req.tokenInfo && req.tokenInfo[filed]) {
    return true
  } else {
    return false
  }
}

function getTokenInfo(req) {
  return req.tokenInfo;
}

function getLoginType(req) {
  return req.tokenInfo.loginType
}
export default {
  getSessionLoginID,
  getSessionLoginName,
  getSessionLoginCompanyName,
  getSessionLoginCompanyID,
  checkPhoneNumberExists,
  checkUseTwoFactorEnable,
  checkTokenInfo,
  getTokenInfo,
  getLoginType
}