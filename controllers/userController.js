import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Photo from '../models/photoModel.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ user: user._id });
  } catch (error) {
    console.log('ERROR', error);

    let errors2 = {};

    if (error.code === 11000) {
      errors2.email = 'The Email is already registered';
    }

    if (error.name === 'ValidationError') {
      Object.keys(error.errors).forEach((key) => {
        errors2[key] = error.errors[key].message;
      });
    }

    res.status(400).json(errors2);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    let same = false;

    if (user) {
      same = await bcrypt.compare(password, user.password);
    } else {
      return res.status(401).json({
        succeded: false,
        error: 'There is no such user',
      });
    }

    if (same) {
      const token = createToken(user._id);
      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.redirect('/users/dashboard');
    } else {
      res.status(401).json({
        succeded: false,
        error: 'Paswords are not matched',
      });
    }
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const getDashboardPage = async (req, res) => {
  const photos = await Photo.find({ user: res.locals.user._id });
  const user = await User.findById({ _id: res.locals.user._id }).populate([
    'followings',
    'followers',
  ]);
  res.render('dashboard', {
    link: 'dashboard',
    photos,
    user: user.toObject(),
  });
};

const getEditDashboardPage = async (req, res) => {
  res.render('editDashboard', {
    link: 'editDashboard',
  });
};

const getFollowingPage = async (req, res) => {
  res.render('following', {
    link: 'following',
  });
};

const getFollowersPage = async (req, res) => {
  res.render('followers', {
    link: 'followers',
  });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).render('users', {
      users,
      link: 'users',
    });
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const getAUser = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id });

    const inFollowers = user.followers.some((follower) => {
      return follower.equals(res.locals.user._id);
    });

    const photos = await Photo.find({ user: user._id });
    res.status(200).render('user', {
      user,
      photos,
      link: 'users',
      inFollowers,
    });
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const follow = async (req, res) => {
  
  try {
    let user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $push: { followers: res.locals.user._id },
      },
      { new: true }
    );

    user = await User.findByIdAndUpdate(
      { _id: res.locals.user._id },
      {
        $push: { followings: req.params.id },
      },
      { new: true }
    );

    res.status(200).redirect(`/users/${req.params.id}`);
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const unfollow = async (req, res) => {
  
  try {
    let user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $pull: { followers: res.locals.user._id },
      },
      { new: true }
    );

    user = await User.findByIdAndUpdate(
      { _id: res.locals.user._id },
      {
        $pull: { followings: req.params.id },
      },
      { new: true }
    );

    res.status(200).redirect(`/users/${req.params.id}`);
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetURL = `http://${req.headers.host}/users/resetPassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a put request to: \n\n ${resetURL}`;

    let transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODE_MAIL,
        pass: process.env.NODE_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: 'Password reset token',
      text: message,
    });

    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const { password } = req.body;

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', err });
  }
};

const uploadProfilPhoto = async (req, res) => {
  try {
    const userId = req.user.id; 
    const file = req.files.profilePhoto; 

    if (!file) {
      throw new Error('No file uploaded');
    }

    const user = await User.findById(userId);

    if (user.image_id) {
      await cloudinary.uploader.destroy(user.image_id);
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'bitirmeProjesiBlogSitesi',
    });

    user.profilePhoto = result.secure_url; 
    user.image_id = result.public_id; 
    await user.save();

    fs.unlinkSync(file.tempFilePath);

    res.status(200).json({ success: true, message: 'Profile photo uploaded successfully' });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ success: false, message: 'Profile photo upload failed', error: error.message });
  }
};

const updateBio = async (req, res) => {
  try {
    const { id } = req.user;
    const { bio } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.bio = bio;
    await user.save();

    res.status(200).json({ success: true, message: 'Bio updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

const updateProfileName = async (req, res) => {
  try {
    const { id } = req.user;
    const { profileName } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.profileName = profileName;
    await user.save();

    res.status(200).json({ success: true, message: 'Profile name updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  } 
};

export {
  createUser,
  loginUser,
  getDashboardPage,
  getEditDashboardPage,
  getFollowingPage,
  getFollowersPage,
  getAllUsers,
  getAUser,
  follow,
  unfollow,
  forgotPassword,
  resetPassword,
  uploadProfilPhoto,
  updateBio,
  updateProfileName,
};
