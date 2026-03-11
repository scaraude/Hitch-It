import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { AddressInput } from '../../components';
import { COLORS } from '../../constants';
import { useTranslation } from '../../i18n/useTranslation';
import type { Location } from '../../types';
import { navigationSetupSheetStyles as styles } from './navigationSetupSheetStyles';

interface NavigationSetupAddressFieldProps {
	label: string;
	icon: ReactNode;
	placeholder: string;
	value: string;
	onChangeText: (text: string) => void;
	onLocationSelected: (location: Location, name: string) => void;
	autoFocus: boolean;
	disableSuggestions: boolean;
	hasCurrentPosition: boolean;
	onUseCurrentPosition: () => void;
	positionButtonAccessibilityLabel: string;
	inputTestID: string;
	positionButtonTestID: string;
	inputLayerStyle: StyleProp<ViewStyle>;
	showPositionButton?: boolean;
}

export const NavigationSetupAddressField: React.FC<
	NavigationSetupAddressFieldProps
> = ({
	label,
	icon,
	placeholder,
	value,
	onChangeText,
	onLocationSelected,
	autoFocus,
	disableSuggestions,
	hasCurrentPosition,
	onUseCurrentPosition,
	positionButtonAccessibilityLabel,
	inputTestID,
	positionButtonTestID,
	inputLayerStyle,
	showPositionButton = true,
}) => {
	const { t } = useTranslation();

	return (
		<View style={styles.field}>
			<View style={inputLayerStyle}>
				<AddressInput
					label={label}
					icon={icon}
					placeholder={placeholder}
					value={value}
					onChangeText={onChangeText}
					onLocationSelected={onLocationSelected}
					autoFocus={autoFocus}
					containerStyle={styles.addressInputContainer}
					inputContainerStyle={styles.addressInputField}
					disableSuggestions={disableSuggestions}
					testID={inputTestID}
				/>
			</View>

			{showPositionButton ? (
				<Pressable
					style={({ pressed }) => [
						styles.positionButton,
						!hasCurrentPosition && styles.positionButtonDisabled,
						pressed && hasCurrentPosition && styles.positionButtonPressed,
					]}
					onPress={onUseCurrentPosition}
					disabled={!hasCurrentPosition}
					accessibilityRole="button"
					accessibilityLabel={positionButtonAccessibilityLabel}
					testID={positionButtonTestID}
				>
					<Ionicons
						name="locate"
						size={14}
						color={hasCurrentPosition ? COLORS.primary : COLORS.textSecondary}
					/>
					<Text
						style={[
							styles.positionButtonText,
							!hasCurrentPosition && styles.positionButtonTextDisabled,
						]}
					>
						{t('common.currentPosition')}
					</Text>
				</Pressable>
			) : null}
		</View>
	);
};
