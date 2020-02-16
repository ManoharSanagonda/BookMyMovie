import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * Post Schema
 */
const TokenSchema = new mongoose.Schema({
  accessToken: String,
  refreshToken: String,
  loginType: String,
  loginFrom: String,
  deviceId: String,
  iosMobileAppVersion: String,
  androidMobileAppVersion: String,
  iosVersion: String,
  iosModel: String,
  devVersion: String,
  androidModel: String,
  expires: Number,
  accessTokenExpireAt: Date,
  refreshTokenExpireAt: Date,
  idscanToken: String,
  authFrom: String,
  email: String,
  employee: {
    type: Schema.ObjectId,
    ref: 'Employee'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  }
},
  {
    usePushEach: true
  });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
TokenSchema.method({
});

/**
 * Statics
 */
TokenSchema.statics = {

  /**
   * save and update token
   * @param token
   * @returns {Promise<Token, APIError>}
   */
  save(token) {
    return token.save()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('Error in user', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Find unique user token.
   * @param {objectId} userId.
   * @returns {Promise<Token>}
   */
  findUniqueUserToken(userId) {
    return this.findOne({
      user: userId,
      loginType: 'user'
    })
      .exec()
      .then((token) => token);
  },

  /**
   * Find unique employee token.
   * @param {objectId} employeeId.
   * @returns {Promise<Token>}
   */
  findUniqueEmployeeToken(employeeId) {
    return this.findOne({
      employee: employeeId,
      loginType: 'employee'
    })
      .exec()
      .then((token) => token);
  }
};

/**
 * @typedef Token
 */
export default mongoose.model('Token', TokenSchema);