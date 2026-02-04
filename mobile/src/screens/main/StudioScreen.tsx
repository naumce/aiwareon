import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { supabase } from '../../services/supabaseClient';
import { useGenerationStore, useCreditStore, useAuthStore, useWardrobeStore } from '../../stores';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { PERSON_EXAMPLES, GARMENT_EXAMPLES, SHOWCASE_RESULTS } from '../../lib/exampleImages';
import { IconSymbol } from '../../components/ui';
import type { Quality, ModelType, FalCategory } from '../../types';

const { width } = Dimensions.get('window');

// Person image from DB
interface PersonImage {
    id: string;
    storage_path: string;
    url?: string;
}

// Loading status messages
const LOADING_MESSAGES = [
    'Analyzing garment...',
    'Processing style...',
    'Generating result...',
    'Almost done...',
];

export function StudioScreen() {
    const { user } = useAuthStore();
    const {
        state,
        personImage,
        dressImage,
        resultUrl,
        error,
        setPersonImage,
        setDressImage,
        generate,
    } = useGenerationStore();

    const { balance, fetchBalance } = useCreditStore();
    const { items: wardrobeItems, exampleItems, fetchItems: fetchWardrobe } = useWardrobeStore();

    const [quality, setQuality] = useState<Quality>('standard');
    const [modelType, setModelType] = useState<ModelType>('gemini2');
    const [falCategory, setFalCategory] = useState<FalCategory>('tops');
    const [messageIndex, setMessageIndex] = useState(0);
    const [showcaseIndex, setShowcaseIndex] = useState(0);
    const fadeAnim = useState(new Animated.Value(1))[0];

    // User's saved person photos from DB
    const [savedPersonPhotos, setSavedPersonPhotos] = useState<PersonImage[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const { colors } = useTheme();
    const styles = createStyles(colors);

    // Fetch user data on mount
    useEffect(() => {
        const loadData = async () => {
            setLoadingData(true);
            await Promise.all([
                fetchBalance(),
                fetchWardrobe(),
                fetchSavedPersonPhotos(),
            ]);
            setLoadingData(false);
        };
        loadData();
    }, [fetchBalance, fetchWardrobe]);

    const fetchSavedPersonPhotos = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { data, error } = await supabase
                .from('person_images')
                .select('id, storage_path')
                .eq('user_id', user.id)
                .order('last_used_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error fetching person images:', error);
                return;
            }

            // Get signed URLs for each image
            const photosWithUrls = await Promise.all(
                (data || []).map(async (img) => {
                    const { data: urlData } = await supabase.storage
                        .from('media')
                        .createSignedUrl(img.storage_path, 3600);
                    return { ...img, url: urlData?.signedUrl };
                })
            );

            setSavedPersonPhotos(photosWithUrls.filter(p => p.url));
        } catch (err) {
            console.error('Error loading person photos:', err);
        }
    }, [user?.id]);

    // Get wardrobe items with signed URLs
    const [wardrobeWithUrls, setWardrobeWithUrls] = useState<Array<{ id: string; url: string; category: string }>>([]);

    useEffect(() => {
        const loadWardrobeUrls = async () => {
            const allItems = [...wardrobeItems, ...exampleItems];
            const itemsWithUrls = await Promise.all(
                allItems.slice(0, 10).map(async (item) => {
                    // image_url can be a storage path or a full URL
                    if (item.image_url && !item.image_url.startsWith('http')) {
                        // It's a storage path - get signed URL from wardrobe bucket
                        const { data } = await supabase.storage
                            .from('wardrobe')
                            .createSignedUrl(item.image_url, 3600);
                        return { id: item.id, url: data?.signedUrl || '', category: item.category };
                    }
                    // It's already a full URL (example items)
                    return { id: item.id, url: item.image_url || '', category: item.category };
                })
            );
            setWardrobeWithUrls(itemsWithUrls.filter(i => i.url));
        };

        if (wardrobeItems.length > 0 || exampleItems.length > 0) {
            loadWardrobeUrls();
        }
    }, [wardrobeItems, exampleItems]);

    useEffect(() => {
        if (state === 'generating') {
            const textInterval = setInterval(() => {
                Animated.sequence([
                    Animated.timing(fadeAnim, { toValue: 0.4, duration: 150, useNativeDriver: true }),
                    Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
                ]).start();
                setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
            }, 2500);

            const imageInterval = setInterval(() => {
                setShowcaseIndex((prev) => (prev + 1) % SHOWCASE_RESULTS.length);
            }, 4000);

            return () => {
                clearInterval(textInterval);
                clearInterval(imageInterval);
            };
        }
    }, [state, fadeAnim]);

    useEffect(() => {
        if (error?.userMessage) {
            Alert.alert('Unable to Generate', error.userMessage);
        }
    }, [error]);

    const pickImage = async (target: 'person' | 'garment') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.9,
        });

        if (!result.canceled && result.assets[0]) {
            if (target === 'person') {
                setPersonImage(result.assets[0].uri);
            } else {
                setDressImage(result.assets[0].uri);
            }
        }
    };

    const takePhoto = async (target: 'person' | 'garment') => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Camera Access Required', 'Please enable camera in Settings.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.9,
        });

        if (!result.canceled && result.assets[0]) {
            if (target === 'person') {
                setPersonImage(result.assets[0].uri);
            } else {
                setDressImage(result.assets[0].uri);
            }
        }
    };

    const showImageOptions = (target: 'person' | 'garment') => {
        Alert.alert(
            target === 'person' ? 'Add Photo' : 'Add Garment',
            'Choose an option',
            [
                { text: 'Take Photo', onPress: () => takePhoto(target) },
                { text: 'Choose from Library', onPress: () => pickImage(target) },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleGenerate = async () => {
        const creditCost = quality === 'studio' ? 2 : 1;
        if (balance < creditCost) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Insufficient Credits', `This requires ${creditCost} credit${creditCost > 1 ? 's' : ''}.`);
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await generate(quality, modelType, modelType === 'fal' ? falCategory : undefined);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await fetchBalance();
    };

    // Save generated result to device gallery
    const handleSaveResult = async () => {
        if (!resultUrl) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow access to save images.');
                return;
            }

            let localUri = resultUrl;

            // If it's a data URI, save to temp file first
            if (resultUrl.startsWith('data:')) {
                const base64Data = resultUrl.split(',')[1];
                const filename = `aiwear_${Date.now()}.jpg`;
                localUri = FileSystem.cacheDirectory + filename;
                await FileSystem.writeAsStringAsync(localUri, base64Data, {
                    encoding: FileSystem.EncodingType.Base64,
                });
            } else if (resultUrl.startsWith('http')) {
                // Download remote URL
                const filename = `aiwear_${Date.now()}.jpg`;
                localUri = FileSystem.cacheDirectory + filename;
                await FileSystem.downloadAsync(resultUrl, localUri);
            }

            await MediaLibrary.saveToLibraryAsync(localUri);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Saved!', 'Image saved to your photo library.');
        } catch (err) {
            console.error('Error saving result:', err);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to save image.');
        }
    };

    // Share generated result
    const handleShareResult = async () => {
        if (!resultUrl) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            let localUri = resultUrl;

            // If it's a data URI, save to temp file first
            if (resultUrl.startsWith('data:')) {
                const base64Data = resultUrl.split(',')[1];
                const filename = `aiwear_${Date.now()}.jpg`;
                localUri = FileSystem.cacheDirectory + filename;
                await FileSystem.writeAsStringAsync(localUri, base64Data, {
                    encoding: FileSystem.EncodingType.Base64,
                });
            } else if (resultUrl.startsWith('http')) {
                const filename = `aiwear_${Date.now()}.jpg`;
                localUri = FileSystem.cacheDirectory + filename;
                await FileSystem.downloadAsync(resultUrl, localUri);
            }

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(localUri);
            } else {
                Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
            }
        } catch (err) {
            console.error('Error sharing result:', err);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to share image.');
        }
    };

    const canGenerate = personImage && dressImage && state !== 'generating' && balance > 0;
    const isGenerating = state === 'generating';
    const creditCost = quality === 'studio' ? 2 : 1;

    // Combine saved + example images for display
    const personOptions = [
        ...savedPersonPhotos.map(p => ({ id: p.id, url: p.url!, label: 'Saved' })),
        ...PERSON_EXAMPLES.map(e => ({ id: e.id, url: e.url, label: 'Example' })),
    ];

    const garmentOptions = [
        ...wardrobeWithUrls.map(w => ({ id: w.id, url: w.url, label: 'Wardrobe' })),
        ...GARMENT_EXAMPLES.map(e => ({ id: e.id, url: e.url, label: 'Example' })),
    ];


    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Studio</Text>
                            <Text style={styles.subtitle}>Virtual Try-On</Text>
                        </View>
                        <View style={styles.creditBadge}>
                            <Text style={styles.creditValue}>{balance}</Text>
                            <IconSymbol name="Sparkles" size={14} color={colors.brand.primary} />
                        </View>
                    </View>

                    {loadingData ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color={colors.brand.primary} />
                            <Text style={styles.loadingText}>Loading your images...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Selected Images Preview (Side-by-Side when both selected) */}
                            {personImage && dressImage ? (
                                <View style={styles.selectedPairContainer}>
                                    <Text style={styles.selectedPairTitle}>Ready to Generate</Text>
                                    <View style={styles.selectedPairRow}>
                                        {/* Person Preview */}
                                        <View style={styles.selectedPairCard}>
                                            <Image source={{ uri: personImage }} style={styles.selectedPairImage} />
                                            <TouchableOpacity
                                                style={styles.pairClearButton}
                                                onPress={() => setPersonImage(null)}
                                            >
                                                <IconSymbol name="X" size={14} color="#fff" strokeWidth={2.5} />
                                            </TouchableOpacity>
                                            <View style={styles.pairLabel}>
                                                <Text style={styles.pairLabelText}>You</Text>
                                            </View>
                                        </View>

                                        {/* Plus Icon */}
                                        <View style={styles.plusIcon}>
                                            <IconSymbol name="Plus" size={20} color={colors.text.tertiary} />
                                        </View>

                                        {/* Garment Preview */}
                                        <View style={styles.selectedPairCard}>
                                            <Image source={{ uri: dressImage }} style={styles.selectedPairImage} />
                                            <TouchableOpacity
                                                style={styles.pairClearButton}
                                                onPress={() => setDressImage(null)}
                                            >
                                                <IconSymbol name="X" size={14} color="#fff" strokeWidth={2.5} />
                                            </TouchableOpacity>
                                            <View style={styles.pairLabel}>
                                                <Text style={styles.pairLabelText}>Garment</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    {/* Person Input */}
                                    <View style={styles.inputSection}>
                                        <View style={styles.inputHeader}>
                                            <Text style={styles.inputTitle}>You</Text>
                                            <TouchableOpacity onPress={() => showImageOptions('person')}>
                                                <Text style={styles.inputAction}>Upload</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {personImage ? (
                                            <View style={styles.selectedCard}>
                                                <Image source={{ uri: personImage }} style={styles.selectedImage} />
                                                <TouchableOpacity
                                                    style={styles.clearButton}
                                                    onPress={() => setPersonImage(null)}
                                                >
                                                    <IconSymbol name="X" size={16} color="#fff" strokeWidth={2.5} />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <View>
                                                {savedPersonPhotos.length > 0 && (
                                                    <Text style={styles.sectionLabel}>Your Photos</Text>
                                                )}
                                                <FlatList
                                                    data={personOptions}
                                                    keyExtractor={(item) => item.id}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity
                                                            style={styles.exampleThumb}
                                                            onPress={() => setPersonImage(item.url)}
                                                            activeOpacity={0.7}
                                                        >
                                                            <Image source={{ uri: item.url }} style={styles.exampleImage} />
                                                            {item.label === 'Saved' && (
                                                                <View style={styles.savedBadge}>
                                                                    <Text style={styles.savedBadgeText}>Saved</Text>
                                                                </View>
                                                            )}
                                                        </TouchableOpacity>
                                                    )}
                                                    horizontal
                                                    showsHorizontalScrollIndicator={false}
                                                    contentContainerStyle={styles.exampleList}
                                                />
                                            </View>
                                        )}
                                    </View>

                                    {/* Garment Input */}
                                    <View style={styles.inputSection}>
                                        <View style={styles.inputHeader}>
                                            <Text style={styles.inputTitle}>Garment</Text>
                                            <TouchableOpacity onPress={() => showImageOptions('garment')}>
                                                <Text style={styles.inputAction}>Upload</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {dressImage ? (
                                            <View style={styles.selectedCard}>
                                                <Image source={{ uri: dressImage }} style={styles.selectedImage} />
                                                <TouchableOpacity
                                                    style={styles.clearButton}
                                                    onPress={() => setDressImage(null)}
                                                >
                                                    <IconSymbol name="X" size={16} color="#fff" strokeWidth={2.5} />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <View>
                                                {wardrobeWithUrls.length > 0 && (
                                                    <Text style={styles.sectionLabel}>Your Wardrobe</Text>
                                                )}
                                                <FlatList
                                                    data={garmentOptions}
                                                    keyExtractor={(item) => item.id}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity
                                                            style={styles.exampleThumb}
                                                            onPress={() => setDressImage(item.url)}
                                                            activeOpacity={0.7}
                                                        >
                                                            <Image source={{ uri: item.url }} style={styles.exampleImage} />
                                                            {item.label === 'Wardrobe' && (
                                                                <View style={styles.wardrobeBadge}>
                                                                    <Text style={styles.wardrobeBadgeText}>Wardrobe</Text>
                                                                </View>
                                                            )}
                                                        </TouchableOpacity>
                                                    )}
                                                    horizontal
                                                    showsHorizontalScrollIndicator={false}
                                                    contentContainerStyle={styles.exampleList}
                                                />
                                            </View>
                                        )}
                                    </View>
                                </>
                            )}

                            {/* Quality */}
                            <View style={styles.optionSection}>
                                <Text style={styles.optionLabel}>Quality</Text>
                                <View style={styles.segmentedControl}>
                                    <TouchableOpacity
                                        style={[styles.segment, quality === 'standard' && styles.segmentActive]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setQuality('standard');
                                        }}
                                        disabled={isGenerating}
                                    >
                                        <Text style={[styles.segmentText, quality === 'standard' && styles.segmentTextActive]}>
                                            Standard · 1
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.segment, quality === 'studio' && styles.segmentActive]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setQuality('studio');
                                        }}
                                        disabled={isGenerating}
                                    >
                                        <Text style={[styles.segmentText, quality === 'studio' && styles.segmentTextActive]}>
                                            Studio · 2
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Model */}
                            <View style={styles.optionSection}>
                                <Text style={styles.optionLabel}>Model</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.chipRow}>
                                        {[
                                            { key: 'gemini2' as ModelType, label: 'Gemini 2' },
                                            { key: 'geminipro' as ModelType, label: 'Gemini Pro' },
                                            { key: 'fal' as ModelType, label: 'Fal AI' },
                                        ].map((model) => (
                                            <TouchableOpacity
                                                key={model.key}
                                                style={[styles.chip, modelType === model.key && styles.chipActive]}
                                                onPress={() => {
                                                    Haptics.selectionAsync();
                                                    setModelType(model.key);
                                                }}
                                                disabled={isGenerating}
                                            >
                                                <Text style={[styles.chipText, modelType === model.key && styles.chipTextActive]}>
                                                    {model.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            {/* Fal Category */}
                            {modelType === 'fal' && (
                                <View style={styles.optionSection}>
                                    <Text style={styles.optionLabel}>Garment Type</Text>
                                    <View style={styles.chipRow}>
                                        {[
                                            { key: 'tops' as FalCategory, label: 'Top' },
                                            { key: 'bottoms' as FalCategory, label: 'Bottom' },
                                            { key: 'one-pieces' as FalCategory, label: 'Dress' },
                                        ].map((cat) => (
                                            <TouchableOpacity
                                                key={cat.key}
                                                style={[styles.chip, falCategory === cat.key && styles.chipActive]}
                                                onPress={() => {
                                                    Haptics.selectionAsync();
                                                    setFalCategory(cat.key);
                                                }}
                                                disabled={isGenerating}
                                            >
                                                <Text style={[styles.chipText, falCategory === cat.key && styles.chipTextActive]}>
                                                    {cat.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Generate Button */}
                            <TouchableOpacity
                                onPress={handleGenerate}
                                disabled={!canGenerate}
                                activeOpacity={0.8}
                                style={styles.generateWrapper}
                            >
                                <LinearGradient
                                    colors={canGenerate ? colors.gradient.primary : ['#3A3A3C', '#3A3A3C']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.generateButton}
                                >
                                    {isGenerating ? (
                                        <View style={styles.generatingRow}>
                                            <ActivityIndicator color="#FFF" size="small" />
                                            <Animated.Text style={[styles.generatingText, { opacity: fadeAnim }]}>
                                                {LOADING_MESSAGES[messageIndex]}
                                            </Animated.Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.generateText}>
                                            Generate · {creditCost} {creditCost === 1 ? 'Credit' : 'Credits'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Generating Preview */}
                            {isGenerating && (
                                <View style={styles.showcaseSection}>
                                    <Text style={styles.showcaseLabel}>Examples of what's possible</Text>
                                    <View style={styles.showcaseCard}>
                                        <Image
                                            source={{ uri: SHOWCASE_RESULTS[showcaseIndex].url }}
                                            style={styles.showcaseImage}
                                        />
                                        <View style={styles.showcaseDots}>
                                            {SHOWCASE_RESULTS.map((_, idx) => (
                                                <View
                                                    key={idx}
                                                    style={[styles.dot, idx === showcaseIndex && styles.dotActive]}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Result */}
                            {resultUrl && state === 'succeeded' && (
                                <View style={styles.resultSection}>
                                    <Text style={styles.resultTitle}>Your Result</Text>
                                    <View style={styles.resultCard}>
                                        <Image source={{ uri: resultUrl }} style={styles.resultImage} />
                                    </View>
                                    <View style={styles.resultActions}>
                                        <TouchableOpacity style={styles.actionBtn} onPress={handleSaveResult}>
                                            <IconSymbol name="Download" size={18} color={colors.text.primary} />
                                            <Text style={styles.actionBtnText}>Save</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleShareResult}>
                                            <IconSymbol name="Share" size={18} color="#000" />
                                            <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>Share</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.regenerateBtn}
                                        onPress={handleGenerate}
                                        disabled={!canGenerate}
                                    >
                                        <IconSymbol name="Sparkles" size={18} color={colors.text.primary} />
                                        <Text style={styles.regenerateBtnText}>
                                            Regenerate · {creditCost} {creditCost === 1 ? 'Credit' : 'Credits'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}

                    {/* Bottom spacing */}
                    <View style={{ height: 120 }} />
                </ScrollView>
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
    scrollContent: {
        paddingHorizontal: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: spacing.md,
        marginBottom: spacing.xl,
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
    creditBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.fill.tertiary,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        gap: 6,
    },
    creditValue: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        gap: spacing.md,
    },
    loadingText: {
        fontSize: typography.subhead,
        color: colors.text.secondary,
    },
    inputSection: {
        marginBottom: spacing.lg,
    },
    inputHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    inputTitle: {
        fontSize: typography.headline,
        fontWeight: typography.semibold,
        color: colors.text.primary,
    },
    inputAction: {
        fontSize: typography.subhead,
        color: colors.brand.primary,
    },
    sectionLabel: {
        fontSize: typography.caption1,
        color: colors.text.tertiary,
        marginBottom: spacing.xs,
    },
    selectedCard: {
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        aspectRatio: 3 / 4,
        maxHeight: 280,
        position: 'relative',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    clearButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: typography.bold,
    },
    exampleList: {
        gap: spacing.sm,
    },
    exampleThumb: {
        width: 80,
        height: 100,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
        backgroundColor: colors.background.tertiary,
    },
    exampleImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    savedBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: colors.brand.primary,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    savedBadgeText: {
        fontSize: 9,
        fontWeight: typography.semibold,
        color: '#FFF',
    },
    wardrobeBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: colors.brand.accent,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    wardrobeBadgeText: {
        fontSize: 9,
        fontWeight: typography.semibold,
        color: '#FFF',
    },
    optionSection: {
        marginBottom: spacing.md,
    },
    optionLabel: {
        fontSize: typography.footnote,
        fontWeight: typography.medium,
        color: colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.xs,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: colors.fill.tertiary,
        borderRadius: borderRadius.xs,
        padding: 2,
    },
    segment: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: borderRadius.xs - 2,
    },
    segmentActive: {
        backgroundColor: colors.background.elevated,
    },
    segmentText: {
        fontSize: typography.subhead,
        fontWeight: typography.medium,
        color: colors.text.secondary,
    },
    segmentTextActive: {
        color: colors.text.primary,
    },
    chipRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: colors.fill.secondary,
        borderRadius: 20,
    },
    chipActive: {
        backgroundColor: colors.brand.primary,
    },
    chipText: {
        fontSize: typography.subhead,
        fontWeight: typography.medium,
        color: colors.text.secondary,
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
    generateWrapper: {
        marginTop: spacing.lg,
    },
    generateButton: {
        paddingVertical: 16,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    generateText: {
        fontSize: typography.body,
        fontWeight: typography.semibold,
        color: '#FFFFFF',
    },
    generatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    generatingText: {
        fontSize: typography.subhead,
        color: 'rgba(255,255,255,0.85)',
    },
    showcaseSection: {
        marginTop: spacing.xl,
    },
    showcaseLabel: {
        fontSize: typography.footnote,
        color: colors.text.tertiary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    showcaseCard: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        backgroundColor: colors.background.tertiary,
    },
    showcaseImage: {
        width: '100%',
        aspectRatio: 3 / 4,
        resizeMode: 'cover',
    },
    showcaseDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: spacing.sm,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.fill.primary,
    },
    dotActive: {
        backgroundColor: colors.text.primary,
    },
    resultSection: {
        marginTop: spacing.xl,
    },
    resultTitle: {
        fontSize: typography.headline,
        fontWeight: typography.semibold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    resultCard: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    resultImage: {
        width: '100%',
        aspectRatio: 3 / 4,
        resizeMode: 'cover',
    },
    resultActions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 14,
        backgroundColor: colors.fill.secondary,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    actionBtnPrimary: {
        backgroundColor: colors.brand.primary,
    },
    actionBtnText: {
        fontSize: typography.subhead,
        fontWeight: typography.medium,
        color: colors.text.primary,
    },
    actionBtnTextPrimary: {
        color: '#FFFFFF',
    },
    regenerateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: spacing.sm,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: colors.separator.primary,
        borderRadius: borderRadius.sm,
    },
    regenerateBtnText: {
        fontSize: typography.subhead,
        fontWeight: typography.medium,
        color: colors.text.primary,
    },
    // Side-by-side selected pair styles
    selectedPairContainer: {
        marginBottom: spacing.lg,
    },
    selectedPairTitle: {
        fontSize: typography.footnote,
        fontWeight: typography.medium,
        color: colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.md,
    },
    selectedPairRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    selectedPairCard: {
        width: (width - spacing.lg * 2 - spacing.xl * 2) / 2,
        aspectRatio: 3 / 4,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    selectedPairImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    pairClearButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pairLabel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 6,
    },
    pairLabelText: {
        fontSize: typography.footnote,
        fontWeight: typography.medium,
        color: '#fff',
        textAlign: 'center',
    },
    plusIcon: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
