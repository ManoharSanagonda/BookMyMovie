import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import crypto from 'crypto';
import errorService from '../services/error.service';
const Schema = mongoose.Schema;
/**
 * ShowTimesSchema
 */
const ShowTimesSchema = new mongoose.Schema({
  time:{
    type:String
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  createdBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    }
  },
  updatedBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    }
  },
  active: {
    type: Boolean,
    default: true
  }
},
  {
    usePushEach: true
  });
/**
 * Statics
 */
ShowTimesSchema.statics = {
  /**
   * save and update showTimes
   * @param showTimes
   * @returns {Promise<ShowTimes, APIError>}
   */
  save(showTimes) {
    return showTimes.save()
      .then((showTimes) => {
        if (showTimes) {
          return showTimes;
        }
        let req = {};
        req.errorKey = 'showTimesCreateError';
        errorService.insertActivity(req);
        const err = new APIError('Error in user', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
    * List task in descending order of 'createdAt' timestamp.
    * @returns {Promise<ShowTimes[]>}
    */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
    * Count of showTimes records
    * @returns {Promise<ShowTimes[]>}
    */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },

  /**
     * Get showTimes
     * @param {ObjectId} id - The objectId of showTimes.
     * @returns {Promise<ShowTimes, APIError>}
     */
  get(id) {
    return this.findById(id)
      .exec()
      .then((showTimes) => {
        if (showTimes) {
          return showTimes;
        }
        let req = {};
        req.errorKey = 'NosuchshowTimesexists';
        errorService.insertActivity(req);
        const err = new APIError('No such showTimes exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  createBankDetails(query) {
    return this.findOne(query.filter)
      .exec()
      .then((showTimes) => {
        if (showTimes) {
          return showTimes;
        }
        let req = {};
        req.errorKey = 'NosuchshowTimesexists';
        errorService.insertActivity(req);
        const err = new APIError('No such showTimes exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef ShowTimes
 */
export default mongoose.model('ShowTimes', ShowTimesSchema);






