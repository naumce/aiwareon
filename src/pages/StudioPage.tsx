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
    const dressInputRef = useRef<HTMLInputElement>(null);
    const garmentSectionRef = useRef<HTMLDivElement>(null);
    const controlsSectionRef = useRef<HTMLDivElement>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const { videoRef, isCapturing, startCamera, capturePhoto, stopCamera, isSupported: isCameraSupported } = useCamera();

    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
        setTimeout(() => {
            ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    useEffect(() => {
        if (resultUrl) {
            setIsImageLoading(true);
        }
    }, [resultUrl]);

    // Reset state to idle after showing error
    useEffect(() => {
        if (state === 'failed') {
            const timer = setTimeout(() => {
                // Don't reset the error, just the state so button works again
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [state]);

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

            // Scroll to next section
            if (isPersonImage) scrollToSection(garmentSectionRef);
            else scrollToSection(controlsSectionRef);

            // Save person image for reuse
            if (isPersonImage && user) {
                await savePersonImage(user.id, base64);
                refreshImages();
            }
        };
        reader.readAsDataURL(file);
    }, [user, refreshImages]);

    const handleSavedImageSelect = async (imageUrl: string, imageId: string) => {
        setPersonImage(imageUrl);
        scrollToSection(garmentSectionRef);
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
            scrollToSection(garmentSectionRef);
            if (user) {
                await savePersonImage(user.id, imageBase64);
                refreshImages();
            }
        }
    };

    const handleStartCamera = async () => {
        setShowCamera(true);
        await startCamera();
    };

    const handleCloseCamera = () => {
        stopCamera();
        setShowCamera(false);
    };

    const canGenerate = personImage && dressImage && state === 'idle' && balance > 0;

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Sidebar - Desktop */}


            {/* Page Header */}
            <div className="px-4 md:px-8 py-6 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight uppercase italic">Atelier</h2>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Creation Space</p>
                </div>
                <div className="flex gap-4">
                    {isAnonymous && (
                        <Link to="/login" className="px-4 py-2 rounded-full glass glass-hover text-[10px] font-bold uppercase tracking-widest text-violet-400">
                            Secure Account
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 pt-0 overflow-y-auto overflow-x-hidden">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 w-full">
                    {/* Person Selection */}
                    <div className="space-y-6 min-w-0 overflow-hidden">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">01 / Person</span>
                            {personImage && <button onClick={() => setPersonImage('')} className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">Clear</button>}
                        </div>

                        <div className="flex flex-col gap-6 min-w-0">
                            {/* My Photos + Upload */}
                            <div className="space-y-3 min-w-0">
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">My Photos</p>
                                </div>

                                {/* Responsive Container: Scroll on Mobile, Grid on Desktop */}
                                <div className="w-full max-w-full overflow-x-auto flex lg:grid lg:grid-cols-4 gap-3 pb-4 lg:pb-0 scrollbar-hide snap-x px-1 overscroll-x-contain">
                                    {/* Add New Button - Toggle Menu */}
                                    <div className="flex-shrink-0 snap-start w-24 lg:w-full aspect-[3/4] rounded-2xl border border-dashed border-white/20 relative overflow-hidden">
                                        {!showAddMenu ? (
                                            <button
                                                onClick={() => setShowAddMenu(true)}
                                                className="w-full h-full flex flex-col items-center justify-center gap-2 group hover:border-violet-500/50 hover:bg-white/5 transition-all"
                                                title="Add Photo"
                                            >
                                                <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="w-10 h-10 rounded-full bg-zinc-900 ring-1 ring-white/10 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white text-zinc-500 transition-all duration-300 shadow-lg">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                                <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-violet-200 transition-colors">Add</span>
                                            </button>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-zinc-900/80 p-2">
                                                {/* Upload Option */}
                                                <button
                                                    onClick={() => { personInputRef.current?.click(); setShowAddMenu(false); }}
                                                    className="w-full flex-1 rounded-xl bg-violet-500/20 hover:bg-violet-500/40 flex flex-col items-center justify-center gap-1 transition-all"
                                                >
                                                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-[7px] font-bold uppercase tracking-wider text-violet-300">Upload</span>
                                                </button>

                                                {/* Camera Option */}
                                                {isCameraSupported && (
                                                    <button
                                                        onClick={() => { handleStartCamera(); setShowAddMenu(false); }}
                                                        className="w-full flex-1 rounded-xl bg-pink-500/20 hover:bg-pink-500/40 flex flex-col items-center justify-center gap-1 transition-all"
                                                    >
                                                        <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="text-[7px] font-bold uppercase tracking-wider text-pink-300">Camera</span>
                                                    </button>
                                                )}

                                                {/* Close */}
                                                <button
                                                    onClick={() => setShowAddMenu(false)}
                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Saved Images */}
                                    {savedImages.map((img) => (
                                        <button
                                            key={img.id}
                                            onClick={() => handleSavedImageSelect(img.url || '', img.id)}
                                            className={`flex-shrink-0 snap-start w-24 lg:w-full aspect-[3/4] rounded-2xl overflow-hidden border transition-all duration-300 relative group
                                            ${personImage === img.url
                                                    ? 'border-violet-500 ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/20 scale-[1.02]'
                                                    : 'border-white/5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10'}`}
                                        >
                                            <img
                                                src={img.url}
                                                alt="Saved"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${personImage === img.url ? 'opacity-100' : ''}`} />

                                            {personImage === img.url && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-violet-500 text-white rounded-full p-1.5 shadow-lg transform scale-100 transition-transform">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Example Models */}
                            <div className="space-y-3 min-w-0">
                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider px-1">Example Models</p>
                                <div className="w-full max-w-full min-w-0 flex lg:grid lg:grid-cols-4 gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide snap-x px-1">
                                    {EXAMPLE_PERSON_IMAGES.map((img) => (
                                        <button
                                            key={img.id}
                                            onClick={() => { setPersonImage(img.url); scrollToSection(garmentSectionRef); }}
                                            className={`flex-shrink-0 snap-start w-24 lg:w-full aspect-[3/4] rounded-2xl overflow-hidden border transition-all duration-300 relative group
                                            ${personImage === img.url
                                                    ? 'border-violet-500 ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/20 scale-[1.02]'
                                                    : 'border-white/5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10'}`}
                                            title={img.label}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.label}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${personImage === img.url ? 'opacity-100' : ''}`} />

                                            {personImage === img.url && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-violet-500 text-white rounded-full p-1.5 shadow-lg transform scale-100 transition-transform">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[8px] font-bold text-white uppercase tracking-wider drop-shadow-md">{img.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <input ref={personInputRef} type="file" accept="image/*" capture="user" onChange={(e) => handleImageUpload(e, setPersonImage, true)} className="hidden" />
                    </div>

                    {/* Dress Upload */}
                    <div className="space-y-4 min-w-0 overflow-hidden" ref={garmentSectionRef}>
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">02 / Garment</span>
                            {dressImage && <button onClick={() => setDressImage('')} className="text-[10px] text-zinc-600 hover:text-white uppercase tracking-widest underline">Clear</button>}
                        </div>
                        <div
                            onClick={() => dressInputRef.current?.click()}
                            className={`aspect-[3/4.5] rounded-[2rem] border-2 border-dashed cursor-pointer relative group
                           transition-all duration-500 overflow-hidden
                           ${dressImage
                                    ? 'border-transparent shadow-2xl'
                                    : 'border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10'}`}
                        >
                            {dressImage ? (
                                <>
                                    <img src={dressImage} alt="Garment" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-[10px] text-white font-bold uppercase tracking-[0.3em]">Change Item</p>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Choose Garment</p>
                                </div>
                            )}
                        </div>

                        {/* Example Garments */}
                        <div className="space-y-3 min-w-0 w-full overflow-hidden">
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider px-1">Example Garments</p>
                            <div className="w-full max-w-full overflow-x-auto flex gap-3 pb-4 scrollbar-hide snap-x px-1 overscroll-x-contain">
                                {EXAMPLE_GARMENT_IMAGES.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => { setDressImage(img.url); scrollToSection(controlsSectionRef); }}
                                        className={`flex-shrink-0 snap-start w-20 aspect-[3/4] rounded-xl overflow-hidden border transition-all duration-300 relative group
                                        ${dressImage === img.url
                                                ? 'border-violet-500 ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/20 scale-[1.02]'
                                                : 'border-white/5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10'}`}
                                        title={img.label}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.label}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {dressImage === img.url && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <div className="bg-violet-500 text-white rounded-full p-1 shadow-lg">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <input ref={dressInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setDressImage)} className="hidden" />
                    </div>

                    {/* Column 3: Controls & Creation */}
                    <div className="space-y-8 pt-8 lg:pt-0 min-w-0 overflow-hidden">
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest self-start px-2">03 / Controls</span>

                            {/* Quality Selector */}
                            <div className="glass rounded-2xl p-1.5 flex gap-1.5 w-full">
                                <button
                                    onClick={() => setQuality('standard')}
                                    className={`flex-1 px-2 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all
                                ${quality === 'standard'
                                            ? 'bg-white/10 text-white shadow-lg'
                                            : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Standard
                                    <span className="block text-[8px] text-violet-400 mt-0.5">1 Credit</span>
                                </button>
                                <button
                                    onClick={() => setQuality('studio')}
                                    className={`flex-1 px-2 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all
                                ${quality === 'studio'
                                            ? 'bg-violet-500/20 text-violet-300 shadow-lg'
                                            : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Studio
                                    <span className="block text-[8px] text-violet-400 mt-0.5">2 Credits</span>
                                </button>
                            </div>

                            {/* Model Selector */}
                            <div className="glass rounded-2xl p-1.5 flex gap-1.5 w-full">
                                <button
                                    onClick={() => setModelType('fal')}
                                    className={`flex-1 px-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all
                                ${modelType === 'fal'
                                            ? 'bg-violet-500/20 text-violet-300 shadow-lg'
                                            : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Fal AI
                                </button>
                                <button
                                    onClick={() => setModelType('gemini2')}
                                    className={`flex-1 px-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all
                                ${modelType === 'gemini2'
                                            ? 'bg-blue-500/20 text-blue-300 shadow-lg'
                                            : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Gemini 2
                                </button>
                                <button
                                    onClick={() => setModelType('geminipro')}
                                    disabled={true}
                                    className={`flex-1 px-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all opacity-30 cursor-not-allowed
                                ${modelType === 'geminipro'
                                            ? 'bg-emerald-500/20 text-emerald-300 shadow-lg'
                                            : 'text-zinc-500'}`}
                                >
                                    Gemini Pro
                                </button>
                            </div>

                            {/* Fal Category Selector */}
                            {modelType === 'fal' && (
                                <div className="glass rounded-2xl p-1.5 flex gap-1.5 w-full justify-center">
                                    <button
                                        onClick={() => setFalCategory('tops')}
                                        className={`flex-1 px-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all
                                ${falCategory === 'tops'
                                                ? 'bg-violet-500/20 text-violet-300 shadow-lg'
                                                : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h2v7a2 2 0 002 2h10a2 2 0 002-2v-7h2v-2h-3l-2.5-6h-7L6 11H3v2z" />
                                        </svg>
                                        <span className="text-[9px] font-bold uppercase tracking-wider">Top</span>
                                    </button>
                                    <button
                                        onClick={() => setFalCategory('bottoms')}
                                        className={`flex-1 px-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all
                                ${falCategory === 'bottoms'
                                                ? 'bg-violet-500/20 text-violet-300 shadow-lg'
                                                : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 21v-8a2 2 0 012-2h8a2 2 0 012 2v8M6 21h4m8 0h-4m-4 0v-7m0 0l-3-3m3 3l3-3" />
                                        </svg>
                                        <span className="text-[9px] font-bold uppercase tracking-wider">Bottom</span>
                                    </button>
                                    <button
                                        onClick={() => setFalCategory('one-pieces')}
                                        className={`flex-1 px-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all
                                ${falCategory === 'one-pieces'
                                                ? 'bg-violet-500/20 text-violet-300 shadow-lg'
                                                : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 2a1 1 0 011 1v1h3V3a1 1 0 011-1h2a1 1 0 011 1v1h1a1 1 0 011 1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a1 1 0 011-1h1V3a1 1 0 011-1h2z" />
                                        </svg>
                                        <span className="text-[9px] font-bold uppercase tracking-wider">Overall</span>
                                    </button>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="w-full mt-2">
                                {state === 'succeeded' && resultUrl ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            clearResult();
                                        }}
                                        className="w-full py-4 rounded-2xl glass glass-hover text-sm font-bold uppercase tracking-[0.2em] transition-all shadow-xl"
                                    >
                                        Try Again
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => generate(quality, modelType, modelType === 'fal' ? falCategory : undefined)}
                                        disabled={!canGenerate}
                                        className={`w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl
                                 ${canGenerate
                                                ? 'gradient-primary text-white shadow-violet-500/20'
                                                : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5'}`}
                                    >
                                        {state === 'generating' ? 'Drafting...' : 'Reveal'}
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {/* Result Preview - NOW BELOW CONTROLS */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">04 / Result</span>
                            </div>
                            <div className="aspect-[3/4.5] rounded-[2rem] bg-zinc-900/40 border border-white/5 overflow-hidden relative">
                                <AnimatePresence mode="wait">
                                    {state === 'generating' ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/20"
                                        >
                                            <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden relative">
                                                <motion.div
                                                    className="absolute inset-0 gradient-primary"
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                                />
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-violet-400 mt-6 animate-pulse">Processing</p>
                                        </motion.div>
                                    ) : resultUrl ? (
                                        <motion.div
                                            key="result"
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-full h-full"
                                        >
                                            <img
                                                src={resultUrl}
                                                alt="Creation"
                                                onLoad={() => setIsImageLoading(false)}
                                                className={`w-full h-full object-cover shadow-2xl transition-all duration-700 ease-in-out
                                                ${isImageLoading ? 'blur-xl scale-105' : 'blur-0 scale-100'}`}
                                            />
                                            {/* Save to Gallery Button - Top Right */}
                                            <Link
                                                to="/studio/history"
                                                className="absolute top-4 right-4 glass px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                                <span className="hidden sm:inline">Gallery</span>
                                            </Link>
                                        </motion.div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800">
                                            <svg className="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.3em]">Awaiting Creation</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Camera Modal */}
            <AnimatePresence>
                {showCamera && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                            {!isCapturing && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-violet-500 border-t-transparent" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-6 mt-8">
                            <button
                                onClick={handleCloseCamera}
                                className="px-8 py-4 rounded-2xl glass text-white font-bold text-[10px] uppercase tracking-[0.2em]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCameraCapture}
                                disabled={!isCapturing}
                                className="px-8 py-4 rounded-2xl gradient-primary text-white font-bold text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 shadow-xl shadow-violet-500/20"
                            >
                                Capture
                            </button>
                        </div>

                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-6">
                            Position yourself in the frame
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

