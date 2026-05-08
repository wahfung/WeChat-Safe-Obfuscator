'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileCode, Zap, HardDrive, BarChart3 } from 'lucide-react';
import { ProcessedFile } from '@/types';

interface StatsPanelProps {
    files: ProcessedFile[];
}

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const StatsPanel: React.FC<StatsPanelProps> = ({ files }) => {
    const totalFiles = files.length;
    const originalSize = files.reduce((acc, f) => acc + (f.originalSize || 0), 0);
    const obfuscatedSize = files.reduce((acc, f) => acc + (f.obfuscatedSize || f.originalSize || 0), 0);

    const compressionRatio = originalSize > 0
        ? ((obfuscatedSize / originalSize) * 100).toFixed(1)
        : '100';

    const stats = [
        { label: '文件总数', value: totalFiles, icon: FileCode, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: '源码体积', value: formatSize(originalSize), icon: HardDrive, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: '保护后体积', value: formatSize(obfuscatedSize), icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: '体积比率', value: `${compressionRatio}%`, icon: BarChart3, color: 'text-green-400', bg: 'bg-green-500/10' },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.05] transition-colors group"
                >
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</span>
                    </div>
                    <div className="text-xl font-black text-white tabular-nums tracking-tight">
                        {stat.value}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
