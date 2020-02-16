import Movie from '../models/movie.model';

import movieService from '../services/movie.service';

import i18nUtil from '../utils/i18n.util';
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';


/**
 * Load Movie and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.movie = await Movie.get(req.params.movieId);
  return next();
}


/**
 * Get movie
 * @param req
 * @param res
 * @returns {details: movie}
 */

async function get(req, res) {
  logger.info('movie', 'Log:movie Controller:get: query :' + JSON.stringify(req.query));
  req.query = await serviceUtil.generateListQuery(req);
  let movie = req.movie;
  logger.info('movie', 'Log:movie Controller:get:' + i18nUtil.getI18nMessage('recordFound'));
  let responseJson = {
    respCode: respUtil.getDetailsSuccessResponse().respCode,
    details: movie
  };
  return res.json(responseJson);
}
/**
 * Create new movie
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('movie', 'Log:movie Controller:cretae: body :' + JSON.stringify(req.body));
  let movie = new Movie(req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      movie.createdBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('movie', 'Error:movie Controller:create:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  req.movie = await Movie.save(movie);
  req.entityType = 'movie';
  logger.info('movie', 'Log:movie Controller:create:' + i18nUtil.getI18nMessage('movieCreate'));
  return res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing movie
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('movie', 'Log:movie Controller:update: body :' + JSON.stringify(req.body));
  let movie = req.movie;
  movie = Object.assign(movie, req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      movie.updatedBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('movie', 'Error:movie Controller:update:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  movie.updated = Date.now();
  req.movie = await Movie.save(movie);
  req.entityType = 'movie';
  logger.info('movie', 'Log:movie Controller:update:' + i18nUtil.getI18nMessage('movieUpdate'));
  return res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Get movie list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {movie: movie, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('movie', 'Log:movie Controller:list: query :' + JSON.stringify(req.query));
  let responseJson = {};
  const query = await serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    //  total count;
    query.pagination.totalCount = await Movie.totalCount(query);
  }
  //get total movie
  const movie = await Movie.list(query);
  logger.info('movie', 'Log:movie Controller:list:' + i18nUtil.getI18nMessage('recordsFound'));
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.movie = movie;
  responseJson.pagination = query.pagination;
  return res.json(responseJson)
}

/**
 * Delete movie.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('movie', 'Log:movie Controller:remove: query :' + JSON.stringify(req.query));
  const movie = req.movie;
  movie.active = false;
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      movie.updatedBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('movie', 'Error:movie Controller:remove:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  movie.updated = Date.now();
  req.movie = await Movie.save(movie);
  req.entityType = 'movie';
  logger.info('movie', 'Log:movie Controller:remove:' + i18nUtil.getI18nMessage('movieDelete'));
  return res.json(respUtil.removeSuccessResponse(req));
}



export default {
  load,
  get,
  create,
  update,
  list,
  remove
};
