import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from "validator";

const { Schema} = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Username alanı zorunlu"],
       lowercase: true,
        validate: [validator.isAlphanumeric, "only alphanumeric"],
    },
    email: {
        type: String,
        required: [true, "Email alanı zorunlu"],
        unique: true,
        validate: [validator.isEmail, "valid email is required"]
    },
    password: {
        type: String,
        required: [true, "Şifre alanı zorunlu"],
        minLength: [9, "En az 9 karakter"],
    },
},
{
    timestamps: true,
}
);

userSchema.pre('save', function (next) {
    const user = this;
    bcrypt.hash(user.password, 10, (err, hash) => {
        user.password = hash;
        next();
    });
});

const User = mongoose.model('User', userSchema);

export default User;