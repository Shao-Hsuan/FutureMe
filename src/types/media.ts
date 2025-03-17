export interface MediaFile {
  url: string;
  type: 'image' | 'video';
  file: File;
  thumbnail?: string; // 添加影片預覽圖
}

export interface MediaUploadOptions {
  multiple?: boolean;
  accept?: string;
}