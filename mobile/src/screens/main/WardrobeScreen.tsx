import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Dimensions,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useWardrobeStore, useAuthStore } from '../../stores';
import { geminiService } from '../../services';
import { compressForWardrobe } from '../../utils/imageUtils';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { IconSymbol, ScalePressable, PremiumHeader } from '../../components/ui';
import type { WardrobeCategory } from '../../types';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - spacing.lg * 2 - spacing.md * 2) / 3;

const CATEGORIES: { key: WardrobeCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'tops', label: 'Tops' },
    { key: 'bottoms', label: 'Bottoms' },
    { key: 'dresses', label: 'Dresses' },
    { key: 'outerwear', label: 'Outerwear' },
    { key: 'bags', label: 'Bags' },
    { key: 'glasses', label: 'Glasses' },
    { key: 'heels', label: 'Heels' },
    { key: 'sneakers', label: 'Sneakers' },
];

interface PendingItem {
    uri: string;
    name: string;
    category: WardrobeCategory;
    confidence: number;
}

export function WardrobeScreen() {
    const { user } = useAuthStore();
    const {
        items,
        exampleItems,
        selectedCategory,
        isLoading,
        fetchItems,
        addItem,
        removeItem,
        setCategory,
        getFilteredItems,
    } = useWardrobeStore();

    const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const { colors } = useTheme();
    const styles = createStyles(colors);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleImageSelected = async (uri: string) => {
        setIsCategorizing(true);

        try {
            // Compress the image
            const compressedUri = await compressForWardrobe(uri);

            // Categorize with AI
            const result = await geminiService.categorizeGarment(compressedUri);

            setPendingItem({
                uri: compressedUri,
                name: result.name,
                category: result.category as WardrobeCategory,
                confidence: result.confidence,
            });
        } catch {
            Alert.alert('Error', 'Failed to process image. Please try again.');
        } finally {
            setIsCategorizing(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await handleImageSelected(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera permission is required');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await handleImageSelected(result.assets[0].uri);
        }
    };

    const confirmAddItem = async () => {
        if (!pendingItem || !user) return;

        setIsAdding(true);

        try {
            // TODO: Upload image to Supabase storage first
            // For now, store the local URI (won't persist across sessions)
            await addItem({
                user_id: user.id,
                name: pendingItem.name,
                category: pendingItem.category,
                category_group: ['bags', 'glasses', 'heels', 'sneakers'].includes(pendingItem.category)
                    ? 'accessories'
                    : 'clothing',
                image_url: pendingItem.uri,
                ai_suggested: true,
                ai_confidence: pendingItem.confidence,
            });

            setPendingItem(null);
        } catch {
            Alert.alert('Error', 'Failed to add item. Please try again.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteItem = (id: string) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to remove this item from your wardrobe?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => removeItem(id),
                },
            ]
        );
    };

    const filteredItems = getFilteredItems();

    const renderItem = ({ item }: { item: typeof items[0] }) => (
        <ScalePressable
            style={styles.itemCard}
            onLongPress={() => !item.is_example && handleDeleteItem(item.id)}
            hapticType="light"
        >
            {item.image_url ? (
                <Image source={item.image_url} style={styles.itemImage} contentFit="cover" transition={200} cachePolicy="memory-disk" />
            ) : (
                <View style={styles.itemPlaceholder}>
                    <IconSymbol name="Shirt" size={28} color={colors.text.muted} strokeWidth={1} />
                </View>
            )}
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                {item.is_example && (
                    <Text style={styles.exampleBadge}>Example</Text>
                )}
            </View>
        </ScalePressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <PremiumHeader
                title="Your Wardrobe"
                greeting={`${items.length} items`}
                rightIcon="Plus"
                onRightPress={() => {
                    Alert.alert(
                        'Add Item',
                        'Choose how to add a garment',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Take Photo', onPress: takePhoto },
                            { text: 'Choose from Library', onPress: pickImage },
                        ]
                    );
                }}
            />

            {/* Category Filter - iOS Segmented Style */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.key}
                            style={[
                                styles.filterPill,
                                selectedCategory === cat.key && styles.filterPillActive,
                            ]}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setCategory(cat.key);
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedCategory === cat.key && styles.filterTextActive,
                            ]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Items Grid */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                </View>
            ) : filteredItems.length > 0 ? (
                <FlatList
                    data={filteredItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    contentContainerStyle={styles.gridContent}
                    columnWrapperStyle={styles.gridRow}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconContainer}>
                        <IconSymbol name="Shirt" size={40} color={colors.text.tertiary} strokeWidth={1} />
                    </View>
                    <Text style={styles.emptyTitle}>No Items Yet</Text>
                    <Text style={styles.emptyDescription}>
                        Tap + to add items to your wardrobe
                    </Text>
                </View>
            )}

            {/* Pending Item Modal */}
            <Modal
                visible={pendingItem !== null}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add to Wardrobe</Text>

                        {pendingItem && (
                            <>
                                <Image
                                    source={{ uri: pendingItem.uri }}
                                    style={styles.pendingImage}
                                />

                                <Text style={styles.pendingName}>{pendingItem.name}</Text>

                                <View style={styles.categorySelect}>
                                    <Text style={styles.categorySelectLabel}>Category</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {CATEGORIES.filter(c => c.key !== 'all').map((cat) => (
                                            <TouchableOpacity
                                                key={cat.key}
                                                style={[
                                                    styles.categoryOption,
                                                    pendingItem.category === cat.key && styles.categoryOptionActive,
                                                ]}
                                                onPress={() => {
                                                    Haptics.selectionAsync();
                                                    setPendingItem({ ...pendingItem, category: cat.key as WardrobeCategory });
                                                }}
                                            >
                                                <Text style={[
                                                    styles.categoryOptionText,
                                                    pendingItem.category === cat.key && styles.categoryOptionTextActive,
                                                ]}>
                                                    {cat.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setPendingItem(null)}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={confirmAddItem}
                                        disabled={isAdding}
                                    >
                                        <LinearGradient
                                            colors={colors.gradient.primary}
                                            style={styles.confirmButton}
                                        >
                                            {isAdding ? (
                                                <ActivityIndicator size="small" color={colors.text.primary} />
                                            ) : (
                                                <Text style={styles.confirmButtonText}>Add Item</Text>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    // Filter Pills
    filterContainer: {
        marginBottom: spacing.lg,
    },
    filterScroll: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    filterPill: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    filterPillActive: {
        backgroundColor: colors.fill.tertiary,
    },
    filterText: {
        fontSize: typography.callout,
        color: colors.text.tertiary,
        fontWeight: '500',
    },
    filterTextActive: {
        color: colors.text.primary,
        fontWeight: '600',
    },
    // Grid
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 120,
    },
    gridRow: {
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    itemCard: {
        width: ITEM_SIZE,
        backgroundColor: colors.background.card,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    itemImage: {
        width: '100%',
        aspectRatio: 1,
        // resizeMode handled by contentFit prop
    },
    itemPlaceholder: {
        width: '100%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.elevated,
    },
    itemInfo: {
        padding: spacing.xs,
    },
    itemName: {
        fontSize: 11,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    exampleBadge: {
        fontSize: 9,
        color: colors.text.muted,
        marginTop: 2,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.background.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.lg,
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: typography.lg,
        fontWeight: typography.semibold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    emptyDescription: {
        fontSize: typography.sm,
        color: colors.text.muted,
        textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        width: '100%',
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
    },
    modalTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    pendingImage: {
        width: 150,
        height: 150,
        borderRadius: borderRadius.lg,
        alignSelf: 'center',
        marginBottom: spacing.md,
    },
    pendingName: {
        fontSize: typography.md,
        fontWeight: typography.medium,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    categorySelect: {
        marginBottom: spacing.lg,
    },
    categorySelectLabel: {
        fontSize: typography.xs,
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    categoryOption: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        borderRadius: borderRadius.md,
        marginRight: spacing.sm,
    },
    categoryOptionActive: {
        backgroundColor: colors.brand.primary,
        borderColor: colors.brand.primary,
    },
    categoryOptionText: {
        fontSize: typography.sm,
        color: colors.text.secondary,
    },
    categoryOptionTextActive: {
        color: colors.text.primary,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: spacing.md,
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: typography.sm,
        color: colors.text.secondary,
    },
    confirmButton: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: colors.text.primary,
    },
});
