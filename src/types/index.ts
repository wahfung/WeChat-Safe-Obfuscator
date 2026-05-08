export interface ProcessedFile {
    path: string;
    content: string | Uint8Array;
    originalContent?: string | Uint8Array; // Added for diffing
    isObfuscated: boolean;
    originalSize: number;
    obfuscatedSize?: number;
    type: 'js' | 'wxml' | 'wxss' | 'json' | 'asset' | 'other';
}
