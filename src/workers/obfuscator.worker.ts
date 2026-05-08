import JavaScriptObfuscator from 'javascript-obfuscator';
import { ProcessedFile } from '../types';

const WECHAT_SAFE_CONFIG: any = {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: false,
    stringArray: true,
    stringArrayEncoding: ['rc4'],
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
};

self.onmessage = (event: MessageEvent<{ files: ProcessedFile[], options?: any }>) => {
    const { files, options } = event.data;
    const mergedOptions = { ...WECHAT_SAFE_CONFIG, ...options };

    try {
        const processedFiles = files.map((file, index) => {
            // Report progress
            if (index % 5 === 0 || index === files.length - 1) {
                self.postMessage({
                    type: 'progress',
                    progress: Math.round(((index + 1) / files.length) * 100)
                });
            }

            if (file.type === 'js' && typeof file.content === 'string') {
                try {
                    const obfuscationResult = (JavaScriptObfuscator as any).obfuscate(file.content, mergedOptions);
                    const obfuscatedCode = obfuscationResult.getObfuscatedCode();

                    return {
                        ...file,
                        originalContent: file.content, // Save original for diff
                        content: obfuscatedCode,
                        isObfuscated: true,
                        obfuscatedSize: new Blob([obfuscatedCode]).size,
                    };
                } catch (err) {
                    console.error(`Failed to obfuscate ${file.path}:`, err);
                    return file;
                }
            }
            return file;
        });

        self.postMessage({ type: 'success', processedFiles });
    } catch (error: any) {
        self.postMessage({ type: 'error', error: error.message });
    }
};
