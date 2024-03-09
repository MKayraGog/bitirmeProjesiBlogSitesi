import User from '../models/userModel.js';
import bcrypt from 'bcrypt';

const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({
            succeded: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            succeded: false,
            error,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await User.findOne({ name });

        let same = false;

        if (user) {
            same = await bcrypt.compare(password, user.password);
        }else {
            return res.status(401).json({
                succeded: false,
                error: 'Böyle bir kullanıcı yok',
            });
        }

        if (same){
            res.status(200).send('Başarıyla giriş yaptınız.');
        } else {
            res.status(401).json({
                succeded: false,
                error: 'Şifre eşleşmiyor',
            });
        }

    } catch (error) {
        res.status(500).json({
            succeded: false,
            error,
        });
    }
};

export { createUser, loginUser };