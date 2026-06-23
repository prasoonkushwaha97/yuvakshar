const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Footer.tsx', 'utf-8');

const targetStr = `            <div className="flex flex-col space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <Link href="/about" className="hover:text-primary transition-colors">हमारे बारे में</Link>
              <Link href="/editorial-policy" className="hover:text-primary transition-colors">संपादकीय नीति</Link>
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">गोपनीयता नीति</Link>
              <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">नियम और शर्तें</Link>
            </div>`;

const newStr = `            <div className="flex flex-col space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
              {settings.footer.links.map((link: any, idx: number) => (
                <Link key={idx} href={link.url || link.href} className="hover:text-primary transition-colors">
                  {link.label || link.name}
                </Link>
              ))}
            </div>`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/components/layout/Footer.tsx', content);
console.log('Footer links replaced successfully!');
