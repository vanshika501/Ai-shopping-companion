import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  
  const cookieToken = req.cookies ? req.cookies.jwt : null;
  const authHeader = req.headers['authorization'] || '';
  const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.id };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
