// toastUtils.ts
export type ToastType = "success" | "error" | "info" | "warning";

export const getIcon = (toastType: ToastType): string => {
    switch (toastType) {
        case "success":
            return "✅"; // success icon
        case "error":
            return "❌"; // error icon
        case "info":
            return "ℹ️"; // info icon
        case "warning":
            return "⚠️"; // warning icon
        default:
            return "ℹ️"; // default to info icon
    }
};
