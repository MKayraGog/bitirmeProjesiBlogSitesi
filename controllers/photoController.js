import Photo from '../models/photoModel.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const createPhoto = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        use_filename: true,
        folder: 'bitirmeProjesiBlogSitesi',
      }
    );

    await Photo.create({
      name: req.body.name,
      description: req.body.description,
      user: res.locals.user._id,
      url: result.secure_url,
      image_id: result.public_id,
    });

    fs.unlinkSync(req.files.image.tempFilePath);

    res.status(201).redirect('/users/dashboard');
  } catch (error) {
    console.error('Error in createPhoto:', error);
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

// Rastgele sıralama işlevi
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getAllPhotos = async (req, res) => {
  try {
    let photos = res.locals.user
      ? await Photo.find({ user: { $ne: res.locals.user._id } })
      : await Photo.find({});
    photos = shuffleArray(photos);  // Fotoğrafları karıştır
    res.status(200).render('photos', {
      photos,
      link: 'photos',
    });
  } catch (error) {
    console.error('Error in getAllPhotos:', error);
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const getAPhoto = async (req, res) => {
  try {
    const photo = await Photo.findById({ _id: req.params.id }).populate('user');

    let isOwner = false;
    let isLiked = false;

    if (res.locals.user) {
      isOwner = photo.user.equals(res.locals.user._id);
      isLiked = (photo.likes.indexOf(res.locals.user._id) !== -1);
    }



    res.status(200).render('photo', {
      photo: photo.toObject(),
      link: 'photos',
      isOwner,
      isLiked,
    });
  } catch (error) {
    console.error('Error in getAPhoto:', error);
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    const photoId = photo.image_id;

    await cloudinary.uploader.destroy(photoId);
    await Photo.findOneAndDelete({ _id: req.params.id });

    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    console.error('Error in deletePhoto:', error);
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const updatePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (req.files) {
      const photoId = photo.image_id;
      await cloudinary.uploader.destroy(photoId);

      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
          use_filename: true,
          folder: 'bitirmeProjesiBlogSitesi',
        }
      );

      photo.url = result.secure_url;
      photo.image_id = result.public_id;

      fs.unlinkSync(req.files.image.tempFilePath);
    }

    photo.name = req.body.name;
    photo.description = req.body.description;

    await photo.save();

    res.status(200).redirect(`/photos/${req.params.id}`);
  } catch (error) {
    console.error('Error in updatePhoto:', error);
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const likePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).send('Photo not found');
    }


    const userId = res.locals.user._id;
    const index = photo.likes.indexOf(userId);

    if (index === -1) {
      photo.likes.push(userId);
    } else {
      photo.likes.splice(index, 1);
    }

    await photo.save();

    res.status(200).json({ likesCount: photo.likesCount });
  } catch (err) {
    res.status(500).send('Server error');
  }
};
export { createPhoto, getAllPhotos, getAPhoto, deletePhoto, updatePhoto, likePhoto };