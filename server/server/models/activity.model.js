import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;
/**
 * Activity Schema
 */
const ActivitySchema = new mongoose.Schema({
  contextId: {
    type: Schema.ObjectId
  },
  contextType: {
    type: String
  },
  context: {
    type: String
  },
  userId: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  employeeId: {
    type: Schema.ObjectId,
    ref: 'Employee'
  },
  desc: {
    type: String
  },
  value: {
    type: String
  },
  type: {
    type: String
  },
  name: {
    type: String
  },
  key: {
    type: String
  },
  description: {
    type: Array
  },
  pair: {
    type: String
  },
  currencySymbol: {
    type: String
  },
  price: {
    type: Number
  },
  activityType: {
    type: String
  },
  transferAmount: {
    type: Number
  },
  amount: {
    type: Number
  },
  created: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  loginFrom: {
    type: String
  },
  loginType: {
    type: String
  },
  createdBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    }
  },
  userObjId: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String
  },
  generate: {
    type: String
  },
  accountType: {
    type: String
  },
  mt4AccountStatus: {
    type: String
  },
  mt4Url: {
    type: String
  },
  from: {
    type: String
  },
  EURtoUSDrate: {
    type: Number
  },
  ipAdress: {
    type: String
  },
  location: {
    type: Object
  },
  country: {
    type: String
  },
  device: {
    type: String
  },
  email: {
    type: String
  },
  requestJson: {
    type: Object
  }
},
  {
    usePushEach: true
  }
);

/**
 * Statics
 */
ActivitySchema.statics = {
  /**
   * save and update activity
   * @param activity
   * @returns {Promise<Activity, APIError>}
   */
  save(activity) {
    return activity.save()
      .then((activity) => {
        if (activity) {
          return activity;
        }
        const err = new APIError('Error in activity', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get activity
   * @param {ObjectId} id - The objectId of activity.
   * @returns {Promise<Activity, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((activity) => {
        if (activity) {
          return activity;
        }
        const err = new APIError('No such activity exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List activity in descending order of 'createdAt' timestamp.
   * @returns {Promise<Activity[]>}
   */
  list(query) {
    return this.find(query.filter)
      .populate("createdBy.employee", 'firstName lastName displayName')
      .populate("createdBy.user", 'firstname lastname userName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  historyList(query) {
    return this.find(query.filter, ({ _id: 0, description: 1 }))
      .sort(query.sorting)
      .skip(query.page - 1 * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
   * Count of activity records
   * @returns {Promise<Activity[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }

};

/**
 * @typedef Activity
 */
export default mongoose.model('Activity', ActivitySchema);
