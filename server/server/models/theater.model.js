import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import crypto from 'crypto';
import errorService from '../services/error.service';
const Schema = mongoose.Schema;
/**
 * TheaterSchema
 */
const TheaterSchema = new mongoose.Schema({
  name: {
    type: String
  },
  location:{
    type:String
  },
  address: {
    address: {
      type: String,
    },
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zip: {
      type: String,
    }
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
TheaterSchema.statics = {
  /**
   * save and update theater
   * @param theater
   * @returns {Promise<Theater, APIError>}
   */
  save(theater) {
    return theater.save()
      .then((theater) => {
        if (theater) {
          return theater;
        }
        let req = {};
        req.errorKey = 'theaterCreateError';
        errorService.insertActivity(req);
        const err = new APIError('Error in user', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
    * List task in descending order of 'createdAt' timestamp.
    * @returns {Promise<Theater[]>}
    */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
    * Count of theater records
    * @returns {Promise<Theater[]>}
    */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },

  /**
     * Get theater
     * @param {ObjectId} id - The objectId of theater.
     * @returns {Promise<Theater, APIError>}
     */
  get(id) {
    return this.findById(id)
      .exec()
      .then((theater) => {
        if (theater) {
          return theater;
        }
        let req = {};
        req.errorKey = 'Nosuchtheaterexists';
        errorService.insertActivity(req);
        const err = new APIError('No such theater exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  createBankDetails(query) {
    return this.findOne(query.filter)
      .exec()
      .then((theater) => {
        if (theater) {
          return theater;
        }
        let req = {};
        req.errorKey = 'Nosuchtheaterexists';
        errorService.insertActivity(req);
        const err = new APIError('No such theater exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef Theater
 */
export default mongoose.model('Theater', TheaterSchema);






