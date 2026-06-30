"use server";

import { supabase } from "@/lib/supabaseClient";

export async function getRooms() {
  const { data, error } = await supabase
    .from('chaupal_rooms')
    .select(`
      id,
      title,
      description,
      type,
      created_at
    `)
    .neq('type', 'group')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
  return data;
}

export async function getRoom(roomId: string) {
  const { data, error } = await supabase
    .from('chaupal_rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) {
    console.error("Error fetching room:", error);
    return null;
  }
  return data;
}

export async function getRoomMessages(roomId: string, page = 1, limit = 50) {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  // We want to order by created_at DESC to get latest, but the client needs them ascending.
  // We'll fetch DESC and reverse them on the client or server.
  const { data, error } = await supabase
    .from('chaupal_messages')
    .select(`
      id,
      content,
      created_at,
      author:profiles!chaupal_messages_author_id_fkey(id, name, username, avatar_url, is_verified)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
  
  // Format to match ChatInterface expectations
  const messages = data.map(msg => {
    const author = Array.isArray(msg.author) ? msg.author[0] : msg.author;
    return {
      id: msg.id,
      content: msg.content,
      timestamp: msg.created_at,
      author: author ? { ...author, avatarUrl: author.avatar_url } : null,
    };
  }).reverse(); // Reverse so oldest is at the top of the fetched batch

  return messages;
}

export async function sendMessage(roomId: string, content: string) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('chaupal_messages')
    .insert([{
      room_id: roomId,
      author_id: userId,
      content
    }])
    .select(`
      id,
      content,
      created_at,
      author:profiles!chaupal_messages_author_id_fkey(id, name, username, avatar_url, is_verified)
    `)
    .single();

  if (error) throw new Error(error.message);

  const author = Array.isArray(data.author) ? data.author[0] : data.author;

  return {
    id: data.id,
    content: data.content,
    timestamp: data.created_at,
    author: author ? { ...author, avatarUrl: author.avatar_url } : null,
  };
}

export async function deleteMessage(messageId: string) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  // RLS will enforce author_id = userId
  const { error } = await supabase
    .from('chaupal_messages')
    .delete()
    .eq('id', messageId)
    .eq('author_id', userId);

  if (error) throw new Error(error.message);
  return true;
}
