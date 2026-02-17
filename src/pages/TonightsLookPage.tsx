import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useWardrobeStore } from '../stores/wardrobeStore';
import { useGenerationStore } from '../stores/generationStore';
import { generateTryOn } from '../services/generationService';
import { getPersonImages, type PersonImage } from '../services/personImageService';
import { type WardrobeItem, type CategoryGroup } from '../services/wardrobeService';
import { getDisplayUrl } from '../utils/imageUrl';

const OCCASIONS = [
    { id: 'date', label: 'Date Night' },
    { id: 'party', label: 'Party' },
    { id: 'formal', label: 'Formal' },
    { id: 'premiere', label: 'Premiere' },
    { id: 'special', label: 'Special' },
    { id: 'casual', label: 'Casual' },
];

// Outfit slots configuration
const OUTFIT_SLOTS = [
    { id: 'clothing', label: 'Outfit', emoji: '👗', group: 'clothing' as CategoryGroup },
    { id: 'bag', label: 'Bag', emoji: '👜', group: 'accessories' as CategoryGroup },
    { id: 'accessory', label: 'Accessory', emoji: '👓', group: 'accessories' as CategoryGroup },
];

type FlowStep = 'occasion' | 'photo' | 'build' | 'result';

interface SelectedItems {
    clothing: WardrobeItem | null;
    bag: WardrobeItem | null;
    accessory: WardrobeItem | null;
}

