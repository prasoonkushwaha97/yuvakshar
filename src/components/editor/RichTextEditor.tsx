import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import { Markdown } from 'tiptap-markdown';
import { EditorToolbar } from './EditorToolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "अपना लेख यहाँ लिखना शुरू करें...",
  minHeight = "min-h-[500px]"
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Underline,
      Superscript,
      Subscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image,
      Youtube.configure({
        inline: false,
        width: 640,
        height: 480,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      CharacterCount,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none w-full font-hindi prose-headings:font-serif prose-headings:font-bold prose-a:text-[#EA580C] prose-p:leading-relaxed prose-p:text-lg',
      },
    },
    onUpdate: ({ editor }) => {
      onChange((editor.storage as any).markdown.getMarkdown());
    },
  });

  // Handle external updates to content (e.g. initial load)
  useEffect(() => {
    if (editor && content && editor.isEmpty) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!isMounted) {
    return <div className={`flex flex-col w-full ${minHeight}`}></div>;
  }

  return (
    <div className="flex flex-col w-full group">
      <div className="sticky top-14 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md pb-2">
        <EditorToolbar editor={editor} />
      </div>
      
      <div className={`w-full ${minHeight}`}>
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center justify-between py-3 text-xs text-slate-400 mt-8 border-t border-slate-100 dark:border-slate-800/50">
        <div>
          {editor?.storage.characterCount?.words() || 0} words
        </div>
        <div>
          Rich Text Editor (TipTap)
        </div>
      </div>
    </div>
  );
}
