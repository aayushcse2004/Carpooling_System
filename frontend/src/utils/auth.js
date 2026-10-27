/**
 * Authentication and Session Management Utility for CommuteX
 */

export const getAuthToken = () => {
  return sessionStorage.getItem('token') || localStorage.getItem('token') || null;
};

export const getAuthRole = () => {
  return sessionStorage.getItem('role') || localStorage.getItem('role') || null;
};

export const getCurrentUser = () => {
  try {
    const user = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (user) return JSON.parse(user);
    const driver = sessionStorage.getItem('driver') || localStorage.getItem('driver');
    if (driver) return JSON.parse(driver);
    return null;
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const isDriver = () => {
  const role = getAuthRole();
  return role === 'driver' || role === 'Driver' || !!sessionStorage.getItem('driverId');
};

export const isPassenger = () => {
  const role = getAuthRole();
  return (role === 'passenger' || role === 'user' || !!sessionStorage.getItem('userId')) && !isDriver();
};

export const setSession = ({ token, role, user, driver }) => {
  if (token) {
    sessionStorage.setItem('token', token);
    localStorage.setItem('token', token);
  }
  if (role) {
    sessionStorage.setItem('role', role);
    localStorage.setItem('role', role);
  }
  if (user) {
    sessionStorage.setItem('user', typeof user === 'string' ? user : JSON.stringify(user));
    sessionStorage.setItem('userId', user.id || user._id);
  }
  if (driver) {
    sessionStorage.setItem('driver', typeof driver === 'string' ? driver : JSON.stringify(driver));
    sessionStorage.setItem('driverId', driver.id || driver._id);
  }
  window.dispatchEvent(new Event('auth-change'));
};

export const clearSession = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('role');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('driver');
  sessionStorage.removeItem('driverId');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.dispatchEvent(new Event('auth-change'));
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};
