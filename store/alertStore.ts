import { create } from "zustand";

interface alertVisibleProps {
  title?: string;
  body?: string;
  isDanger?: boolean;
  button1?: string;
  button2?: string;
}

interface AlertProps {
  title: string;
  body: string;
  button1: string;
  button2: string;
  isSuccess: boolean;
  alertVisible: boolean;
  lottieAlertVisible: boolean;
  onConfirm: (() => void) | null;
  isDanger: boolean;
  setAlertVisible({
    title,
    body,
    isDanger,
    button1,
    button2,
  }: alertVisibleProps): void;
  hideAlert: () => void;
  setOnConfirm: (callback: (() => void) | null) => void;
  setLottieAlertVisible: (value: boolean) => void;
}

const useAlertStore = create<AlertProps>((set) => ({
  title: "",
  body: "",
  isDanger: false,
  alertVisible: false,
  isSuccess: true,
  lottieAlertVisible: false,
  onConfirm: null,
  button1: "Cancel",
  button2: "Yes",

  setAlertVisible: ({ title, body, isDanger }) => {
    set({
      alertVisible: true,
      title: title ?? "",
      body: body ?? "",
      isDanger: isDanger,
    });
  },

  hideAlert: () => {
    set({ alertVisible: false });
  },

  setOnConfirm: (callback) => set({ onConfirm: callback }),

  setLottieAlertVisible: (value) => {
    set({ lottieAlertVisible: value });
  },
}));

export default useAlertStore;
