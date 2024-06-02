import express from 'express';
import * as userController from '../controllers/userController.js';
import * as authMiddleware from '../middlewares/authMiddleware.js';
import * as pageController from '../controllers/pageController.js';

const router = express.Router();

router.route('/register').post(userController.createUser);
router.route('/login').post(userController.loginUser);

router.route('/forgotPassword')
  .get(pageController.getForgotPasswordPage)
  .post(userController.forgotPassword);
router.route('/resetPassword/:token')
  .get(pageController.getResetPasswordPage)
  .post(userController.resetPassword);
router
  .route('/dashboard')
  .get(authMiddleware.authenticateToken, userController.getDashboardPage);
router
  .route('/editDashboard')
  .get(authMiddleware.authenticateToken, userController.getEditDashboardPage);
router
  .route('/:id/following')
  .get(authMiddleware.authenticateToken, userController.getFollowingPage);
router
  .route('/:id/followers')
  .get(authMiddleware.authenticateToken, userController.getFollowersPage);
router
  .route('/')
  .get(authMiddleware.authenticateToken, userController.getAllUsers);
router
  .route('/:id')
  .get(authMiddleware.authenticateToken, userController.getAUser);
router
  .route('/:id/follow')
  .put(authMiddleware.authenticateToken, userController.follow);
router
  .route('/:id/unfollow')
  .put(authMiddleware.authenticateToken, userController.unfollow);
router
  .route('/uploadProfilPhoto')
  .post(authMiddleware.authenticateToken, userController.uploadProfilPhoto);
router
  .route('/updateBio')
  .post(authMiddleware.authenticateToken, userController.updateBio);
router
  .route('/updateProfileName')
  .post(authMiddleware.authenticateToken, userController.updateProfileName);

export default router;
