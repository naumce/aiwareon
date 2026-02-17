import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useWardrobeStore } from '../stores/wardrobeStore';
import { type WardrobeCategory, EXAMPLE_WARDROBE_ITEMS } from '../services/wardrobeService';
import { compressForWardrobe } from '../utils/imageOptimizer';
import { getDisplayUrl } from '../utils/imageUrl';
import { categorizeItem, ALL_CATEGORIES, getCategoryGroup, type CategoryResult } from '../services/categorizeService';

const CATEGORIES: { id: WardrobeCategory | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'tops', label: 'Tops', icon: '👕' },
    { id: 'bottoms', label: 'Bottoms', icon: '👖' },
    { id: 'dresses', label: 'Dresses', icon: '👗' },
    { id: 'outerwear', label: 'Outerwear', icon: '🧥' },
    { id: 'bags', label: 'Bags', icon: '👜' },
    { id: 'glasses', label: 'Glasses', icon: '👓' },
    { id: 'heels', label: 'Heels', icon: '👠' },
    { id: 'sneakers', label: 'Sneakers', icon: '👟' },
];

export function WardrobePage() {
    const { user } = useAuthStore();
    const { isLoading, selectedCategory, fetchItems, addItem, removeItem, setCategory, getFilteredItems } = useWardrobeStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Upload state
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);

    // AI categorization state
    const [aiResult, setAiResult] = useState<CategoryResult | null>(null);
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [selectedCat, setSelectedCat] = useState<WardrobeCategory | null>(null);

    useEffect(() => {
        if (user) {
            fetchItems(user.id);
        }
    }, [user, fetchItems]);

    // Upload button click
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Camera button click
    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };

    // After selecting file, compress and AI categorize
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        e.target.value = '';
        setIsCompressing(true);

        try {
            // Read file as data URL
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Compress the image
            const optimized = await compressForWardrobe(dataUrl);
            console.log(`Image compressed: ${Math.round(optimized.originalSize / 1024)}KB → ${Math.round(optimized.optimizedSize / 1024)}KB`);

            setPendingImage(optimized.dataUrl);
            setPendingBlob(optimized.blob);
            setIsCompressing(false);

            // AI categorize
            setIsCategorizing(true);
            const result = await categorizeItem(optimized.dataUrl);
            setAiResult(result);
            setSelectedCat(result.category as WardrobeCategory);
            setIsCategorizing(false);
        } catch (error) {
            console.error('Error processing image:', error);
            setIsCompressing(false);
            setIsCategorizing(false);
        }
    };

    // Confirm and save item
    const handleConfirmAdd = async () => {
        if (!user || !pendingBlob || !selectedCat) return;

        setIsAdding(true);
        const name = aiResult?.suggestedName || `New ${selectedCat}`;
        const categoryGroup = getCategoryGroup(selectedCat);

        await addItem(
            user.id,
            name,
            selectedCat,
            categoryGroup,
            pendingBlob,
            true, // ai_suggested
            aiResult?.confidence
        );

        // Reset state
        setPendingImage(null);
        setPendingBlob(null);
        setAiResult(null);
        setSelectedCat(null);
        setIsAdding(false);
    };

    // Cancel pending upload
    const handleCancelUpload = () => {
        setPendingImage(null);
        setPendingBlob(null);
        setAiResult(null);
        setSelectedCat(null);
    };

    const handleDeleteItem = async (itemId: string) => {
        await removeItem(itemId);
    };

    const filteredItems = getFilteredItems();
    const userItems = filteredItems.filter(item => !item.is_example);

    const exampleItems = selectedCategory === 'all'
        ? EXAMPLE_WARDROBE_ITEMS
        : EXAMPLE_WARDROBE_ITEMS.filter(item => item.category === selectedCategory);

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto">

                {/* COMPRESSING INDICATOR */}
                <AnimatePresence>
                    {(isCompressing || isCategorizing) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="glass rounded-3xl p-4 border border-[#C9A0FF]/30 flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-[#888]">
                                    {isCompressing ? 'Optimizing image...' : 'AI detecting category...'}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* PENDING UPLOAD - AI Category Confirmation */}
                <AnimatePresence>
                    {pendingImage && aiResult && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="glass rounded-3xl p-4 border border-[#C9A0FF]/30">
                                <div className="flex gap-4">
                                    {/* Preview */}
                                    <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 ring-2 ring-[#C9A0FF]">
                                        <img src={pendingImage} alt="New item" className="w-full h-full object-cover" />
                                    </div>

                                    {/* AI Result + Category Picker */}
                                    <div className="flex-1">
                                        {/* AI Detected */}
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
                                            ✨ AI Detected: {aiResult.suggestedName}
                                        </p>

                                        {/* Category Selector */}
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {ALL_CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setSelectedCat(cat.id as WardrobeCategory)}
                                                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1
                                                        ${selectedCat === cat.id
                                                            ? 'bg-[#C9A0FF] text-[#1A1A2E] ring-2 ring-[#C9A0FF]'
                                                            : 'bg-black/[0.04] text-[#888] hover:bg-black/[0.08]'}`}
                                                >
                                                    <span>{cat.emoji}</span>
                                                    <span className="hidden sm:inline">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleConfirmAdd}
                                                disabled={isAdding || !selectedCat}
                                                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#C9A0FF] to-[#FF8FAB] text-[#1A1A2E] hover:scale-[1.02] transition-transform disabled:opacity-50"
                                            >
                                                {isAdding ? 'Saving...' : '✓ Add to Wardrobe'}
                                            </button>
                                            <button
                                                onClick={handleCancelUpload}
                                                className="px-3 py-2 text-xs text-[#AAA] hover:text-[#1A1A2E] uppercase tracking-wider"
                                            >
                                                ✕ Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Category Filter + Add Buttons Combined */}
                <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex gap-2 min-w-max">
                        {/* UPLOAD BUTTON */}
                        <button
                            onClick={handleUploadClick}
                            className="px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#C9A0FF] to-[#FF8FAB] text-[#1A1A2E] shadow-lg shadow-[#C9A0FF]/25 flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Upload</span>
                        </button>

                        {/* CAMERA BUTTON */}
                        <button
                            onClick={handleCameraClick}
                            className="px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#FF8FAB] to-[#FAD390] text-[#1A1A2E] shadow-lg shadow-[#FF8FAB]/25 flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Camera</span>
                        </button>

                        {/* Category filters */}
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                                    ${selectedCategory === cat.id
                                        ? 'bg-black/[0.06] text-[#1A1A2E] ring-1 ring-[#AAA]/30'
                                        : 'glass text-[#888] hover:text-[#1A1A2E] hover:bg-black/[0.06]'}`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* My Items Section */}
                {userItems.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-[10px] font-bold text-[#AAA] uppercase tracking-widest mb-4 px-1">
                            My Pieces ({userItems.length})
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {userItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-black/[0.06] bg-gray-50 hover:border-[#FF8FAB]/50 transition-all duration-300"
                                >
                                    <img
                                        src={getDisplayUrl(item.image_url, 'thumbnail')}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />

                                    {/* Category Badge - Always visible */}
                                    <div className="absolute bottom-1.5 left-1.5 right-1.5">
                                        <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                                            <span className="text-[9px] font-bold text-[#1A1A2E] uppercase tracking-wider">{item.category}</span>
                                        </div>
                                    </div>

                                    {/* Delete Button - On hover */}
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                                    >
                                        <svg className="w-3.5 h-3.5 text-[#1A1A2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Example Items Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-[10px] font-bold text-[#AAA] uppercase tracking-widest px-1">Inspiration</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-black/[0.06] to-transparent" />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {exampleItems.map((item, index) => (
                            <motion.div
                                key={`example-${index}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-black/[0.04] bg-gray-50 opacity-70 hover:opacity-100 transition-opacity"
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-1.5 left-1.5 right-1.5">
                                    <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                                        <span className="text-[9px] font-bold text-[#888] uppercase tracking-wider">{item.category}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Empty State */}
                {userItems.length === 0 && !isLoading && !pendingImage && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C9A0FF]/15 to-[#FF8FAB]/15 flex items-center justify-center">
                            <span className="text-3xl">👗</span>
                        </div>
                        <h3 className="text-base font-bold text-[#1A1A2E] mb-1">Start your wardrobe</h3>
                        <p className="text-sm text-[#AAA] mb-4">Upload or snap your first piece</p>
                        <button
                            onClick={handleUploadClick}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#C9A0FF] to-[#FF8FAB] text-[#1A1A2E] font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#C9A0FF]/25"
                        >
                            + Add First Piece
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
