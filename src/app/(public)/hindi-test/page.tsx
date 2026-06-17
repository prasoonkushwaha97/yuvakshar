import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function HindiTestLab() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary font-serif mb-2">Hindi Typography Test Lab</h1>
            <p className="text-sm text-slate-500 font-sans">Pre-deployment font and encoding validation</p>
          </div>
          <Link href="/" className="flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm space-y-8">
          
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-border pb-2">1. Short Text & Headings (Serif + Sans)</h2>
            <h1 className="text-5xl font-extrabold font-serif">भारत एक लोकतांत्रिक गणराज्य है।</h1>
            <h2 className="text-3xl font-bold font-serif text-slate-700 dark:text-slate-300">युवाक्षर: विचारों को आवाज़ दीजिए</h2>
            <h3 className="text-2xl font-medium font-sans">संविधान की प्रस्तावना और नागरिक कर्तव्य</h3>
            <p className="text-base font-sans">यह एक छोटा परीक्षण वाक्य है। (This is a short test sentence.)</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-border pb-2">2. Mixed Hindi + English Code Switching</h2>
            <p className="text-lg font-sans leading-relaxed">
              Yuvakshar is a <span className="font-bold text-primary">Hindi-first publishing platform</span>. यहाँ हम आधुनिक तकनीक का उपयोग करके <span className="italic">AI-powered learning</span> और Editorial Content प्रदान करते हैं। The quick brown fox jumps over the lazy dog. 
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-border pb-2">3. Long Article Reading (Typography Line-Height Test)</h2>
            <div className="text-lg font-serif leading-loose space-y-4 text-slate-800 dark:text-slate-200">
              <p>
                भारत का इतिहास कई सहस्राब्दियों पुराना है। सिन्धु घाटी सभ्यता, जो विश्व की प्राचीनतम सभ्यताओं में से एक है, यहाँ फली-फूली। वेदों और उपनिषदों की रचना इसी भूमि पर हुई, जिन्होंने दर्शन और आध्यात्म की नींव रखी। 
              </p>
              <p>
                आधुनिक युग में, स्वतंत्रता संग्राम ने देश को एकजुट किया। महात्मा गांधी के नेतृत्व में अहिंसा और सत्याग्रह के मार्ग पर चलते हुए, भारत ने 1947 में स्वतंत्रता प्राप्त की। 1950 में संविधान लागू होने के बाद, यह एक संप्रभु, समाजवादी, धर्मनिरपेक्ष और लोकतांत्रिक गणराज्य बना।
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-border pb-2">4. Quotes & Poetry (Italics & Formatting)</h2>
            <blockquote className="border-l-4 border-primary pl-6 py-2 italic font-serif text-xl text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-r-lg">
              "उठो, जागो और तब तक नहीं रुको जब तक लक्ष्य प्राप्त न हो जाए।" <br/>
              <span className="text-sm font-bold not-italic mt-2 block text-slate-500">— स्वामी विवेकानंद</span>
            </blockquote>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-border pb-2">5. Numerals & Lists</h2>
            <ul className="list-disc list-inside space-y-2 font-sans text-base">
              <li>प्रथम बिंदु (First Point) - ०१२३४५६७८९</li>
              <li>द्वितीय बिंदु (Second Point) - 100% Verified</li>
              <li>तृतीय बिंदु (Third Point) - ₹ ५,००० (5,000 INR)</li>
            </ul>
          </section>
          
        </div>
      </div>
    </div>
  );
}
