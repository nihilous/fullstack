import Cookies from 'js-cookie';
import * as jwt_decode from 'jwt-decode';

interface DecodedToken {
    userId: number;
    admin: boolean;
    userDetailIds: number[];
}

const token: string | undefined = Cookies.get('token');
let decodedToken: DecodedToken | null = null;

if (token) {
    try {
        decodedToken =  jwt_decode.jwtDecode(token)
    } catch (error) {
        console.error('Failed to decode token:', error);
        decodedToken = null;
    }
}

export { decodedToken, token };
