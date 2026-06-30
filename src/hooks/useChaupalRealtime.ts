import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useChaupalRealtime(roomId: string, initialMessages: any[] = []) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Sync initial messages if they change (e.g. pagination upwards)
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chaupal_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          // We get the raw row, but we need author details.
          // Since it's realtime, we quickly fetch the author.
          // Optimization: the user who sent it doesn't need to fetch, but other clients do.
          const { data: author } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url, is_verified')
            .eq('id', payload.new.author_id)
            .single();

          const newMessage = {
            id: payload.new.id,
            content: payload.new.content,
            timestamp: payload.new.created_at,
            author: author ? { ...author, avatarUrl: author.avatar_url } : { id: payload.new.author_id, name: 'Unknown' }
          };

          setMessages((prev) => {
            // Prevent duplicates if optimistic update already added it
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chaupal_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { messages, setMessages, isConnected };
}
