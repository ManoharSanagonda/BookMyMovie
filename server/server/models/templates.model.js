import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import crypto from 'crypto';
import mongooseFloat from 'mongoose-float';
import errorService from '../services/error.service';
const Float = mongooseFloat.loadType(mongoose);
const Schema = mongoose.Schema;
/**
 * templates Schema
 */
const TemplatesSchema = new mongoose.Schema({
  name: {
    type: String
  },
  templateType: {
    type: String
  },
  entityType: {
    type: String
  },
  subject: {
    type: String
  },
  templateText: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: 'Employee'
  },
  updatedBy: {
    type: Schema.ObjectId,
    ref: 'Employee'
  }
},
  {
    usePushEach: true
  });
/**
 * Statics
 */
TemplatesSchema.statics = {
  /**
   * save and update templates
   * @param templates
   * @returns {Promise<Templates, APIError>}
   */
  save(templates) {
    return templates.save()
      .then((templates) => {
        if (templates) {
          return templates;
        }
        let req = {};
        req.errorKey = 'templatesCreateError';
        errorService.insertActivity(req);
        const err = new APIError('Error in user', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
    * List task in descending order of 'createdAt' timestamp.
    * @returns {Promise<Templates[]>}
    */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
    * Count of templates records
    * @returns {Promise<Templates[]>}
    */
  totalCount(query) {
    console.log(query)
    return this.find(query.filter)
      .count();
  },

  /**
     * Get templates
     * @param {ObjectId} id - The objectId of templates.
     * @returns {Promise<Templates, APIError>}
     */
  get(id) {
    return this.findById(id)
      .exec()
      .then((templates) => {
        if (templates) {
          return templates;
        }
        let req = {};
        req.errorKey = 'Nosuchtemplatesexists';
        errorService.insertActivity(req);
        const err = new APIError('No such templates exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Find unique emailid.
   * @param {string} emailid.
   * @returns {Promise<templates[]>}
   */
  findUniqueTemplate(name) {
    return this.findOne({
      name: name,
      active: true
    })
      .exec()
      .then((templates) => {
        if (templates) {
          return templates;
        }
        let req = {};
        req.errorKey = 'Nosuchtemplatesexists';
        errorService.insertActivity(req);
        const err = new APIError('No such templates exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef Templates
 */
export default mongoose.model('Templates', TemplatesSchema);





