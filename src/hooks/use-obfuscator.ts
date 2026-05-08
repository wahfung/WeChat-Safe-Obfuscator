import { useState, useEffect, useRef, useCallback } from 'react';
import { ProcessedFile } from '@/types';

export function useObfuscator() {
    const [isObfuscating, setIsObfuscating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<ProcessedFile[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Initialize worker using URL constructor for Next.js compatibility
        const worker = new Worker(new URL('../workers/obfuscator.worker.ts', import.meta.url));
        workerRef.current = worker;

        return () => {
            worker.terminate();
        };
    }, []);

    const obfuscate = useCallback((files: ProcessedFile[], options?: any) => {
        if (!workerRef.current) return;

        setIsObfuscating(true);
        setProgress(0);
        setResult(null);
        setError(null);

        workerRef.current.onmessage = (event) => {
            const { type, progress, processedFiles, error: workerError } = event.data;

            if (type === 'progress') {
                setProgress(progress);
            } else if (type === 'success') {
                setResult(processedFiles);
                setIsObfuscating(false);
            } else if (type === 'error') {
                setError(workerError);
                setIsObfuscating(false);
            }
        };

        workerRef.current.onerror = (err) => {
            setError(`Worker thread error: ${err.message}`);
            setIsObfuscating(false);
        };

        workerRef.current.postMessage({ files, options });
    }, []);

    return {
        obfuscate,
        isObfuscating,
        progress,
        result,
        error,
    };
}
