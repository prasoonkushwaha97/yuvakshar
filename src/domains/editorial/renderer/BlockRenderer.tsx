import React from "react";
import { EditorBlock, ContentDocument } from "../types/schema";

export const HeadingRenderer = ({ block }: { block: EditorBlock & { type: "heading" } }) => {
  const Tag = `h${block.content.level}` as React.ElementType;
  return (
    <Tag className={`font-serif font-bold text-slate-900 dark:text-white my-4 ${
      block.content.level === 1 ? "text-4xl" :
      block.content.level === 2 ? "text-3xl" :
      block.content.level === 3 ? "text-2xl" : "text-xl"
    }`}>
      {block.content.text}
    </Tag>
  );
};

export const ParagraphRenderer = ({ block }: { block: EditorBlock & { type: "paragraph" } }) => {
  return (
    <p 
      className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 my-4" 
      dangerouslySetInnerHTML={{ __html: block.content.text }} 
    />
  );
};

export const ImageRenderer = ({ block }: { block: EditorBlock & { type: "image" } }) => {
  return (
    <figure className={`my-8 ${block.settings?.layout === 'wide' ? '-mx-8' : ''}`}>
      <img 
        src={block.content.url} 
        alt={block.content.altText || ""} 
        className="w-full rounded-xl bg-slate-100 dark:bg-slate-800"
      />
      {(block.content.caption || block.content.photographerCredit) && (
        <figcaption className="text-sm text-slate-500 mt-3 text-center">
          {block.content.caption}
          {block.content.photographerCredit && (
            <span className="block text-xs mt-1 opacity-70">
              Photo: {block.content.photographerCredit}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
};

export const QuoteRenderer = ({ block }: { block: EditorBlock & { type: "quote" } }) => {
  return (
    <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-xl text-slate-700 dark:text-slate-300">
      "{block.content.text}"
      {(block.content.author || block.content.source) && (
        <footer className="text-sm not-italic font-medium text-slate-500 mt-3">
          — {block.content.author} {block.content.source && <cite className="opacity-70">({block.content.source})</cite>}
        </footer>
      )}
    </blockquote>
  );
};

export const DividerRenderer = () => {
  return <hr className="my-10 border-slate-200 dark:border-slate-800" />;
};

export const BlockRenderer = ({ block }: { block: EditorBlock }) => {
  switch (block.type) {
    case "heading":
      return <HeadingRenderer block={block} />;
    case "paragraph":
      return <ParagraphRenderer block={block} />;
    case "image":
      return <ImageRenderer block={block} />;
    case "quote":
      return <QuoteRenderer block={block} />;
    case "divider":
      return <DividerRenderer />;
    default:
      console.warn(`Unknown block type: ${(block as any).type}`);
      return null;
  }
};

/**
 * Universal Content Renderer
 * Maps a full JSON Document to React Components.
 */
export const DocumentRenderer = ({ document }: { document: ContentDocument }) => {
  if (document.schemaVersion !== 1) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Unsupported schema version</div>;
  }

  // Sort blocks by order if necessary (assuming array is already ordered)
  const blocks = [...document.blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="yuvakshar-content prose prose-lg prose-slate dark:prose-invert max-w-none">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
};
