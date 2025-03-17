export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  media_urls: string[];
  text_collects?: Array<{
    type: 'text' | 'link';
    content: string;
    title?: string;
    preview_image?: string;
    color?: string;
  }>;
  created_at: string;
  goal_id: string;
  user_id: string;
  collect_id?: string;
  letter_id?: string;
}

export interface CreateJournalEntry {
  title: string;
  content: string;
  media_urls: string[];
  text_collects?: Array<{
    type: 'text' | 'link';
    content: string;
    title?: string;
    preview_image?: string;
    color?: string;
  }>;
  goal_id: string;
  collect_id?: string;
  letter_id?: string;
}