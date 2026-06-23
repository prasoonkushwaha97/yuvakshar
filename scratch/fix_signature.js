const fs = require('fs');
let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf-8');

const targetSignature = `export function CmsProvider({ children }: { children: React.ReactNode }) {`;
const newSignature = `export function CmsProvider({ 
  children,
  initialSettings,
  initialNavigation,
  initialHomepageSections,
  initialAds
}: { 
  children: React.ReactNode,
  initialSettings?: any,
  initialNavigation?: any,
  initialHomepageSections?: any[],
  initialAds?: any[]
}) {`;

if (content.includes(targetSignature)) {
  content = content.replace(targetSignature, newSignature);
  fs.writeFileSync('src/store/CmsContext.tsx', content);
  console.log('Signature fixed');
} else {
  console.log('Signature not found or already fixed');
}
