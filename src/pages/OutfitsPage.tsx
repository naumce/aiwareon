import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useOutfitStore } from '../stores/outfitStore';
import { useWardrobeStore } from '../stores/wardrobeStore';
import { OCCASION_LABELS, type OutfitOccasion } from '../services/outfitService';
import { EXAMPLE_WARDROBE_ITEMS, type WardrobeItem } from '../services/wardrobeService';
import { getDisplayUrl } from '../utils/imageUrl';

const OCCASIONS = Object.entries(OCCASION_LABELS).map(([id, config]) => ({
    id: id as OutfitOccasion,
    ...config
}));

// Quick outfit templates for 1-tap creation
const QUICK_TEMPLATES = [
    { name: 'Date Night', occasion: 'date' as OutfitOccasion, emoji: '❤️' },
    { name: 'Gym Ready', occasion: 'training' as OutfitOccasion, emoji: '💪' },
    { name: 'Casual Day', occasion: 'casual' as OutfitOccasion, emoji: '😎' },
    { name: 'Work Mode', occasion: 'work' as OutfitOccasion, emoji: '💼' },
    { name: 'Night Out', occasion: 'night_out' as OutfitOccasion, emoji: '🌙' },
    { name: 'Beach Vibes', occasion: 'beach' as OutfitOccasion, emoji: '🏖️' },
];

