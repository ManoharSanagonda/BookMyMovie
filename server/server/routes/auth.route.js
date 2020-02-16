import express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../config/param-validation';
import authCtrl from '../controllers/auth.controller';
import config from '../config/config';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login')
  .post(validate(paramValidation.login), asyncHandler(authCtrl.login));

router.route('/token').post(authPolicy.oauthToken, authCtrl.sendLoginResponse);

/** POST /api/auth/logout */
router.route('/logout').all(authPolicy.isAllowed)
  .post(authCtrl.logout);

router.route('/forgotPassword')
  .post(validate(paramValidation.forgotPassword), asyncHandler(authCtrl.forgotPassword))

router.route('/changeRecoverPassword')
  .post(validate(paramValidation.changeReocveryPassword), asyncHandler(authCtrl.changeRecoverPassword))

router.route('/changePassword').all(authPolicy.isAllowed)
  .post(validate(paramValidation.changePassword), asyncHandler(authCtrl.changePassword))

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router.route('/random-number')
  .get(expressJwt({ secret: config.jwtSecret }), authCtrl.getRandomNumber);

export default router;
