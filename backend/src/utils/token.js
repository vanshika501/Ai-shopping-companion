import jwt from 'jsonwebtoken';

export function generateToken(userId, res) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');

  const token = jwt.sign({ id: userId }, secret, { expiresIn: '7d' });

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    httpOnly: true,
    sameSite: 'strict',
    // Important: only secure cookies in production so localhost (http) works
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return token;
}

export function clearAuthCookie(res) {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}
