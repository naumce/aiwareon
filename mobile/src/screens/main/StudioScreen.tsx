import React, { useEffect, useState, useCallback, useRef } from 'react';
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
    Easing,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../services/supabaseClient';
import { useGenerationStore, useCreditStore, useAuthStore, useWardrobeStore } from '../../stores';
import { PERSON_EXAMPLES, GARMENT_EXAMPLES, SHOWCASE_RESULTS } from '../../lib/exampleImages';
import { IconSymbol, PremiumHeader, type IconName } from '../../components/ui';
import type { Quality, ModelType, FalCategory, RootStackParamList } from '../../types';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Animated "+" add-photo card with gradient border and pulse */
function AddPhotoCard({ onPress, colors }: { onPress: () => void; colors: ReturnType<typeof useTheme>['colors'] }) {
    const pulse = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
        ).start();
    }, [pulse]);

    const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });
    const iconScale = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.12, 1] });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.9, tension: 300, friction: 15, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 12, useNativeDriver: true }).start()}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <LinearGradient
                    colors={colors.gradient.primary as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        width: 82,
                        height: 102,
                        borderRadius: borderRadius.sm + 1,
                        padding: 1.5,
                    }}
                >
                    <Animated.View style={{
                        ...StyleSheet.absoluteFillObject,
                        borderRadius: borderRadius.sm + 1,
                        opacity: glowOpacity,
                        shadowColor: colors.brand.primary,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6,
                        shadowRadius: 12,
                        elevation: 6,
                    }} />
                    <View style={{
                        flex: 1,
                        borderRadius: borderRadius.sm,
                        backgroundColor: colors.background.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                            <LinearGradient
                                colors={colors.gradient.primary as [string, string]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <IconSymbol name="Plus" size={20} color="#fff" strokeWidth={2.5} />
                            </LinearGradient>
                        </Animated.View>
                    </View>
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
}

/** Premium quality toggle with animated sliding gradient indicator */
function QualitySelector({
    quality,
    setQuality,
    disabled,
    colors,
    isDark,
}: {
    quality: Quality;
    setQuality: (q: Quality) => void;
    disabled: boolean;
    colors: ReturnType<typeof useTheme>['colors'];
    isDark: boolean;
}) {
    const slideX = useRef(new Animated.Value(quality === 'standard' ? 0 : 1)).current;
    const pressScale = useRef(new Animated.Value(1)).current;
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        Animated.spring(slideX, {
            toValue: quality === 'standard' ? 0 : 1,
            tension: 280,
            friction: 22,
            useNativeDriver: true,
        }).start();
    }, [quality, slideX]);

    const handleSelect = (q: Quality) => {
        if (disabled || q === quality) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
            Animated.timing(pressScale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
            Animated.spring(pressScale, { toValue: 1, tension: 300, friction: 15, useNativeDriver: true }),
        ]).start();
        setQuality(q);
    };

    const pillWidth = containerWidth > 0 ? (containerWidth - 8) / 2 : 0;

    return (
        <View style={{ marginBottom: spacing.md }}>
            <Animated.View style={{ transform: [{ scale: pressScale }] }}>
                <View
                    onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
                    style={{
                        flexDirection: 'row',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        borderRadius: 16,
                        padding: 4,
                    }}
                >
                    {/* Sliding gradient pill */}
                    {pillWidth > 0 && (
                        <Animated.View
                            pointerEvents="none"
                            style={{
                                position: 'absolute',
                                top: 4,
                                bottom: 4,
                                left: 4,
                                width: pillWidth,
                                zIndex: 0,
                                transform: [{
                                    translateX: slideX.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, pillWidth],
                                    }),
                                }],
                            }}
                        >
                            <LinearGradient
                                colors={quality === 'studio'
                                    ? [colors.brand.secondary + '20', colors.brand.primary + '12']
                                    : [colors.brand.primary + '18', colors.brand.secondary + '0C']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    flex: 1,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: quality === 'studio'
                                        ? colors.brand.secondary + '35'
                                        : colors.brand.primary + '30',
                                }}
                            />
                        </Animated.View>
                    )}

                    {/* Standard */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleSelect('standard')}
                        disabled={disabled}
                        style={{ flex: 1, zIndex: 2 }}
                    >
                        <Animated.View style={{
                            paddingVertical: 14,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 8,
                            opacity: slideX.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }),
                        }}>
                            <IconSymbol
                                name="Zap"
                                size={15}
                                color={quality === 'standard' ? colors.brand.primary : colors.text.tertiary}
                                strokeWidth={quality === 'standard' ? 2.5 : 1.5}
                            />
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: quality === 'standard' ? colors.text.primary : colors.text.tertiary,
                            }}>
                                Standard
                            </Text>
                            <View style={{
                                backgroundColor: quality === 'standard'
                                    ? (isDark ? 'rgba(201,160,255,0.18)' : 'rgba(201,160,255,0.14)')
                                    : 'transparent',
                                paddingHorizontal: 7,
                                paddingVertical: 2,
                                borderRadius: 8,
                            }}>
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: '700',
                                    color: quality === 'standard' ? colors.brand.primary : colors.text.tertiary,
                                }}>
                                    1 cr
                                </Text>
                            </View>
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Studio */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleSelect('studio')}
                        disabled={disabled}
                        style={{ flex: 1, zIndex: 2 }}
                    >
                        <Animated.View style={{
                            paddingVertical: 14,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 8,
                            opacity: slideX.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
                        }}>
                            <IconSymbol
                                name="Sparkles"
                                size={15}
                                color={quality === 'studio' ? colors.brand.secondary : colors.text.tertiary}
                                strokeWidth={quality === 'studio' ? 2.5 : 1.5}
                            />
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: quality === 'studio' ? colors.text.primary : colors.text.tertiary,
                            }}>
                                Studio
                            </Text>
                            <View style={{
                                backgroundColor: quality === 'studio'
                                    ? (isDark ? 'rgba(255,143,171,0.18)' : 'rgba(255,143,171,0.14)')
                                    : 'transparent',
                                paddingHorizontal: 7,
                                paddingVertical: 2,
                                borderRadius: 8,
                            }}>
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: '700',
                                    color: quality === 'studio' ? colors.brand.secondary : colors.text.tertiary,
                                }}>
                                    2 cr
                                </Text>
                            </View>
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

