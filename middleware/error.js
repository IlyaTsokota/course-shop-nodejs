module.exports = function (req, resp, next) {
    resp.status(404).render('404', {
        title: 'Страница не найдена',
    });
};