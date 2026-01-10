import { create } from 'zustand';
import { PoseOption, QualityLevel, GenerationState } from '../types';

// Pose options with warm, fashion-forward descriptions
export const POSES: PoseOption[] = [
    {
        id: 'mirror',
        label: 'Mirror',
        imagePrompt: 'Mirror selfie',
        videoPrompt: 'Slow mirror sway',
        icon: '🪞'
    },
    {
        id: 'editorial',
        label: 'Editorial',
        imagePrompt: 'Editorial pose',
        videoPrompt: 'Elegantly static',
        icon: '📸'
    },
    {
        id: 'walk',
        label: 'Catwalk',
        imagePrompt: 'Walking pose',
        videoPrompt: 'Professional runway walk',
        icon: '👗'
    }
];

interface StudioState {
    // Upload state
    userPhoto: string | null;
    garmentPhoto: string | null;

    // Result state
    composite: string | null;
    videoUrl: string | null;

    // Options
    selectedPose: string;
    quality: QualityLevel;

    // Generation status
    status: GenerationState;

    // History (session-based)
    sessionHistory: string[];

    // Actions
    setUserPhoto: (photo: string | null) => void;
    setGarmentPhoto: (photo: string | null) => void;
    setComposite: (composite: string | null) => void;
    setVideoUrl: (url: string | null) => void;
    setSelectedPose: (poseId: string) => void;
    setQuality: (quality: QualityLevel) => void;
    setStatus: (status: Partial<GenerationState>) => void;
    clearError: () => void;
    addToHistory: (imageUrl: string) => void;
    reset: () => void;

    // Helpers
    getSelectedPose: () => PoseOption;
    getCost: () => number;
    canGenerate: () => boolean;
}

const initialStatus: GenerationState = {
    isProcessing: false,
    progressMessage: '',
    error: null,
};

export const useStudioStore = create<StudioState>((set, get) => ({
    userPhoto: null,
    garmentPhoto: null,
    composite: null,
    videoUrl: null,
    selectedPose: 'mirror',
    quality: 'standard',
    status: initialStatus,
    sessionHistory: [],

    setUserPhoto: (photo) => set({ userPhoto: photo }),
    setGarmentPhoto: (photo) => set({ garmentPhoto: photo }),
    setComposite: (composite) => set({ composite }),
    setVideoUrl: (url) => set({ videoUrl: url }),
    setSelectedPose: (poseId) => set({ selectedPose: poseId }),
    setQuality: (quality) => set({ quality }),

    setStatus: (statusUpdate) => set((state) => ({
        status: { ...state.status, ...statusUpdate }
    })),

    clearError: () => set((state) => ({
        status: { ...state.status, error: null }
    })),

    addToHistory: (imageUrl) => set((state) => ({
        sessionHistory: [imageUrl, ...state.sessionHistory].slice(0, 12)
    })),

    reset: () => set({
        userPhoto: null,
        garmentPhoto: null,
        composite: null,
        videoUrl: null,
        status: initialStatus,
    }),

    getSelectedPose: () => {
        const { selectedPose } = get();
        return POSES.find(p => p.id === selectedPose) || POSES[0];
    },

    getCost: () => {
        const { quality } = get();
        return quality === 'studio' ? 2 : 1;
    },

    canGenerate: () => {
        const { userPhoto, garmentPhoto, status } = get();
        return !!(userPhoto && garmentPhoto && !status.isProcessing);
    },
}));
