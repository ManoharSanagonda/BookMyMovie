import express from 'express';
import validate from 'express-validation';
import paramValidate from '../config/param-validation';
import employeeCtrl from '../controllers/employee.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
  /** POST /api/employees - Create new employees */
  .post(validate(paramValidate.createEmployee), asyncHandler(employeeCtrl.create))

  /** get /api/employees -  get all employees */
  .get(asyncHandler(employeeCtrl.list));

router.route('/:employeeId').all(authPolicy.isAllowed)
  /** get /api/employees -  get one employees using id*/
  .get(asyncHandler(employeeCtrl.get))

  /** put /api/employees -  update employees */
  .put(validate(paramValidate.updateEmployee), asyncHandler(employeeCtrl.update))

  /** delete /api/employees -  delete employees */
  .delete(asyncHandler(employeeCtrl.remove));

router.param('employeeId', asyncHandler(employeeCtrl.load));

export default router;