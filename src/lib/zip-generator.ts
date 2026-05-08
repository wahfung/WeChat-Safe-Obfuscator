import JSZip from 'jszip';
import { ProcessedFile } from '@/types';

/**
 * Generates a ZIP file blob from an array of processed files.
 * It uses the current 'content' of each file (which may be obfuscated).
 */
export async function generateZip(files: ProcessedFile[]): Promise<Blob> {
    const zip = new JSZip();

    files.forEach((file) => {
        // We add the file to the zip using its relative path
        // The content will be the obfuscated version for JS files
        zip.file(file.path, file.content);
    });

    // Generate the ZIP as a blob for browser download
    return await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
    });
}
