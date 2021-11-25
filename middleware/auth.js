module.exports = function (req, resp, next) {
    if (!req.session.isAuthentificated) {
        return resp.redirect('/auth/login')
    }

    next();
};