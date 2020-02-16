import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import errorService from '../services/error.service';
const Schema = mongoose.Schema;
/**
 * EmailVerification Schema
 */
const EmailVerificationSchema = new mongoose.Schema({
  token: {
    type: String
  },
  email: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  type: {
    type: String
  },
  login: {
    type: String
  },
  createdTimeStamp: {
    type: Number
  },
  expireTimeStamp: {
    type: Number
  },
  created: {
    type: Date,
    default: Date.now
  }
});
/**
 * Statics
 */
EmailVerificationSchema.statics = {
  /**
   * save and update emailVerification
   * @param emailVerification
   * @returns {Promise<EmailVerification, APIError>}
   */
  save(emailVerification) {
    return emailVerification.save()
      .then((emailVerification) => {
        if (emailVerification) {
          return emailVerification;
        }
        let req = {};
        req.errorKey = 'emailVerificationCreateError';
        errorService.insertActivity(req);
        const err = new APIError('Error in user', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
    * List task in descending order of 'createdAt' timestamp.
    * @returns {Promise<EmailVerification[]>}
    */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
    * Count of emailVerification records
    * @returns {Promise<EmailVerification[]>}
    */
  totalCount(query) {
    console.log(query)
    return this.find(query.filter)
      .count();
  },

  /**
     * Get emailVerification
     * @param {ObjectId} id - The objectId of emailVerification.
     * @returns {Promise<EmailVerification, APIError>}
     */
  get(id) {
    return this.findById(id)
      .exec()
      .then((emailVerification) => {
        if (emailVerification) {
          return emailVerification;
        }
        let req = {};
        req.errorKey = 'NosuchemailVerificationexists';
        errorService.insertActivity(req);
        const err = new APIError('No such emailVerification exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
};

/**
 * @typedef EmailVerification
 */
export default mongoose.model('EmailVerification', EmailVerificationSchema);




