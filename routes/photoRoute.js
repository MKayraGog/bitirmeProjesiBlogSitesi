import express from 'express';
import * as photoController from '../controllers/photoController.js';
import * as authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(photoController.createPhoto)
  .get(photoController.getAllPhotos);

router.route('/:id').get(photoController.getAPhoto);
router.route('/:id').delete(photoController.deletePhoto);
router.route('/:id').put(photoController.updatePhoto);
router.route('/:id/like').post(authMiddleware.authenticateToken, photoController.likePhoto);


export default router;
