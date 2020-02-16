import express from 'express';
import uploadCtrl from '../controllers/upload.controller';
import asyncHandler from 'express-async-handler';
import validate from 'express-validation';
import paramValidation from '../config/param-validation';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
    .post(validate(paramValidation.upload), asyncHandler(uploadCtrl.upload))

export default router;