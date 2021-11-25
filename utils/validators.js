const { body } = require('express-validator');
const User = require('../models/user');

const validationFiledMap = {
    email: () => body('email')
        .isEmail()
        .withMessage('Введите корректный email')
        .trim(),
    password: () => body('password', 'Пароль должен быть минимум 6 символов')
        .isLength({ min:6, max: 56 })
        .isAlphanumeric()
        .trim(),
    confirmPassword: () => body('confirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать');
            }
            return true;
        }).trim(),
    name: () => body('name')
        .isLength({ min: 3 })
        .withMessage('Имя должно быть минимум 3 символа')
        .trim(),
    title: () => body('title')
        .isLength({ min: 3 })
        .withMessage('Минимальная длинна названия 3 символа')
        .trim(),
    price: () => body('price')
        .isNumeric()
        .withMessage('Введите корректную цену'),
    img: () => body('img', 'Введите корректный URL картинки')
        .isURL()
        .trim(),
};

exports.registerValidators = [
    validationFiledMap.email().custom(async (value) => {
            try {   
                const user = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject('Такой email уже занят');
                }
            } catch (e) {
                console.log(e);
            }
        }),
    validationFiledMap.name(),
    validationFiledMap.password(),
    validationFiledMap.confirmPassword(),
];

exports.loginValidators = [
    validationFiledMap.email(),
    validationFiledMap.password(),
];

exports.courseValidators = [
    validationFiledMap.title(),
    validationFiledMap.price(),
    validationFiledMap.img(),
];