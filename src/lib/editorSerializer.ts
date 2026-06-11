export interface ListBlockItem {
  text: string;
  checked?: boolean;
  depth: number;
}

export interface ImageItem {
  url: string;
  caption?: string;
  credit?: string;
  width?: number; // 25 to 100
  rotation?: number; // 0, 90, 180, 270
}

export interface BlockItem {
  id: string;
  type: "paragraph" | "heading" | "list" | "checklist" | "quote" | "media" | "video" | "table" | "special";
  level?: 1 | 2 | 3 | 4 | 5; // headings
  align?: "left" | "center" | "right" | "justify";
  style?: "normal" | "pull" | "editorial" | "highlight"; // quotes
  specialType?: "fact" | "didyouknow" | "editorial_note" | "author_note" | "warning" | "reference"; // boxes
  text?: string; // HTML string
  listType?: "bullet" | "ordered";
  listItems?: ListBlockItem[];
  images?: ImageItem[];
  videoUrl?: string;
  videoType?: "youtube" | "vimeo" | "embed" | "short";
  tableData?: string[][];
  mergedCells?: { r1: number; c1: number; r2: number; c2: number }[];
}

export function serializeBlocksToMarkdown(blocks: BlockItem[]): string {
  return blocks
    .map((block) => {
      const alignAttr = block.align && block.align !== "left" ? ` style="text-align: ${block.align};"` : "";
      
      switch (block.type) {
        case "heading": {
          const hashes = "#".repeat(block.level || 2);
          if (alignAttr) {
            return `<h${block.level || 2}${alignAttr}>${block.text || ""}</h${block.level || 2}>`;
          }
          return `${hashes} ${block.text || ""}`;
        }
        
        case "paragraph": {
          if (alignAttr) {
            return `<div${alignAttr}>${block.text || ""}</div>`;
          }
          return block.text || "";
        }
        
        case "quote": {
          const styleClass = block.style && block.style !== "normal" ? ` class="${block.style}-quote"` : "";
          if (styleClass) {
            return `<blockquote${styleClass}>${block.text || ""}</blockquote>`;
          }
          return `> ${block.text || ""}`;
        }
        
        case "list":
        case "checklist": {
          if (!block.listItems || block.listItems.length === 0) return "";
          return block.listItems
            .map((item) => {
              const indent = "  ".repeat(item.depth || 0);
              let prefix = block.listType === "ordered" ? "1." : "-";
              if (block.type === "checklist") {
                prefix = item.checked ? "- [x]" : "- [ ]";
              }
              return `${indent}${prefix} ${item.text || ""}`;
            })
            .join("\n");
        }
        
        case "media": {
          if (!block.images || block.images.length === 0) return "";
          if (block.images.length === 1) {
            const img = block.images[0];
            const widthStyle = img.width ? ` width="${img.width}%"` : "";
            const transformStyle = img.rotation ? ` style="transform: rotate(${img.rotation}deg);"` : "";
            const creditAttr = img.credit ? ` data-credit="${img.credit}"` : "";
            return `<img src="${img.url}" alt="${img.caption || ""}"${widthStyle}${transformStyle}${creditAttr} />`;
          } else {
            // Gallery
            const imagesJson = encodeURIComponent(JSON.stringify(block.images));
            return `<div class="yuvakshar-gallery" data-images="${imagesJson}">\n` +
              block.images.map(img => `  <img src="${img.url}" alt="${img.caption || ""}" data-credit="${img.credit || ""}" />`).join("\n") +
              "\n</div>";
          }
        }
        
        case "video": {
          if (!block.videoUrl) return "";
          return `<iframe src="${block.videoUrl}" data-video-type="${block.videoType || "embed"}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
        }
        
        case "table": {
          if (!block.tableData || block.tableData.length === 0) return "";
          // Check if it's a simple table without merged cells
          const hasMerges = block.mergedCells && block.mergedCells.length > 0;
          
          if (!hasMerges) {
            // Write standard markdown table
            const headers = block.tableData[0];
            const separator = headers.map(() => "---");
            const rows = block.tableData.slice(1);
            
            const formatRow = (r: string[]) => `| ${r.join(" | ")} |`;
            
            return [
              formatRow(headers),
              formatRow(separator),
              ...rows.map(formatRow)
            ].join("\n");
          } else {
            // Write HTML table to support merges
            let html = `<table>\n`;
            block.tableData.forEach((row, rIdx) => {
              html += "  <tr>\n";
              row.forEach((cell, cIdx) => {
                // Check if this cell is inside a merged cell range but is not the top-left cell
                const merge = block.mergedCells?.find(
                  m => rIdx >= m.r1 && rIdx <= m.r2 && cIdx >= m.c1 && cIdx <= m.c2
                );
                
                if (merge) {
                  if (rIdx === merge.r1 && cIdx === merge.c1) {
                    const rowSpan = merge.r2 - merge.r1 + 1;
                    const colSpan = merge.c2 - merge.c1 + 1;
                    const rsAttr = rowSpan > 1 ? ` rowspan="${rowSpan}"` : "";
                    const csAttr = colSpan > 1 ? ` colspan="${colSpan}"` : "";
                    html += `    <td${rsAttr}${csAttr}>${cell}</td>\n`;
                  }
                  // Otherwise, skip rendering this cell entirely
                } else {
                  html += `    <td>${cell}</td>\n`;
                }
              });
              html += "  </tr>\n";
            });
            html += "</table>";
            return html;
          }
        }
        
        case "special": {
          const hindiTitleMap: Record<string, string> = {
            fact: "महत्वपूर्ण तथ्य",
            didyouknow: "क्या आप जानते हैं?",
            editorial_note: "संपादकीय टिप्पणी",
            author_note: "लेखक टिप्पणी",
            warning: "चेतावनी बॉक्स",
            reference: "संदर्भ बॉक्स"
          };
          const title = hindiTitleMap[block.specialType || "fact"] || "महत्वपूर्ण तथ्य";
          return `<div class="special-block ${block.specialType || "fact"}" data-type="${block.specialType || "fact"}">\n` +
            `  <div class="special-block-title">${title}</div>\n` +
            `  <div class="special-block-content">${block.text || ""}</div>\n` +
            `</div>`;
        }
        
        default:
          return "";
      }
    })
    .join("\n\n");
}

export function deserializeMarkdownToBlocks(markdown: string): BlockItem[] {
  if (!markdown || !markdown.trim()) {
    return [
      {
        id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: "paragraph",
        text: ""
      }
    ];
  }

  // Split by double newline or HTML wrapper chunks
  // We want to extract HTML tables, iframes, divs, blockquotes, and normal paragraphs.
  const blocks: BlockItem[] = [];
  const rawChunks = markdown.split(/\n\n+/);
  
  let i = 0;
  while (i < rawChunks.length) {
    const chunk = rawChunks[i].trim();
    if (!chunk) {
      i++;
      continue;
    }
    
    const id = `block-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;
    
    // 1. Heading (Markdown: ## Title or HTML: <h2>Title</h2>)
    const headingHtmlMatch = chunk.match(/^<h([1-5])([^>]*)>(.*?)<\/h\1>/i);
    const headingMdMatch = chunk.match(/^(#{1,5})\s+(.*)/);
    if (headingHtmlMatch) {
      const level = parseInt(headingHtmlMatch[1], 10) as any;
      const attrs = headingHtmlMatch[2];
      const text = headingHtmlMatch[3];
      const alignMatch = attrs.match(/text-align:\s*(left|center|right|justify)/i);
      const align = alignMatch ? (alignMatch[1].toLowerCase() as any) : "left";
      
      blocks.push({ id, type: "heading", level, text, align });
      i++;
      continue;
    } else if (headingMdMatch) {
      const level = headingMdMatch[1].length as any;
      const text = headingMdMatch[2];
      blocks.push({ id, type: "heading", level, text, align: "left" });
      i++;
      continue;
    }
    
    // 2. Quote (Markdown: > text or HTML: <blockquote class="pull-quote">text</blockquote>)
    const quoteHtmlMatch = chunk.match(/^<blockquote([^>]*)>(.*?)<\/blockquote>/is);
    const quoteMdMatch = chunk.match(/^>\s*(.*)/s);
    if (quoteHtmlMatch) {
      const attrs = quoteHtmlMatch[1];
      const text = quoteHtmlMatch[2];
      const classMatch = attrs.match(/class="([^"]+)"/i);
      let style: any = "normal";
      if (classMatch) {
        if (classMatch[1].includes("pull")) style = "pull";
        else if (classMatch[1].includes("editorial")) style = "editorial";
        else if (classMatch[1].includes("highlight")) style = "highlight";
      }
      blocks.push({ id, type: "quote", style, text });
      i++;
      continue;
    } else if (quoteMdMatch) {
      const text = quoteMdMatch[1].replace(/^>\s*/gm, "");
      blocks.push({ id, type: "quote", style: "normal", text });
      i++;
      continue;
    }
    
    // 3. Lists and Checklists
    // Match line-by-line if all lines start with list markup
    const lines = chunk.split("\n");
    const isList = lines.every(line => /^\s*([-*]|\d+\.)\s+/.test(line));
    if (isList) {
      const listItems: ListBlockItem[] = [];
      let listType: "bullet" | "ordered" = "bullet";
      let isChecklist = false;
      
      lines.forEach((line) => {
        const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
        if (match) {
          const indentSpace = match[1].length;
          const depth = Math.floor(indentSpace / 2);
          const marker = match[2];
          let text = match[3];
          
          if (/^\d+\./.test(marker)) {
            listType = "ordered";
          }
          
          let checked: boolean | undefined = undefined;
          if (text.startsWith("[ ]")) {
            isChecklist = true;
            checked = false;
            text = text.slice(3).trim();
          } else if (text.startsWith("[x]")) {
            isChecklist = true;
            checked = true;
            text = text.slice(3).trim();
          }
          
          listItems.push({ text, checked, depth });
        }
      });
      
      blocks.push({
        id,
        type: isChecklist ? "checklist" : "list",
        listType,
        listItems
      });
      i++;
      continue;
    }
    
    // 4. Special Block Box
    const specialMatch = chunk.match(/^<div class="special-block\s+([^"]+)"\s+data-type="([^"]+)"[^>]*>(.*?)<\/div>/is);
    if (specialMatch) {
      const type = specialMatch[2] as any;
      const contentHtml = specialMatch[3];
      const innerContentMatch = contentHtml.match(/<div class="special-block-content">(.*?)<\/div>/is);
      const text = innerContentMatch ? innerContentMatch[1].trim() : contentHtml.trim();
      
      blocks.push({
        id,
        type: "special",
        specialType: type,
        text
      });
      i++;
      continue;
    }
    
    // 5. Video Embed (iframe)
    const videoMatch = chunk.match(/^<iframe src="([^"]+)"[^>]*data-video-type="([^"]+)"[^>]*><\/iframe>/i) ||
                       chunk.match(/^<iframe src="([^"]+)"[^>]*><\/iframe>/i);
    if (videoMatch) {
      const videoUrl = videoMatch[1];
      const videoType = (videoMatch[2] || "embed") as any;
      blocks.push({
        id,
        type: "video",
        videoUrl,
        videoType
      });
      i++;
      continue;
    }
    
    // 6. Media / Image Block
    // Match single <img ... /> or gallery <div>
    const singleImgMatch = chunk.match(/^<img src="([^"]+)"\s+alt="([^"]*)"([^>]*)\/>/i);
    const galleryMatch = chunk.match(/^<div class="yuvakshar-gallery"\s+data-images="([^"]+)"/i);
    if (singleImgMatch) {
      const url = singleImgMatch[1];
      const caption = singleImgMatch[2];
      const attrs = singleImgMatch[3];
      
      const widthMatch = attrs.match(/width="(\d+)%"/i);
      const width = widthMatch ? parseInt(widthMatch[1], 10) : 100;
      
      const rotationMatch = attrs.match(/transform:\s*rotate\((\d+)deg\)/i);
      const rotation = rotationMatch ? parseInt(rotationMatch[1], 10) : 0;
      
      const creditMatch = attrs.match(/data-credit="([^"]*)"/i);
      const credit = creditMatch ? creditMatch[1] : "";
      
      blocks.push({
        id,
        type: "media",
        mediaType: "image",
        images: [{ url, caption, credit, width, rotation }]
      });
      i++;
      continue;
    } else if (galleryMatch) {
      try {
        const decoded = decodeURIComponent(galleryMatch[1]);
        const images = JSON.parse(decoded);
        blocks.push({
          id,
          type: "media",
          mediaType: "gallery",
          images
        });
      } catch (err) {
        console.error("Failed to parse gallery JSON", err);
      }
      i++;
      continue;
    }
    
    // 7. HTML Table or MD Table
    const htmlTableMatch = chunk.startsWith("<table>");
    const mdTableMatch = chunk.startsWith("|") && chunk.includes("\n|");
    if (htmlTableMatch) {
      const tableData: string[][] = [];
      const mergedCells: any[] = [];
      
      const rowMatches = chunk.match(/<tr>(.*?)<\/tr>/gis) || [];
      rowMatches.forEach((rowHtml, rIdx) => {
        const cellData: string[] = [];
        // Match td tags
        const cellMatches = rowHtml.match(/<td([^>]*)>(.*?)<\/td>/gis) || [];
        cellMatches.forEach((cellHtml, cIdx) => {
          const innerMatch = cellHtml.match(/<td([^>]*)>(.*?)<\/td>/is);
          if (innerMatch) {
            const attrs = innerMatch[1];
            const text = innerMatch[2].trim();
            cellData.push(text);
            
            const rsMatch = attrs.match(/rowspan="(\d+)"/i);
            const csMatch = attrs.match(/colspan="(\d+)"/i);
            if (rsMatch || csMatch) {
              const rowSpan = rsMatch ? parseInt(rsMatch[1], 10) : 1;
              const colSpan = csMatch ? parseInt(csMatch[1], 10) : 1;
              mergedCells.push({
                r1: rIdx,
                c1: cIdx,
                r2: rIdx + rowSpan - 1,
                c2: cIdx + colSpan - 1
              });
            }
          }
        });
        tableData.push(cellData);
      });
      
      blocks.push({
        id,
        type: "table",
        tableData,
        mergedCells
      });
      i++;
      continue;
    } else if (mdTableMatch) {
      const tableLines = chunk.split("\n");
      const tableData: string[][] = [];
      
      tableLines.forEach((line) => {
        if (!line.trim().startsWith("|")) return;
        // Skip separator line (e.g. |---|---|)
        if (line.includes("---")) return;
        const cells = line.split("|").map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        tableData.push(cells);
      });
      
      blocks.push({
        id,
        type: "table",
        tableData
      });
      i++;
      continue;
    }
    
    // 8. Paragraph (HTML <div> or clean text)
    const alignHtmlMatch = chunk.match(/^<div style="text-align:\s*(left|center|right|justify);?"[^>]*>(.*?)<\/div>/is);
    if (alignHtmlMatch) {
      const align = alignHtmlMatch[1].toLowerCase() as any;
      const text = alignHtmlMatch[2];
      blocks.push({ id, type: "paragraph", align, text });
    } else {
      blocks.push({ id, type: "paragraph", align: "left", text: chunk });
    }
    
    i++;
  }

  return blocks;
}
