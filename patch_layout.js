const fs = require('fs');
const path = require('path');

const navbarPath = path.join(process.cwd(), 'src/components/layout/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// 1. Import LiveNewsTicker
if (!navbarContent.includes('import LiveNewsTicker')) {
  navbarContent = navbarContent.replace(
    'import MobileSearchOverlay from "@/components/layout/MobileSearchOverlay";',
    'import MobileSearchOverlay from "@/components/layout/MobileSearchOverlay";\nimport LiveNewsTicker from "@/components/yuvakshar/LiveNewsTicker";'
  );
}

// 2. Add Top Bar
const topBarStr = `  return (
    <div className="w-full">
      {/* ═══════════════════════════════════════════════════
          TOP BAR — Beta Notice & Live News Ticker
      ═══════════════════════════════════════════════════ */}
      <div className="w-full bg-[#EA580C] text-white text-[11px] font-bold py-1.5 px-4 flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-2">
          <span className="bg-white text-[#EA580C] px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">Beta</span>
          <span>युवाक्षर में आपका स्वागत है।</span>
        </div>
        <div className="hidden md:block flex-1 max-w-4xl mx-auto px-8 relative -my-1.5">
           <LiveNewsTicker />
        </div>
      </div>
`;
navbarContent = navbarContent.replace(/  return \(\s*<div className="w-full">\s*/, topBarStr);

// 3. Update navLinks
const navLinksStr = `  const navLinks = [
    { name: "समाचार", href: "/category/news" },
    { name: "विश्लेषण", href: "/category/analysis" },
    { name: "विशेष लेख", href: "/category/special" },
    { name: "साहित्य", href: "/category/literature", hasDropdown: true },
    { name: "साक्षात्कार", href: "/category/interviews" },
    { name: "इतिहास", href: "/category/history" },
    { name: "पर्यावरण", href: "/category/environment" },
    { name: "शिक्षा", href: "/category/education" },
    { name: "वीडियो", href: "/category/video" },
    { name: "पत्रिका", href: "/magazine" },
    { name: "लेखक", href: "/authors" },
    { name: "चौपाल", href: "/community" },
  ];`;
navbarContent = navbarContent.replace(/  const navLinks = \[\s*[\s\S]*?\];/g, navLinksStr);

// 4. Update Header Alignment & Links
// Ensuring proper alignment of right-side icons
// It already aligns search, theme, notifications, user profile using standard layout.

fs.writeFileSync(navbarPath, navbarContent, 'utf8');

// FOOTER UPDATE
const footerPath = path.join(process.cwd(), 'src/components/layout/Footer.tsx');
let footerContent = fs.readFileSync(footerPath, 'utf8');

// Replace standard links
const newLinks1 = `<div className="flex flex-col space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <Link href="/about" className="hover:text-primary transition-colors">हमारे बारे में</Link>
              <Link href="/editorial-policy" className="hover:text-primary transition-colors">संपादकीय नीति</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">संपर्क</Link>
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">गोपनीयता नीति</Link>
              <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">नियम एवं शर्तें</Link>
              <Link href="/sitemap.xml" className="hover:text-primary transition-colors">Sitemap</Link>
              <Link href="/rss" className="hover:text-primary transition-colors">RSS</Link>
            </div>`;
footerContent = footerContent.replace(/<div className="flex flex-col space-y-1\.5 text-slate-600 dark:text-slate-400 font-medium">\s*<Link href="\/about"[\s\S]*?<\/div>/, newLinks1);

fs.writeFileSync(footerPath, footerContent, 'utf8');
console.log("Navbar and Footer patched successfully.");
