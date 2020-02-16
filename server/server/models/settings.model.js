import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import crypto from 'crypto';
import errorService from '../services/error.service';
const Schema = mongoose.Schema;
/**
 * SettingsSchema
 */
const SettingsSchema = new mongoose.Schema({
  companyName: {
    type: String
  },
  companyImg: {
    type: String
  },
  contactPerson: {
    type: String
  },
  contactMail: {
    type: String
  },
  contactNumber: {
    type: String
  },
  contactAddress: {
    type: String
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
SettingsSchema.statics = {
  /**
   * save and update settings
   * @param settings
   * @returns {Promise<Settings, APIError>}
   */
  save(settings) {
    return settings.save()
      .then((settings) => {
        if (settings) {
          return settings;
        }
        let req = {};
        req.errorKey = 'settingsCreateError';
        errorService.insertActivity(req);
        const err = new APIError('Error in user', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
    * List task in descending order of 'createdAt' timestamp.
    * @returns {Promise<Settings[]>}
    */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
    * Count of settings records
    * @returns {Promise<Settings[]>}
    */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },

  /**
     * Get settings
     * @param {ObjectId} id - The objectId of settings.
     * @returns {Promise<Settings, APIError>}
     */
  get(id) {
    return this.findById(id)
      .exec()
      .then((settings) => {
        if (settings) {
          return settings;
        }
        let req = {};
        req.errorKey = 'Nosuchsettingsexists';
        errorService.insertActivity(req);
        const err = new APIError('No such settings exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  createBankDetails(query) {
    return this.findOne(query.filter)
      .exec()
      .then((settings) => {
        if (settings) {
          return settings;
        }
        let req = {};
        req.errorKey = 'Nosuchsettingsexists';
        errorService.insertActivity(req);
        const err = new APIError('No such settings exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef Settings
 */
export default mongoose.model('Settings', SettingsSchema);






