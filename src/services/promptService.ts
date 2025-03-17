import { useEffect, useState, useCallback } from 'react';

interface Prompt {
  text: string;
}

const prompts: Prompt[] = [
  { text: '此刻，你最想與目標相關的什麼感覺記錄下來？' },
  { text: '現在的你，對於目標有什麼突如其來的想法或啟發？' },
  { text: '剛剛，你做了什麼讓自己覺得更靠近夢想的事？' },
  { text: '此刻的心情，如何與你的目標連結起來？' },
  { text: '當下，你對自己的目標最強烈的渴望是什麼？' },
  { text: '今天，你為夢想做了什麼值得記住的努力？' },
  { text: '這一天，與目標相關的哪個瞬間，讓你覺得特別驕傲？' },
  { text: '今天有沒有遇到什麼挑戰，讓你更了解自己？' },
  { text: '今天的哪個進展，讓你覺得更接近你的目標？' },
  { text: '今天，你的目標旅程中最有成就感的一刻是什麼？' },
  { text: '回顧最近的幾天，有什麼與目標相關的瞬間讓你感到滿足？' },
  { text: '最近，你為目標付出的哪個努力讓你感到特別驕傲？' },
  { text: '這幾天，有沒有哪個挫折幫助你重新審視你的目標？' },
  { text: '最近的哪個行動或成果，讓你對夢想更有信心？' },
  { text: '回想這幾天，哪件與目標相關的事，讓你印象最深刻？' },
  { text: '最近，有什麼與目標有關的感受，讓你覺得值得被記錄？' },
  { text: '這幾天，有哪個時刻讓你重新燃起對目標的熱情？' },
  { text: '最近的哪一個選擇或行動，讓你感到自己正為夢想創造改變？' },
  { text: '最近，有什麼與目標相關的小進步值得被紀念？' }
];

// Keep track of recently used prompts to avoid repetition
const recentPrompts = new Set<string>();

function getRandomPrompt(): Prompt {
  const availablePrompts = prompts.filter(p => !recentPrompts.has(p.text));
  
  // If all prompts have been used recently, clear the history
  if (availablePrompts.length === 0) {
    recentPrompts.clear();
    return getRandomPrompt();
  }
  
  const randomIndex = Math.floor(Math.random() * availablePrompts.length);
  const selectedPrompt = availablePrompts[randomIndex];
  
  // Add to recent prompts, keeping only the last 2 prompts
  recentPrompts.add(selectedPrompt.text);
  if (recentPrompts.size > 2) {
    const [firstPrompt] = recentPrompts;
    recentPrompts.delete(firstPrompt);
  }
  
  return selectedPrompt;
}

export function useJournalPrompt() {
  const [prompt, setPrompt] = useState<Prompt>();

  const refreshPrompt = useCallback(() => {
    setPrompt(getRandomPrompt());
  }, []);

  useEffect(() => {
    refreshPrompt();
  }, [refreshPrompt]);

  return { prompt, refreshPrompt };
}