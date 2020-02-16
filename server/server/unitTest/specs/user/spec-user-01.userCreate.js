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
import User from '../../models/user';
import Employee from '../../models/employee';

import i18nUtil from '../../../utils/i18n.util';

// load payload module
import payload from '../../http-requests/lib/payloads';
const authUser = new User(credentials.validUser);
const authEmployee = new Employee(credentials.validEmployee)
const user = new User();
const createpostBody = payload.getPostBody(user);
// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);

describe('## Check user creation', () => {

    beforeEach(mochaAsync(async () => {
        // login user and get access token
        await auth.getAccessToken(authUser);
        await auth.getAccessToken(authEmployee);
    }));

    it('## Check user creation', (done) => {
        request(app)
            .post('/api/users')
            .send(createpostBody)
            .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
            .expect(httpStatus.OK)
            .then((res, req = {}) => {
                req.i18nKey = 'userCreate';
                expect(res.body).to.have.property('userId');
                expect(res.body.respCode).to.equal(responseCodes.create);
                expect(res.body).to.have.property('respMessage');
                expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
                user.setId(res.body.userId);
                done();
            })
            .catch(done)
    });

    it('## Check user creation :: Email already exists when create same user', (done) => {
        request(app)
            .post('/api/users')
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

    it("## Should return User not active error message", (done) => {
        request(app)
            .post('/api/auth/login')
            .send({
                email: user.getEmail(),
                password: user.getPassword(),
                entityType: user.getEntityType()
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
                enEmail: user.getEnmail(),
                newPassword: user.getChangePassword(),
                confirmPassword: user.getPassword(),
                entityType: user.getEntityType()
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
                enEmail: `wng${user.getEnmail()}`,
                newPassword: user.getChangePassword(),
                confirmPassword: user.getPassword(),
                entityType: user.getEntityType()
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
                enEmail: user.getEnmail(),
                newPassword: user.getChangePassword(),
                confirmPassword: user.getPassword(),
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
                enEmail: user.getEnmail(),
                newPassword: user.getPassword(),
                confirmPassword: user.getPassword(),
                entityType: user.getEntityType()
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
                email: user.getEmail(),
                password: user.getPassword(),
                entityType: user.getEntityType()
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
                user.setAccessToken(res.body.accessToken);
                done();
            })
            .catch(done);
    });

    it("## Should return user updated succesfully", (done) => {
        request(app)
            .put(`/api/users/${user.getId()}`)
            .set({ Authorization: `Bearer ${user.getAccessToken()}` })
            .send({
                firstName: user.getNewFirstName(),
                lastName: user.getNewLastName(),
                phone: user.getNewPhone()
            })
            .expect(httpStatus.OK)
            .then((res, req = {}) => {
                req.i18nKey = "userUpdate";
                expect(res.body).to.have.property('respCode');
                expect(res.body).to.have.property('respMessage');
                expect(res.body).to.have.property('userId');
                expect(res.body.respCode).to.equal(responseCodes.update);
                expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
                done();
            })
            .catch(done)
    });

    it("## Should return the details of the user", (done) => {
        request(app)
            .get(`/api/users/${user.getId()}`)
            .set({ Authorization: `Bearer ${user.getAccessToken()}` })
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

    it("## Should return the list of the users", (done) => {
        request(app)
            .get('/api/users')
            .set({ Authorization: `Bearer ${user.getAccessToken()}` })
            .expect(httpStatus.OK)
            .then((res) => {
                expect(res.body).to.have.property('respCode');
                expect(res.body.respCode).to.equal(responseCodes.sucess);
                expect(res.body).to.have.property('users');
                expect(res.body.users).to.be.an('array');
                expect(res.body.users).to.not.have.length(0)
                done();
            })
            .catch(done);
    });

    it('## Should send email to reset the password', (done) => {
        request(app)
            .post(`/api/auth/forgotPassword?email=${user.getEmail()}`)
            .send({
                entityType: user.getEntityType()
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
                enEmail: user.getEnmail(),
                newPassword: user.getChangePassword(),
                confirmPassword: user.getPassword(),
                entityType: user.getEntityType()
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
                enEmail: `wng${user.getEnmail()}`,
                newPassword: user.getChangePassword(),
                confirmPassword: user.getPassword(),
                entityType: user.getEntityType()
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
                enEmail: user.getEnmail(),
                newPassword: user.getChangePassword(),
                confirmPassword: user.getPassword(),
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
                enEmail: user.getEnmail(),
                newPassword: user.getChangePassword(),
                confirmPassword: user.getChangePassword(),
                entityType: user.getEntityType()
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
                email: user.getEmail(),
                password: user.getPassword(),
                entityType: user.getEntityType()
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
                email: user.getEmail(),
                password: user.getChangePassword(),
                entityType: user.getEntityType()
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
                user.setAccessToken(res.body.accessToken);
                done();
            })
            .catch(done);
    });

    it("## Should change password of the user", (done) => {
        request(app)
            .post('/api/auth/changePassword')
            .set({ Authorization: `Bearer ${user.getAccessToken()}` })
            .send({
                currentPassword: user.getChangePassword(),
                newPassword: user.getPassword(),
                confirmPassword: user.getPassword()
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
                email: user.getEmail(),
                password: user.getChangePassword(),
                entityType: user.getEntityType()
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
                email: user.getEmail(),
                password: user.getPassword(),
                entityType: user.getEntityType()
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
                user.setAccessToken(res.body.accessToken);
                done();
            })
            .catch(done);
    });

    it("## Should get sucessfully deleted message", (done) => {
        request(app)
            .delete(`/api/users/${user.getId()}?response=true`)
            .set({ Authorization: `Bearer ${user.getAccessToken()}` })
            .expect(httpStatus.OK)
            .then((res, req = {}) => {
                req.i18nKey = 'userDelete';
                expect(res.body).to.have.property('userId');
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