'use client';

import React, { useCallback, useState } from 'react';
import { Upload, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface UploadZoneProps {
    onUpload: (file: File) => void;
    isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, isProcessing }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'application/zip' || file.name.endsWith('.zip'))) {
            onUpload(file);
        }
    }, [onUpload]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 text-center h-[400px]",
                isDragging
                    ? "border-blue-500 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.1)] scale-[1.02]"
                    : "border-white/10 hover:border-white/20 bg-white/[0.02]",
                isProcessing && "opacity-50 pointer-events-none grayscale"
            )}
        >
            <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isProcessing}
            />

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-blue-500/5">
                <Upload className="w-10 h-10 text-blue-400" />
            </div>

            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                {isProcessing ? "Reading Project Structure..." : "Deploy Source Code"}
            </h3>
            <p className="text-gray-400 text-sm max-w-[280px] leading-relaxed mb-8">
                Drag and drop your WeChat Mini Program <span className="text-blue-400 font-mono">.zip</span> archive here.
            </p>

            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-black/40 px-5 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                <span>Local Secure Processing Environment</span>
            </div>
        </motion.div>
    );
};
