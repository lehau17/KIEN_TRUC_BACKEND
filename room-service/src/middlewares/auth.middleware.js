const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sndkjbvfskdvfhjsvdfjhvsdjfhvsdkjfhvsjdhfvskdhvfkjshvdfhjk';

/**
 * Middleware xác thực và decode JWT token
 */
function authThenMiddleware(req, res, next) {
    // token de o header trong request
  const authHeader = req.headers['authorization']; // lay token o header

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thiếu Authorization header' });
  }

  const token = authHeader.split(' ')[1];


  try {
    // xac thuc coi token hop le khong
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Gắn user vào request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = authThenMiddleware;