/** Frosted glass action button for overlaying on images */
function GlassButton({
    icon,
    label,
    onPress,
    colors,
    isPrimary = false,
}: {
    icon: IconName;
    label: string;
    onPress: () => void;
    colors: ReturnType<typeof useTheme>['colors'];
    isPrimary?: boolean;
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const content = isPrimary ? (
        <LinearGradient
            colors={colors.gradient.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 14,
                borderRadius: 14,
            }}
        >
            <IconSymbol name={icon} size={17} color="#FFFFFF" strokeWidth={2} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>{label}</Text>
        </LinearGradient>
    ) : (
        <BlurView
            intensity={60}
            tint="dark"
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 14,
                borderRadius: 14,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)',
            }}
        >
            <IconSymbol name={icon} size={17} color="#FFFFFF" strokeWidth={1.8} />
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#FFFFFF' }}>{label}</Text>
        </BlurView>
    );

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.92, tension: 300, friction: 15, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 12, useNativeDriver: true }).start()}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
            style={{ flex: 1 }}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                {content}
            </Animated.View>
        </TouchableOpacity>
    );
}

/** Immersive full-screen result hero with overlaid action buttons */
function ResultHeroSection({
    resultUrl,
    onSave,
    onShare,
    onRetake,
    onFavorite,
    colors,
    isDark,
}: {
    resultUrl: string;
    onSave: () => void;
    onShare: () => void;
    onRetake: () => void;
    onFavorite: () => void;
    colors: ReturnType<typeof useTheme>['colors'];
    isDark: boolean;
}) {
    const [isFavorited, setIsFavorited] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const btnSlide = useRef(new Animated.Value(30)).current;
    const btnOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();

        setTimeout(() => {
            Animated.parallel([
                Animated.spring(btnSlide, { toValue: 0, tension: 100, friction: 14, useNativeDriver: true }),
                Animated.timing(btnOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
        }, 250);
    }, [scaleAnim, opacityAnim, btnSlide, btnOpacity]);

    const handleFavoritePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsFavorited(prev => !prev);
        onFavorite();
    };

    const imageHeight = SCREEN_HEIGHT * 0.72;

    return (
        <Animated.View style={{
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
            marginBottom: spacing.lg,
        }}>
            <View style={{
                borderRadius: 24,
                overflow: 'hidden',
                height: imageHeight,
            }}>
                <Image
                    source={{ uri: resultUrl }}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                />

                {/* Bottom gradient for button legibility */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 180,
                    }}
                />

                {/* Heart — top right */}
                <TouchableOpacity
                    onPress={handleFavoritePress}
                    activeOpacity={0.7}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <IconSymbol
                        name="Heart"
                        size={22}
                        color={isFavorited ? '#FF8FAB' : '#FFFFFF'}
                        strokeWidth={isFavorited ? 2.5 : 1.5}
                    />
                </TouchableOpacity>

                {/* Action buttons — bottom */}
                <Animated.View style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 16,
                    right: 16,
                    flexDirection: 'row',
                    gap: 10,
                    opacity: btnOpacity,
                    transform: [{ translateY: btnSlide }],
                }}>
                    <GlassButton icon="RotateCcw" label="Retake" onPress={onRetake} colors={colors} />
                    <GlassButton icon="Download" label="Save" onPress={onSave} colors={colors} />
                    <GlassButton icon="Share" label="Share" onPress={onShare} colors={colors} isPrimary />
                </Animated.View>
            </View>
        </Animated.View>
    );
}

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
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
    // HARDCODED: Using geminipro for feature development. Model selection UI commented out below.
    const modelType: ModelType = 'geminipro';
    // const [modelType, setModelType] = useState<ModelType>('gemini2');
    // const [falCategory, setFalCategory] = useState<FalCategory>('tops');
    const [messageIndex, setMessageIndex] = useState(0);
    const [showcaseIndex, setShowcaseIndex] = useState(0);
    const fadeAnim = useState(new Animated.Value(1))[0];
    const scrollViewRef = useRef<ScrollView>(null);
    const showcaseLayoutY = useRef(0);

    // User's saved person photos from DB
    const [savedPersonPhotos, setSavedPersonPhotos] = useState<PersonImage[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const { colors, isDark } = useTheme();
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

    // Auto-scroll to showcase when generating
    useEffect(() => {
        if (state === 'generating' && scrollViewRef.current) {
            const timer = setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: showcaseLayoutY.current, animated: true });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [state]);

    // Auto-scroll to top when result arrives
    useEffect(() => {
        if (state === 'succeeded' && resultUrl) {
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }, 100);
        }
    }, [state, resultUrl]);

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
        // HARDCODED: geminipro model, no fal category needed
        await generate(quality, modelType);
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

    const handleRetake = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        useGenerationStore.setState({ state: 'idle', resultUrl: null, error: null });
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, []);

    const handleFavorite = useCallback(() => {
        // TODO: persist favorite to backend
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);

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
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Result Hero — shown at top when generation succeeds */}
                    {resultUrl && state === 'succeeded' && (
                        <ResultHeroSection
                            resultUrl={resultUrl}
                            onSave={handleSaveResult}
                            onShare={handleShareResult}
                            onRetake={handleRetake}
                            onFavorite={handleFavorite}
                            colors={colors}
                            isDark={isDark}
                        />
                    )}

                    {/* Header */}
                    <PremiumHeader
                        title="What will you wear?"
                        rightIcon="Sparkles"
                        rightLabel={String(balance)}
                        onRightPress={() => navigation.navigate('BuyCredits')}
                        style={{ paddingHorizontal: 0 }}
                    />

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
                                <View style={styles.selectedPairContainer}>
                                    <Text style={styles.selectedPairTitle}>Ready to Generate</Text>
                                    <View style={styles.selectedPairRow}>
                                        {/* Person Preview */}
                                        <View style={styles.selectedPairCard}>
                                            <Image source={{ uri: personImage }} style={styles.selectedPairImage} />
                                            <TouchableOpacity
                                                style={styles.pairClearButton}
                                                onPress={() => setPersonImage(null)}
                                                accessibilityLabel="Remove person photo"
                                            >
                                                <IconSymbol name="X" size={12} color="#FFF" strokeWidth={3} />
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
                                                accessibilityLabel="Remove garment photo"
                                            >
                                                <IconSymbol name="X" size={12} color="#FFF" strokeWidth={3} />
                                            </TouchableOpacity>
                                            <View style={styles.pairLabel}>
                                                <Text style={styles.pairLabelText}>Garment</Text>
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
                                                <Image source={{ uri: personImage }} style={styles.selectedImage} />
                                                <TouchableOpacity
                                                    style={styles.removeButton}
                                                    onPress={() => setPersonImage(null)}
                                                >
                                                    <IconSymbol name="X" size={14} color="#FFF" strokeWidth={2.5} />
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
                                                    ListHeaderComponent={
                                                        <AddPhotoCard onPress={() => showImageOptions('person')} colors={colors} />
                                                    }
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

                                    {/* Garment Selection */}
                                    <View style={styles.inputSection}>
                                        <Text style={styles.inputTitle}>Garment</Text>

                                        {dressImage ? (
                                            <View style={styles.selectedCard}>
                                                <Image source={{ uri: dressImage }} style={styles.selectedImage} />
                                                <TouchableOpacity
                                                    style={styles.removeButton}
                                                    onPress={() => setDressImage(null)}
                                                >
                                                    <IconSymbol name="X" size={14} color="#FFF" strokeWidth={2.5} />
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
                                                    ListHeaderComponent={
                                                        <AddPhotoCard onPress={() => showImageOptions('garment')} colors={colors} />
                                                    }
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
                            <QualitySelector
                                quality={quality}
                                setQuality={setQuality}
                                disabled={isGenerating}
                                colors={colors}
                                isDark={isDark}
                            />

                            {/* COMMENTED OUT: Model selection chips - hardcoded to geminipro for feature development */}
                            {/* <View style={styles.optionSection}>
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
                            </View> */}

                            {/* COMMENTED OUT: Fal category selector - hardcoded model doesn't use fal */}
                            {/* {modelType === 'fal' && (
                                <View style={styles.optionSection}>
                                    <Text style={styles.optionLabel}>Garment Type</Text>
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
                            )} */}

                            {/* Generate Button */}
                            <TouchableOpacity
                                onPress={handleGenerate}
                                disabled={!canGenerate}
                                activeOpacity={0.8}
                                style={styles.generateWrapper}
                            >
                                <LinearGradient
                                    colors={canGenerate ? colors.gradient.primary : ['#D4D4D8', '#D4D4D8']}
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
                                <View
                                    style={styles.showcaseSection}
                                    onLayout={(e) => { showcaseLayoutY.current = e.nativeEvent.layout.y; }}
                                >
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
                        </>
                    )}

                    {/* Bottom spacing for tab bar */}
                    <View style={{ height: 100 }} />
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
    inputTitle: {
        fontSize: typography.headline,
        fontWeight: typography.semibold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
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
        width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.xl * 2) / 2,
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
    // Skeleton loaders
    skeletonSection: {
        gap: 12,
    },
    skeletonLabel: {
        width: 60,
        height: 14,
        borderRadius: 4,
        backgroundColor: colors.fill.tertiary,
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
        backgroundColor: colors.fill.tertiary,
    },
});
