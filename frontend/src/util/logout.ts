import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import { setNoticePopUp } from '../redux/slice';
import { Dispatch } from 'redux';

const logOut = (navigate: ReturnType<typeof useNavigate>, dispatch: Dispatch<any>) => {
    const preWarningTimer = localStorage.getItem('jwtPreWarningTimer');
    const expirationTimer = localStorage.getItem('jwtExpirationTimer');
    const isAdminPath = window.location.pathname.includes("admin");

    if (preWarningTimer) {
        clearTimeout(parseInt(preWarningTimer));
        localStorage.removeItem('jwtPreWarningTimer');
    }

    if (expirationTimer) {
        clearTimeout(parseInt(expirationTimer));
        localStorage.removeItem('jwtExpirationTimer');
    }

    Cookies.remove('token');
    localStorage.removeItem('jwtExpiration');

    dispatch(setNoticePopUp({ on: false, is_error: null, message: '' }));

    if(isAdminPath){
        navigate('/admin/login');
    }else{
        navigate('/');
    }
    window.location.reload();
}

export default logOut;