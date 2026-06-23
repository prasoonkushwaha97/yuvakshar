const fs = require('fs');

let content = fs.readFileSync('src/store/types.ts', 'utf-8');

const oldImport = `// These are re-exported from mockData for convenience
export type { Article } from "@/lib/mockData";`;

const newInterface = `export interface Article {
  id: string;
  title: string;
  englishTitle?: string;
  summary: string;
  content: string;
  category: string;
  section: "news" | "article";
  author: string;
  authorRole: string;
  authorBio?: string;
  readTime: string;
  date: string;
  tags: string[];
  coverImage: string;
  isFeatured?: boolean;
  slug?: string;
  status?: "Draft" | "Pending Review" | "Revision Required" | "Approved" | "Scheduled" | "Published" | "Archived";
  views?: number;
  likes?: number;
  accessLevel?: "Free" | "Premium" | "Patron";
}`;

content = content.replace(oldImport, newInterface);

fs.writeFileSync('src/store/types.ts', content);
console.log('Fixed types.ts!');