export function OutfitsPage() {
    const { user } = useAuthStore();
    const { isLoading, selectedOccasion, fetchOutfits, addOutfit, removeOutfit, setOccasion, getFilteredOutfits } = useOutfitStore();
    const { items: wardrobeItems, fetchItems: fetchWardrobeItems } = useWardrobeStore();

    // Staging area - items being added to a new outfit
    const [stagingItems, setStagingItems] = useState<string[]>([]);
    const [stagingOccasion, setStagingOccasion] = useState<OutfitOccasion | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (user) {
            fetchOutfits(user.id);
            fetchWardrobeItems(user.id);
        }
    }, [user, fetchOutfits, fetchWardrobeItems]);

    // Quick template: 1-tap to start outfit with occasion pre-selected
    const handleQuickTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
        setStagingOccasion(template.occasion);
        setStagingItems([]);
    };

    // Toggle item in staging area
    const toggleStagingItem = (itemId: string) => {
        setStagingItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    // Save staging outfit - 1 tap
    const handleSaveOutfit = async () => {
        if (!user || !stagingOccasion || stagingItems.length === 0) return;

        setIsCreating(true);
        const occasionLabel = OCCASION_LABELS[stagingOccasion].label;
        const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const autoName = `${occasionLabel} • ${timestamp}`;

        await addOutfit(user.id, autoName, stagingOccasion, stagingItems);
        setStagingItems([]);
        setStagingOccasion(null);
        setIsCreating(false);
    };

    // Cancel staging
    const handleCancelStaging = () => {
        setStagingItems([]);
        setStagingOccasion(null);
    };

    const handleDeleteOutfit = async (outfitId: string) => {
        await removeOutfit(outfitId);
    };

    // All available items for the picker
    const allItems: (WardrobeItem | { id: string; name: string; category: string; image_url: string; is_example: boolean })[] = [
        ...wardrobeItems,
        ...EXAMPLE_WARDROBE_ITEMS.map((item, i) => ({ ...item, id: `example-${i}`, user_id: '', created_at: '' }))
    ];

    const filteredOutfits = getFilteredOutfits();
    const isStaging = stagingOccasion !== null;

    return (
        <div className="flex-1 p-4 md:p-8 pt-0 overflow-y-auto">
            <div className="max-w-6xl mx-auto">

                {/* STAGING MODE - Item Picker */}
                <AnimatePresence>
                    {isStaging && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="glass rounded-3xl p-4 border border-[#FF8FAB]/30">
                                {/* Staging Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{OCCASION_LABELS[stagingOccasion].emoji}</span>
                                        <span className="font-bold text-[#1A1A2E]">{OCCASION_LABELS[stagingOccasion].label} Outfit</span>
                                        <span className="text-xs text-[#AAA]">({stagingItems.length} items)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancelStaging}
                                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-black/[0.04] text-[#888] hover:bg-black/[0.08] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveOutfit}
                                            disabled={stagingItems.length === 0 || isCreating}
                                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF8FAB] to-[#FAD390] text-[#1A1A2E] disabled:opacity-50 shadow-lg"
                                        >
                                            {isCreating ? '...' : 'Save Outfit'}
                                        </button>
                                    </div>
                                </div>

                                {/* Item Grid - Tap to toggle */}
                                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">
                                    {allItems.map((item) => {
                                        const isSelected = stagingItems.includes(item.id);
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleStagingItem(item.id)}
                                                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200
                                                    ${isSelected
                                                        ? 'border-[#FF8FAB] ring-2 ring-[#FF8FAB]/40 scale-95'
                                                        : 'border-transparent hover:border-black/10'}`}
                                            >
                                                <img
                                                    src={getDisplayUrl(item.image_url, 'thumbnail')}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-[#FF8FAB]/30 flex items-center justify-center">
                                                        <div className="w-5 h-5 rounded-full bg-[#FF8FAB] flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-[#1A1A2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* QUICK TEMPLATES - 1-tap to start outfit */}
                {!isStaging && (
                    <div className="mb-8">
                        <h2 className="text-[10px] font-bold text-[#AAA] uppercase tracking-widest mb-3 px-1">
                            Quick Start (1 tap)
                        </h2>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {QUICK_TEMPLATES.map((template) => (
                                <button
                                    key={template.occasion}
                                    onClick={() => handleQuickTemplate(template)}
                                    className={`shrink-0 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${OCCASION_LABELS[template.occasion].color} hover:scale-105 shadow-lg`}
                                >
                                    <span className="text-lg">{template.emoji}</span>
                                    <span>{template.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Occasion Filter - Only show when not staging */}
                {!isStaging && filteredOutfits.length > 0 && (
                    <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex gap-2 min-w-max">
                            <button
                                onClick={() => setOccasion('all')}
                                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5
                                    ${selectedOccasion === 'all'
                                        ? 'bg-black/[0.06] text-[#1A1A2E]'
                                        : 'glass text-[#888] hover:text-[#1A1A2E]'}`}
                            >
                                <span>✨</span>
                                <span>All</span>
                            </button>
                            {OCCASIONS.map((occ) => (
                                <button
                                    key={occ.id}
                                    onClick={() => setOccasion(occ.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5
                                        ${selectedOccasion === occ.id
                                            ? occ.color
                                            : 'glass text-[#888] hover:text-[#1A1A2E]'}`}
                                >
                                    <span>{occ.emoji}</span>
                                    <span className="hidden sm:inline">{occ.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Outfits Grid */}
                {!isStaging && filteredOutfits.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                        {filteredOutfits.map((outfit) => {
                            const occasionConfig = OCCASION_LABELS[outfit.occasion];
                            return (
                                <motion.div
                                    key={outfit.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative glass rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[#FF8FAB]/10 transition-all"
                                >
                                    {/* Outfit Preview - 2x2 grid */}
                                    <div className="aspect-square relative overflow-hidden">
                                        {outfit.items && outfit.items.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-0.5 p-1 h-full">
                                                {outfit.items.slice(0, 4).map((item, i) => (
                                                    <div key={i} className="rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={getDisplayUrl(item.image_url, 'thumbnail')}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                ))}
                                                {outfit.items.length < 4 && Array(4 - outfit.items.length).fill(0).map((_, i) => (
                                                    <div key={`empty-${i}`} className="rounded-lg bg-gray-50" />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                <span className="text-2xl">{occasionConfig.emoji}</span>
                                            </div>
                                        )}

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDeleteOutfit(outfit.id)}
                                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <svg className="w-3.5 h-3.5 text-[#1A1A2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Outfit Info */}
                                    <div className="p-3">
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${occasionConfig.color} mb-1`}>
                                            <span className="text-[10px]">{occasionConfig.emoji}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-wider">{occasionConfig.label}</span>
                                        </div>
                                        <p className="text-xs font-bold text-[#1A1A2E] truncate">{outfit.name}</p>
                                        <p className="text-[10px] text-[#AAA]">{outfit.items?.length || 0} pieces</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!isStaging && filteredOutfits.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FF8FAB]/15 to-[#FAD390]/15 flex items-center justify-center">
                            <span className="text-3xl">✨</span>
                        </div>
                        <h3 className="text-base font-bold text-[#1A1A2E] mb-1">No outfits yet</h3>
                        <p className="text-sm text-[#AAA] mb-4">Tap a vibe above to create your first outfit</p>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-[#FF8FAB] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
