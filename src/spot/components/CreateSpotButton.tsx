import { StyleSheet, View } from "react-native";
import { FloatingButton } from "../../components/ui";

interface CreateSpotButtonProps {
    onPress: () => void;
}

export const CreateSpotButton: React.FC<CreateSpotButtonProps> = ({ onPress }) => {
    return (
        <View style={styles.container}>
            <FloatingButton
                onPress={onPress}
                icon="+"
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