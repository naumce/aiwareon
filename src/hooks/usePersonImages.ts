import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getPersonImages, type PersonImage } from '../services/personImageService';

export function usePersonImages() {
    const { user } = useAuthStore();
    const [savedImages, setSavedImages] = useState<PersonImage[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchImages = async () => {
        if (!user) {
            setSavedImages([]);
            return;
        }

        setLoading(true);
        const images = await getPersonImages(user.id, 3);
        setSavedImages(images);
        setLoading(false);
    };

    useEffect(() => {
        fetchImages();
    }, [user]);

    return {
        savedImages,
        loading,
        refreshImages: fetchImages
    };
}
