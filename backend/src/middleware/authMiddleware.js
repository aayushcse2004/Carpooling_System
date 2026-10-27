import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Driver from '../models/driver.model.js';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = (decoded.role || '').toLowerCase();

    if (role === 'driver') {
      const driver = await Driver.findById(decoded._id).select('-password');
      if (!driver) {
        return res.status(401).json({ success: false, message: 'Driver account not found' });
      }
      req.user = driver;
      req.user.role = 'driver';
    } else {
      let user = await User.findById(decoded._id).select('-password');
      if (!user) {
        // Fallback check Driver collection in case role wasn't explicitly tagged
        const driver = await Driver.findById(decoded._id).select('-password');
        if (driver) {
          req.user = driver;
          req.user.role = 'driver';
          return next();
        }
        return res.status(401).json({ success: false, message: 'User account not found' });
      }
      req.user = user;
      req.user.role = user.role || 'passenger';
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    const normalizedRoles = roles.map(r => r.toLowerCase());
    const userRole = (req.user?.role || '').toLowerCase();
    
    if (!req.user || !normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user?.role || 'guest'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

export default protect;
