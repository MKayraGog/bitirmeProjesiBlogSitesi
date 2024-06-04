import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const checkUser = async (req, res, next) => {
const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        const user = await User.findById(decodedToken.userId);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.redirect('/login');
        } else {
          req.user = { id: decodedToken.userId }; // Kullanıcı kimliğini ayarlayın
          next();
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.status(401).json({
      succeeded: false,
      error: 'Not authorized',
    });
  }
};
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { // Bu örnek Passport.js kullanılarak yapılmıştır
      return next();
  } else {
      res.redirect('/login');
  }
}


export { authenticateToken, checkUser,  };


