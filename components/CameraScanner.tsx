
import React, { useState, useCallback } from 'react';
import { useCamera } from '../hooks/useCamera';
import { performOcr } from '../services/geminiService';
import Spinner from './shared/Spinner';
import Card from './shared/Card';

const CameraScanner: React.FC = () => {
  const { videoRef, canvasRef, stream, error: cameraError, isCameraReady, startCamera, stopCamera, captureFrame } = useCamera();
  const [ocrResult, setOcrResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCaptureAndOcr = useCallback(async () => {
    const frame = captureFrame();
    if (frame) {
      stopCamera();
      setCapturedImage(frame.dataUrl);
      setIsLoading(true);
      setApiError(null);
      setOcrResult('');
      try {
        const result = await performOcr(frame.base64, frame.mimeType);
        setOcrResult(result);
      } catch (e) {
        setApiError('An unexpected error occurred during OCR.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [captureFrame, stopCamera]);

  const handleStartCamera = () => {
    setCapturedImage(null);
    setOcrResult('');
    setApiError(null);
    startCamera();
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Camera Scanner (OCR)</h1>
      <Card>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full max-w-lg aspect-video bg-gray-800 rounded-md overflow-hidden border border-gray-700 flex items-center justify-center relative">
             {stream && !isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 z-10">
                <Spinner />
                <p className="ml-2 text-gray-300">Starting camera...</p>
              </div>
            )}
            {stream ? (
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`} />
            ) : capturedImage ? (
              <img src={capturedImage} alt="Captured frame" className="w-full h-full object-contain" />
            ) : (
              <p className="text-gray-400">Camera is off</p>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {(cameraError || apiError) && <p className="text-red-400 text-center">{cameraError || apiError}</p>}
          
          <div className="flex space-x-4">
            {!stream ? (
              <button onClick={handleStartCamera} className="py-2 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors">Start Camera</button>
            ) : (
              <>
                <button onClick={stopCamera} className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors">Stop Camera</button>
                <button 
                  onClick={handleCaptureAndOcr} 
                  disabled={isLoading || !isCameraReady} 
                  className="py-2 px-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="Capture and Scan"
                >
                  {isLoading ? <Spinner /> : 'Capture & Scan'}
                </button>
              </>
            )}
          </div>
        </div>
      </Card>
      
      {(isLoading || ocrResult) && (
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Scan Result</h2>
          {isLoading && !ocrResult && <div className="flex justify-center p-8"><Spinner /></div>}
          {ocrResult && <pre className="whitespace-pre-wrap bg-gray-800/50 p-4 rounded-md text-gray-300 font-sans">{ocrResult}</pre>}
        </Card>
      )}
    </div>
  );
};

export default CameraScanner;
