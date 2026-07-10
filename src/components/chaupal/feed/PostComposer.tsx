"use client";

import React, { useState } from "react";
import DiscussionComposer from "@/components/shared/DiscussionComposer";
import { createPost } from "@/lib/actions/chaupalFeedActions";
import { supabase } from "@/lib/supabaseClient";

interface PostComposerProps {
  currentUser: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  placeholder?: string;
  onPostCreated?: (post: any) => void;
  groupId?: string;
}

export default function PostComposer({ currentUser, placeholder = "चौपाल पर क्या चल रहा है?", onPostCreated, groupId }: PostComposerProps) {
  
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${currentUser.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chaupal-media')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('chaupal-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (content: string, imageFile: File | null, isDraft = false) => {
    let mediaUrl = undefined;
    
    if (imageFile) {
      mediaUrl = await uploadImage(imageFile);
    }

    const newPost = await createPost({
      content,
      mediaUrl,
      isDraft,
      groupId: groupId || null
    });
    
    const formattedPost = {
      id: newPost.id,
      content: newPost.content,
      timestamp: newPost.created_at,
      mediaUrl: newPost.media_url,
      isPinned: newPost.is_pinned,
      isLocked: newPost.is_locked,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.name, 
        avatarUrl: currentUser.avatarUrl,
      },
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: false,
    };

    if (onPostCreated && !isDraft) {
      onPostCreated(formattedPost);
    }
    
    if (isDraft) {
      alert("ड्राफ्ट सुरक्षित कर लिया गया है।");
    }
  };

  return (
    <DiscussionComposer 
      currentUser={currentUser}
      placeholder={placeholder}
      submitLabel="पोस्ट करें"
      showDraftButton={true}
      onSubmit={(c, i) => handleSubmit(c, i, false)}
      onDraft={(c, i) => handleSubmit(c, i, true)}
      maxLength={1000}
    />
  );
}