export function TonightsLookPage() {
    const { user } = useAuthStore();
    const { fetchItems, items } = useWardrobeStore();
    const { setPersonImage, setDressImage, personImage, resultUrl, error } = useGenerationStore();

    const [step, setStep] = useState<FlowStep>('occasion');
    const [_occasion, setOccasion] = useState<string | null>(null);
    const [savedPhotos, setSavedPhotos] = useState<PersonImage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Multi-slot selection
    const [selectedItems, setSelectedItems] = useState<SelectedItems>({
        clothing: null,
        bag: null,
        accessory: null
    });
    const [activeSlot, setActiveSlot] = useState<keyof SelectedItems>('clothing');

    // Fetch wardrobe items and saved photos
    useEffect(() => {
        if (user) {
            fetchItems(user.id);
            getPersonImages(user.id).then(setSavedPhotos);
        }
    }, [user, fetchItems]);

    // Get user's items only (no examples) filtered by category group
    const userClothing = items.filter(item => !item.is_example && item.category_group === 'clothing');
    const userAccessories = items.filter(item => !item.is_example && item.category_group === 'accessories');

    // Get items for current active slot
    const getItemsForSlot = (slot: keyof SelectedItems): WardrobeItem[] => {
        if (slot === 'clothing') return userClothing;
        // For bag and accessory slots, show all accessories
        return userAccessories;
    };

    const currentSlotItems = getItemsForSlot(activeSlot);

    const handleOccasionSelect = (id: string) => {
        setOccasion(id);
        setStep('photo');
    };

    const handlePhotoSelect = (url: string) => {
        setPersonImage(url);
        setStep('build');
    };

    const handleSelectItem = (item: WardrobeItem) => {
        setSelectedItems(prev => ({
            ...prev,
            [activeSlot]: prev[activeSlot]?.id === item.id ? null : item
        }));
    };

    const handleTryOn = async () => {
        if (!personImage || !selectedItems.clothing || !user) return;

        setIsGenerating(true);

        // Use main clothing item for try-on
        const garmentUrl = selectedItems.clothing.image_url.startsWith('http')
            ? selectedItems.clothing.image_url
            : getDisplayUrl(selectedItems.clothing.image_url, 'full');
        setDressImage(garmentUrl);

        try {
            await generateTryOn({
                personImageBase64: personImage,
                dressImageBase64: garmentUrl,
                quality: 'standard'
            });
            setStep('result');
        } catch (err) {
            console.error('Generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setStep('occasion');
        setOccasion(null);
        setPersonImage('');
        setDressImage('');
        setSelectedItems({ clothing: null, bag: null, accessory: null });
        setActiveSlot('clothing');
    };

    const selectedCount = Object.values(selectedItems).filter(Boolean).length;
    const hasClothing = selectedItems.clothing !== null;

    return (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold mb-2">
                        <span className="text-[#1A1A2E]">Tonight's</span>
                        <span className="bg-gradient-to-r from-[#C9A0FF] to-[#FF8FAB] bg-clip-text text-transparent"> Look</span>
                    </h1>
                    <p className="text-[#AAA] text-sm">Build your perfect outfit</p>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                    {['occasion', 'photo', 'build', 'result'].map((s, i) => (
                        <div
                            key={s}
                            className={`w-2 h-2 rounded-full transition-all ${step === s ? 'w-6 bg-[#C9A0FF]' :
                                ['occasion', 'photo', 'build', 'result'].indexOf(step) > i ? 'bg-[#C9A0FF]' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Occasion */}
                    {step === 'occasion' && (
                        <motion.div
                            key="occasion"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <p className="text-center text-[#888] text-sm uppercase tracking-widest">What's the occasion?</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {OCCASIONS.map((occ) => (
                                    <button
                                        key={occ.id}
                                        onClick={() => handleOccasionSelect(occ.id)}
                                        className="py-8 px-4 rounded-2xl bg-black/[0.03] backdrop-blur-sm hover:bg-black/[0.06] transition-all border border-black/[0.06] hover:border-black/[0.1]"
                                    >
                                        <div className="text-[#1A1A2E] font-medium text-base">{occ.label}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Photo Selection */}
                    {step === 'photo' && (
                        <motion.div
                            key="photo"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <p className="text-center text-[#888] text-sm uppercase tracking-widest">Choose your photo</p>

                            {savedPhotos.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {savedPhotos.map((photo) => (
                                        <button
                                            key={photo.id}
                                            onClick={() => handlePhotoSelect(photo.url || '')}
                                            className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-black/[0.06] hover:border-[#C9A0FF] transition-all hover:scale-105"
                                        >
                                            <img src={photo.url} alt="Saved" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 glass rounded-2xl">
                                    <p className="text-[#AAA]">No saved photos yet</p>
                                    <p className="text-[#BBB] text-sm mt-2">Upload one in the Atelier first</p>
                                </div>
                            )}

                            <button
                                onClick={() => setStep('occasion')}
                                className="w-full py-3 text-[#AAA] hover:text-[#1A1A2E] text-sm uppercase tracking-widest transition-colors"
                            >
                                ← Back
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: Build Outfit */}
                    {step === 'build' && (
                        <motion.div
                            key="build"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* Outfit Slots */}
                            <div className="flex gap-2 justify-center mb-4">
                                {OUTFIT_SLOTS.map((slot) => {
                                    const selected = selectedItems[slot.id as keyof SelectedItems];
                                    const isActive = activeSlot === slot.id;
                                    return (
                                        <button
                                            key={slot.id}
                                            onClick={() => setActiveSlot(slot.id as keyof SelectedItems)}
                                            className={`relative w-20 h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1
                                                ${isActive ? 'border-[#C9A0FF] bg-[#C9A0FF]/20' : 'border-black/[0.06] bg-black/[0.03]'}
                                                ${selected ? 'ring-2 ring-emerald-400' : ''}`}
                                        >
                                            {selected ? (
                                                <img
                                                    src={selected.image_url.startsWith('http')
                                                        ? selected.image_url
                                                        : getDisplayUrl(selected.image_url, 'thumbnail')}
                                                    alt={selected.name}
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                            ) : (
                                                <>
                                                    <span className="text-2xl">{slot.emoji}</span>
                                                    <span className="text-[10px] text-[#AAA] uppercase">{slot.label}</span>
                                                </>
                                            )}
                                            {selected && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center text-xs">✓</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Items Grid */}
                            <div className="glass rounded-2xl p-4">
                                <p className="text-[10px] font-bold text-[#AAA] uppercase tracking-widest mb-3">
                                    Select {activeSlot === 'clothing' ? 'Outfit' : activeSlot === 'bag' ? 'Bag' : 'Accessory'}
                                </p>

                                {currentSlotItems.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                        {currentSlotItems.map((item) => {
                                            const isSelected = selectedItems[activeSlot]?.id === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleSelectItem(item)}
                                                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all
                                                        ${isSelected ? 'border-[#C9A0FF] ring-2 ring-[#C9A0FF]' : 'border-black/[0.06] hover:border-black/[0.15]'}`}
                                                >
                                                    <img
                                                        src={item.image_url.startsWith('http')
                                                            ? item.image_url
                                                            : getDisplayUrl(item.image_url, 'thumbnail')}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-[#BBB] text-sm">
                                        No {activeSlot === 'clothing' ? 'clothing' : 'accessories'} in your wardrobe yet
                                    </div>
                                )}
                            </div>

                            {/* Selected Summary */}
                            {selectedCount > 0 && (
                                <div className="text-center text-xs text-[#AAA]">
                                    {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('photo')}
                                    className="flex-1 py-4 rounded-2xl glass text-[#888] hover:text-[#1A1A2E] font-bold uppercase tracking-wider transition-colors"
                                >
                                    ← Photo
                                </button>
                                <button
                                    onClick={handleTryOn}
                                    disabled={isGenerating || !hasClothing}
                                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#C9A0FF] to-[#FF8FAB] text-[#1A1A2E] font-bold uppercase tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-50"
                                >
                                    {isGenerating ? 'Creating...' : '✨ Try It On'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Result */}
                    {step === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <p className="text-center text-[#888] text-sm uppercase tracking-widest">Your Look is Ready!</p>

                            {resultUrl ? (
                                <div className="aspect-[3/4] rounded-3xl overflow-hidden border-2 border-[#C9A0FF] shadow-2xl shadow-[#C9A0FF]/20">
                                    <img src={resultUrl} alt="Your Look" className="w-full h-full object-cover" />
                                </div>
                            ) : error ? (
                                <div className="glass rounded-2xl p-8 text-center">
                                    <p className="text-red-400">{typeof error === 'string' ? error : error?.message || 'Something went wrong'}</p>
                                </div>
                            ) : (
                                <div className="aspect-[3/4] rounded-3xl glass flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-[#C9A0FF] border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('build')}
                                    className="flex-1 py-4 rounded-2xl glass text-[#888] hover:text-[#1A1A2E] font-bold uppercase tracking-wider transition-colors"
                                >
                                    ← Try Another
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#C9A0FF] to-[#FF8FAB] text-[#1A1A2E] font-bold uppercase tracking-wider hover:scale-[1.02] transition-transform"
                                >
                                    ✨ Start Over
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
