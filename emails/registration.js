const config = require('../config');

module.exports = function(email) {
    return {
        to: email,
        from: config.EMAIL_FROM,
        subject: 'Аккаунт создан',
        html: `
            <h1>Добро пожаловать в наш магазин</h1>
            <p>Вы успешно создали аккаунт с email - ${email}</p>
            <hr/>
            <a href="${config.BASE_URL}" alt="">Магазин курсов</a>
        `,
    };
};