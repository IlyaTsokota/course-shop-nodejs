const { Router } = require('express');
const router = Router();

router.get('/', (req, resp) => {
    resp.render('index', {
        title: 'Главная страница',
        isMain: true,
    });
});

module.exports = router;
