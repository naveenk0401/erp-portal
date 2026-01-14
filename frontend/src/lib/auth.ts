import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'erp_access_token';
const REFRESH_TOKEN_KEY = 'erp_refresh_token';

export const setTokens = (accessToken: string, refreshToken: string) => {
  // Store tokens in cookies with security flags
  // Note: For real production, use HttpOnly cookies set by backend
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1/48, secure: true, sameSite: 'strict' }); // 30 mins
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7, secure: true, sameSite: 'strict' });  // 7 days
};

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY);

export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};

export const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};
