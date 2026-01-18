import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useWardrobeStore } from '../stores/wardrobeStore';
import { EXAMPLE_WARDROBE_ITEMS, type WardrobeCategory } from '../services/wardrobeService';
import { compressForWardrobe } from '../utils/imageOptimizer';
import { getDisplayUrl } from '../utils/imageUrl';

const CATEGORIES: { id: WardrobeCategory | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'tops', label: 'Tops', icon: '👕' },
    { id: 'bottoms', label: 'Bottoms', icon: '👖' },
    { id: 'dresses', label: 'Dresses', icon: '👗' },
    { id: 'outerwear', label: 'Outerwear', icon: '🧥' },
    { id: 'shoes', label: 'Shoes', icon: '👟' },
    { id: 'accessories', label: 'Accessories', icon: '👜' },
];

export function WardrobePage() {
    const { user } = useAuthStore();
    const { isLoading, selectedCategory, fetchItems, addItem, removeItem, setCategory, getFilteredItems } = useWardrobeStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Simplified state - just track pending upload for category selection
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);

    useEffect(() => {
        if (user) {
            fetchItems(user.id);
        }
    }, [user, fetchItems]);

    // SIMPLIFIED: Tap "Upload" → opens file picker directly
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Tap "Camera" → opens native camera
    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };

    // After selecting file, compress and show quick category picker
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input so same file can be selected again
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
        } catch (error) {
            console.error('Error compressing image:', error);
        } finally {
            setIsCompressing(false);
        }
    };

    // SIMPLIFIED: One tap on category → saves item instantly with auto-generated name
    const handleQuickAdd = async (category: WardrobeCategory) => {
        if (!user || !pendingBlob) return;

        setIsAdding(true);
        const categoryLabel = CATEGORIES.find(c => c.id === category)?.label || category;
        const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const autoName = `${categoryLabel} • ${timestamp}`;

        await addItem(user.id, autoName, category, pendingBlob);
        setPendingImage(null);
        setPendingBlob(null);
        setIsAdding(false);
    };

    // Cancel pending upload
    const handleCancelUpload = () => {
        setPendingImage(null);
        setPendingBlob(null);
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
        <div className="flex-1 p-4 md:p-8 pt-0 overflow-y-auto">
            <div className="max-w-6xl mx-auto">

                {/* COMPRESSING INDICATOR */}
                <AnimatePresence>
                    {isCompressing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="glass rounded-3xl p-4 border border-violet-500/30 flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-zinc-400">Optimizing image...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* PENDING UPLOAD - Inline Category Quick Picker */}
                <AnimatePresence>
                    {pendingImage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="glass rounded-3xl p-4 border border-violet-500/30">
                                <div className="flex gap-4">
                                    {/* Preview */}
                                    <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 ring-2 ring-violet-500">
                                        <img src={pendingImage} alt="New item" className="w-full h-full object-cover" />
                                    </div>

                                    {/* Category Quick Select */}
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-2">
                                            What type is this? (1 tap to save)
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => handleQuickAdd(cat.id as WardrobeCategory)}
                                                    disabled={isAdding}
                                                    className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-violet-500 text-white transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5"
                                                >
                                                    <span>{cat.icon}</span>
                                                    <span className="hidden sm:inline">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleCancelUpload}
                                            className="mt-2 text-[10px] text-zinc-500 hover:text-white uppercase tracking-wider"
                                        >
                                            ✕ Cancel
                                        </button>
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
                            className="px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/25 flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Upload</span>
                        </button>

                        {/* CAMERA BUTTON */}
                        <button
                            onClick={handleCameraClick}
                            className="px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg shadow-pink-500/25 flex items-center gap-2 hover:scale-105 transition-transform"
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
                                        ? 'bg-white/20 text-white ring-1 ring-white/30'
                                        : 'glass text-zinc-400 hover:text-white hover:bg-white/10'}`}
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
                        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 px-1">
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
                                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50 hover:border-violet-500/50 transition-all duration-300"
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
                                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">{item.category}</span>
                                        </div>
                                    </div>

                                    {/* Delete Button - On hover */}
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                                    >
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Inspiration</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {exampleItems.map((item, index) => (
                            <motion.div
                                key={`example-${index}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-zinc-900/30 opacity-70 hover:opacity-100 transition-opacity"
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-1.5 left-1.5 right-1.5">
                                    <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{item.category}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Empty State */}
                {userItems.length === 0 && !isLoading && !pendingImage && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                            <span className="text-3xl">👗</span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">Start your wardrobe</h3>
                        <p className="text-sm text-zinc-500 mb-4">Upload or snap your first piece</p>
                        <button
                            onClick={handleUploadClick}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-violet-500/25"
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
