import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useAuthStore } from '../stores/authStore';

interface MediaItem {
    id: string;
    object_path: string;
    kind: string;
    created_at: string;
}

interface GalleryPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
    title?: string;
}

export function GalleryPicker({ isOpen, onClose, onSelect, title = 'Select from Gallery' }: GalleryPickerProps) {
    const { user } = useAuthStore();
    const [items, setItems] = useState<MediaItem[]>([]);
    const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && user) {
            fetchItems();
        }
    }, [isOpen, user]);

    const fetchItems = async () => {
        if (!user || !supabase) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('media_items')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20); // Limit to recent items for quick picking

        if (error) {
            console.error('Error fetching gallery:', error);
            setLoading(false);
            return;
        }

        setItems(data || []);

        // Sign URLs
        const urlMap = new Map<string, string>();
        for (const item of data || []) {
            const { data: signedUrl } = await supabase.storage
                .from('aiwear-media')
                .createSignedUrl(item.object_path, 3600);

            if (signedUrl?.signedUrl) {
                urlMap.set(item.id, signedUrl.signedUrl);
            }
        }
        setImageUrls(urlMap);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-black/90 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            No images found in your gallery.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {items.map((item) => {
                                const url = imageUrls.get(item.id);
                                if (!url) return null;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onSelect(url)}
                                        className="relative aspect-[3/4] group rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <img
                                            src={url}
                                            alt="Gallery item"
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-xs font-bold text-white bg-indigo-500/80 px-3 py-1 rounded-full">SELECT</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
