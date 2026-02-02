import type React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';

export const bottomSheetStyles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: COLORS.background,
		borderTopLeftRadius: SIZES.radiusXLarge,
		borderTopRightRadius: SIZES.radiusXLarge,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 5,
	},
	header: {
		alignItems: 'center',
		paddingTop: SPACING.sm,
	},
	dragHandle: {
		width: SIZES.dragHandleWidth,
		height: SIZES.dragHandleHeight,
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusSmall,
	},
});

interface BottomSheetHeaderProps {
	children?: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	showDragHandle?: boolean;
	dragHandleStyle?: StyleProp<ViewStyle>;
}

export function BottomSheetHeader({
	children,
	style,
	showDragHandle = true,
	dragHandleStyle,
}: BottomSheetHeaderProps) {
	return (
		<View style={[bottomSheetStyles.header, style]}>
			{showDragHandle ? (
				<View style={[bottomSheetStyles.dragHandle, dragHandleStyle]} />
			) : null}
			{children}
		</View>
	);
}
