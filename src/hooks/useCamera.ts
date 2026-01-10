import { useState, useRef, useCallback, RefObject } from 'react';

interface UseCameraReturn {
    isSupported: boolean;
    isCapturing: boolean;
    capturedImage: string | null;
    startCamera: () => Promise<void>;
    capturePhoto: () => Promise<string | null>;
    stopCamera: () => void;
    error: string | null;
    videoRef: RefObject<HTMLVideoElement>;
}

export function useCamera(): UseCameraReturn {
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const isSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

    const startCamera = useCallback(async () => {
        if (!isSupported) {
            setError('Camera not supported on this device');
            return;
        }

        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user', // Front camera
                    width: { ideal: 1280 },
                    height: { ideal: 1920 }
                }
            });

            setStream(mediaStream);
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
    }, [isSupported]);

    const capturePhoto = useCallback(async (): Promise<string | null> => {
        if (!videoRef.current || !stream) return null;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

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
    }, [stream]);

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
        startCamera,
        capturePhoto,
        stopCamera,
        error,
        videoRef
    };
}
