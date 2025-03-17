import { MediaFile } from '../types/media';

export function getMediaType(file: File): 'image' | 'video' {
  return file.type.startsWith('video/') ? 'video' : 'image';
}

export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

export async function processMediaFiles(fileList: FileList): Promise<MediaFile[]> {
  const files = Array.from(fileList);
  
  return files.map(file => ({
    url: createObjectURL(file),
    type: getMediaType(file),
    file
  }));
}