import { useState, useEffect, useRef, useCallback } from 'react';
import { searchChaupal } from '@/lib/actions/chaupalSearchActions';
import getCaretCoordinates from 'textarea-caret';

export interface MentionUser {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  is_verified?: boolean;
  role?: string;
}

interface Coords {
  top: number;
  left: number;
  height: number;
}

export function useMentionEngine() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'none' | 'mention' | 'hashtag'>('none');
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorIndex, setCursorIndex] = useState(-1);
  const [coords, setCoords] = useState<Coords | null>(null);

  const userCache = useRef<Record<string, MentionUser[]>>({});
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const closeAutocomplete = useCallback(() => {
    setType('none');
    setQuery('');
    setUsers([]);
    setHashtags([]);
    setCoords(null);
  }, []);

  useEffect(() => {
    if (type === 'none' || query.length === 0) {
      setUsers([]);
      setHashtags([]);
      setIsLoading(false);
      return;
    }

    if (type === 'hashtag') {
      // Mock hashtags for now
      setHashtags([query, `${query}Trending`, `${query}News`]);
      setSelectedIndex(0);
      setIsLoading(false);
      return;
    }

    if (type === 'mention') {
      if (userCache.current[query]) {
        setUsers(userCache.current[query]);
        setSelectedIndex(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await searchChaupal(query, 'users');
          userCache.current[query] = results as MentionUser[];
          setUsers(results as MentionUser[]);
          setSelectedIndex(0);
        } catch (error) {
          console.error("Error fetching mentions:", error);
          setUsers([]);
        } finally {
          setIsLoading(false);
        }
      }, 300); // 300ms debounce
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, type]);

  const handleInput = (textarea: HTMLTextAreaElement) => {
    const value = textarea.value;
    const cursor = textarea.selectionStart;
    
    // Find the word currently being typed
    const textBeforeCursor = value.slice(0, cursor);
    const words = textBeforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];

    if (currentWord.startsWith('@')) {
      setType('mention');
      setQuery(currentWord.slice(1));
      setCursorIndex(cursor - currentWord.length);
      
      const caret = getCaretCoordinates(textarea, cursor);
      setCoords({
        top: caret.top + caret.height,
        left: caret.left,
        height: caret.height
      });
    } else if (currentWord.startsWith('#')) {
      setType('hashtag');
      setQuery(currentWord.slice(1));
      setCursorIndex(cursor - currentWord.length);
      
      const caret = getCaretCoordinates(textarea, cursor);
      setCoords({
        top: caret.top + caret.height,
        left: caret.left,
        height: caret.height
      });
    } else {
      closeAutocomplete();
    }
  };

  return {
    type,
    query,
    users,
    hashtags,
    isLoading,
    selectedIndex,
    setSelectedIndex,
    cursorIndex,
    coords,
    handleInput,
    closeAutocomplete
  };
}
