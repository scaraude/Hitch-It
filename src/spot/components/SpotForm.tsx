import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { Appreciation, Direction } from '../types';

interface SpotFormData {
    appreciation: Appreciation;
    roadName: string;
    direction: Direction;
    destinations: string[];
}

interface SpotFormProps {
    onSubmit: (data: SpotFormData) => void;
    onCancel: () => void;
}

const APPRECIATIONS = Object.values(Appreciation);
const DIRECTIONS = Object.values(Direction);

const APPRECIATION_LABELS: Record<Appreciation, string> = {
    [Appreciation.Perfect]: 'Parfait',
    [Appreciation.Good]: 'Bon',
    [Appreciation.Bad]: 'Mauvais'
};

export const SpotForm: React.FC<SpotFormProps> = ({ onSubmit, onCancel }) => {
    const [appreciation, setAppreciation] = useState<Appreciation>(Appreciation.Good);
    const [roadName, setRoadName] = useState('');
    const [direction, setDirection] = useState<Direction>(Direction.North);
    const [destinationInput, setDestinationInput] = useState('');
    const [destinations, setDestinations] = useState<string[]>([]);

    const handleAddDestination = () => {
        if (destinationInput.trim()) {
            setDestinations([...destinations, destinationInput.trim()]);
            setDestinationInput('');
        }
    };

    const handleRemoveDestination = (index: number) => {
        setDestinations(destinations.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!roadName.trim()) {
            return;
        }
        onSubmit({
            appreciation,
            roadName: roadName.trim(),
            direction,
            destinations
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContent}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>Nouveau Spot</Text>

                    {/* Appreciation */}
                    <Text style={styles.label}>Appréciation *</Text>
                    <View style={styles.buttonGroup}>
                        {APPRECIATIONS.map((app) => (
                            <TouchableOpacity
                                key={app}
                                style={[
                                    styles.optionButton,
                                    appreciation === app && styles.optionButtonSelected
                                ]}
                                onPress={() => setAppreciation(app)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    appreciation === app && styles.optionTextSelected
                                ]}>
                                    {APPRECIATION_LABELS[app]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Road Name */}
                    <Text style={styles.label}>Nom de la route *</Text>
                    <TextInput
                        style={styles.input}
                        value={roadName}
                        onChangeText={setRoadName}
                        placeholder="Ex: A6, D907, Route de Lyon..."
                        placeholderTextColor={COLORS.textSecondary}
                    />

                    {/* Direction */}
                    <Text style={styles.label}>Direction *</Text>
                    <View style={styles.directionGrid}>
                        {DIRECTIONS.map((dir) => (
                            <TouchableOpacity
                                key={dir}
                                style={[
                                    styles.directionButton,
                                    direction === dir && styles.directionButtonSelected
                                ]}
                                onPress={() => setDirection(dir)}
                            >
                                <Text style={[
                                    styles.directionText,
                                    direction === dir && styles.directionTextSelected
                                ]}>
                                    {dir}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Destinations */}
                    <Text style={styles.label}>Destinations</Text>
                    <View style={styles.destinationInput}>
                        <TextInput
                            style={styles.input}
                            value={destinationInput}
                            onChangeText={setDestinationInput}
                            placeholder="Ex: Paris, Lyon..."
                            placeholderTextColor={COLORS.textSecondary}
                            onSubmitEditing={handleAddDestination}
                        />
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddDestination}
                        >
                            <Text style={styles.addButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {destinations.length > 0 && (
                        <View style={styles.destinationList}>
                            {destinations.map((dest, index) => (
                                <View key={index} style={styles.destinationChip}>
                                    <Text style={styles.destinationText}>{dest}</Text>
                                    <TouchableOpacity onPress={() => handleRemoveDestination(index)}>
                                        <Text style={styles.removeButton}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={onCancel}
                    >
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.submitButton, !roadName.trim() && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!roadName.trim()}
                    >
                        <Text style={styles.submitButtonText}>Créer le spot</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        maxHeight: '80%',
    },
    formContent: {
        padding: SPACING.lg,
    },
    scrollView: {
        maxHeight: 500,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.surface,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: SPACING.md,
        fontSize: 16,
        color: COLORS.text,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    optionButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.surface,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
    },
    optionButtonSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    optionText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    optionTextSelected: {
        color: COLORS.background,
    },
    directionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    directionButton: {
        width: '23%',
        paddingVertical: SPACING.sm,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.surface,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
    },
    directionButtonSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    directionText: {
        fontSize: 12,
        color: COLORS.text,
        fontWeight: '500',
    },
    directionTextSelected: {
        color: COLORS.background,
    },
    destinationInput: {
        flexDirection: 'row',
        gap: SPACING.sm,
        alignItems: 'center',
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 24,
        color: COLORS.background,
        fontWeight: 'bold',
    },
    destinationList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },
    destinationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: 20,
        gap: SPACING.sm,
    },
    destinationText: {
        fontSize: 14,
        color: COLORS.background,
        fontWeight: '500',
    },
    removeButton: {
        fontSize: 16,
        color: COLORS.background,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.lg,
    },
    button: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.surface,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.textSecondary,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.background,
    },
});
