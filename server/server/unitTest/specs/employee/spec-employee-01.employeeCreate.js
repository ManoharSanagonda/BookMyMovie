import 'babel-polyfill';
import request from 'supertest-as-promised';
import chaiAsPromised from 'chai-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../../index';

import auth from '../../http-requests/lib/authorization';
import mochaAsync from '../../lib/mocha-async';

// load credentials
import credentials from '../../data/credentials.json';
import responseCodes from '../../data/response-codes.json';

// initialize models
import Employee from '../../models/employee';

import i18nUtil from '../../../utils/i18n.util';

// load payload module
import payload from '../../http-requests/lib/payloads';
const authEmployee = new Employee(credentials.validEmployee);
const employee = new Employee();
const createpostBody = payload.getPostBody(employee);
// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);

describe('## Check employee creation', () => {

  beforeEach(mochaAsync(async () => {
    // login employee and get access token
    await auth.getAccessToken(authEmployee);
  }));

  it('## Check employee creation', (done) => {
    request(app)
      .post('/api/employees')
      .send(createpostBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'employeeCreate';
        expect(res.body).to.have.property('employeeId');
        expect(res.body.respCode).to.equal(responseCodes.create);
        expect(res.body).to.have.property('respMessage');
        expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        employee.setId(res.body.employeeId);
        done();
      })
      .catch(done)
  });

  it('## Check employee creation :: Email already exists when create same employee', (done) => {
    request(app)
      .post('/api/employees')
      .send(createpostBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'emailExists';
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        done();
      })
      .catch(done);
  });

  it("## Should return Employee not active error message", (done) => {
    request(app)
      .post('/api/auth/login')
      .send({
        email: employee.getEmail(),
        password: employee.getPassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'activateYourAcount';
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey))
        done();
      })
      .catch(done)
  });


  it('## Should return  passwords notmatched error while activating account ', (done) => {
    request(app)
      .post("/api/auth/changeRecoverPassword?active=true")
      .send({
        enEmail: employee.getEnmail(),
        newPassword: employee.getChangePassword(),
        confirmPassword: employee.getPassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'passwordsNotMatched';
        expect(res.body).to.have.property('errorCode');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        done();
      })
      .catch(done)
  });

  it('## Should return email notfound error while activating account', (done) => {
    request(app)
      .post("/api/auth/changeRecoverPassword?active=true")
      .send({
        enEmail: `wng${employee.getEnmail()}`,
        newPassword: employee.getChangePassword(),
        confirmPassword: employee.getPassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'emailNotExist';
        expect(res.body).to.have.property('errorCode');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        done();
      })
      .catch(done)
  });

  it('## Should return invlid loginType error while activating account', (done) => {
    request(app)
      .post("/api/auth/changeRecoverPassword?active=true")
      .send({
        enEmail: employee.getEnmail(),
        newPassword: employee.getChangePassword(),
        confirmPassword: employee.getPassword(),
        entityType: "InvalidLofinType"
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'invalidLoginType';
        expect(res.body).to.have.property('errorCode');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        done();
      })
      .catch(done)
  });




  it('## Should return account activated succesfully', (done) => {
    request(app)
      .post("/api/auth/changeRecoverPassword?active=true")
      .send({
        enEmail: employee.getEnmail(),
        newPassword: employee.getPassword(),
        confirmPassword: employee.getPassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'accountactivate';
        expect(res.body).to.have.property('respCode');
        expect(res.body.respCode).to.equal(responseCodes.sucess);
        expect(res.body).to.have.property('respMessage');
        expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        done();
      })
      .catch(done)
  });

  it("## should login succesfully", (done) => {
    request(app)
      .post('/api/auth/login')
      .send({
        email: employee.getEmail(),
        password: employee.getPassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'loginSuccessMessage';
        expect(res.body).to.have.property('respCode');
        expect(res.body.respCode).to.equal(responseCodes.sucess);
        expect(res.body).to.have.property('respMessage');
        expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        expect(res.body).to.have.property('accessToken');
        expect(res.body).to.have.property('refreshToken');
        employee.setAccessToken(res.body.accessToken);
        console.log(employee.getId())
        done();
      })
      .catch(done);
  });

  it("## Should return employee updated succesfully", (done) => {
    request(app)
      .put(`/api/employees/${employee.getId()}`)
      .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
      .send({
        firstName: employee.getNewFirstName(),
        lastName: employee.getNewLastName(),
        phone: employee.getNewPhone()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = "employeeUpdate";
        expect(res.body).to.have.property('respCode');
        expect(res.body).to.have.property('respMessage');
        expect(res.body).to.have.property('employeeId');
        expect(res.body.respCode).to.equal(responseCodes.update);
        expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        done();
      })
      .catch(done)
  });

  it("## Should return the details of the employee", (done) => {
    request(app)
      .get(`/api/employees/${employee.getId()}`)
      .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        expect(res.body).to.have.property('respCode');
        expect(res.body.respCode).to.equal(responseCodes.sucess);
        expect(res.body).to.have.property('details');
        expect(res.body.details).to.have.property('email');
        done();
      })
      .catch(done)
  })

  it("## Should return the list of the employees", (done) => {
    request(app)
      .get('/api/employees')
      .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body).to.have.property('respCode');
        expect(res.body.respCode).to.equal(responseCodes.sucess);
        expect(res.body).to.have.property('employees');
        expect(res.body.employees).to.be.an('array');
        expect(res.body.employees).to.not.have.length(0)
        done();
      })
      .catch(done);
  });

  it('## Should send email to reset the password', (done) => {
    request(app)
      .post(`/api/auth/forgotPassword?email=${employee.getEmail()}`)
      .send({
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = "mailSuccess"
        expect(res.body).to.have.property('respCode');
        expect(res.body.respCode).to.equal(responseCodes.sucess);
        expect(res.body).to.have.property('respMessage');
        expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey))
        done();
      })
      .catch(done);
  })

  it('## Should return password notmatched error while Resetting the password', (done) => {
    request(app)
      .post("/api/auth/changeRecoverPassword")
      .send({
        enEmail: employee.getEnmail(),
        newPassword: employee.getChangePassword(),
        confirmPassword: employee.getPassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'passwordsNotMatched';
        expect(res.body).to.have.property('errorCode');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        done();
      })
      .catch(done)
  });

  it('## Should return email notfound error while Resetting the password', (done) => {
    request(app)
      .post("/api/auth/changeRecoverPassword")
      .send({
        enEmail: `wng${employee.getEnmail()}`,
        newPassword: employee.getChangePassword(),
        confirmPassword: employee.getPassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'emailNotExist';
        expect(res.body).to.have.property('errorCode');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        done();
      })
      .catch(done)
  });

  it('## Should return invlid loginType error while Resetting the password', (done) => {
    request(app)
      .post("/api/auth/changeRecoverPassword")
      .send({
        enEmail: employee.getEnmail(),
        newPassword: employee.getChangePassword(),
        confirmPassword: employee.getPassword(),
        entityType: "InvalidLofinType"
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'invalidLoginType';
        expect(res.body).to.have.property('errorCode');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        done();
      })
      .catch(done)
  });

  it('## Should return password created succesfully', (done) => {
    request(app)
      .post("/api/auth/changeRecoverPassword")
      .send({
        enEmail: employee.getEnmail(),
        newPassword: employee.getChangePassword(),
        confirmPassword: employee.getChangePassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'passwordReset';
        expect(res.body).to.have.property('respCode');
        expect(res.body.respCode).to.equal(responseCodes.sucess);
        expect(res.body).to.have.property('respMessage');
        expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        done();
      })
      .catch(done)
  });

  it("## Should return Login error message when trying to login with the old password after resetting the password", (done) => {
    request(app)
      .post('/api/auth/login')
      .send({
        email: employee.getEmail(),
        password: employee.getPassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'loginError';
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey))
        done();
      })
      .catch(done)
  });


  it("## should login succesfully after resetting the new password", (done) => {
    request(app)
      .post('/api/auth/login')
      .send({
        email: employee.getEmail(),
        password: employee.getChangePassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'loginSuccessMessage';
        expect(res.body).to.have.property('respCode');
        expect(res.body.respCode).to.equal(responseCodes.sucess);
        expect(res.body).to.have.property('respMessage');
        expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        expect(res.body).to.have.property('accessToken');
        expect(res.body).to.have.property('refreshToken');
        employee.setAccessToken(res.body.accessToken);
        done();
      })
      .catch(done);
  });

  it("## Should change password of the employee", (done) => {
    request(app)
      .post('/api/auth/changePassword')
      .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
      .send({
        currentPassword: employee.getChangePassword(),
        newPassword: employee.getPassword(),
        confirmPassword: employee.getPassword()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'passwordSuccess';
        expect(res.body).to.have.property('respCode');
        expect(res.body.respCode).to.equal(responseCodes.sucess);
        expect(res.body).to.have.property('respMessage');
        expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        done();
      })
      .catch(done)
  })

  it("## Should return Login error message when trying to login with the old password after changing the password", (done) => {
    request(app)
      .post('/api/auth/login')
      .send({
        email: employee.getEmail(),
        password: employee.getChangePassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'loginError';
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey))
        done();
      })
      .catch(done)
  });


  it("## should login succesfully after changing the new password", (done) => {
    request(app)
      .post('/api/auth/login')
      .send({
        email: employee.getEmail(),
        password: employee.getPassword(),
        entityType: employee.getEntityType()
      })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'loginSuccessMessage';
        expect(res.body).to.have.property('respCode');
        expect(res.body.respCode).to.equal(responseCodes.sucess);
        expect(res.body).to.have.property('respMessage');
        expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        expect(res.body).to.have.property('accessToken');
        expect(res.body).to.have.property('refreshToken');
        employee.setAccessToken(res.body.accessToken);
        done();
      })
      .catch(done);
  });

  it("## Should get sucessfully deleted message", (done) => {
    request(app)
      .delete(`/api/employees/${employee.getId()}?response=true`)
      .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'employeeDelete';
        expect(res.body).to.have.property('employeeId');
        expect(res.body.respCode).to.equal(responseCodes.delete);
        expect(res.body).to.have.property('respMessage');
        expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        expect(res.body).to.have.property("details");
        expect(res.body.details).to.have.property("active");
        expect(res.body.details.active).to.equal(false);
        done();
      })
      .catch(done);
  })
});