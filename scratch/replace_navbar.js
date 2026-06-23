const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8');

const targetStr = `  const navLinks = [
    { name: "समाचार", href: "/category/news" },
    { name: "विशेष लेख", href: "/category/special" },
    { name: "विचार", href: "/category/opinion" },
    { name: "साहित्य", href: "/category/literature", hasDropdown: true },
    { name: "साक्षात्कार", href: "/category/interviews" },
    { name: "शिक्षा", href: "/category/education" },
    { name: "पर्यावरण", href: "/category/environment" },
    { name: "इतिहास", href: "/category/history" },
    { name: "वीडियो", href: "/category/video" },
    { name: "पत्रिका", href: "/magazine" },
    { name: "लेखक", href: "/authors" },
    { name: "कम्युनिटी", href: "/community" },
  ];`;

const newStr = `  const { navigation } = useCms();

  const navLinks = navigation && navigation.length > 0 ? navigation.map((nav: any) => ({
    name: nav.label,
    href: nav.url,
    hasDropdown: nav.has_children || false
  })) : [
    { name: "समाचार", href: "/category/news" },
    { name: "विशेष लेख", href: "/category/special" },
    { name: "विचार", href: "/category/opinion" },
    { name: "साहित्य", href: "/category/literature", hasDropdown: true },
    { name: "साक्षात्कार", href: "/category/interviews" },
    { name: "शिक्षा", href: "/category/education" },
    { name: "पर्यावरण", href: "/category/environment" },
    { name: "इतिहास", href: "/category/history" },
    { name: "वीडियो", href: "/category/video" },
    { name: "पत्रिका", href: "/magazine" },
    { name: "लेखक", href: "/authors" },
    { name: "कम्युनिटी", href: "/community" },
  ];`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/components/layout/Navbar.tsx', content);
console.log('Navbar navLinks replaced successfully!');
