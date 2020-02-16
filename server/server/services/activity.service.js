import Activity from '../models/activity.model';
import ReqJson from '../models/reqJson.model';

import ActivityUtil from '../utils/activity.util';
import serviceUtil from '../utils/service.util';

/**
 * set activity variables
 * @returns {activity}
 */
function setActivityVaribles(req, activity) {
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'activity') {
      activity.createdBy.activity = req.tokenInfo._id;
    }
  }
  return activity;
}

/**
 * insert activity
 * @returns {activity}
 */
async function insertActivity(req) {
  let activityConfig = ActivityUtil.activityConfig;
  let activity = new Activity(activityConfig[req.activityKey]);
  if (req.contextId) {
    activity.contextId = req.contextId;
  } else if (req.entityType && req[req.entityType] && req[req.entityType]._id) {
    activity.contextId = req[req.entityType]._id
  }
  if (req.body && req.body.pair) {
    activity.pair = req.body.pair;
  }
  if (req.description) {
    activity.description = req.description;
  }
  if (activityConfig && activityConfig[req.activityKey]) {
    if (req.key === '401') {
      if (req.body && !req.body.type) {
        req.body.type = "web";
      }
      activity.loginFrom = req.body.type;
    }
    if (req.body && (req.body.email || req.body.emailid) && activity.contextType && activity.contextType === "LOGIN") {
      activity.email = req.body.email || req.body.emailid;
    }
    if (req && req.tokenInfo && req.tokenInfo.loginType === 'employee') {
      activity.createdBy.employee = req.tokenInfo._id;
      if (!activity.contextId) {
        activity.contextId = req.tokenInfo._id;
      }
      activity.type = 'EMPLOYEE';
      activity.email = req.tokenInfo.email;

    }
    if (req.body && req.url && req.tokenInfo) {
      let reqJson = {}
      reqJson.json = {};
      reqJson.url = req.originalUrl || '';
      reqJson.json.body = req.body || {};
      reqJson.json.params = req.query || {};
      reqJson.method = req.method;
      activity.requestJson = reqJson;
    }
    if (req.entityType && req.entityType === "templates" && req.templates) {
      activity.name = req.templates.name;
    }
    await Activity.save(activity);
    return true;
  } else {
    return true;
  }
}

/**
 * get activities
 * @returns {activity}
 */
async function getActivities(req, user) {
  let query = await serviceUtil.generateListQuery(req);
  // let query = {};

  query.filter = { type: 'user', active: true, 'createdBy.user': user._id };
  if (query.page === 1) {
    query.pagination.totalCount = await Activity.totalCount(query);
  }
  let activities = await Activity.list(query);
  let activityObj = {
    pagination: query.pagination,
    details: activities
  };
  return activityObj;
}

export default {
  setActivityVaribles,
  insertActivity,
  getActivities
};
