export type CollectType = 'text' | 'image' | 'video' | 'link';

export type TextCollectColor = 'blue' | 'green' | 'yellow' | 'purple' | 'pink';

export interface Collect {
  id: string;
  type: CollectType;
  content: string;
  caption?: string;
  title?: string;
  preview_image?: string;
  created_at: string;
  goal_id: string;
  user_id: string;
  color?: TextCollectColor;
}