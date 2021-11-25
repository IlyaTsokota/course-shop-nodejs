const { Router } = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const router = Router();

router.get('/', auth, async (req, resp) => {
    try {
        const orders = await Order.find({
            'user.userId': req.user._id,
        }).populate('user.userId');

        resp.render('orders', {
            isOrder: true,
            title: 'Заказы',
            orders: orders.map((order) => ({ 
                ...order._doc,
                price: order.courses.reduce((acc, item) => acc + item.count * item.course.price, 0), 
            })),
        });
    } catch (e) {
        console.log(e);
    }

});

router.post('/create', auth, async (req, resp) => {
    try {
        const { user } = req;
        const { cart } = await user.populate('cart.items.courseId');
        
        const courses = cart.items.map(({ courseId, count }) => ({  
            course: {...courseId._doc},
            count,
        }));
    
        const order = new Order({
            user: {
                name: user.name,
                userId: user, 
            },
            courses,
        });
    
        await order.save();
        await req.user.clearCart();
    
        resp.redirect('/orders');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;