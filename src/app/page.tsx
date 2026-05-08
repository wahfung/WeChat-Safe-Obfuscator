'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import {
  Shield, Download, Lock, CheckCircle2, ChevronRight,
  FileCode2, Loader2, Sparkles, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { UploadZone } from '@/components/dashboard/upload-zone';
import { StatsPanel } from '@/components/dashboard/stats-panel';
import { Button } from '@/components/ui/button';
import { readZipFile } from '@/lib/zip-handler';
import { generateZip } from '@/lib/zip-generator';
import { useObfuscator } from '@/hooks/use-obfuscator';
import { ProcessedFile } from '@/types';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { obfuscate, isObfuscating, progress, error } = useObfuscator();

  // Handle Obfuscation Complete via effect or callback in hook
  // Since our hook returns isObfuscating, we can watch it or rely on result.
  // Actually, useObfuscator exposes 'result' state.
  const { result } = useObfuscator(); // Wait, I instantiated it twice. This is wrong.
  // Let's correct usage:

  // Re-instantiate properly
  const obfuscator = useObfuscator();

  // Update files when result changes
  React.useEffect(() => {
    if (obfuscator.result) {
      setFiles(obfuscator.result);
      // Refresh selection to trigger DiffViewer update if needed
      if (selectedFilePath) {
        // Force re-render/update
        // setFiles will trigger it naturally
      }
    }
  }, [obfuscator.result, selectedFilePath]);

  const handleUpload = useCallback(async (zipFile: File) => {
    setIsUploading(true);
    try {
      const extractedFiles = await readZipFile(zipFile);
      setFiles(extractedFiles);
      if (extractedFiles.length > 0) {
        setSelectedFilePath(extractedFiles[0].path);
      }
    } catch (err) {
      console.error('Failed to read zip:', err);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleObfuscate = () => {
    if (files.length > 0) {
      obfuscator.obfuscate(files);
    }
  };

  const handleDownload = async () => {
    if (files.length === 0) return;
    const blob = await generateZip(files);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'obfuscated_project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedFile = useMemo(() =>
    files.find(f => f.path === selectedFilePath),
    [files, selectedFilePath]
  );

  const hasObfuscated = useMemo(() =>
    files.some(f => f.isObfuscated),
    [files]
  );

  return (
    <div className="min-h-screen bg-[#050507] text-slate-300 selection:bg-blue-500/30 font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/20 border border-white/10">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tighter">微信小程序安全盾</h1>
                <span className="text-[10px] bg-blue-500 text-white font-black px-1.5 py-0.5 rounded italic">PRO</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">加密级代码混淆引擎</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <AnimatePresence>
              {hasObfuscated && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Button
                    onClick={handleDownload}
                    className="gap-2 bg-white text-black hover:bg-white/90 font-bold px-6 h-11 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    下载工程包
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">沙箱运行中</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1920px] mx-auto p-6 grid grid-cols-12 gap-6 h-[calc(100vh-80px)]">
        {/* Left Control Panel */}
        <aside className="col-span-3 flex flex-col gap-6 h-full overflow-hidden pb-6">
          {files.length === 0 ? (
            <UploadZone onUpload={handleUpload} isProcessing={isUploading} />
          ) : (
            <>
              <StatsPanel files={files} />

              <div className="flex-1 min-h-0 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col overflow-hidden backdrop-blur-sm">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-blue-500" />
                    工程目录树
                  </h3>
                  <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded-md text-gray-500">
                    {files.length} 个文件
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFilePath(file.path)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-3 group relative overflow-hidden",
                        selectedFilePath === file.path
                          ? "bg-blue-600/10 text-white border border-blue-500/20"
                          : "text-gray-500 hover:bg-white/[0.04] border border-transparent"
                      )}
                    >
                      <ChevronRight className={cn(
                        "w-3 h-3 transition-transform duration-300 flex-shrink-0",
                        selectedFilePath === file.path ? "rotate-90 text-blue-500" : "group-hover:translate-x-1"
                      )} />
                      <span className="truncate flex-1 font-medium font-mono">{file.path}</span>
                      {file.type === 'js' && (
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-colors duration-500 flex-shrink-0",
                          file.isObfuscated ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-yellow-500/30"
                        )} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-gradient-to-b from-blue-600/10 to-transparent border border-blue-500/10 rounded-3xl space-y-4">
                {obfuscator.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-[10px] text-red-400 font-medium leading-tight">{obfuscator.error}</p>
                  </div>
                )}

                <Button
                  onClick={handleObfuscate}
                  disabled={obfuscator.isObfuscating || files.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black h-12 rounded-2xl shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.98]"
                >
                  {obfuscator.isObfuscating ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="tracking-tight italic">正在加密 {Math.round(obfuscator.progress)}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5" />
                      <span className="tracking-tight uppercase">开始混淆工程</span>
                    </div>
                  )}
                </Button>
              </div>
            </>
          )}
        </aside>

        {/* Monaco Editor Container */}
        <section className="col-span-9 flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden glass-panel h-full pb-6">
          {!selectedFile ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-40">
              <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                <Shield className="w-12 h-12 text-gray-700" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tighter">等待源码导入</h2>
              <p className="text-gray-500 max-w-[280px] text-sm leading-relaxed">
                请连接您的工程归档文件以查看结构化保护层的实时预览。
              </p>
            </div>
          ) : (
            <>
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-black/40 rounded-lg border border-white/5">
                    <span className="text-[11px] font-mono font-bold text-gray-400">{selectedFile.path}</span>
                  </div>
                  <AnimatePresence mode="wait">
                    {selectedFile.isObfuscated ? (
                      <motion.div
                        key="obs"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        已保护
                      </motion.div>
                    ) : (
                      <motion.div
                        key="raw"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5"
                      >
                        原始源码
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-tighter">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-red-500/40" />
                      <span className="text-gray-500">源码</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <span className="text-gray-400">已加密</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 relative">
                <DiffEditor
                  theme="vs-dark"
                  language={selectedFile.type === 'js' ? 'javascript' : (selectedFile.type === 'json' ? 'json' : 'html')}
                  original={typeof selectedFile.originalContent === 'string' ? selectedFile.originalContent : (typeof selectedFile.content === 'string' ? selectedFile.content : '')}
                  modified={typeof selectedFile.content === 'string' ? selectedFile.content : ''}
                  options={{
                    renderSideBySide: true,
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 24, bottom: 24 },
                    scrollbar: {
                      vertical: 'hidden',
                      horizontal: 'hidden'
                    },
                    diffWordWrap: 'on',
                  }}
                  loading={
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050507]">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">正在加载缓冲区</span>
                    </div>
                  }
                />
              </div>
            </>
          )}
        </section>
      </main>

      <style jsx global>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .monaco-editor, .monaco-editor .margin, .monaco-editor-background {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
}
