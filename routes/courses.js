const { Router } = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');
const { courseValidators } = require('../utils/validators');
const { validationResult } = require('express-validator');
const router = Router();

function isOwner(courseUserId, reqUserId) {
    return courseUserId.toString() === reqUserId.toString();
}

router.get('/', async(req, resp) => {
    try {
        const courses = await Course.find().populate('userId', 'email name');

        resp.render('courses', {
            title: 'Курсы',
            isCourses: true,
            courses,
            userId: req.user ? req.user._id.toString() : null,
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id/edit', auth, async(req, resp) => {
    if (!req.query.allow) {
        return resp.redirect('/');
    }

    try {
        const course = await Course.findById(req.params.id);

        if (!isOwner(course.userId, req.user._id)) {
            return res.redirect('/courses');
        }

        resp.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course,
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id', async(req, resp) => {
    try {
        const course = await Course.findById(req.params.id);

        resp.render('course', {
            layout: 'empty',
            title: `Курс ${course.title}`,
            course,
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/remove', auth, async(req, resp) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id,
        });

        resp.redirect('/courses');
    } catch (e) {
        console.log(e);
    }
});

router.post('/edit', auth, courseValidators, async(req, resp) => {
    try {
        const { id, ...data } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return resp.status(422).redirect(`/courses/${id}/edit?allow=true`);
        }
        
        const course = await Course.findOne({_id: id});
        
        if (!isOwner(course.userId, req.user._id)) {
            return resp.redirect('/courses');
        }

        Object.assign(course, data);

        await course.save();

        resp.redirect('/courses');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;
