import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export function formatDate(date: Date, formatStr: string = 'PPP'): string {
  return format(date, formatStr, { locale: zhTW });
}