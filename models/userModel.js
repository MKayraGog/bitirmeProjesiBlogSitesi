import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username area is required'],
      lowercase: true,
      validate: [validator.isAlphanumeric, 'Only Alphanumeric characters'],
    },
    email: {
      type: String,
      required: [true, 'Email area is required'],
      unique: true,
      validate: [validator.isEmail, 'Valid email is required'],
    },
    password: {
      type: String,
      required: [true, 'Password area is required'],
      minLength: [4, 'At least 4 characters'],
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    resetPasswordToken: 
    {
      type: String,
    },
    resetPasswordExpires: 
    {
      type: Date,
    },
    profilePhoto: 
    {
      type: String, 
    },
    bio: {
      type: String,
      default: 'Default bio...',
    },
    profileName: {
      type: String,
      default: 'Your name...',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for followers count
userSchema.virtual('followersCount').get(function () {
  return this.followers.length;
});

// Virtual for followings count
userSchema.virtual('followingsCount').get(function () {
  return this.followings.length;
});


userSchema.pre('save', function (next) {
  const user = this;

  // Şifre sadece değiştirildiğinde hashlenir
  if (!user.isModified('password')) {
    return next();
  }
  // Şifreyi hashle
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

const User = mongoose.model('User', userSchema);

export default User;
