import express from 'express';

import authRoutes from './auth.route';

import settingsRoutes from './settings.route';

import showTimesRoutes from './showTimes.route';

import theaterRoutes from './theater.route';

import movieRoutes from './movie.route';

import templatesRoutes from './templates.route';

import employeeRoutes from './employee.route';

import activityRoutes from './activity.route';

import uploadRoutes from './upload.route';

import userRoutes from './user.routes';


const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount activity routes at /activities
router.use('/activities', activityRoutes);

// mount settings routes at /settings
router.use('/settings', settingsRoutes);


// mount showTimes routes at /showTimes
router.use('/showTimes', showTimesRoutes);

// mount theater routes at /theater
router.use('/theater', theaterRoutes);

// mount movie routes at /movie
router.use('/movie', movieRoutes);

// mount employees routes at /employees
router.use('/employees', employeeRoutes);

//mount templated rputes at /templates
router.use('/templatesRoutes', templatesRoutes);

//Mount upload routes at /uploads
router.use('/uploads', uploadRoutes);

//Mount user routes at /users
router.use('/users', userRoutes);



export default router;
