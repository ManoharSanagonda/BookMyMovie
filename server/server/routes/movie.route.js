import express from 'express';
import movieCtrl from '../controllers/movie.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/movie - Get list of movie */
  .get(asyncHandler(movieCtrl.list))

  /** POST /api/movie- Create new movie */
  .post(asyncHandler(movieCtrl.create));

router.route('/:movieId').all(authPolicy.isAllowed)
  /** GET /api/movie/:movieId - Get movie */
  .get(asyncHandler(movieCtrl.get))

  /** PUT /api/movie/:movieId - Update movie */
  .put(asyncHandler(movieCtrl.update))

  /** DELETE /api/movie/:movieId - Delete movie */
  .delete(asyncHandler(movieCtrl.remove));

/** Load movie when API with movieId route parameter is hit */
router.param('movieId', asyncHandler(movieCtrl.load));

export default router;
