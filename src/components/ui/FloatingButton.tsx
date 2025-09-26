import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants';

interface FloatingButtonProps {
    onPress: () => void;
    icon: string;
    backgroundColor?: string;
    position?: 'center' | 'right' | 'left';
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
    onPress,
    icon,
    backgroundColor = COLORS.primary,
    position = 'center'
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor },
                position === 'center' && styles.center,
                position === 'right' && styles.right,
                position === 'left' && styles.left,
            ]}
            onPress={onPress}
        >
            <Text style={styles.icon}>{icon}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        bottom: 60,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    center: {
        alignSelf: 'center',
    },
    right: {
        right: 20,
    },
    left: {
        left: 20,
    },
    icon: {
        color: COLORS.background,
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});