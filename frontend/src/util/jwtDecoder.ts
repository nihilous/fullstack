import Cookies from 'js-cookie';
import * as jwt_decode from 'jwt-decode';

interface DecodedToken {
  userId: number;
  admin: boolean;
  userDetailIds: number[] | null;
}

const getToken = (): string | undefined => {
  return Cookies.get('token');
};

const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwt_decode.jwtDecode(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

const getDecodedToken = (): DecodedToken | null => {
  const token = getToken();
  return token ? decodeToken(token) : null;
};

export { getDecodedToken, getToken, decodeToken };
