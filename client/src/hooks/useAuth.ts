import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface TokenPayload {
  exp: number;
  isAdmin?: boolean;
}
export const useAuth = () => {
  const token = Cookies.get('token');

  if (token) {
    try {
      const decodedToken = jwtDecode<TokenPayload>(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        Cookies.remove('token');
        return { isAuthenticated: false, isAdmin: false };
      }
      return {
        isAuthenticated: true,
        isAdmin: decodedToken.isAdmin || false,
      };
    } catch (error) {
      console.log(error)
      Cookies.remove('token');
      return { isAuthenticated: false, isAdmin: false };
    }
  }

  return { isAuthenticated: false, isAdmin: false };
};
