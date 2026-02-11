/**
 * StudioScreen - Apple HIG Compliant
 *
 * Design Decisions:
 * - Large Title typography (34px, +0.40px letter-spacing) for header
 * - SF Pro system font stack throughout
 * - Apple system colors with automatic dark mode
 * - 8pt grid spacing system (4/8/12/16/24/32px)
 * - 44pt minimum touch targets for all interactive elements
 * - Capsule-style primary button (9999px border-radius)
 * - HIG-compliant segmented control for Quality selector
 * - Proper card shadows and border radius
 * - Minimal, content-focused design (Deference principle)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { supabase } from '../../services/supabaseClient';
import { useGenerationStore, useCreditStore, useAuthStore, useWardrobeStore } from '../../stores';
import { PERSON_EXAMPLES, GARMENT_EXAMPLES, SHOWCASE_RESULTS } from '../../lib/exampleImages';
import { IconSymbol } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
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
    const { isDark } = useTheme();

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
    const [falCategory, setFalCategory] = useState<FalCategory>('upper');
    const [messageIndex, setMessageIndex] = useState(0);
    const [showcaseIndex, setShowcaseIndex] = useState(0);
    const fadeAnim = useState(new Animated.Value(1))[0];

    // User's saved person photos from DB
    const [savedPersonPhotos, setSavedPersonPhotos] = useState<PersonImage[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Apple System Colors
    const colors = {
        // Backgrounds
        bgPrimary: isDark ? '#000000' : '#FFFFFF',
        bgSecondary: isDark ? '#242426' : '#F2F2F7',
        bgTertiary: isDark ? '#363638' : '#FFFFFF',

        // Labels (Text)
        labelPrimary: isDark ? '#FFFFFF' : '#000000',
        labelSecondary: isDark ? 'rgba(235, 235, 245, 0.7)' : 'rgba(60, 60, 67, 0.6)',
        labelTertiary: isDark ? 'rgba(235, 235, 245, 0.55)' : 'rgba(60, 60, 67, 0.3)',

        // System Colors
        systemBlue: isDark ? '#5CB8FF' : '#0088FF',
        systemGray: isDark ? '#AEAEB2' : '#8E8E93',
        systemGray5: isDark ? '#242426' : '#E5E5EA',

        // Fills
        fillTertiary: isDark ? 'rgba(118, 118, 128, 0.32)' : 'rgba(118, 118, 128, 0.12)',
        fillQuaternary: isDark ? 'rgba(118, 118, 128, 0.26)' : 'rgba(116, 116, 128, 0.08)',

        // Separator
        separator: isDark ? 'rgba(255, 255, 255, 0.17)' : 'rgba(0, 0, 0, 0.12)',
    };

    const styles = createStyles(colors);

    const fetchSavedPersonPhotos = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('person_images')
                .select('id, storage_path')
                .eq('user_id', user!.id)
                .order('last_used_at', { ascending: false })
                .limit(10);

            if (error) return;

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
        } catch {
            // Failed to load person photos
        }
    }, [user]);

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
    }, [fetchBalance, fetchWardrobe, fetchSavedPersonPhotos]);

    // Get wardrobe items with signed URLs
    const [wardrobeWithUrls, setWardrobeWithUrls] = useState<Array<{ id: string; url: string; category: string }>>([]);

    useEffect(() => {
        const loadWardrobeUrls = async () => {
            const allItems = [...wardrobeItems, ...exampleItems];
            const itemsWithUrls = await Promise.all(
                allItems.slice(0, 10).map(async (item) => {
                    if (item.image_url && !item.image_url.startsWith('http')) {
                        const { data } = await supabase.storage
                            .from('wardrobe')
                            .createSignedUrl(item.image_url, 3600);
                        return { id: item.id, url: data?.signedUrl || '', category: item.category };
                    }
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

    const getModelCost = (model: ModelType) => model === 'gemini2' ? 1 : 2;
    const getQualityCost = (q: Quality) => q === 'studio' ? 2 : 1;
    const getCreditCost = () => getQualityCost(quality) + getModelCost(modelType);

    const handleGenerate = async () => {
        const creditCost = getCreditCost();
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

            await MediaLibrary.saveToLibraryAsync(localUri);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Saved!', 'Image saved to your photo library.');
        } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to save image.');
        }
    };

    const handleShareResult = async () => {
        if (!resultUrl) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            let localUri = resultUrl;

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
        } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to share image.');
        }
    };

    const creditCost = getCreditCost();
    const canGenerate = personImage && dressImage && state !== 'generating' && balance >= creditCost;
    const isGenerating = state === 'generating';

    // Combine saved + example images for display
    const personOptions = [
        { id: 'add-photo', url: '', label: 'Add' }, // Placeholder
        ...savedPersonPhotos.map(p => ({ id: p.id, url: p.url!, label: 'Saved' })),
        ...PERSON_EXAMPLES.map(e => ({ id: e.id, url: e.url, label: 'Example' })),
    ];

    const garmentOptions = [
        { id: 'add-garment', url: '', label: 'Add' }, // Placeholder
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
                    {/* Header - Large Title + Credit Badge */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.largeTitle}>Studio</Text>
                            <Text style={styles.subtitle}>AI Virtual Try-On</Text>
                        </View>
                        <BlurView intensity={isDark ? 60 : 80} tint={isDark ? 'dark' : 'light'} style={styles.creditBadge}>
                            <Text style={styles.creditText}>{balance}</Text>
                            <IconSymbol name="Sparkles" size={14} color={colors.systemBlue} />
                        </BlurView>
                    </View>

                    {loadingData ? (
                        <View style={styles.skeletonSection}>
                            <View style={styles.skeletonLabel} />
                            <View style={styles.skeletonRow}>
                                {[1, 2, 3, 4].map(i => (
                                    <View key={i} style={styles.skeletonThumb} />
                                ))}
                            </View>
                            <View style={[styles.skeletonLabel, { marginTop: 24 }]} />
                            <View style={styles.skeletonRow}>
                                {[1, 2, 3, 4].map(i => (
                                    <View key={i} style={styles.skeletonThumb} />
                                ))}
                            </View>
                        </View>
                    ) : (
                        <>
                            {/* Image Selection Section */}
                            {personImage && dressImage ? (
                                // Side-by-side preview when both selected
                                <View style={styles.previewSection}>
                                    <Text style={styles.sectionLabel}>READY TO GENERATE</Text>
                                    <View style={styles.previewRow}>
                                        <View style={styles.previewCard}>
                                            <Image source={personImage} style={styles.previewImage} contentFit="cover" transition={200} cachePolicy="memory-disk" />
                                            <TouchableOpacity
                                                style={styles.removeButton}
                                                onPress={() => setPersonImage(null)}
                                                accessibilityLabel="Remove person photo"
                                            >
                                                <IconSymbol name="X" size={12} color="#FFF" strokeWidth={3} />
                                            </TouchableOpacity>
                                            <View style={styles.previewLabel}>
                                                <Text style={styles.previewLabelText}>You</Text>
                                            </View>
                                        </View>

                                        <View style={styles.plusContainer}>
                                            <IconSymbol name="Plus" size={18} color={colors.labelTertiary} />
                                        </View>

                                        <View style={styles.previewCard}>
                                            <Image source={dressImage} style={styles.previewImage} contentFit="cover" transition={200} cachePolicy="memory-disk" />
                                            <TouchableOpacity
                                                style={styles.removeButton}
                                                onPress={() => setDressImage(null)}
                                                accessibilityLabel="Remove garment photo"
                                            >
                                                <IconSymbol name="X" size={12} color="#FFF" strokeWidth={3} />
                                            </TouchableOpacity>
                                            <View style={styles.previewLabel}>
                                                <Text style={styles.previewLabelText}>Garment</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    {/* Person Selection */}
                                    <View style={styles.inputSection}>
                                        <Text style={styles.inputTitle}>You</Text>

                                        {personImage ? (
                                            <View style={styles.selectedCard}>
                                                <Image source={personImage} style={styles.selectedImage} contentFit="cover" transition={200} cachePolicy="memory-disk" />
                                                <TouchableOpacity
                                                    style={styles.removeButton}
                                                    onPress={() => setPersonImage(null)}
                                                >
                                                    <IconSymbol name="X" size={14} color="#FFF" strokeWidth={2.5} />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <FlatList
                                                data={personOptions}
                                                keyExtractor={(item) => item.id}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={item.label === 'Add' ? styles.thumbCardAdd : styles.thumbCard}
                                                        onPress={() => item.label === 'Add' ? showImageOptions('person') : setPersonImage(item.url)}
                                                        activeOpacity={0.7}
                                                    >
                                                        {item.label === 'Add' ? (
                                                            <IconSymbol name="Plus" size={28} color={colors.systemBlue} strokeWidth={2.5} />
                                                        ) : (
                                                            <>
                                                                <Image source={item.url} style={styles.thumbImage} contentFit="cover" transition={150} cachePolicy="memory-disk" />
                                                                {item.label === 'Saved' && (
                                                                    <View style={styles.badge}>
                                                                        <Text style={styles.badgeText}>Saved</Text>
                                                                    </View>
                                                                )}
                                                            </>
                                                        )}
                                                    </TouchableOpacity>
                                                )}
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={styles.thumbList}
                                            />
                                        )}
                                    </View>

                                    {/* Garment Selection */}
                                    <View style={styles.inputSection}>
                                        <Text style={styles.inputTitle}>Garment</Text>

                                        {dressImage ? (
                                            <View style={styles.selectedCard}>
                                                <Image source={dressImage} style={styles.selectedImage} contentFit="cover" transition={200} cachePolicy="memory-disk" />
                                                <TouchableOpacity
                                                    style={styles.removeButton}
                                                    onPress={() => setDressImage(null)}
                                                >
                                                    <IconSymbol name="X" size={14} color="#FFF" strokeWidth={2.5} />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <FlatList
                                                data={garmentOptions}
                                                keyExtractor={(item) => item.id}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={item.label === 'Add' ? styles.thumbCardAdd : styles.thumbCard}
                                                        onPress={() => item.label === 'Add' ? showImageOptions('garment') : setDressImage(item.url)}
                                                        activeOpacity={0.7}
                                                    >
                                                        {item.label === 'Add' ? (
                                                            <IconSymbol name="Plus" size={28} color={colors.systemBlue} strokeWidth={2.5} />
                                                        ) : (
                                                            <>
                                                                <Image source={item.url} style={styles.thumbImage} contentFit="cover" transition={150} cachePolicy="memory-disk" />
                                                                {item.label === 'Wardrobe' && (
                                                                    <View style={[styles.badge, styles.badgeWardrobe]}>
                                                                        <Text style={styles.badgeText}>Wardrobe</Text>
                                                                    </View>
                                                                )}
                                                            </>
                                                        )}
                                                    </TouchableOpacity>
                                                )}
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={styles.thumbList}
                                            />
                                        )}
                                    </View>
                                </>
                            )}

                            {/* Quality Selector - HIG Segmented Control */}
                            <View style={styles.controlSection}>
                                <Text style={styles.sectionLabel}>QUALITY</Text>
                                <View style={styles.segmentedControl}>
                                    <TouchableOpacity
                                        style={[styles.segment, quality === 'standard' && styles.segmentActive]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setQuality('standard');
                                        }}
                                        disabled={isGenerating}
                                        accessibilityLabel="Standard quality - 1 credit"
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
                                        accessibilityLabel="Studio quality - 2 credits"
                                    >
                                        <Text style={[styles.segmentText, quality === 'studio' && styles.segmentTextActive]}>
                                            Studio · 2
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Model Selector - Chips */}
                            <View style={styles.controlSection}>
                                <Text style={styles.sectionLabel}>MODEL</Text>
                                <View style={styles.chipRow}>
                                    {[
                                        { key: 'gemini2' as ModelType, label: 'Flash 2.0', cost: 1 },
                                        { key: 'geminipro' as ModelType, label: 'Flash Pro', cost: 2 },
                                        { key: 'fal' as ModelType, label: 'Studio AI', cost: 2 },
                                    ].map((model) => (
                                        <TouchableOpacity
                                            key={model.key}
                                            style={[styles.chip, modelType === model.key && styles.chipActive]}
                                            onPress={() => {
                                                Haptics.selectionAsync();
                                                setModelType(model.key);
                                            }}
                                            disabled={isGenerating}
                                            accessibilityLabel={`Select ${model.label} model`}
                                        >
                                            <Text style={[styles.chipText, modelType === model.key && styles.chipTextActive]}>
                                                {model.label} · {model.cost}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Fal Category (if Fal AI selected) */}
                            {modelType === 'fal' && (
                                <View style={styles.controlSection}>
                                    <Text style={styles.sectionLabel}>GARMENT TYPE</Text>
                                    <View style={styles.chipRow}>
                                        {[
                                            { key: 'upper' as FalCategory, label: 'Top' },
                                            { key: 'lower' as FalCategory, label: 'Bottom' },
                                            { key: 'overall' as FalCategory, label: 'Dress' },
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

                            {/* Generate Button - Capsule Style */}
                            <TouchableOpacity
                                onPress={handleGenerate}
                                disabled={!canGenerate}
                                activeOpacity={0.8}
                                style={[
                                    styles.generateButton,
                                    { backgroundColor: canGenerate ? colors.systemBlue : colors.fillTertiary }
                                ]}
                                accessibilityLabel={`Generate image for ${creditCost} ${creditCost === 1 ? 'credit' : 'credits'}`}
                            >
                                {isGenerating ? (
                                    <View style={styles.generatingRow}>
                                        <ActivityIndicator color="#FFF" size="small" />
                                        <Animated.Text style={[styles.generateText, { opacity: fadeAnim }]}>
                                            {LOADING_MESSAGES[messageIndex]}
                                        </Animated.Text>
                                    </View>
                                ) : (
                                    <Text style={styles.generateText}>
                                        Generate · {creditCost} {creditCost === 1 ? 'Credit' : 'Credits'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Generating Preview */}
                            {isGenerating && (
                                <View style={styles.showcaseSection}>
                                    <Text style={styles.showcaseLabel}>Examples of what's possible</Text>
                                    <View style={styles.showcaseCard}>
                                        <Image
                                            source={SHOWCASE_RESULTS[showcaseIndex].url}
                                            style={styles.showcaseImage}
                                            contentFit="cover"
                                            transition={300}
                                            cachePolicy="memory-disk"
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

                            {/* Result Display */}
                            {resultUrl && state === 'succeeded' && (
                                <View style={styles.resultSection}>
                                    <Text style={styles.resultTitle}>Your Result</Text>
                                    <View style={styles.resultCard}>
                                        <Image source={resultUrl} style={styles.resultImage} contentFit="cover" transition={300} cachePolicy="memory-disk" />
                                    </View>
                                    <View style={styles.resultActions}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={handleSaveResult}
                                            accessibilityLabel="Save image to gallery"
                                        >
                                            <IconSymbol name="Download" size={18} color={colors.labelPrimary} />
                                            <Text style={styles.actionButtonText}>Save</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.actionButtonPrimary]}
                                            onPress={handleShareResult}
                                            accessibilityLabel="Share image"
                                        >
                                            <IconSymbol name="Share" size={18} color="#FFFFFF" />
                                            <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>Share</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.regenerateButton}
                                        onPress={handleGenerate}
                                        disabled={!canGenerate}
                                        accessibilityLabel="Generate again"
                                    >
                                        <IconSymbol name="Sparkles" size={18} color={colors.systemBlue} />
                                        <Text style={styles.regenerateText}>
                                            Generate Again · {creditCost} {creditCost === 1 ? 'Credit' : 'Credits'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}

                    {/* Bottom spacing for tab bar */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// Apple HIG Styles
const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16, // --space-4
    },

    // Header - Large Title (34px)
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: 16, // --space-4
        marginBottom: 24, // --space-6
    },
    largeTitle: {
        fontFamily: '-apple-system',
        fontSize: 34, // --text-large-title
        lineHeight: 41,
        letterSpacing: 0.4,
        fontWeight: '700',
        color: colors.labelPrimary,
    },
    subtitle: {
        fontFamily: '-apple-system',
        fontSize: 13, // --text-footnote
        lineHeight: 18,
        letterSpacing: -0.08,
        fontWeight: '400',
        color: colors.labelSecondary,
        marginTop: 2,
    },
    creditBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 9999, // Capsule
        borderWidth: 0.5,
        borderColor: colors.separator,
        gap: 6,
        overflow: 'hidden',
    },
    creditText: {
        fontFamily: '-apple-system',
        fontSize: 17, // --text-headline
        lineHeight: 22,
        letterSpacing: -0.43,
        fontWeight: '600',
        color: colors.labelPrimary,
    },

    // Loading
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 48, // --space-12
        gap: 12,
    },
    loadingText: {
        fontFamily: '-apple-system',
        fontSize: 15, // --text-subhead
        lineHeight: 20,
        letterSpacing: -0.23,
        color: colors.labelSecondary,
    },

    // Preview Section (when both images selected)
    previewSection: {
        marginBottom: 24,
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    previewCard: {
        width: (width - 32 - 48) / 2, // Account for padding and gap
        aspectRatio: 3 / 4,
        borderRadius: 16, // --radius-lg
        overflow: 'hidden',
        backgroundColor: colors.bgTertiary,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        // resizeMode handled by contentFit prop
    },
    removeButton: {
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
    previewLabel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 6,
    },
    previewLabelText: {
        fontFamily: '-apple-system',
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    plusContainer: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Input Section
    inputSection: {
        marginBottom: 24,
    },
    inputTitle: {
        fontFamily: '-apple-system',
        fontSize: 17, // --text-headline
        lineHeight: 22,
        letterSpacing: -0.43,
        fontWeight: '600',
        color: colors.labelPrimary,
        marginBottom: 12,
    },
    selectedCard: {
        borderRadius: 12, // --radius-md
        overflow: 'hidden',
        aspectRatio: 3 / 4,
        maxHeight: 280,
        backgroundColor: colors.bgTertiary,
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        // resizeMode handled by contentFit prop
    },
    thumbList: {
        gap: 8, // --space-2
    },
    thumbCard: {
        width: 80,
        height: 100,
        borderRadius: 8, // --radius-sm
        overflow: 'hidden',
        backgroundColor: colors.bgTertiary,
    },
    thumbCardAdd: {
        width: 80,
        height: 100,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.systemBlue,
        backgroundColor: colors.bgTertiary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
        // resizeMode handled by contentFit prop
    },
    badge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: colors.systemBlue,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    badgeWardrobe: {
        backgroundColor: colors.systemGray,
    },
    badgeText: {
        fontFamily: '-apple-system',
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Control Section
    controlSection: {
        marginBottom: 16,
    },
    sectionLabel: {
        fontFamily: '-apple-system',
        fontSize: 13, // --text-footnote
        lineHeight: 18,
        letterSpacing: 0.5,
        fontWeight: '400',
        color: colors.labelSecondary,
        textTransform: 'uppercase',
        marginBottom: 8,
    },

    // Segmented Control (HIG Style)
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: colors.fillTertiary,
        borderRadius: 8, // --radius-sm
        padding: 2,
    },
    segment: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        minHeight: 44, // iOS touch target
    },
    segmentActive: {
        backgroundColor: colors.bgPrimary,
    },
    segmentText: {
        fontFamily: '-apple-system',
        fontSize: 15, // --text-subhead
        lineHeight: 20,
        letterSpacing: -0.23,
        fontWeight: '400',
        color: colors.labelSecondary,
    },
    segmentTextActive: {
        color: colors.labelPrimary,
        fontWeight: '600',
    },

    // Chips
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: colors.fillQuaternary,
        borderRadius: 9999, // Capsule
        minHeight: 44,
        justifyContent: 'center',
    },
    chipActive: {
        backgroundColor: colors.systemBlue,
    },
    chipText: {
        fontFamily: '-apple-system',
        fontSize: 15,
        fontWeight: '400',
        color: colors.labelPrimary,
    },
    chipTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Generate Button - Capsule Style
    generateButton: {
        marginTop: 8,
        paddingVertical: 16,
        borderRadius: 9999, // Capsule
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56, // Prominent button
    },
    generateText: {
        fontFamily: '-apple-system',
        fontSize: 17, // --text-body
        lineHeight: 22,
        letterSpacing: -0.43,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    generatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    // Showcase (while generating)
    showcaseSection: {
        marginTop: 24,
    },
    showcaseLabel: {
        fontFamily: '-apple-system',
        fontSize: 13,
        color: colors.labelTertiary,
        textAlign: 'center',
        marginBottom: 12,
    },
    showcaseCard: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.bgTertiary,
    },
    showcaseImage: {
        width: '100%',
        aspectRatio: 3 / 4,
        // resizeMode handled by contentFit prop
    },
    showcaseDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.fillTertiary,
    },
    dotActive: {
        backgroundColor: colors.labelPrimary,
    },

    // Result Section
    resultSection: {
        marginTop: 24,
    },
    resultTitle: {
        fontFamily: '-apple-system',
        fontSize: 17,
        fontWeight: '600',
        color: colors.labelPrimary,
        marginBottom: 12,
    },
    resultCard: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.bgTertiary,
    },
    resultImage: {
        width: '100%',
        aspectRatio: 3 / 4,
        // resizeMode handled by contentFit prop
    },
    resultActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 12,
        backgroundColor: colors.fillQuaternary,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 44,
    },
    actionButtonPrimary: {
        backgroundColor: colors.systemBlue,
    },
    actionButtonText: {
        fontFamily: '-apple-system',
        fontSize: 15,
        fontWeight: '600',
        color: colors.labelPrimary,
    },
    actionButtonTextPrimary: {
        color: '#FFFFFF',
    },
    regenerateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: colors.separator,
        borderRadius: 12,
        minHeight: 44,
    },
    regenerateText: {
        fontFamily: '-apple-system',
        fontSize: 15,
        fontWeight: '400',
        color: colors.systemBlue,
    },

    // Skeleton loaders
    skeletonSection: {
        gap: 12,
    },
    skeletonLabel: {
        width: 60,
        height: 14,
        borderRadius: 4,
        backgroundColor: colors.fillTertiary,
    },
    skeletonRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    skeletonThumb: {
        width: 80,
        height: 100,
        borderRadius: 8,
        backgroundColor: colors.fillTertiary,
    },
});
