import 'babel-polyfill';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import { setTimeout } from 'timers';

import app from '../../../index';

// load predfined modules
import responseCodes from '../../data/response-codes.json';

// initialize models
import Employee from '../../models/employee';

import i18nUtil from '../../../utils/i18n.util';

// load payload module
import payload from '../../http-requests/lib/payloads';
const employee = new Employee();
chai.config.includeStack = true;

describe('## Check employee invalid login', () => {
  it('User login :: should get invalid employee login', (done) => {
    const loginPostBody = payload.getPostLogin(employee);
    request(app)
      .post('/api/auth/login')
      .send(loginPostBody)
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        // check access token
        req.i18nKey = 'loginError';
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey))
        done();
      })
      .catch(done);
  });
});