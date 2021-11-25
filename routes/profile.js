const { Router } = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user');
const path = require('path');

const router = Router();

router.get('/', auth, async (req, resp) => {
    resp.render('profile', {
        title: 'Профиль',
        isProfile: true,
        user: req.user.toObject(),
    });
});


router.post('/', auth, async (req, resp) => {
    try {   
        const user = await User.findById(req.user._id);

        const toChange = {
            name: req.body.name,
        };

        console.log(__dirname);

        if (req.body) {
            toChange.avatarUrl = path.join(__dirname, '../images',  req.file.filename).replace(path.join(__dirname, '..'), '');
        }

        Object.assign(user, toChange);
        await user.save();
        resp.redirect('/profile');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;