import { createClient } from '@supabase/supabase-js';
import type { Goal } from '../types';
import type { JournalEntry } from '../types/journal';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('🔌 Initializing Supabase client:', { 
  url: supabaseUrl,
  hasKey: !!supabaseKey 
});

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'goal-journal-auth'
  }
});

// Session 檢查函式
export async function checkSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (!session) {
      throw new Error('No active session');
    }
    
    return session;
  } catch (error) {
    console.error('Session check failed:', error);
    throw error;
  }
}

// 上傳前的驗證檢查
export async function verifyStorageAccess() {
  try {
    const session = await checkSession();
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    const mediaBucket = buckets.find(b => b.name === 'journal-media');
    if (!mediaBucket) {
      throw new Error('Storage configuration error');
    }
    
    return {
      userId: session.user.id,
      bucket: mediaBucket.name
    };
  } catch (error) {
    console.error('Storage access verification failed:', error);
    throw new Error('無法存取儲存空間，請重新登入');
  }
}

// Goal functions
export async function getGoals(): Promise<Goal[]> {
  console.log('📚 Fetching goals...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) throw new Error('請先登入');

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch goals:', error);
    throw error;
  }

  console.log('✅ Goals fetched:', { count: data?.length });
  return data || [];
}

export async function createGoal(data: { title: string; image?: string }): Promise<Goal> {
  console.log('📝 Creating goal:', data);
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) throw new Error('請先登入');

  const { data: goal, error } = await supabase
    .from('goals')
    .insert({ ...data, user_id: session.user.id })
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create goal:', error);
    throw error;
  }

  console.log('✅ Goal created:', { id: goal.id });
  return goal;
}

export async function updateGoal(id: string, updates: { title?: string; image?: string }): Promise<Goal> {
  console.log('✏️ Updating goal:', { id, updates });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) throw new Error('請先登入');

  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to update goal:', error);
    throw error;
  }

  console.log('✅ Goal updated:', { id });
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  console.log('🗑️ Deleting goal:', { id });
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ Failed to delete goal:', error);
    throw error;
  }

  console.log('✅ Goal deleted:', { id });
}

// Journal functions
export async function getJournalEntries(goalId: string): Promise<JournalEntry[]> {
  console.log('📚 Fetching journal entries:', { goalId });
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      throw new Error('請先登入');
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch journal entries:', error);
      throw error;
    }

    console.log('✅ Journal entries fetched:', { count: data?.length });
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching journal entries:', error);
    throw error;
  }
}

export async function getJournalEntry(id: string): Promise<JournalEntry> {
  console.log('📖 Fetching journal entry:', { id });
  
  try {
    const { data: entry, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return entry;
  } catch (error) {
    console.error('❌ Failed to fetch journal entry:', error);
    throw error;
  }
}

export async function createJournalEntry(data: {
  title: string;
  content: string;
  media_urls: string[];
  text_collects?: Array<{
    type: 'text' | 'link';
    content: string;
    title?: string;
    preview_image?: string;
  }>;
  goal_id: string;
  collect_id?: string;
  letter_id?: string;
}): Promise<JournalEntry> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) throw new Error('請先登入');

  const { data: entry, error } = await supabase
    .from('journal_entries')
    .insert({ 
      ...data, 
      user_id: session.user.id,
      text_collects: data.text_collects || []
    })
    .select()
    .single();

  if (error) throw error;
  return entry;
}

export async function updateJournalEntry(
  id: string,
  updates: {
    title?: string;
    content?: string;
    media_urls?: string[];
    text_collects?: Array<{
      type: 'text' | 'link';
      content: string;
      title?: string;
      preview_image?: string;
    }>;
  }
): Promise<JournalEntry> {
  const { data: entry, error } = await supabase
    .from('journal_entries')
    .update({
      ...updates,
      text_collects: updates.text_collects || []
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return entry;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}