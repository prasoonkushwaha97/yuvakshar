import { readFileSync, writeFileSync } from 'fs';

const file = 'src/store/CmsContext.tsx';
let content = readFileSync(file, 'utf8');

const corruptStart = content.indexOf('  },\r\n  {\r\n  videos: Video[];');
console.log('Corrupt start:', corruptStart);

const secondArrayClose = content.indexOf('];\r\n\r\nconst isOwner', corruptStart);
console.log('Second array close:', secondArrayClose);

// Replacement: vid-4, vid-5, close array
const vid4and5 = `  },\r\n  {\r\n    id: "vid-4",\r\n    title: "डिजिटल इंडिया क्या है? (शॉर्ट वीडियो)",\r\n    description: "डिजिटल भारत अभियान के मुख्य स्तंभ और आम नागरिक के जीवन पर इसका प्रभाव। १ मिनट में पूरी जानकारी।",\r\n    youtubeUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ",\r\n    category: "समाचार",\r\n    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",\r\n    isFeatured: false,\r\n    isShorts: true,\r\n    status: "Published",\r\n    publishDate: "०८ जून २०२६",\r\n    viewCount: 4500,\r\n    duration: "0:58"\r\n  },\r\n  {\r\n    id: "vid-5",\r\n    title: "सुपरकंप्यूटर कैसे काम करता है? (लघु ज्ञान)",\r\n    description: "सुपरकंप्यूटर की समानांतर प्रोसेसिंग क्षमता और सामान्य कंप्यूटर से इसकी तुलना। केवल ६० सेकंड में।",\r\n    youtubeUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ",\r\n    category: "शिक्षा",\r\n    thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80",\r\n    isFeatured: false,\r\n    isShorts: true,\r\n    status: "Published",\r\n    publishDate: "०७ जून २०२६",\r\n    viewCount: 3100,\r\n    duration: "0:55"\r\n  }\r\n`;

// Stitch: everything up to corruptStart + vid4and5 + everything from secondArrayClose
const fixed = content.substring(0, corruptStart) + vid4and5 + content.substring(secondArrayClose);
console.log('Fixed content length:', fixed.length, '(was:', content.length, ')');

// Sanity: check "videos: Video[];" only appears inside the interface (before initialMockVideos array)
const arrayStart = fixed.indexOf('const initialMockVideos');
const vidTypeIdx = fixed.indexOf('videos: Video[];');
console.log('initialMockVideos at:', arrayStart, '| "videos: Video[];" at:', vidTypeIdx);

if (vidTypeIdx > arrayStart) {
  console.error('Interface type leaked AFTER array start — still corrupt!');
  process.exit(1);
}

// Sanity: check vid-4 and vid-5 appear inside the array
if (!fixed.includes('vid-4') || !fixed.includes('vid-5')) {
  console.error('vid-4/vid-5 missing!');
  process.exit(1);
}

writeFileSync(file, fixed, 'utf8');
console.log('✅ CmsContext.tsx corruption fixed!');
