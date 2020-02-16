import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import crypto from 'crypto';
import mongooseFloat from 'mongoose-float';
const Float = mongooseFloat.loadType(mongoose);

const Schema = mongoose.Schema;
import errorService from '../services/error.service';

/**
 * Employee Schema
 */
const EmployeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  displayName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  photo: {
    type: String,
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
  password: {
    type: String,
  },
  salt: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  createdByName: {
    type: String
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
  disabledDate: {
    type: Date
  },
  status: {
    type: String,
    default: 'Active'
  },
  active: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    default: ''
  },
  rolePermissions: {
    type: Object
  }
},
  {
    usePushEach: true
  });

/**
 * Hook a pre save method to hash the password
 */
EmployeeSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 * Hook a pre validate method to test the local password
 */
EmployeeSchema.pre('validate', function (next) {
  if (this.provider === 'local' && this.password && this.isModified('password')) {
    let result = owasp.test(this.password);
    if (result.errors.length) {
      let error = result.errors.join(' ');
      this.invalidate('password', error);
    }
  }

  next();
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
EmployeeSchema.methods = {
  /**
  * Create instance method for authenticating employee
  * @param {password}
  */
  authenticate(password) {
    return this.password === this.hashPassword(password);
  },

  /**
  * Create instance method for hashing a password
  * @param {password}
  */
  hashPassword(password) {
    if (this.salt && password) {
      return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
    } else {
      return password;
    }
  }
};


EmployeeSchema.statics = {

  /**
   * save and update Employee
   * @param Employee
   * @returns {Promise<Employee, APIError>}
   */
  save(employee) {
    return employee.save()
      .then((employee) => {
        if (employee) {
          return employee;
        }
        let req = {};
        req.errorKey = 'EmployeeCreateError';
        errorService.insertActivity(req);
        const err = new APIError('error in employee', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });

  },

  /**
 * List employee in descending order of 'createdAt' timestamp.
 * @returns {Promise<employee[]>}
 */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of employee records
   * @returns {Promise<employee[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .estimatedDocumentCount();
  },
  /**
   * Get employee
   * @param {ObjectId} id - The objectId of employee.
   * @returns {Promise<employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((employee) => {
        if (employee) {
          return employee;
        }
        let req = {};
        req.errorKey = 'NoSuchEmployeeExist';
        errorService.insertActivity(req);
        const err = new APIError('No such employee exists', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      })
  },

  /**
   * Find unique email.
   * @param {string} email.
   * @returns {Promise<Employee[]>}
   */
  findUniqueEmail(email) {
    email = email.toLowerCase();
    return this.findOne({
      email: email,
      active: true
    })
      .exec()
      .then((employee) => employee);
  }
}

export default mongoose.model('Employee', EmployeeSchema);
