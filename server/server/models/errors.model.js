import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;
/**
 * Activity Schema
 */
const ErrorSchema = new mongoose.Schema({
  contextId: {
    type: Schema.ObjectId
  },
  contextType: {
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
  key: {
    type: String
  },
  description: {
    type: Array
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
},
  {
    usePushEach: true
  });

/**
 * Statics
 */
ErrorSchema.statics = {
  /**
   * save and update error
   * @param error
   * @returns {Promise<error, APIError>}
   */
  save(error) {
    return error.save()
      .then((error) => {
        if (error) {
          return error;
        }
        const err = new APIError('Error in error', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
}
/**
* @typedef Error
*/
export default mongoose.model('Error', ErrorSchema);

