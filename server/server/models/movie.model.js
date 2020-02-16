import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import crypto from 'crypto';
import errorService from '../services/error.service';
const Schema = mongoose.Schema;
/**
 * MovieSchema
 */
const MovieSchema = new mongoose.Schema({
  name: {
    type: String
  },
  Image: {
    type: String
  },
  theatersList:{
    type:Array
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
  },
  enableMails: {
    type: Boolean,
    default: false
  },
  disableMultipleLogin: {
    type: Boolean,
    default: true
  },
  sendGridApiKey: {
    type: String
  },
  sendGridEmail: {
    type: String
  },
  emailSourceType: {
    type: String
  },
  logs: {
    type: Array
  },
  enableTerminalLogs: {
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
MovieSchema.statics = {
  /**
   * save and update movie
   * @param movie
   * @returns {Promise<Movie, APIError>}
   */
  save(movie) {
    return movie.save()
      .then((movie) => {
        if (movie) {
          return movie;
        }
        let req = {};
        req.errorKey = 'movieCreateError';
        errorService.insertActivity(req);
        const err = new APIError('Error in user', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
    * List task in descending order of 'createdAt' timestamp.
    * @returns {Promise<Movie[]>}
    */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
    * Count of movie records
    * @returns {Promise<Movie[]>}
    */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },

  /**
     * Get movie
     * @param {ObjectId} id - The objectId of movie.
     * @returns {Promise<Movie, APIError>}
     */
  get(id) {
    return this.findById(id)
      .exec()
      .then((movie) => {
        if (movie) {
          return movie;
        }
        let req = {};
        req.errorKey = 'Nosuchmovieexists';
        errorService.insertActivity(req);
        const err = new APIError('No such movie exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  createBankDetails(query) {
    return this.findOne(query.filter)
      .exec()
      .then((movie) => {
        if (movie) {
          return movie;
        }
        let req = {};
        req.errorKey = 'Nosuchmovieexists';
        errorService.insertActivity(req);
        const err = new APIError('No such movie exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef Movie
 */
export default mongoose.model('Movie', MovieSchema);






