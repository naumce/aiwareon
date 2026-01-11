import { useState, useRef, useCallback, type RefObject } from 'react';

type FacingMode = 'user' | 'environment';

interface UseCameraReturn {
    isSupported: boolean;
    isCapturing: boolean;
    capturedImage: string | null;
    facingMode: FacingMode;
    startCamera: (mode?: FacingMode) => Promise<void>;
    capturePhoto: () => Promise<string | null>;
    stopCamera: () => void;
    flipCamera: () => Promise<void>;
    error: string | null;
    videoRef: RefObject<HTMLVideoElement | null>;
}

export function useCamera(): UseCameraReturn {
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<FacingMode>('user');
    const videoRef = useRef<HTMLVideoElement>(null);

    const isSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

    const startCamera = useCallback(async (mode: FacingMode = facingMode) => {
        if (!isSupported) {
            setError('Camera not supported on this device');
            return;
        }

        try {
            setError(null);

            // Stop existing stream first
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mode,
                    width: { ideal: 1280 },
                    height: { ideal: 1920 }
                }
            });

            setStream(mediaStream);
            setFacingMode(mode);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }
            setIsCapturing(true);
        } catch (err) {
            console.error('Camera error:', err);
            setError('Failed to access camera. Please check permissions.');
            setIsCapturing(false);
        }
    }, [isSupported, facingMode, stream]);

    const flipCamera = useCallback(async () => {
        const newMode: FacingMode = facingMode === 'user' ? 'environment' : 'user';
        await startCamera(newMode);
    }, [facingMode, startCamera]);

    const capturePhoto = useCallback(async (): Promise<string | null> => {
        if (!videoRef.current || !stream) return null;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            // Mirror the image if using front camera
            if (facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(videoRef.current, 0, 0);
            const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);

            setCapturedImage(imageBase64);
            stopCamera();

            return imageBase64;
        } catch (err) {
            console.error('Capture error:', err);
            setError('Failed to capture photo');
            return null;
        }
    }, [stream, facingMode]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCapturing(false);
    }, [stream]);

    return {
        isSupported,
        isCapturing,
        capturedImage,
        facingMode,
        startCamera,
        capturePhoto,
        stopCamera,
        flipCamera,
        error,
        videoRef
    };
}
