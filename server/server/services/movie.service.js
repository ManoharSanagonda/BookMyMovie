
import session from '../utils/session.util';

import Movie from '../models/movie.model';
/**
 * set movie variables
 * @returns {movie}
 */

function setCreateMovieVaribles(req, movie) {

  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'employee') {
      movie.createdBy = session.getSessionLoginID(req);
    }

  }
  return movie;
}

/**
 * set movie update variables
 * @returns {user}
 */
function setUpdateMovieVaribles(req, movie) {
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'employee') {
      movie.updatedBy = session.getSessionLoginID(req);
    }
  }
  movie.updated = Date.now();
  return movie;
}

async function updateGlobalMovie() {
  let movie = await Movie.findOne({ active: true });
  if (movie) {
    global.movie = movie;
  }
}
updateGlobalMovie();

export default {
  setCreateMovieVaribles,
  setUpdateMovieVaribles,
  updateGlobalMovie
}