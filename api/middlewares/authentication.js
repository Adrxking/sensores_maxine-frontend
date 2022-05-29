const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
  const token = req.get('token');

  // eslint-disable-next-line consistent-return
  jwt.verify(token, 'securePasswordHere', (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: 'error',
        error: err,
      });
    }

    req.userData = decoded.userData;

    next();
  });
};

module.exports = { checkAuth };
