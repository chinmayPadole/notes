import { useToast } from "../provider/toastProvider";

export const useToastService = () => {
  const { showToast } = useToast();

  const fireToast = (message: string, color: string, duration: number) => {
    showToast(message, color, duration);
  };

  return { fireToast };
};
