export interface MarkdownBlock {
  type: 'heading' | 'paragraph' | 'list' | 'blockquote' | 'code' | 'hr' | 'html';
  html: string;
}

function getHeadingClasses(level: number): string {
  switch (level) {
    case 1:
      return "font-serif text-3xl sm:text-4xl font-bold leading-tight font-hindi my-6 text-slate-900 dark:text-white";
    case 2:
      return "font-serif text-2xl sm:text-3xl font-bold leading-tight font-hindi my-5 border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-900 dark:text-white";
    case 3:
      return "font-serif text-xl sm:text-2xl font-bold leading-tight font-hindi my-4 text-slate-900 dark:text-white";
    case 4:
      return "font-serif text-lg sm:text-xl font-semibold leading-tight font-hindi my-3 text-slate-800 dark:text-slate-200";
    case 5:
      return "font-serif text-base sm:text-lg font-semibold leading-tight font-hindi my-2 text-slate-800 dark:text-slate-200";
    default:
      return "font-serif text-sm sm:text-base font-semibold leading-tight font-hindi my-2 text-slate-800 dark:text-slate-350";
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function parseInlineMarkdown(text: string): string {
  let html = text;
  
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Inline code: `code`
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono text-xs text-primary">$1</code>');
  
  return html;
}

export function stripMarkdown(text: string): string {
  if (!text) return "";
  let clean = text;
  
  // Remove HTML tags if present (e.g. from TipTap)
  clean = clean.replace(/<[^>]*>/g, '');
  
  // Remove headings (e.g., ### title)
  clean = clean.replace(/^#{1,6}\s+/gm, '');
  
  // Remove blockquotes (e.g., > quote)
  clean = clean.replace(/^>\s*/gm, '');
  
  // Remove lists
  clean = clean.replace(/^\s*([-*]|\d+\.)\s+/gm, '');
  
  // Remove bold and italic formatting
  clean = clean.replace(/\*\*([^*]+)\*\*/g, '$1');
  clean = clean.replace(/__([^_]+)__/g, '$1');
  clean = clean.replace(/\*([^*]+)\*/g, '$1');
  clean = clean.replace(/_([^_]+)_/g, '$1');
  
  // Remove inline code blocks
  clean = clean.replace(/`([^`]+)`/g, '$1');
  
  // Remove horizontal rules
  clean = clean.replace(/^\s*[-*_]{3,}\s*$/gm, '');
  
  return clean.trim();
}

export function parseMarkdownToHtmlBlocks(markdown: string, fontSizeClass: string = "text-base md:text-lg"): MarkdownBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  
  let currentBlockType: MarkdownBlock['type'] | null = null;
  let currentBlockLines: string[] = [];
  
  const flushBlock = () => {
    if (currentBlockLines.length === 0) return;
    
    const text = currentBlockLines.join('\n');
    let html = '';
    
    if (currentBlockType === 'heading') {
      const match = text.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const content = parseInlineMarkdown(match[2]);
        const classes = getHeadingClasses(level);
        html = `<h${level} class="${classes}">${content}</h${level}>`;
      } else {
        html = `<p class="font-serif leading-relaxed text-slate-700 dark:text-slate-300 my-4 font-light ${fontSizeClass}">${parseInlineMarkdown(text)}</p>`;
      }
    } else if (currentBlockType === 'blockquote') {
      const cleaned = currentBlockLines.map(line => line.replace(/^>\s?/, '')).join('\n');
      html = `<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-slate-650 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-r-xl">${parseMarkdownToHtmlBlocks(cleaned, fontSizeClass).map(b => b.html).join('')}</blockquote>`;
    } else if (currentBlockType === 'list') {
      const isOrdered = /^\s*\d+\.\s+/.test(currentBlockLines[0]);
      const listItemsHtml = currentBlockLines.map(line => {
        const content = line.replace(/^\s*([-*]|\d+\.)\s+/, '');
        return `<li class="my-1.5">${parseInlineMarkdown(content)}</li>`;
      }).join('\n');
      const listClass = isOrdered ? 'list-decimal pl-6 my-4 space-y-1' : 'list-disc pl-6 my-4 space-y-1';
      const tag = isOrdered ? 'ol' : 'ul';
      html = `<${tag} class="${listClass}">${listItemsHtml}</${tag}>`;
    } else if (currentBlockType === 'code') {
      const codeLines = currentBlockLines.slice(1, -1);
      const escapedCode = escapeHtml(codeLines.join('\n'));
      html = `<pre class="bg-slate-950 text-slate-200 p-4 rounded-2xl overflow-x-auto my-4 text-xs font-mono border border-slate-800"><code>${escapedCode}</code></pre>`;
    } else if (currentBlockType === 'hr') {
      html = `<hr class="my-6 border-slate-200 dark:border-slate-800" />`;
    } else if (currentBlockType === 'html') {
      html = text;
    } else {
      const content = parseInlineMarkdown(text);
      html = `<p class="font-serif leading-relaxed text-slate-700 dark:text-slate-350 my-4 font-light ${fontSizeClass}">${content}</p>`;
    }
    
    blocks.push({ type: currentBlockType || 'paragraph', html });
    currentBlockLines = [];
    currentBlockType = null;
  };
  
  let inCodeBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (inCodeBlock) {
      currentBlockLines.push(line);
      if (trimmed.startsWith('```')) {
        inCodeBlock = false;
        flushBlock();
      }
      continue;
    }
    
    if (trimmed.startsWith('```')) {
      flushBlock();
      currentBlockType = 'code';
      currentBlockLines.push(line);
      inCodeBlock = true;
      continue;
    }
    
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      flushBlock();
      blocks.push({ type: 'html', html: line });
      continue;
    }
    
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushBlock();
      currentBlockType = 'hr';
      currentBlockLines.push(line);
      flushBlock();
      continue;
    }
    
    if (/^#{1,6}\s+/.test(trimmed)) {
      flushBlock();
      currentBlockType = 'heading';
      currentBlockLines.push(line);
      flushBlock();
      continue;
    }
    
    if (trimmed.startsWith('>')) {
      if (currentBlockType !== 'blockquote') {
        flushBlock();
        currentBlockType = 'blockquote';
      }
      currentBlockLines.push(line);
      continue;
    }
    
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      if (currentBlockType !== 'list') {
        flushBlock();
        currentBlockType = 'list';
      }
      currentBlockLines.push(line);
      continue;
    }
    
    if (trimmed === '') {
      flushBlock();
      continue;
    }
    
    if (currentBlockType !== 'paragraph' && currentBlockType !== null) {
      flushBlock();
    }
    currentBlockType = 'paragraph';
    currentBlockLines.push(line);
  }
  
  flushBlock();
  return blocks;
}
