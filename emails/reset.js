const config = require('../config');

module.exports = function(email, token) {
    return {
        to: email,
        from: config.EMAIL_FROM,
        subject: 'Востановление доступа',
        html: `
            <h1>Вы забыли пароль?</h1>
            <p>Если нет, то проигнорируйте это письмо</p>
            <p>Иначе нажмите на ссылку ниже:</p>
            <p><a href="${config.BASE_URL}/auth/password/${token}" alt="">Восстановить доступ</a></p>
            <hr/>
            <a href="${config.BASE_URL}" alt="">Магазин курсов</a>
        `,
    };
};