import express from 'express';
import validate from 'express-validation';
import paramValidate from '../config/param-validation';
import userCtrl from '../controllers/user.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
    /** POST /api/users - Create new users */
    .post(validate(paramValidate.createUser), asyncHandler(userCtrl.create))

    /** get /api/users -  get all users */
    .get(asyncHandler(userCtrl.list));

router.route('/:userId').all(authPolicy.isAllowed)
    /** get /api/users -  get one users using id*/
    .get(asyncHandler(userCtrl.get))

    /** put /api/users -  update users */
    .put(validate(paramValidate.updateUser), asyncHandler(userCtrl.update))

    /** delete /api/users -  delete users */
    .delete(asyncHandler(userCtrl.remove));

router.param('userId', asyncHandler(userCtrl.load));

export default router;