import { supabase } from './supabase';
import JSZip from 'jszip';

export async function clearUserData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    // Delete all data in sequence to ensure proper cleanup
    // 1. Delete journal entries
    const { error: journalError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('user_id', user.id);
    
    if (journalError) throw journalError;

    // 2. Delete collects
    const { error: collectsError } = await supabase
      .from('collects')
      .delete()
      .eq('user_id', user.id);
    
    if (collectsError) throw collectsError;

    // 3. Delete reflect cards
    const { error: reflectError } = await supabase
      .from('reflect_cards')
      .delete()
      .eq('user_id', user.id);
    
    if (reflectError) throw reflectError;

    // 4. Delete goals
    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', user.id);
    
    if (goalsError) throw goalsError;

    // 5. Delete media files
    const { data: files, error: listError } = await supabase.storage
      .from('journal-media')
      .list(user.id);
    
    if (listError) throw listError;

    if (files && files.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from('journal-media')
        .remove(files.map(file => `${user.id}/${file.name}`));
      
      if (deleteError) throw deleteError;
    }

    return true;
  } catch (error) {
    console.error('Failed to clear data:', error);
    throw new Error('清除資料失敗，請稍後再試');
  }
}

export async function exportGoalData(goalId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    // Fetch all data
    const [
      { data: goal },
      { data: journals },
      { data: collects },
      { data: reflectCards }
    ] = await Promise.all([
      supabase.from('goals').select('*').eq('id', goalId).single(),
      supabase.from('journal_entries').select('*').eq('goal_id', goalId),
      supabase.from('collects').select('*').eq('goal_id', goalId),
      supabase.from('reflect_cards').select('*').eq('goal_id', goalId)
    ]);

    if (!goal) throw new Error('目標不存在');

    // Create a new ZIP file
    const zip = new JSZip();

    // Add metadata
    zip.file('metadata.json', JSON.stringify({
      exportDate: new Date().toISOString(),
      userId: user.id,
      goal
    }, null, 2));

    // Add data files
    zip.file('journals.json', JSON.stringify(journals || [], null, 2));
    zip.file('collects.json', JSON.stringify(collects || [], null, 2));
    zip.file('reflect-cards.json', JSON.stringify(reflectCards || [], null, 2));

    // Generate ZIP file
    const content = await zip.generateAsync({ type: 'blob' });

    // Create download link
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `goal-${goalId}-${new Date().toISOString().split('T')[0]}.zip`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('匯出失敗，請稍後再試');
  }
}

export async function exportGoalDataAsPDF(goalId: string) {
  // Keep existing exportGoalDataAsPDF implementation
}

export async function importGoalData(file: File) {
  // Keep existing importGoalData implementation
}