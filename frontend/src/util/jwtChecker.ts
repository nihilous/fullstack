import { AxiosError } from 'axios';

interface JWTErrorResponse {
  tokenExpired?: boolean;
}

const jwtChecker = (
  error: AxiosError<JWTErrorResponse>,
  popupTranslations: any,
) => {
  if (error.response?.status === 403) {
    if (error.response.data?.tokenExpired) {
      return { message: popupTranslations.JWT_Expired };
    } else {
      return { message: popupTranslations.JWT_Invalid };
    }
  } else {
    return { message: popupTranslations.defaultError };
  }
};

export default jwtChecker;
