
import { useState, useEffect, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraReady(false);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsCameraReady(false);
    if (stream) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(playErr => {
              console.error("Error attempting to play video:", playErr);
              setError("Could not start video playback.");
          });
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err instanceof Error) {
        setError(`Error accessing camera: ${err.message}. Please grant permission.`);
      } else {
        setError('An unknown error occurred while accessing the camera.');
      }
    }
  }, [stream]);

  const captureFrame = useCallback((): { base64: string; dataUrl: string; mimeType: string } | null => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('Video dimensions are not available yet.');
        setError('Cannot capture frame, video not ready.');
        return null;
      }
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.9);
        return { base64: dataUrl.split(',')[1], dataUrl, mimeType };
      }
    }
    return null;
  }, [isCameraReady]);
  
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { videoRef, canvasRef, stream, error, isCameraReady, startCamera, stopCamera, captureFrame };
};
