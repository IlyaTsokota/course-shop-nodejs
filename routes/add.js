const { Router } = require('express');
const Course = require('../models/course');
const { validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { courseValidators } = require('../utils/validators');
const router = Router();

router.get('/', auth, (req, resp) => {
    resp.render('add', {
        title: 'Добавить курс',
        isAdd: true,
    });
});

router.post('/', auth, courseValidators, async (req, resp) => {
    try {
        const { title, price, img } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return resp.status(422).render('add', {
                title: 'Добавить курс',
                isAdd: true,
                error: errors.array()[0].msg,
                data: {
                    title,
                    price, 
                    img,
                },
            });
        }

        const course = new Course({ 
            title, 
            price,
            img,
            userId: req.user 
        });

        await course.save();
        
        resp.redirect('/courses');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;
