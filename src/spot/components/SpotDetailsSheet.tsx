import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { Appreciation, Direction, Spot } from '../types';

interface SpotDetailsSheetProps {
    spot: Spot;
    onClose: () => void;
    onAddComment?: () => void;
}

const APPRECIATION_CONFIG: Record<Appreciation, { label: string; color: string; emoji: string }> = {
    [Appreciation.Perfect]: { label: 'Parfait', color: COLORS.success, emoji: '🎯' },
    [Appreciation.Good]: { label: 'Bon', color: COLORS.primary, emoji: '👍' },
    [Appreciation.Bad]: { label: 'Mauvais', color: COLORS.error, emoji: '👎' }
};

const DIRECTION_EMOJI: Record<Direction, string> = {
    [Direction.North]: '⬆️',
    [Direction.NorthEast]: '↗️',
    [Direction.East]: '➡️',
    [Direction.SouthEast]: '↘️',
    [Direction.South]: '⬇️',
    [Direction.SouthWest]: '↙️',
    [Direction.West]: '⬅️',
    [Direction.NorthWest]: '↖️'
};

export const SpotDetailsSheet: React.FC<SpotDetailsSheetProps> = ({ spot, onClose, onAddComment }) => {
    const appreciationConfig = APPRECIATION_CONFIG[spot.appreciation];
    const directionEmoji = DIRECTION_EMOJI[spot.direction];

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.dragHandle} />
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Appreciation Badge */}
                <View style={[styles.appreciationBadge, { backgroundColor: appreciationConfig.color }]}>
                    <Text style={styles.appreciationEmoji}>{appreciationConfig.emoji}</Text>
                    <Text style={styles.appreciationText}>{appreciationConfig.label}</Text>
                </View>

                {/* Road Name */}
                <Text style={styles.roadName}>{spot.roadName}</Text>

                {/* Direction */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Direction</Text>
                    <View style={styles.directionContainer}>
                        <Text style={styles.directionEmoji}>{directionEmoji}</Text>
                        <Text style={styles.infoValue}>{spot.direction}</Text>
                    </View>
                </View>

                {/* Destinations */}
                {spot.destinations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Destinations</Text>
                        <View style={styles.destinationList}>
                            {spot.destinations.map((dest, index) => (
                                <View key={index} style={styles.destinationChip}>
                                    <Text style={styles.destinationText}>{dest}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Coordonnées</Text>
                    <Text style={styles.coordinates}>
                        {spot.coordinates.latitude.toFixed(6)}, {spot.coordinates.longitude.toFixed(6)}
                    </Text>
                </View>

                {/* Metadata */}
                <View style={styles.metadata}>
                    <Text style={styles.metadataText}>
                        Créé le {formatDate(spot.createdAt)}
                    </Text>
                    <Text style={styles.metadataText}>
                        Par {spot.createdBy}
                    </Text>
                </View>

                {/* Comments Section (placeholder for future) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Commentaires</Text>
                    <Text style={styles.noComments}>Aucun commentaire pour le moment</Text>
                    {onAddComment && (
                        <TouchableOpacity
                            style={styles.addCommentButton}
                            onPress={onAddComment}
                        >
                            <Text style={styles.addCommentButtonText}>+ Ajouter un commentaire</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
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
    header: {
        alignItems: 'center',
        paddingTop: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        position: 'relative',
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.surface,
        borderRadius: 2,
        marginBottom: SPACING.md,
    },
    closeButton: {
        position: 'absolute',
        right: SPACING.lg,
        top: SPACING.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: COLORS.text,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    appreciationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: 20,
        marginBottom: SPACING.md,
    },
    appreciationEmoji: {
        fontSize: 20,
        marginRight: SPACING.sm,
    },
    appreciationText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.background,
    },
    roadName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
    },
    infoLabel: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
    },
    directionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    directionEmoji: {
        fontSize: 20,
    },
    section: {
        marginTop: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    destinationList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    destinationChip: {
        backgroundColor: COLORS.secondary,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: 20,
    },
    destinationText: {
        fontSize: 14,
        color: COLORS.background,
        fontWeight: '500',
    },
    coordinates: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: 'monospace',
    },
    metadata: {
        marginTop: SPACING.lg,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.surface,
    },
    metadataText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    noComments: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginBottom: SPACING.md,
    },
    addCommentButton: {
        backgroundColor: COLORS.surface,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: 8,
        alignItems: 'center',
    },
    addCommentButtonText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
