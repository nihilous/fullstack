import { Dispatch } from 'redux';
import { setNoticePopUp } from '../redux/slice';
import Cookies from 'js-cookie';

const clearStoredTimers = () => {
  const preWarningTimerId = localStorage.getItem('jwtPreWarningTimer');
  const expirationTimerId = localStorage.getItem('jwtExpirationTimer');

  if (preWarningTimerId) {
    clearTimeout(Number(preWarningTimerId));
    localStorage.removeItem('jwtPreWarningTimer');
  }

  if (expirationTimerId) {
    clearTimeout(Number(expirationTimerId));
    localStorage.removeItem('jwtExpirationTimer');
  }
};

export const startJwtTimers = (
  dispatch: Dispatch<any>,
  expirationTime: number,
  preWarningTime: number,
) => {
  clearStoredTimers();

  const timeUntilPreWarning = preWarningTime - Date.now();
  const timeUntilExpiration = expirationTime - Date.now();

  if (timeUntilPreWarning > 0) {
    const preWarningTimerId = setTimeout(() => {
      dispatch(
        setNoticePopUp({
          on: true,
          is_error: false,
          message: 'Your session is about to expire in 10 minutes.',
        }),
      );
    }, timeUntilPreWarning);
    localStorage.setItem('jwtPreWarningTimer', preWarningTimerId.toString());
  }

  if (timeUntilExpiration > 0) {
    const expirationTimerId = setTimeout(() => {
      dispatch(
        setNoticePopUp({
          on: true,
          is_error: false,
          message: 'Your session has expired. Please log in again.',
        }),
      );
      Cookies.remove('token');
      localStorage.removeItem('jwtExpiration');

      setTimeout(() => {
        const isAdminPath = window.location.pathname.includes('admin');
        if (isAdminPath) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/';
        }
      }, 3000);
    }, timeUntilExpiration);
    localStorage.setItem('jwtExpirationTimer', expirationTimerId.toString());
  }
};
