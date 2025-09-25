import jwt from 'jsonwebtoken';

export default function maybeAuth(req, _res, next) {
  try {
    const cookieToken = req.cookies ? req.cookies.jwt : null;
    const authHeader = req.headers['authorization'] || '';
    const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || headerToken;

    if (!token) return next();

    const secret = process.env.JWT_SECRET;
    if (!secret) return next();

    const decoded = jwt.verify(token, secret);
    if (decoded && decoded.id) {
      req.user = { id: decoded.id };
    }
  } catch (e) {
    // ignore errors, proceed unauthenticated
  }
  return next();
}
