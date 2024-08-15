import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';

const logOut = (navigate: ReturnType<typeof useNavigate>) => {
    Cookies.remove('token');
    navigate('/');
    window.location.reload();
}

export default logOut;