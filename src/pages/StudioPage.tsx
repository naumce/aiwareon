import { useCallback, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGenerationStore } from '../stores/generationStore';
import { useCreditStore } from '../stores/creditStore';
import { useAuthStore } from '../stores/authStore';
import { usePersonImages } from '../hooks/usePersonImages';
import { useCamera } from '../hooks/useCamera';
import { savePersonImage, markPersonImageUsed } from '../services/personImageService';
import { EXAMPLE_PERSON_IMAGES, EXAMPLE_GARMENT_IMAGES } from '../lib/exampleImages';
import { Link } from 'react-router-dom';
import { GalleryPicker } from '../components/GalleryPicker';

// Showcase images for the carousel - these rotate while waiting for generation
const SHOWCASE_IMAGES = [
    { url: '/assets/showcase/1/g1d1f.png', label: 'Floral Dress Look' },
    { url: '/assets/showcase/1/g1d2f.png', label: 'Summer Style' },
    { url: '/assets/showcase/2/g2d1f.png', label: 'Casual Outfit' },
    { url: '/assets/showcase/3/g3d1f.png', label: 'Beach Look' },
    { url: '/assets/showcase/3/g3d2f.png', label: 'Evening Style' },
];

// Showcase carousel component that rotates through example images
function ShowcaseCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % SHOWCASE_IMAGES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <img
                        src={SHOWCASE_IMAGES[currentIndex].url}
                        alt={SHOWCASE_IMAGES[currentIndex].label}
                        className="w-full h-full object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Overlay gradient for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Label and indicator dots */}
            <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3">
                <p className="text-xs text-[#1A1A2E]/80 font-medium px-4 py-1.5 rounded-full"
                    style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}>
                    {SHOWCASE_IMAGES[currentIndex].label}
                </p>
                <div className="flex gap-1.5">
                    {SHOWCASE_IMAGES.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                                ? 'bg-white scale-110'
                                : 'bg-white/30 hover:bg-black/[0.03]0'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Subtle "See what's possible" badge */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-medium"
                style={{ background: 'rgba(201, 160, 255, 0.3)', backdropFilter: 'blur(8px)' }}>
                ✨ See What's Possible
            </div>
        </div>
    );
}

// Style prompt suggestions that rotate as placeholder text
const STYLE_PROMPTS = [
    "Casual summer vibes, outdoor sunshine",
    "Elegant evening look, soft lighting",
    "Streetwear aesthetic, urban setting",
    "Professional business attire",
    "Bohemian free-spirited style",
    "Minimalist clean aesthetic",
    "Romantic date night mood",
    "Athletic sporty energy",
    "Vintage retro inspiration",
    "High fashion editorial feel",
];

// Input with animated rotating placeholder (typewriter effect)
function RotatingPlaceholderInput({
    value,
    onChange
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [showCursor, setShowCursor] = useState(true);

    // Cursor blink effect
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 530);
        return () => clearInterval(cursorInterval);
    }, []);

    // Typewriter effect
    useEffect(() => {
        if (isFocused || value) return;

        const currentPrompt = STYLE_PROMPTS[placeholderIndex];

        if (isTyping) {
            // Typing phase
            if (displayedText.length < currentPrompt.length) {
                const timeout = setTimeout(() => {
                    setDisplayedText(currentPrompt.slice(0, displayedText.length + 1));
                }, 50 + Math.random() * 30); // Variable speed for realism
                return () => clearTimeout(timeout);
            } else {
                // Done typing, wait then start erasing
                const timeout = setTimeout(() => {
                    setIsTyping(false);
                }, 2000);
                return () => clearTimeout(timeout);
            }
        } else {
            // Erasing phase
            if (displayedText.length > 0) {
                const timeout = setTimeout(() => {
                    setDisplayedText(displayedText.slice(0, -1));
                }, 25); // Faster erase
                return () => clearTimeout(timeout);
            } else {
                // Done erasing, next prompt
                setPlaceholderIndex((prev) => (prev + 1) % STYLE_PROMPTS.length);
                setIsTyping(true);
            }
        }
    }, [displayedText, isTyping, placeholderIndex, isFocused, value]);

    // Reset when focused/unfocused
    useEffect(() => {
        if (!isFocused && !value) {
            setDisplayedText('');
            setIsTyping(true);
        }
    }, [isFocused, value]);

    return (
        <div className="relative">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder=""
                rows={2}
                className="w-full px-4 py-3 rounded-xl text-sm text-[#1A1A2E] resize-none transition-all focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/40"
                style={{
                    background: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.08)'
                }}
            />
            {/* Custom animated placeholder */}
            {!value && (
                <div
                    className="absolute left-4 top-3 pointer-events-none text-sm"
                    style={{ color: 'rgba(170, 170, 170, 0.8)' }}
                >
                    <span>{displayedText}</span>
                    <motion.span
                        animate={{ opacity: showCursor ? 1 : 0 }}
                        transition={{ duration: 0.1 }}
                        className="inline-block w-0.5 h-4 ml-0.5 align-middle"
                        style={{ background: 'rgba(255, 143, 171, 0.7)' }}
                    />
                </div>
            )}
            {!value && !isFocused && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-3 top-3 flex items-center gap-1 text-[10px] text-[#BBB]"
                >
                    <span>💡</span>
                    <span>Optional</span>
                </motion.div>
            )}
        </div>
    );
}

