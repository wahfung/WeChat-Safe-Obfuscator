import JSZip from 'jszip';
import { ProcessedFile } from '@/types';

export async function readZipFile(file: File): Promise<ProcessedFile[]> {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const processedFiles: ProcessedFile[] = [];

    for (const [path, zipEntry] of Object.entries(contents.files)) {
        if (zipEntry.dir) continue;

        // Filter out system files, node_modules, and hidden files
        if (path.split('/').some(p => p.startsWith('.')) || path.includes('__MACOSX') || path.includes('node_modules/')) {
            continue;
        }

        const lowerPath = path.toLowerCase();
        const ext = lowerPath.split('.').pop();
        let type: ProcessedFile['type'] = 'other';

        // Explicitly handle common miniprogram extensions
        if (ext === 'js' || ext === 'wxs') type = 'js';
        else if (ext === 'wxml') type = 'wxml';
        else if (ext === 'wxss') type = 'wxss';
        else if (ext === 'json') type = 'json';
        else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext || '')) type = 'asset';

        let content: string | Uint8Array;
        let size: number;

        // Treat code files as text, others (assets) as binary
        if (type === 'js' || type === 'wxml' || type === 'wxss' || type === 'json') {
            content = await zipEntry.async('string');
            size = new TextEncoder().encode(content).length;
        } else {
            content = await zipEntry.async('uint8array');
            size = (content as Uint8Array).length;
        }

        processedFiles.push({ path, content, isObfuscated: false, originalSize: size, type });
    }

    // Sort by path for consistent ordering
    return processedFiles.sort((a, b) => a.path.localeCompare(b.path));
}
