import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../services/supabaseClient';
import { useAuthStore, useWardrobeStore } from '../../stores';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { IconSymbol } from '../../components/ui';

const { width } = Dimensions.get('window');
const COLUMNS = 2;
const GAP = spacing.sm;
const ITEM_WIDTH = (width - spacing.lg * 2 - GAP) / COLUMNS;

interface GalleryItem {
    id: string;
    object_path: string;
    kind: string;
    created_at: string;
    signedUrl?: string;
    thumbUrl?: string; // Smaller thumbnail for grid
}

// Skeleton loader component with pulse animation
function SkeletonCard({ colors }: { colors: any }) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={{
                width: ITEM_WIDTH,
                aspectRatio: 3 / 4,
                borderRadius: borderRadius.md,
                backgroundColor: colors.fill.secondary,
                opacity,
            }}
        />
    );
}

export function GalleryScreen() {
    const { user } = useAuthStore();
    const { addItem: addWardrobeItem } = useWardrobeStore();
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [movingToWardrobe, setMovingToWardrobe] = useState(false);
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);

    const PAGE_SIZE = 6;

    const fetchGallery = useCallback(async (reset = false) => {
        if (!user?.id) return;
        if (!reset && (loadingMore || !hasMore)) return;

        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const offset = reset ? 0 : items.length;

            const { data, error } = await supabase
                .from('media_items')
                .select('id, object_path, kind, created_at')
                .eq('user_id', user.id)
                .eq('kind', 'result')
                .order('created_at', { ascending: false })
                .range(offset, offset + PAGE_SIZE - 1);

            if (error) throw error;

            const newItems = data || [];
            setHasMore(newItems.length === PAGE_SIZE);

            const itemsWithUrls = await Promise.all(
                newItems.map(async (item) => {
                    // Full-size URL for detail view
                    const { data: signedData } = await supabase.storage
                        .from('aiwear-media')
                        .createSignedUrl(item.object_path, 3600);
                    // Thumbnail URL for grid (200px wide, 60% quality)
                    const { data: thumbData } = await supabase.storage
                        .from('aiwear-media')
                        .createSignedUrl(item.object_path, 3600, {
                            transform: { width: 200, height: 267, resize: 'cover', quality: 60 },
                        });
                    return {
                        ...item,
                        signedUrl: signedData?.signedUrl,
                        thumbUrl: thumbData?.signedUrl || signedData?.signedUrl,
                    };
                })
            );

            if (reset) {
                setItems(itemsWithUrls.filter(i => i.signedUrl));
            } else {
                setItems(prev => [...prev, ...itemsWithUrls.filter(i => i.signedUrl)]);
            }
        } catch {
            // Gallery fetch failed
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [user?.id, items.length, loadingMore, hasMore]);

    useEffect(() => {
        fetchGallery(true);
    }, [user?.id]);

    const handleRefresh = () => {
        setRefreshing(true);
        setHasMore(true);
        fetchGallery(true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchGallery(false);
        }
    };

    const handleSave = async (item: GalleryItem) => {
        if (!item.signedUrl) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow access to save images.');
                return;
            }

            const filename = `aiwear_${Date.now()}.jpg`;
            const localUri = FileSystem.documentDirectory + filename;

            await FileSystem.downloadAsync(item.signedUrl, localUri);
            await MediaLibrary.saveToLibraryAsync(localUri);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Saved', 'Image saved to your gallery.');
        } catch (err) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to save image.');
        }
    };

    const handleShare = async (item: GalleryItem) => {
        if (!item.signedUrl) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const filename = `aiwear_${Date.now()}.jpg`;
            const localUri = FileSystem.documentDirectory + filename;

            await FileSystem.downloadAsync(item.signedUrl, localUri);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(localUri);
            }
        } catch (err) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to share image.');
        }
    };

    const handleDelete = async (item: GalleryItem) => {
        Alert.alert(
            'Delete Image',
            'This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        try {
                            await supabase.from('media_items').delete().eq('id', item.id);
                            await supabase.storage.from('aiwear-media').remove([item.object_path]);
                            setItems((prev) => prev.filter((i) => i.id !== item.id));
                            setSelectedItem(null);
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete image.');
                        }
                    },
                },
            ]
        );
    };

    const handleMoveToWardrobe = async (item: GalleryItem) => {
        if (!item.signedUrl || !user?.id) return;

        setMovingToWardrobe(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            // Download image locally
            const filename = `wardrobe_${Date.now()}.jpg`;
            const localUri = FileSystem.documentDirectory + filename;
            await FileSystem.downloadAsync(item.signedUrl, localUri);

            // Read as base64 and upload to wardrobe bucket
            const base64 = await FileSystem.readAsStringAsync(localUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const storagePath = `${user.id}/${filename}`;
            const { error: uploadError } = await supabase.storage
                .from('wardrobe')
                .upload(storagePath, decode(base64), { contentType: 'image/jpeg' });

            if (uploadError) throw uploadError;

            // Add to wardrobe store
            await addWardrobeItem({
                user_id: user.id,
                name: 'Try-On Result',
                category: 'tops',
                category_group: 'clothing',
                image_url: storagePath,
                ai_suggested: false,
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Added', 'Image moved to your wardrobe.');
            setSelectedItem(null);
        } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to move image to wardrobe.');
        } finally {
            setMovingToWardrobe(false);
        }
    };

    const renderItem = ({ item }: { item: GalleryItem }) => (
        <View style={styles.gridItem}>
            <TouchableOpacity
                style={styles.gridTouchable}
                onPress={() => setSelectedItem(item)}
                activeOpacity={0.8}
            >
                {item.thumbUrl ? (
                    <Image
                        source={item.thumbUrl}
                        style={styles.gridImage}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                    />
                ) : (
                    <View style={styles.gridPlaceholder}>
                        <ActivityIndicator color={colors.text.tertiary} />
                    </View>
                )}
            </TouchableOpacity>

            {/* Delete button overlay */}
            <TouchableOpacity
                style={styles.gridDeleteButton}
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <IconSymbol name="X" size={12} color="#FFF" strokeWidth={3} />
            </TouchableOpacity>

            {/* Move to wardrobe button overlay */}
            <TouchableOpacity
                style={styles.gridMoveButton}
                onPress={() => handleMoveToWardrobe(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <IconSymbol name="Shirt" size={12} color="#FFF" strokeWidth={2.5} />
            </TouchableOpacity>
        </View>
    );

    const renderSkeleton = () => (
        <View style={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} colors={colors} />
            ))}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
                <IconSymbol name="Images" size={40} color={colors.text.tertiary} strokeWidth={1} />
            </View>
            <Text style={styles.emptyTitle}>No Results Yet</Text>
            <Text style={styles.emptySubtitle}>
                Your generated try-on images will appear here
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Gallery</Text>
                        <Text style={styles.subtitle}>{items.length} results</Text>
                    </View>
                </View>

                {loading ? (
                    renderSkeleton()
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        numColumns={COLUMNS}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={[
                            styles.listContent,
                            items.length === 0 && styles.listEmpty,
                        ]}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmpty}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={colors.brand.primary}
                            />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={
                            loadingMore ? (
                                <View style={styles.loadMoreContainer}>
                                    <ActivityIndicator size="small" color={colors.brand.primary} />
                                </View>
                            ) : null
                        }
                    />
                )}

                {/* Detail Overlay */}
                {selectedItem && (
                    <TouchableOpacity
                        style={styles.overlay}
                        activeOpacity={1}
                        onPress={() => setSelectedItem(null)}
                    >
                        <View style={styles.detailCard}>
                            <Image
                                source={selectedItem.signedUrl}
                                style={styles.detailImage}
                                contentFit="cover"
                                transition={300}
                                cachePolicy="memory-disk"
                            />
                            <View style={styles.detailActions}>
                                <TouchableOpacity
                                    style={styles.detailButton}
                                    onPress={() => handleSave(selectedItem)}
                                >
                                    <IconSymbol name="Download" size={20} color={colors.text.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.detailButton}
                                    onPress={() => handleShare(selectedItem)}
                                >
                                    <IconSymbol name="Share" size={20} color={colors.text.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.detailButton}
                                    onPress={() => handleMoveToWardrobe(selectedItem)}
                                    disabled={movingToWardrobe}
                                >
                                    {movingToWardrobe ? (
                                        <ActivityIndicator size="small" color={colors.brand.primary} />
                                    ) : (
                                        <IconSymbol name="Shirt" size={20} color={colors.brand.primary} />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.detailButton, styles.detailButtonDestructive]}
                                    onPress={() => handleDelete(selectedItem)}
                                >
                                    <IconSymbol name="Trash2" size={20} color={colors.state.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
        </View>
    );
}

// Helper to decode base64 to Uint8Array for Supabase upload
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: typography.footnote,
        color: colors.text.muted,
        marginTop: 2,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 100,
    },
    listEmpty: {
        flexGrow: 1,
    },
    row: {
        gap: GAP,
        marginBottom: GAP,
    },

    // Skeleton
    skeletonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
        paddingHorizontal: spacing.lg,
    },

    // Grid items
    gridItem: {
        width: ITEM_WIDTH,
        aspectRatio: 3 / 4,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        backgroundColor: colors.background.tertiary,
    },
    gridTouchable: {
        flex: 1,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Delete button on grid card (top-right)
    gridDeleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Move to wardrobe button on grid card (bottom-right)
    gridMoveButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Loading & empty states
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.fill.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: typography.title3,
        fontWeight: typography.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontSize: typography.subhead,
        color: colors.text.secondary,
        textAlign: 'center',
    },

    // Detail overlay
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    detailCard: {
        width: '100%',
        maxWidth: 360,
    },
    detailImage: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: borderRadius.lg,
    },
    detailActions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    detailButton: {
        flex: 1,
        paddingVertical: spacing.md,
        backgroundColor: colors.fill.secondary,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
    },
    detailButtonDestructive: {
        backgroundColor: 'rgba(255, 69, 58, 0.15)',
    },
    loadMoreContainer: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
});
