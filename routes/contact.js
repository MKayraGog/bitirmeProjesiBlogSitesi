const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../authMiddleware'); // authMiddleware.js aynı dizinde değilse dosya yolunu buna göre ayarlayın

router.get('/contact', ensureAuthenticated, (req, res) => {
    res.render('contact'); // Bu sizin mevcut contact sayfanızı render edecek
});

module.exports = router;
