const { Router } = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const config = require('../config');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const { registerValidators, loginValidators } = require('../utils/validators');
const router = Router();

const transporter = nodemailer.createTransport(sendgrid({
    auth: {
        'api_key': config.SENDGRID_API,
    },
}));

router.get('/login', async(req, resp) => {
    resp.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError'),
    });
});

router.get('/logout', async(req, resp) => {
    req.session.destroy(() => {
        resp.redirect('/auth/login#login');
    });
});

router.post('/login', loginValidators, async(req, resp) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('loginError', errors.array()[0].msg);
            return resp.status(422).redirect('/auth/login#login');
        }

        const { email, password } = req.body;
        console.log(email);
        const candidate = await User.findOne({ email: email });
        console.log(candidate);

        if (candidate &&  await bcrypt.compare(password, candidate.password)) {
            req.session.user = candidate;
            req.session.isAuthentificated = true;
            req.session.save((err) => {
                if (err) {
                    throw err;
                }

                resp.redirect('/');
            })
        } else {
            req.flash('loginError', 'Неверный email или пароль!');
            resp.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
    }
});


router.post('/register', registerValidators , async(req, resp) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg);
            return resp.status(422).redirect('/auth/login#register');
        }

        const { email, name, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            name,
            password: hashPassword,
            cart: { items: [] },
        });

        await user.save();
        resp.redirect('/auth/login#login');
        await transporter.sendMail(regEmail(email));
    } catch (e) {
        console.log(e);
    }
});


router.get('/reset', (req, resp) => {
    resp.render('auth/reset', {
        title: 'Забыли пароль?',
        error: req.flash('error'),
    });
});

router.post('/reset', (req, resp) => {
    try {
        crypto.randomBytes(32, async(err, buffer) => {
            if (err) {
                req.flash('error', 'Что-то пошло не так, повторите попытку позже!');
                return resp.redirect('/auth/reset')
            }

            const candidate = await User.findOne({ email: req.body.email })

            if (candidate) {
                const token = buffer.toString('hex');
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;

                await candidate.save();
                resp.redirect('/auth/login#login');
                await transporter.sendMail(resetEmail(candidate.email, token));
            } else {
                req.flash('error', 'Такого email нет!');
                resp.redirect('/auth/reset')
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/password/:token', async(req, resp) => {
    const token = req.params.token;
    if (!token) {
        return resp.redirect('/auth/login');
    }

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExp: { $gt: Date.now() },
        });

        if (!user) {
            return resp.redirect('/auth/login');
        }

        resp.render('auth/reset-password', {
            title: 'Забыли пароль?',
            error: req.flash('error'),
            userId: user._id,
            token,
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/password', async (req, resp) => {
    try {
        const { token, userId, password } = req.body;
        const user = await User.findOne({
            _id: userId,
            resetToken: token,
            resetTokenExp: { $gt: Date.now() },
        });

        console.log(user);

        if (!user) {
            req.flash('loginError', 'Время жизни токена истекло');
            return resp.redirect('/auth/login');
        }
        const newPassword = await bcrypt.hash(password, 10);
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExp = undefined;
        await user.save();
        resp.redirect('/auth/login');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;