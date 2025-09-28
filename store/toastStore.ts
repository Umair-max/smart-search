import {create} from 'zustand';

type errorTypes = 'error' | 'success';

interface ToastTypes {
  toastVisible: boolean;
  message: string;
  type?: errorTypes;
  showToast: (message: string, type?: errorTypes) => void;
  hideToast: () => void;
}

const useToastStore = create<ToastTypes>(set => ({
  toastVisible: false,
  type: 'success',
  message: '',

  showToast: (message, type) => {
    set({toastVisible: true, message: message, type: type || 'success'});
  },

  hideToast: () => {
    set({toastVisible: false, message: '', type: 'success'});
  },
}));

export default useToastStore;
