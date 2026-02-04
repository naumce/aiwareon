import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../services/supabaseClient';
import { useAuthStore } from '../../stores';
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
}

export function GalleryScreen() {
    const { user } = useAuthStore();
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const { colors } = useTheme();
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

            // Query with pagination
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

            // Get signed URLs for each image
            const itemsWithUrls = await Promise.all(
                newItems.map(async (item) => {
                    const { data: signedData } = await supabase.storage
                        .from('aiwear-media')
                        .createSignedUrl(item.object_path, 3600);
                    return { ...item, signedUrl: signedData?.signedUrl };
                })
            );

            if (reset) {
                setItems(itemsWithUrls.filter(i => i.signedUrl));
            } else {
                setItems(prev => [...prev, ...itemsWithUrls.filter(i => i.signedUrl)]);
            }
        } catch (err) {
            console.error('Error fetching gallery:', err);
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

    const renderItem = ({ item }: { item: GalleryItem }) => (
        <TouchableOpacity
            style={styles.gridItem}
            onPress={() => setSelectedItem(item)}
            activeOpacity={0.8}
        >
            {item.signedUrl ? (
                <Image source={{ uri: item.signedUrl }} style={styles.gridImage} />
            ) : (
                <View style={styles.gridPlaceholder}>
                    <ActivityIndicator color={colors.text.tertiary} />
                </View>
            )}
        </TouchableOpacity>
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
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.brand.primary} />
                    </View>
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
                                source={{ uri: selectedItem.signedUrl }}
                                style={styles.detailImage}
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
    gridItem: {
        width: ITEM_WIDTH,
        aspectRatio: 3 / 4,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        backgroundColor: colors.background.tertiary,
    },
    gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gridPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
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
    emptySquare: {
        width: 32,
        height: 32,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.fill.primary,
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
        resizeMode: 'cover',
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
    detailButtonText: {
        fontSize: typography.subhead,
        fontWeight: typography.medium,
        color: colors.text.primary,
    },
    detailButtonTextDestructive: {
        fontSize: typography.subhead,
        fontWeight: typography.medium,
        color: colors.state.error,
    },
    loadMoreContainer: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
});
