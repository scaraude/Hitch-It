import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { formatDate } from '../../utils';
import { APPRECIATION_CONFIG, DIRECTION_CONFIG } from '../constants';
import { Spot } from '../types';
import { DestinationChip } from './ui';

interface SpotDetailsSheetProps {
    spot: Spot;
    onClose: () => void;
    onAddComment?: () => void;
}

export const SpotDetailsSheet: React.FC<SpotDetailsSheetProps> = ({ spot, onClose, onAddComment }) => {
    const appreciationConfig = APPRECIATION_CONFIG[spot.appreciation];
    const directionEmoji = DIRECTION_CONFIG[spot.direction].emoji;

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
                                <DestinationChip key={index} destination={dest} />
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
