const { Router } = require("express");
const Course = require('../models/course');
const auth = require('../middleware/auth');
const router = Router();

function mapCartItems(cart) {
    return cart.items.map(({ courseId, count }) => ({  
        ...courseId._doc,
        id: courseId.id,
        count 
    }));
}

function computePrice(courses) {
    return courses.reduce((acc, { price, count }) => acc + price * count, 0);
}

router.post('/add', auth, async (req, resp) => {
    try {
        const course = await Course.findById(req.body.id);
    
        await req.user.addToCart(course);
        
        resp.redirect('/cart');
    } catch (e) {
        console.log(e);
    }
});

router.delete('/remove/:id', auth, async (req, resp) => {
    await req.user.removeFromCart(req.params.id);

    const { cart } = await req.user
        .populate('cart.items.courseId');

    const courses = mapCartItems(cart);
    
    resp.status(200).json({
        courses,
        price: computePrice(courses),
    });
});

router.get('/', auth, async (req, resp) => {
    const { cart } = await req.user
        .populate('cart.items.courseId');

    const courses = mapCartItems(cart);

    resp.render('cart', {
        title: 'Корзина',
        isCart: true,
        courses,
        price: computePrice(courses),
    });
});

module.exports = router;
