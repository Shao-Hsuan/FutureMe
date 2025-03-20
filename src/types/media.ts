export interface MediaFile {
  url: string;
  type: 'image' | 'video' | 'link';
  file: File;
  thumbnail?: string; // 添加影片預覽圖
  preview?: {        // 添加連結預覽數據
    title?: string;
    image?: string | undefined;
    description?: string | undefined;
  };
}

export interface MediaUploadOptions {
  multiple?: boolean;
  accept?: string;
}