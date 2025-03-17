import { useState, useEffect } from 'react';
import type { JournalEntry } from '../types/journal';
import { getJournalEntry, deleteJournalEntry } from '../services/supabase';

export function useJournalEntry(id?: string) {
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadEntry = async () => {
      try {
        setIsLoading(true);
        const data = await getJournalEntry(id);
        setEntry(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load entry'));
      } finally {
        setIsLoading(false);
      }
    };

    loadEntry();
  }, [id]);

  const deleteEntry = async () => {
    if (!id) return;
    
    try {
      await deleteJournalEntry(id);
    } catch (err) {
      console.error('Failed to delete entry:', err);
      throw err;
    }
  };

  return {
    entry,
    isLoading,
    error,
    deleteEntry,
  };
}