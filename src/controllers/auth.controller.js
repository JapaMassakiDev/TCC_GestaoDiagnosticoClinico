const authService = require('../services/auth.service');

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        return res.status(200).json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        return res.status(status).json({ error: error.message });
    }
};

module.exports = {
    login
};
