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

type Quality = 'standard' | 'studio';

export function StudioPage() {
    const {
        state,
        personImage,
        dressImage,
        resultUrl,
        setPersonImage,
        setDressImage,
        generate,
        clearResult
    } = useGenerationStore();

    const { balance, fetchBalance } = useCreditStore();
    const { user, isAnonymous } = useAuthStore();
    const { savedImages, refreshImages } = usePersonImages();

    const [quality, setQuality] = useState<Quality>('standard');
    const [modelType, setModelType] = useState<'fal' | 'gemini2' | 'geminipro'>('gemini2');
    const [falCategory, setFalCategory] = useState<'tops' | 'bottoms' | 'one-pieces'>('one-pieces');

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

    const canGenerate = personImage && dressImage && state === 'idle' && balance > 0;

    return (
        <div className="flex flex-col min-h-full w-full">
            {/* Hero Section */}
            <section className="text-center py-8 px-4 max-w-4xl mx-auto animate-fade-in-up">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gradient mb-4">
                    AI Image Generator
                </h1>
                <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-6">
                    Try on any garment virtually with AI. Upload your photo and a clothing item to see yourself in a new look.
                </p>

                {/* Tip Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: '#a5b4fc'
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
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                            {/* Frame Upload Intro */}
                            <p className="text-sm text-zinc-400 mb-6">
                                Upload your photo and select a garment to try on.
                            </p>

                            {/* Person Upload */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 block">
                                    Your Photo
                                </label>

                                {personImage ? (
                                    <div className="relative aspect-[3/4] max-w-[200px] rounded-xl overflow-hidden group">
                                        <img src={personImage} alt="Person" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => personInputRef.current?.click()}
                                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setPersonImage('')}
                                                className="p-2 rounded-full bg-red-500/50 hover:bg-red-500/70 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-xs">
                                        {/* Upload Dropzone */}
                                        <button
                                            onClick={() => personInputRef.current?.click()}
                                            className="aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                                            style={{
                                                border: '2px dashed rgba(255, 255, 255, 0.2)',
                                                background: 'rgba(255, 255, 255, 0.02)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                            }}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-zinc-400">Upload Photo</span>
                                        </button>

                                        {/* Camera Button */}
                                        {isCameraSupported && (
                                            <button
                                                onClick={() => cameraInputRef.current?.click()}
                                                className="aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                                                style={{
                                                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                                                    background: 'rgba(255, 255, 255, 0.02)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                                }}
                                            >
                                                <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-medium text-zinc-400">Take Photo</span>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Saved Photos */}
                                {savedImages.length > 0 && !personImage && (
                                    <div className="mt-4">
                                        <p className="text-xs text-zinc-500 mb-2">Your saved photos</p>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {savedImages.slice(0, 4).map((img) => (
                                                <button
                                                    key={img.id}
                                                    onClick={() => handleSavedImageSelect(img.url || '', img.id)}
                                                    className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-colors"
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
                                        <p className="text-xs text-zinc-500 mb-2">Or try with examples</p>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {EXAMPLE_PERSON_IMAGES.map((img) => (
                                                <button
                                                    key={img.id}
                                                    onClick={() => setPersonImage(img.url)}
                                                    className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-colors"
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
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 block">
                                    Garment
                                </label>

                                {dressImage ? (
                                    <div className="relative aspect-[3/4] max-w-[200px] rounded-xl overflow-hidden group">
                                        <img src={dressImage} alt="Garment" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => dressInputRef.current?.click()}
                                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDressImage('')}
                                                className="p-2 rounded-full bg-red-500/50 hover:bg-red-500/70 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => dressInputRef.current?.click()}
                                        className="w-full aspect-[4/3] max-w-full sm:max-w-[280px] rounded-xl flex flex-col items-center justify-center gap-3 transition-all"
                                        style={{
                                            border: '2px dashed rgba(255, 255, 255, 0.2)',
                                            background: 'rgba(255, 255, 255, 0.02)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                        }}
                                    >
                                        <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                            <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-zinc-400">Upload Garment</span>
                                    </button>
                                )}

                                {/* Example Garments */}
                                {!dressImage && (
                                    <div className="mt-4">
                                        <p className="text-xs text-zinc-500 mb-2">Example garments</p>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {EXAMPLE_GARMENT_IMAGES.map((img) => (
                                                <button
                                                    key={img.id}
                                                    onClick={() => setDressImage(img.url)}
                                                    className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-colors"
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
                                <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                    <button
                                        onClick={() => setQuality('standard')}
                                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${quality === 'standard'
                                            ? 'bg-white/10 text-white'
                                            : 'text-zinc-400 hover:text-white'
                                            }`}
                                    >
                                        Standard
                                        <span className="block text-xs text-indigo-400 mt-0.5">1 Credit</span>
                                    </button>
                                    <button
                                        onClick={() => setQuality('studio')}
                                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${quality === 'studio'
                                            ? 'bg-indigo-500/20 text-indigo-300'
                                            : 'text-zinc-400 hover:text-white'
                                            }`}
                                    >
                                        Studio
                                        <span className="block text-xs text-indigo-400 mt-0.5">2 Credits</span>
                                    </button>
                                </div>

                                {/* Model */}
                                <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                    <button
                                        onClick={() => setModelType('fal')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${modelType === 'fal'
                                            ? 'bg-violet-500/20 text-violet-300'
                                            : 'text-zinc-400 hover:text-white'
                                            }`}
                                    >
                                        Fal AI
                                    </button>
                                    <button
                                        onClick={() => setModelType('gemini2')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${modelType === 'gemini2'
                                            ? 'bg-blue-500/20 text-blue-300'
                                            : 'text-zinc-400 hover:text-white'
                                            }`}
                                    >
                                        Gemini 2
                                    </button>
                                    <button
                                        onClick={() => setModelType('geminipro')}
                                        disabled
                                        className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 cursor-not-allowed"
                                    >
                                        Pro
                                    </button>
                                </div>

                                {/* Fal Category */}
                                {modelType === 'fal' && (
                                    <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                        {(['tops', 'bottoms', 'one-pieces'] as const).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setFalCategory(cat)}
                                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${falCategory === cat
                                                    ? 'bg-violet-500/20 text-violet-300'
                                                    : 'text-zinc-400 hover:text-white'
                                                    }`}
                                            >
                                                {cat === 'one-pieces' ? 'Full' : cat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Generate Button */}
                            {state === 'succeeded' && resultUrl ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => clearResult()}
                                    className="w-full py-4 rounded-xl text-sm font-semibold transition-all"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)'
                                    }}
                                >
                                    Try Again
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={canGenerate ? { scale: 1.02, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' } : {}}
                                    whileTap={canGenerate ? { scale: 0.98 } : {}}
                                    onClick={() => generate(quality, modelType, modelType === 'fal' ? falCategory : undefined)}
                                    disabled={!canGenerate}
                                    className={`w-full py-4 rounded-xl text-sm font-semibold transition-all ${canGenerate
                                        ? 'text-white'
                                        : 'text-zinc-600 cursor-not-allowed'
                                        }`}
                                    style={{
                                        background: canGenerate
                                            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        border: canGenerate ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                                    }}
                                >
                                    {state === 'generating' ? 'Generating...' : 'Generate'}
                                </motion.button>
                            )}

                            {isAnonymous && (
                                <Link
                                    to="/login"
                                    className="block text-center text-xs text-indigo-400 hover:text-indigo-300 mt-4 transition-colors"
                                >
                                    Create account to save your generations →
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Preview Panel */}
                    <div className="space-y-6 animate-fade-in-up-delay-2">
                        {/* Preview Card */}
                        <div className="rounded-2xl p-6" style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                                Preview
                            </h3>

                            {/* Preview Area */}
                            <div className="aspect-[3/4] rounded-xl overflow-hidden relative"
                                style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                                <AnimatePresence mode="wait">
                                    {state === 'generating' ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center"
                                        >
                                            <div className="w-16 h-1 rounded-full overflow-hidden relative"
                                                style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                                <motion.div
                                                    className="absolute inset-0"
                                                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                                />
                                            </div>
                                            <p className="text-xs text-indigo-400 mt-4 uppercase tracking-widest">
                                                Processing
                                            </p>
                                        </motion.div>
                                    ) : resultUrl ? (
                                        <motion.div
                                            key="result"
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-full h-full"
                                        >
                                            <img
                                                src={resultUrl}
                                                alt="Result"
                                                onLoad={() => setIsImageLoading(false)}
                                                className={`w-full h-full object-cover transition-all duration-500 ${isImageLoading ? 'blur-lg scale-105' : 'blur-0 scale-100'
                                                    }`}
                                            />
                                            <Link
                                                to="/studio/history"
                                                className="absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all hover:scale-105"
                                                style={{
                                                    background: 'rgba(0, 0, 0, 0.5)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                                }}
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                                View Gallery
                                            </Link>
                                        </motion.div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                                            <svg className="w-16 h-16 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-xs uppercase tracking-widest">Awaiting Generation</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Inspiration Section */}
                        <div className="rounded-2xl p-6" style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                                Inspiration
                            </h3>
                            <div className="p-4 rounded-lg text-sm text-zinc-400 italic"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderLeft: '3px solid rgba(99, 102, 241, 0.5)'
                                }}>
                                "Upload a clear, full-body photo with neutral background for the most realistic results"
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="rounded-2xl p-6" style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                                Quick Tips
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-zinc-400">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    Use high-quality, well-lit photos for best results
                                </li>
                                <li className="flex items-start gap-3 text-sm text-zinc-400">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    Full-body shots work better than cropped images
                                </li>
                                <li className="flex items-start gap-3 text-sm text-zinc-400">
                                    <span className="text-indigo-400 mt-0.5">•</span>
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
                        className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                            />
                            {!isCapturing && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleCloseCamera}
                                className="px-6 py-3 rounded-xl text-sm font-medium"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={flipCamera}
                                className="px-6 py-3 rounded-xl flex items-center gap-2"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
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
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                }}
                            >
                                Capture
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
