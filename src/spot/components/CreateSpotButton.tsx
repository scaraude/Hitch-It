import { StyleSheet, View } from 'react-native';
import { FloatingButton } from '../../components/ui';
import { A11Y_LABELS } from '../../constants/accessibility';

interface CreateSpotButtonProps {
	onPress: () => void;
}

export const CreateSpotButton: React.FC<CreateSpotButtonProps> = ({
	onPress,
}) => {
	return (
		<View style={styles.container}>
			<FloatingButton
				onPress={onPress}
				icon="+"
				accessibilityLabel={A11Y_LABELS.addSpot}
				accessibilityHint={A11Y_LABELS.addSpotHint}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 60,
		alignSelf: 'center',
	},
});
