import cogoToast from 'cogo-toast';
import { useEffect } from 'react';

export * as Toast from './useToast';
export enum ToastTypes {
  'error',
  'success',
  'loading',
  'warn',
  'info',
}
export interface ToastConfig {
  statusToast?: {
    errorMessage?: string;
    successMessage?: string;
    isSuccess?: boolean;
    loadingMessage?: string;
    status: string;
    error: any;
  };

  toastOverride?: {
    type: ToastTypes;
    message: string;
  };
}

export const fireToast = async (_toastType: ToastTypes, _message: string) => {
  switch (_toastType) {
    case ToastTypes.error:
      const t = cogoToast.error(_message);
      break;
    case ToastTypes.success:
      cogoToast.success(_message);
      break;
    case ToastTypes.loading:
      cogoToast.loading(_message);
      break;
    case ToastTypes.warn:
      cogoToast.warn(_message);
      break;
    case ToastTypes.info:
      cogoToast.info(_message);
      break;
  }
};

export const useToast = (_toastConfig: ToastConfig) => {
  useEffect(() => {
    if (_toastConfig.toastOverride) {
      const {
        toastOverride: { type, message },
      } = _toastConfig;
      if (type === ToastTypes.error) {
        cogoToast.error(message);
      } else if (type === ToastTypes.success) {
        cogoToast.success(message);
      } else if (type === ToastTypes.loading) {
        cogoToast.loading(message);
      } else if (type === ToastTypes.warn) {
        cogoToast.warn(message);
      } else if (type === ToastTypes.info) {
        cogoToast.info(message);
      }
    } else if (_toastConfig.statusToast) {
      const {
        statusToast: { status, error, errorMessage, loadingMessage, successMessage, isSuccess },
      } = _toastConfig;
      if (status === 'error') {
        if (errorMessage) cogoToast.error(error.message);
        error.message;
      } else if (status === 'success') {
        if (isSuccess === undefined) {
          if (successMessage) cogoToast.success(successMessage);
        } else if (isSuccess) {
          if (successMessage) cogoToast.success(successMessage);
        } else {
          if (errorMessage) cogoToast.error(errorMessage);
        }
      } else if (status === 'loading') {
        if (loadingMessage) cogoToast.loading(loadingMessage);
      }
    }
  }, [_toastConfig]);
};
