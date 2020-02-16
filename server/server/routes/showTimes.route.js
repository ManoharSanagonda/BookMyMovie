import express from 'express';
import showTimesCtrl from '../controllers/showTimes.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/showTimes - Get list of showTimes */
  .get(asyncHandler(showTimesCtrl.list))

  /** POST /api/showTimes- Create new showTimes */
  .post(asyncHandler(showTimesCtrl.create));

router.route('/:showTimesId').all(authPolicy.isAllowed)
  /** GET /api/showTimes/:showTimesId - Get showTimes */
  .get(asyncHandler(showTimesCtrl.get))

  /** PUT /api/showTimes/:showTimesId - Update showTimes */
  .put(asyncHandler(showTimesCtrl.update))

  /** DELETE /api/showTimes/:showTimesId - Delete showTimes */
  .delete(asyncHandler(showTimesCtrl.remove));

/** Load showTimes when API with showTimesId route parameter is hit */
router.param('showTimesId', asyncHandler(showTimesCtrl.load));

export default router;
