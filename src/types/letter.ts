export interface Letter {
  id: string;
  type: 'goal_created' | 'daily_feedback' | 'weekly_review';
  title: string;
  greeting: string;
  content: string;
  reflection_question: string;
  signature: string;
  front_image: string;
  created_at: string;
  read_at?: string;
  goal_id: string;
  user_id: string;
  related_journals?: any[];
  related_collects?: any[];
}