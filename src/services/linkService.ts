import { UserCancelError } from '../utils/error';

export async function handleLinkInput(): Promise<string> {
  const url = prompt('請輸入連結網址：');
  if (!url) throw new UserCancelError();
  
  try {
    new URL(url); // Validate URL format
    return url;
  } catch {
    throw new Error('無效的連結格式');
  }
}