type Quality = 'standard' | 'studio';
type GalleryTarget = 'person' | 'dress';

export function StudioPage() {
    const {
        state,
        personImage,
        dressImage,
        resultUrl,
        error,
        userPrompt,
        setPersonImage,
        setDressImage,
        setUserPrompt,
        generate,
        clearResult
    } = useGenerationStore();

    const { balance, fetchBalance } = useCreditStore();
    const { user, isAnonymous } = useAuthStore();
    const { savedImages, refreshImages } = usePersonImages();

    const [quality, setQuality] = useState<Quality>('standard');
    const [modelType, setModelType] = useState<'fal' | 'gemini2' | 'geminipro'>('gemini2');
    const [falCategory, setFalCategory] = useState<'tops' | 'bottoms' | 'one-pieces'>('one-pieces');

    // Gallery Modal State
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryTarget, setGalleryTarget] = useState<GalleryTarget>('person');

    // Input Selection Modal State
    const [isInputMenuOpen, setIsInputMenuOpen] = useState(false);
    const [activeInputType, setActiveInputType] = useState<'person' | 'dress'>('person');

    const previewRef = useRef<HTMLDivElement>(null);
    const personInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const dressInputRef = useRef<HTMLInputElement>(null);
    const dressCameraInputRef = useRef<HTMLInputElement>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const { videoRef, isCapturing, capturePhoto, stopCamera, flipCamera, facingMode, isSupported: isCameraSupported } = useCamera();

    useEffect(() => {
        if (resultUrl) {
            setIsImageLoading(true);
        }
    }, [resultUrl]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const handleImageUpload = useCallback(async (
        e: React.ChangeEvent<HTMLInputElement>,
        setImage: (base64: string) => void,
        isPersonImage: boolean = false
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setImage(base64);

            if (isPersonImage && user) {
                await savePersonImage(user.id, base64);
                refreshImages();
            }
        };
        reader.readAsDataURL(file);
    }, [user, refreshImages]);

    const handleSavedImageSelect = async (imageUrl: string, imageId: string) => {
        setPersonImage(imageUrl);
        if (user) {
            await markPersonImageUsed(imageId);
            refreshImages();
        }
    };

    const handleCameraCapture = async () => {
        const imageBase64 = await capturePhoto();
        if (imageBase64) {
            setPersonImage(imageBase64);
            setShowCamera(false);
            if (user) {
                await savePersonImage(user.id, imageBase64);
                refreshImages();
            }
        }
    };

    const handleCloseCamera = () => {
        stopCamera();
        setShowCamera(false);
    };

    const canGenerate = personImage && dressImage && (state === 'idle' || state === 'failed') && balance > 0;

    return (
        <div className="flex flex-col min-h-full w-full">
            {/* Hero Section */}
            <section className="text-center py-8 px-4 max-w-4xl mx-auto animate-fade-in-up">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gradient mb-4">
                    AI Image Generator
                </h1>
                <p className="text-base md:text-lg text-[#888] max-w-2xl mx-auto leading-relaxed mb-6">
                    Try on any garment virtually with AI. Upload your photo and a clothing item to see yourself in a new look.
                </p>

                {/* Tip Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    style={{
                        background: 'rgba(201, 160, 255, 0.1)',
                        border: '1px solid rgba(201, 160, 255, 0.25)',
                        color: '#C9A0FF'
                    }}>
                    <span>💡</span>
                    <span>Tip: Use a full-body photo with good lighting for best results.</span>
                </div>
            </section>

            {/* Main Content: 2-Column Layout */}
            <div className="flex-1 px-4 md:px-8 pb-8">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">

                    {/* LEFT: Form Panel */}
                    <div className="space-y-6 animate-fade-in-up-delay-1 min-w-0 overflow-hidden">
                        {/* Form Card */}
                        <div className="rounded-2xl p-4 md:p-6" style={{
                            background: 'white',
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                        }}>
                            {/* Frame Upload Intro */}
                            <p className="text-sm text-[#888] mb-6">
                                Upload your photo and select a garment to try on.
                            </p>

                            {/* Person Upload */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-[#AAA] uppercase tracking-wider mb-3 block">
                                    Your Photo
                                </label>

                                {personImage ? (
                                    <div className="relative aspect-[3/4] max-w-[200px] rounded-xl overflow-hidden group">
                                        <img src={personImage} alt="Person" className="w-full h-full object-cover" />

                                        {/* Always visible X button */}
                                        <button
                                            onClick={() => setPersonImage('')}
                                            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center transition-all border border-black/[0.1]"
                                        >
                                            <svg className="w-4 h-4 text-[#1A1A2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        {/* Change button on hover */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => personInputRef.current?.click()}
                                                className="px-4 py-2 rounded-full bg-black/[0.06] hover:bg-black/[0.06] transition-colors text-xs font-medium flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => {
                                            setActiveInputType('person');
                                            setIsInputMenuOpen(true);
                                        }}
                                        className="aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
                                        style={{
                                            border: '2px dashed rgba(0, 0, 0, 0.12)',
                                            background: 'rgba(201, 160, 255, 0.04)'
                                        }}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[#C9A0FF]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-[#C9A0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-medium text-[#888] group-hover:text-[#1A1A2E] transition-colors">Add Photo</span>
                                    </div>
                                )}

                                {/* Saved Photos */}
                                {savedImages.length > 0 && !personImage && (
                                    <div className="mt-4">
                                        <p className="text-xs text-[#AAA] mb-2">Your saved photos</p>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {savedImages.slice(0, 4).map((img) => (
                                                <button
                                                    key={img.id}
                                                    onClick={() => handleSavedImageSelect(img.url || '', img.id)}
                                                    className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-black/[0.06] hover:border-[#FF8FAB]/50 transition-colors"
                                                >
                                                    <img src={img.url} alt="Saved" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Example Models */}
                                {!personImage && (
                                    <div className="mt-4">
                                        <p className="text-xs text-[#AAA] mb-2">Or try with examples</p>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {EXAMPLE_PERSON_IMAGES.map((img) => (
                                                <button
                                                    key={img.id}
                                                    onClick={() => setPersonImage(img.url)}
                                                    className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-black/[0.06] hover:border-[#FF8FAB]/50 transition-colors"
                                                >
                                                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Garment Upload */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-[#AAA] uppercase tracking-wider mb-3 block">
                                    Garment
                                </label>

                                {dressImage ? (
                                    <div className="relative aspect-[3/4] max-w-[200px] rounded-xl overflow-hidden group">
                                        <img src={dressImage} alt="Garment" className="w-full h-full object-cover" />

                                        {/* Always visible X button */}
                                        <button
                                            onClick={() => setDressImage('')}
                                            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center transition-all border border-black/[0.1]"
                                        >
                                            <svg className="w-4 h-4 text-[#1A1A2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        {/* Change button on hover */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => dressInputRef.current?.click()}
                                                className="px-4 py-2 rounded-full bg-black/[0.06] hover:bg-black/[0.06] transition-colors text-xs font-medium flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => {
                                            setActiveInputType('dress');
                                            setIsInputMenuOpen(true);
                                        }}
                                        className="w-full aspect-[4/3] rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
                                        style={{
                                            border: '2px dashed rgba(0, 0, 0, 0.12)',
                                            background: 'rgba(201, 160, 255, 0.04)'
                                        }}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#C9A0FF]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-5 h-5 text-[#C9A0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-medium text-[#888] group-hover:text-[#1A1A2E] transition-colors">Add Garment</span>
                                    </div>
                                )}

                                {/* Example Garments */}
                                {!dressImage && (
                                    <div className="mt-4">
                                        <p className="text-xs text-[#AAA] mb-2">Example garments</p>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {EXAMPLE_GARMENT_IMAGES.map((img) => (
                                                <button
                                                    key={img.id}
                                                    onClick={() => setDressImage(img.url)}
                                                    className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-black/[0.06] hover:border-[#FF8FAB]/50 transition-colors"
                                                >
                                                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quality/Model Controls */}
                            <div className="space-y-4 mb-6">
                                {/* Quality */}
                                <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                                    <button
                                        onClick={() => setQuality('standard')}
                                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${quality === 'standard'
                                            ? 'bg-black/[0.04] text-[#1A1A2E]'
                                            : 'text-[#888] hover:text-[#1A1A2E]'
                                            }`}
                                    >
                                        Standard
                                        <span className="block text-xs text-[#C9A0FF] mt-0.5">1 Credit</span>
                                    </button>
                                    <button
                                        onClick={() => setQuality('studio')}
                                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${quality === 'studio'
                                            ? 'bg-[#C9A0FF]/15 text-[#C9A0FF]'
                                            : 'text-[#888] hover:text-[#1A1A2E]'
                                            }`}
                                    >
                                        Studio
                                        <span className="block text-xs text-[#C9A0FF] mt-0.5">2 Credits</span>
                                    </button>
                                </div>

                                {/* Model */}
                                <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                                    <button
                                        onClick={() => setModelType('fal')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${modelType === 'fal'
                                            ? 'bg-[#C9A0FF]/15 text-[#C9A0FF]'
                                            : 'text-[#888] hover:text-[#1A1A2E]'
                                            }`}
                                    >
                                        Fal AI
                                    </button>
                                    <button
                                        onClick={() => setModelType('gemini2')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${modelType === 'gemini2'
                                            ? 'bg-[#7DD3C0]/15 text-[#7DD3C0]'
                                            : 'text-[#888] hover:text-[#1A1A2E]'
                                            }`}
                                    >
                                        Gemini 2
                                    </button>
                                    <button
                                        onClick={() => setModelType('geminipro')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${modelType === 'geminipro'
                                            ? 'bg-gradient-to-r from-[#C9A0FF] to-[#FF8FAB] shadow-lg text-[#1A1A2E]'
                                            : 'text-[#888] hover:text-[#1A1A2E] hover:bg-black/[0.03]'
                                            }`}
                                    >
                                        Pro
                                    </button>
                                </div>

                                {/* Fal Category */}
                                {modelType === 'fal' && (
                                    <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                                        {(['tops', 'bottoms', 'one-pieces'] as const).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setFalCategory(cat)}
                                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${falCategory === cat
                                                    ? 'bg-[#C9A0FF]/15 text-[#C9A0FF]'
                                                    : 'text-[#888] hover:text-[#1A1A2E]'
                                                    }`}
                                            >
                                                {cat === 'one-pieces' ? 'Full' : cat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Style Prompt - Above Generate Button */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-semibold text-[#AAA] uppercase tracking-wider">
                                            Style Prompt
                                        </h3>
                                        <span className="text-[10px] text-[#BBB]">
                                            optional · guide the vibe or specify changes
                                        </span>
                                    </div>
                                    {userPrompt && (
                                        <button
                                            onClick={() => setUserPrompt('')}
                                            className="text-[10px] text-[#BBB] hover:text-[#888] transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <RotatingPlaceholderInput
                                    value={userPrompt}
                                    onChange={setUserPrompt}
                                />
                            </div>

                            {/* Error Notification */}
                            <AnimatePresence>
                                {state === 'failed' && error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-4 p-4 rounded-xl flex items-start gap-3"
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)'
                                        }}
                                    >
                                        <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-red-300">
                                                {error.userMessage || 'Generation failed'}
                                            </p>
                                            {error.message?.includes('API key expired') && (
                                                <p className="text-xs text-red-400/70 mt-1">
                                                    The API key needs to be renewed. Please check your configuration.
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => clearResult()}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Generate Button */}
                            {state === 'succeeded' && resultUrl ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => clearResult()}
                                    className="w-full py-4 rounded-xl text-sm font-semibold transition-all"
                                    style={{
                                        background: 'white',
                                        border: '1px solid rgba(0, 0, 0, 0.08)'
                                    }}
                                >
                                    Try Again
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={canGenerate ? { scale: 1.02, boxShadow: '0 10px 30px rgba(255, 143, 171, 0.3)' } : {}}
                                    whileTap={canGenerate ? { scale: 0.98 } : {}}
                                    onClick={() => {
                                        generate(quality, modelType, modelType === 'fal' ? falCategory : undefined);
                                        // Auto-scroll to preview on mobile
                                        if (window.innerWidth < 1024) {
                                            setTimeout(() => {
                                                previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }, 100);
                                        }
                                    }}
                                    disabled={!canGenerate}
                                    className={`w-full py-4 rounded-xl text-sm font-semibold transition-all ${canGenerate
                                        ? 'text-[#1A1A2E]'
                                        : 'text-[#BBB] cursor-not-allowed'
                                        }`}
                                    style={{
                                        background: canGenerate
                                            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        border: canGenerate ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                                    }}
                                >
                                    {state === 'generating' ? 'Generating...' : state === 'failed' ? 'Retry' : 'Generate'}
                                </motion.button>
                            )}

                            {isAnonymous && (
                                <Link
                                    to="/login"
                                    className="block text-center text-xs text-[#C9A0FF] hover:text-[#C9A0FF] mt-4 transition-colors"
                                >
                                    Create account to save your generations →
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Preview Panel */}
                    <div className="space-y-6 animate-fade-in-up-delay-2">
                        {/* Preview Card */}
                        <div ref={previewRef} className="rounded-2xl p-6" style={{
                            background: 'white',
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                        }}>
                            <h3 className="text-xs font-semibold text-[#AAA] uppercase tracking-wider mb-4">
                                Preview
                            </h3>

                            {/* Preview Area */}
                            <div className="aspect-[3/4] rounded-xl overflow-hidden relative"
                                style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                                <AnimatePresence mode="wait">
                                    {state === 'generating' ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0"
                                        >
                                            {/* Background carousel */}
                                            <ShowcaseCarousel />

                                            {/* Loading overlay */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center"
                                                style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>

                                                {/* Animated spinner ring */}
                                                <div className="relative w-20 h-20 mb-4">
                                                    <motion.div
                                                        className="absolute inset-0 rounded-full"
                                                        style={{
                                                            border: '3px solid rgba(201, 160, 255, 0.2)',
                                                            borderTopColor: '#C9A0FF'
                                                        }}
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                    />
                                                    <motion.div
                                                        className="absolute inset-2 rounded-full"
                                                        style={{
                                                            border: '3px solid rgba(255, 143, 171, 0.2)',
                                                            borderBottomColor: '#FF8FAB'
                                                        }}
                                                        animate={{ rotate: -360 }}
                                                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-2xl">✨</span>
                                                    </div>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="w-32 h-1.5 rounded-full overflow-hidden mb-3"
                                                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                                    <motion.div
                                                        className="h-full rounded-full"
                                                        style={{ background: 'linear-gradient(135deg, #C9A0FF, #FF8FAB)' }}
                                                        animate={{ x: ['-100%', '100%'] }}
                                                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                                    />
                                                </div>

                                                <p className="text-sm font-medium text-[#1A1A2E] mb-1">
                                                    Creating your look...
                                                </p>
                                                <p className="text-xs text-[#C9A0FF]/70">
                                                    This may take 15-30 seconds
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : resultUrl ? (
                                        <motion.div
                                            key="result"
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-full h-full relative"
                                        >
                                            <img
                                                src={resultUrl}
                                                alt="Result"
                                                onLoad={() => setIsImageLoading(false)}
                                                className={`w-full h-full object-contain transition-all duration-500 ${isImageLoading ? 'blur-lg scale-105' : 'blur-0 scale-100'
                                                    }`}
                                            />

                                            {/* Top action buttons */}
                                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                                {/* New Look button */}
                                                <button
                                                    onClick={() => clearResult()}
                                                    className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all hover:scale-105"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #C9A0FF, #FF8FAB)',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                                    }}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    New Look
                                                </button>

                                                {/* View Gallery button */}
                                                <Link
                                                    to="/studio/history"
                                                    className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all hover:scale-105"
                                                    style={{
                                                        background: 'rgba(0, 0, 0, 0.5)',
                                                        backdropFilter: 'blur(10px)',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                                    }}
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                    </svg>
                                                    Gallery
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <ShowcaseCarousel />
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="rounded-2xl p-6" style={{
                            background: 'white',
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                        }}>
                            <h3 className="text-xs font-semibold text-[#AAA] uppercase tracking-wider mb-4">
                                Quick Tips
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-[#888]">
                                    <span className="text-[#C9A0FF] mt-0.5">•</span>
                                    Use high-quality, well-lit photos for best results
                                </li>
                                <li className="flex items-start gap-3 text-sm text-[#888]">
                                    <span className="text-[#C9A0FF] mt-0.5">•</span>
                                    Full-body shots work better than cropped images
                                </li>
                                <li className="flex items-start gap-3 text-sm text-[#888]">
                                    <span className="text-[#C9A0FF] mt-0.5">•</span>
                                    Studio quality takes longer but produces sharper images
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Inputs */}
            <input ref={personInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setPersonImage, true)} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="user" onChange={(e) => handleImageUpload(e, setPersonImage, true)} className="hidden" />
            <input ref={dressInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setDressImage)} className="hidden" />
            <input ref={dressCameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleImageUpload(e, setDressImage)} className="hidden" />

            {/* Camera Modal */}
            <AnimatePresence>
                {showCamera && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex flex-col items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                            />
                            {!isCapturing && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#C9A0FF] border-t-transparent" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleCloseCamera}
                                className="px-6 py-3 rounded-xl text-sm font-medium"
                                style={{
                                    background: 'rgba(0, 0, 0, 0.04)',
                                    border: '1px solid rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={flipCamera}
                                className="px-6 py-3 rounded-xl flex items-center gap-2"
                                style={{
                                    background: 'rgba(0, 0, 0, 0.04)',
                                    border: '1px solid rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <button
                                onClick={handleCameraCapture}
                                disabled={!isCapturing}
                                className="px-8 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                                style={{
                                    background: 'linear-gradient(135deg, #C9A0FF, #FF8FAB)'
                                }}
                            >
                                Capture
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <GalleryPicker
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                onSelect={(url) => {
                    if (galleryTarget === 'person') {
                        setPersonImage(url);
                    } else {
                        setDressImage(url);
                    }
                    setIsGalleryOpen(false);
                }}
                title={galleryTarget === 'person' ? 'Select Model from Gallery' : 'Select Garment from Gallery'}
            />

            {/* Input Selection Modal */}
            <AnimatePresence>
                {isInputMenuOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsInputMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm rounded-2xl border p-6 shadow-xl overflow-hidden"
                            style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 0, 0, 0.08)' }}
                        >
                            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 text-center">
                                {activeInputType === 'person' ? 'Add Photo' : 'Add Garment'}
                            </h3>

                            <div className="grid grid-cols-1 gap-3">
                                {/* Upload Option */}
                                <button
                                    onClick={() => {
                                        if (activeInputType === 'person') {
                                            personInputRef.current?.click();
                                        } else {
                                            dressInputRef.current?.click();
                                        }
                                        setIsInputMenuOpen(false);
                                    }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#C9A0FF]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5 text-[#C9A0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium text-[#1A1A2E]">Upload Selection</div>
                                        <div className="text-xs text-[#888]">Choose from your device</div>
                                    </div>
                                </button>

                                {/* Camera Option - Only for Person */}
                                {activeInputType === 'person' && isCameraSupported && (
                                    <button
                                        onClick={() => {
                                            cameraInputRef.current?.click();
                                            setIsInputMenuOpen(false);
                                        }}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#C9A0FF]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-5 h-5 text-[#C9A0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-[#1A1A2E]">Take Photo</div>
                                            <div className="text-xs text-[#888]">Use your camera</div>
                                        </div>
                                    </button>
                                )}

                                {/* Gallery Option */}
                                <button
                                    onClick={() => {
                                        setGalleryTarget(activeInputType);
                                        setIsGalleryOpen(true);
                                        setIsInputMenuOpen(false);
                                    }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#FF8FAB]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5 text-[#FF8FAB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium text-[#1A1A2E]">From Gallery</div>
                                        <div className="text-xs text-[#888]">Select from wardrobe</div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
