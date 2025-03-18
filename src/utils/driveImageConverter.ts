/**
 * Google Drive 圖片連結轉換工具
 * 用於將 Google Drive 分享連結轉換為直接圖片連結
 */

// 從 Google Drive 分享連結中提取 ID
export function extractDriveFileId(shareLink: string): string | null {
  // 標準的分享連結格式: https://drive.google.com/file/d/FILE_ID/view...
  const standardPattern = /https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/?/;
  
  // 已開啟權限的預覽連結格式: https://drive.google.com/open?id=FILE_ID
  const openPattern = /https:\/\/drive\.google\.com\/open\?id=([\w-]+)/;
  
  // 新版UI的連結格式: https://drive.google.com/drive/*/FILE_ID
  const newPattern = /https:\/\/drive\.google\.com\/drive\/\w+\/([\w-]+)/;

  let match = shareLink.match(standardPattern);
  if (match && match[1]) return match[1];
  
  match = shareLink.match(openPattern);
  if (match && match[1]) return match[1];
  
  match = shareLink.match(newPattern);
  if (match && match[1]) return match[1];
  
  // 如果是直接提供的ID
  if (/^[\w-]{25,}$/.test(shareLink.trim())) {
    return shareLink.trim();
  }
  
  return null;
}

// 將 ID 轉換為直接圖片連結
export function convertToDriveDirectLink(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

// 一步到位轉換連結
export function convertDriveShareLinkToDirectLink(shareLink: string): string {
  const fileId = extractDriveFileId(shareLink);
  if (!fileId) {
    throw new Error(`無法從連結中提取檔案ID: ${shareLink}`);
  }
  return convertToDriveDirectLink(fileId);
}

// 批量轉換多個連結
export function convertMultipleDriveLinks(shareLinks: string[]): {
  directLinks: string[];
  failedLinks: { original: string; error: string }[];
} {
  const directLinks: string[] = [];
  const failedLinks: { original: string; error: string }[] = [];
  
  for (const link of shareLinks) {
    try {
      const directLink = convertDriveShareLinkToDirectLink(link);
      directLinks.push(directLink);
    } catch (error) {
      failedLinks.push({
        original: link,
        error: error instanceof Error ? error.message : '未知錯誤'
      });
    }
  }
  
  return { directLinks, failedLinks };
}

/**
 * 使用範例：
 *
 * // 單個連結轉換
 * const directLink = convertDriveShareLinkToDirectLink('https://drive.google.com/file/d/abc123xyz/view?usp=sharing');
 * console.log(directLink); // https://drive.google.com/uc?export=view&id=abc123xyz
 *
 * // 批量轉換
 * const shareLinks = [
 *   'https://drive.google.com/file/d/abc123xyz/view?usp=sharing',
 *   'https://drive.google.com/file/d/def456uvw/view?usp=sharing'
 * ];
 * const { directLinks, failedLinks } = convertMultipleDriveLinks(shareLinks);
 */
