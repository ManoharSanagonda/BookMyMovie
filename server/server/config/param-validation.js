import Joi from 'joi';

export default {
  //Validate forgotpassword
  forgotPassword: {
    body: {
      entityType: Joi.string().required()
    },
    query: {
      email: Joi.string().required()
    }
  },

  //validate change password 
  changePassword: {
    body: {
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    }
  },

  //validate change recovery password
  changeReocveryPassword: {
    body: {
      enEmail: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmPassword: Joi.string().required(),
      entityType: Joi.string().required()
    }
  },
  upload: {
    query: {
      uploadPath: Joi.string().required()
    }
  },
  // POST /api/auth/login
  login: {
    body: {
      email: Joi.string().required(),
      entityType: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  //Create Employee
  createEmployee: {
    body: {
      email: Joi.string().lowercase().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required()
    }
  },

  //update Employee
  updateEmployee: {
    body: {
      email: Joi.any().forbidden(),
      password: Joi.any().forbidden()
    },
    params: {
      employeeId: Joi.string().hex().required()
    }
  },

  //Create User
  createUser: {
    body: {
      email: Joi.string().lowercase().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required()
    }
  },

  //update User
  updateUser: {
    body: {
      email: Joi.any().forbidden(),
      password: Joi.any().forbidden()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },
};
