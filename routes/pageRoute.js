import express from 'express';
import * as PageController from '../controllers/pageController.js'

const router = express.Router();

router.route('/').get(PageController.getHomePage);
router.route('/blogs').get(PageController.getBlogsPage);
router.route('/contact').get(PageController.getContactPage);

export default router;