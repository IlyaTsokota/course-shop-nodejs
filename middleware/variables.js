module.exports = function(req, resp, next) {
    const token = req.csrfToken();
    resp.cookie('XSRF-TOKEN', token)
    resp.locals.csrf = token;
    resp.locals.isAuth = req.session.isAuthentificated;

    next();
};