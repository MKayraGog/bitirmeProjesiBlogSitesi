import express from 'express';
import * as PageController from '../controllers/pageController.js';


const router = express.Router();

router.route('/').get(PageController.getHomePage);
router.route('/blogs').get(PageController.getBlogsPage);
router.route('/contact').get(PageController.getContactPage);
router.route('/register').get(PageController.getRegisterPage);
router.route('/login').get(PageController.getLoginPage);

export default router;