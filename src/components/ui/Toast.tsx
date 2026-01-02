import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

interface ShowToastParams {
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
}

export const showToast = ({
	type,
	title,
	message,
	duration = 3000,
}: ShowToastParams) => {
	Toast.show({
		type,
		text1: title,
		text2: message,
		position: 'top',
		visibilityTime: duration,
	});
};

export const toastUtils = {
	success: (title: string, message?: string) =>
		showToast({ type: 'success', title, message }),
	error: (title: string, message?: string) =>
		showToast({ type: 'error', title, message }),
	info: (title: string, message?: string) =>
		showToast({ type: 'info', title, message }),
};
