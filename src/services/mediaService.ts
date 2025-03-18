import { supabase, verifyStorageAccess } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import type { MediaFile, MediaUploadOptions } from '../types/media';

// Constants for file size limits
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB max image size
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB max video size

// 支援的影片格式
const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime', // MOV
  'video/x-m4v', // M4V
  'video/x-matroska', // MKV
  'video/3gpp', // 3GP
  'video/x-ms-wmv', // WMV
  'video/x-flv', // FLV
  'video/avi' // AVI
];

// 支援的圖片格式
const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'image/heic',
  'image/heif'
];

// Helper to format file size
function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
}

// Validate file size and type
function validateFile(file: File): void {
  const maxSize = file.type.startsWith('video/') ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    throw new Error(
      `檔案大小超過限制 (${formatFileSize(file.size)} > ${formatFileSize(maxSize)})`
    );
  }

  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type) && !SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
    throw new Error(`不支援的檔案格式：${file.type}`);
  }
}

// 壓縮圖片以加快上傳速度
async function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<File> {
  // 如果不是圖片，或已經是 WebP/AVIF 等高效格式，則直接返回
  if (!file.type.startsWith('image/') || file.size < 1 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // 計算新的尺寸，保持原始比例
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('無法創建 canvas context'));
        return;
      }
      
      // 繪製調整大小後的圖像
      ctx.drawImage(img, 0, 0, width, height);
      
      // 轉換為 blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('圖片壓縮失敗'));
            return;
          }
          
          // 創建新文件，保留原始擴展名
          const fileName = file.name;
          const compressedFile = new File(
            [blob], 
            fileName, 
            { type: 'image/jpeg' }
          );
          
          console.log(`壓縮前: ${formatFileSize(file.size)}, 壓縮後: ${formatFileSize(compressedFile.size)}`);
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('圖片加載失敗'));
    };
    
    img.src = url;
  });
}

// 檢測是否為移動設備
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 修改上傳函數
async function uploadFile(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // 驗證檔案
    validateFile(file);

    // 壓縮圖片檔案，特別是從移動設備上傳的大文件
    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      const isMobile = isMobileDevice();
      // 移動設備使用更激進的壓縮
      if (isMobile) {
        fileToUpload = await compressImage(file, 1280, 0.75);
      } else if (file.size > 3 * 1024 * 1024) {
        // 大於 3MB 的圖片進行壓縮
        fileToUpload = await compressImage(file);
      }
    }

    // 驗證存取權限
    const { userId, bucket } = await verifyStorageAccess();

    // 生成檔案名稱
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;

    // 上傳檔案
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
        contentType: fileToUpload.type, // 明確設定 content-type
        onUploadProgress: (progress) => {
          const percentage = (progress.loaded / progress.total) * 100;
          onProgress?.(Math.round(percentage));
        }
      });

    if (uploadError) {
      if (uploadError.message.includes('storage/unauthorized')) {
        throw new Error('未授權的操作，請重新登入');
      }
      if (uploadError.message.includes('Payload too large')) {
        throw new Error(`檔案大小超過限制：${formatFileSize(file.size)}`);
      }
      throw new Error('檔案上傳失敗，請稍後再試');
    }

    // 取得公開 URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// 修改媒體選擇器
export async function openMediaPicker(
  options: MediaUploadOptions = {},
  onProgress?: (progress: number, fileName: string) => void,
  info?: {
    imageInfo?: string;
    videoInfo?: string;
  }
): Promise<MediaFile[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options.multiple ?? false;
    
    // 設定接受的檔案類型
    if (options.accept === 'image/*') {
      input.accept = SUPPORTED_IMAGE_FORMATS.join(',');
    } else if (options.accept === 'video/*') {
      input.accept = SUPPORTED_VIDEO_FORMATS.join(',');
    } else {
      input.accept = [...SUPPORTED_IMAGE_FORMATS, ...SUPPORTED_VIDEO_FORMATS].join(',');
    }

    // 添加說明文字
    if (info) {
      const infoText = document.createElement('div');
      infoText.style.position = 'fixed';
      infoText.style.bottom = '20px';
      infoText.style.left = '50%';
      infoText.style.transform = 'translateX(-50%)';
      infoText.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      infoText.style.color = 'white';
      infoText.style.padding = '8px 16px';
      infoText.style.borderRadius = '8px';
      infoText.style.fontSize = '14px';
      infoText.innerHTML = `
        ${info.imageInfo ? `<div>📷 ${info.imageInfo}</div>` : ''}
        ${info.videoInfo ? `<div>🎥 ${info.videoInfo}</div>` : ''}
        <div style="font-size: 12px; margin-top: 4px; opacity: 0.8">
          支援格式：JPG, PNG, GIF, WebP, HEIC, MP4, MOV, WebM, MKV 等
        </div>
      `;
      document.body.appendChild(infoText);
      setTimeout(() => infoText.remove(), 3000);
    }

    input.onchange = async () => {
      if (!input.files?.length) {
        reject(new Error('未選擇任何檔案'));
        return;
      }

      try {
        const mediaFiles = await Promise.all(
          Array.from(input.files).map(async (file) => {
            const url = await uploadFile(file, (progress) => {
              onProgress?.(progress, file.name);
            });

            return {
              url,
              type: file.type.startsWith('video/') ? 'video' : 'image',
              file
            };
          })
        );

        resolve(mediaFiles);
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}

// 修改相機函數
export async function openCamera(): Promise<MediaFile> {
  try {
    // 檢查相機權限
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });

    // 建立預覽元素
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;

    // 建立拍照用的 canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('無法建立 canvas context');

    // 等待影片準備就緒
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        resolve();
      };
    });

    // 拍照
    ctx.drawImage(video, 0, 0);

    // 轉換為檔案
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8);
    });

    // 建立檔案物件
    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });

    // 清理資源
    stream.getTracks().forEach(track => track.stop());
    video.remove();
    canvas.remove();

    // 上傳檔案
    const url = await uploadFile(file);

    return {
      url,
      type: 'image',
      file
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('請允許存取相機');
      }
      if (error.name === 'NotFoundError') {
        throw new Error('找不到相機裝置');
      }
    }
    throw new Error('無法存取相機');
  }
}