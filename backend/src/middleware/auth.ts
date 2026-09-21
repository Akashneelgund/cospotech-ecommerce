import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthUser } from '../types/index.js';
import { verifyToken } from '../utils/jwt.js';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
    return;
  }

  req.user = decoded;
  next();
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
      return;
    }
    next();
  });
};

export const requireStaffOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN' && req.user?.role !== 'STAFF') {
      res.status(403).json({ success: false, message: 'Access denied: Staff or Admin privileges required.' });
      return;
    }
    next();
  });
};
