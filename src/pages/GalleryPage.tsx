import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useAuthStore } from '../stores/authStore';
import { useCreditStore } from '../stores/creditStore';

interface MediaItem {
    id: string;
    object_path: string;
    kind: string;
    created_at: string;
    generation_id: string;
}

export function GalleryPage() {
    const { user } = useAuthStore();
    const { fetchBalance } = useCreditStore();
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        fetchBalance();
        fetchMediaItems();
    }, [fetchBalance, currentPage]);

    const fetchMediaItems = async () => {
        if (!user || !supabase) return;

        setLoading(true);

        // Get total count
        const { count } = await supabase
            .from('media_items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('kind', 'result');

        setTotalCount(count || 0);

        // Get paginated data
        const { data, error } = await supabase
            .from('media_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('kind', 'result')
            .order('created_at', { ascending: false })
            .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

        if (error) {
            console.error('Error fetching media items:', error);
            setLoading(false);
            return;
        }

        setMediaItems(data || []);

        // Fetch signed URLs for each image
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

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 shrink-0">
                <h2 className="text-2xl font-bold tracking-tight uppercase italic">Gallery</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Your Creations</p>
            </div>

            <div className="flex-1 p-8 pt-0 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-violet-500 border-t-transparent" />
                    </div>
                ) : mediaItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <svg className="w-20 h-20 mb-4 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-zinc-600 font-bold text-sm uppercase tracking-widest mb-4">No Creations Yet</p>
                        <Link
                            to="/studio"
                            className="px-6 py-3 rounded-2xl gradient-primary text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                        >
                            Create Your First Look
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {mediaItems.map((item) => {
                            const url = imageUrls.get(item.id);
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900/40 border border-white/5 cursor-pointer hover:border-violet-500/30 transition-all"
                                >
                                    {url ? (
                                        <>
                                            <img
                                                src={url}
                                                alt="Creation"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && totalCount > ITEMS_PER_PAGE && (
                    <div className="mt-8 flex items-center justify-center gap-6">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            className="px-6 py-3 rounded-2xl glass text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ← Previous
                        </button>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                            Page {currentPage + 1} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE) - 1, p + 1))}
                            disabled={currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE) - 1}
                            className="px-6 py-3 rounded-2xl glass text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
