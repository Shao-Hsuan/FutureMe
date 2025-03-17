export interface Account {
  id: number;
  reward_level: number;
  unlocked_rewards: string;
  last_updated: Date;
}

export interface Goal {
  id: number;
  title: string;
  image: string;
}

export interface Collect {
  id: number;
  title: string;
  content: string;
  created_time: Date;
  caption: string;
}

export interface Journal {
  id: number;
  title: string;
  content: string;
  attachment: string;
  related_collect: number;
  created_time: Date;
}

export interface ReflectCard {
  id: number;
  content: string;
  card_image: string;
  created_time: Date;
}

export interface ReflectJournal {
  id: number;
  reflect_card_id: number;
  reflect_card_content: string;
  title: string;
  content: string;
  attachment: string;
  related_collect: number;
  created_time: Date;
}