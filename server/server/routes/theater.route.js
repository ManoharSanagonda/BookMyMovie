import express from 'express';
import theaterCtrl from '../controllers/theater.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/theater - Get list of theater */
  .get(asyncHandler(theaterCtrl.list))

  /** POST /api/theater- Create new theater */
  .post(asyncHandler(theaterCtrl.create));

router.route('/:theaterId').all(authPolicy.isAllowed)
  /** GET /api/theater/:theaterId - Get theater */
  .get(asyncHandler(theaterCtrl.get))

  /** PUT /api/theater/:theaterId - Update theater */
  .put(asyncHandler(theaterCtrl.update))

  /** DELETE /api/theater/:theaterId - Delete theater */
  .delete(asyncHandler(theaterCtrl.remove));

/** Load theater when API with theaterId route parameter is hit */
router.param('theaterId', asyncHandler(theaterCtrl.load));

export default router;
