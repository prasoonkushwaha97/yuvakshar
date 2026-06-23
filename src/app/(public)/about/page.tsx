"use client";

import React from "react";
import Link from "next/link";
import { Shield, Sparkles, BookOpen, BrainCircuit, Globe, Award, Heart, HelpCircle, FileText, CheckCircle2, Milestone, Info } from "lucide-react";
import GlassCard from "@/components/yuvakshar/GlassCard";

export default function AboutPage() {
  const pillars = [
    { 
      title: "ज्ञान स्वराज", 
      icon: BrainCircuit, 
      desc: "डिजिटल और मानसिक स्वतंत्रता की रक्षा के लिए स्थानीय, बहुभाषी प्रणालियों और विमर्शों का निर्माण करना।" 
    },
    { 
      title: "युवा नेतृत्व", 
      icon: Award, 
      desc: "गहन तकनीकी विकास, वैज्ञानिक अनुसंधान और सक्रिय नागरिक जिम्मेदारी के लिए युवाओं की क्षमता का विकास करना।" 
    },
    { 
      title: "राष्ट्र निर्माण", 
      icon: Shield, 
      desc: "संरचित और रचनात्मक संवाद के माध्यम से लोकतांत्रिक मूल्यों और संस्थागत सुधारों को सुदृढ़ बनाना।" 
    },
    { 
      title: "सांस्कृतिक चेतना", 
      icon: Heart, 
      desc: "भारतीय सांस्कृतिक धरोहर, मूल्यों और ऐतिहासिक पृष्ठभूमि का आधुनिक संदर्भों में संरक्षण व प्रसार करना।" 
    },
    { 
      title: "लोकतांत्रिक संवाद", 
      icon: Globe, 
      desc: "बिना किसी पूर्वाग्रह के समाज के विभिन्न वर्गों के बीच स्वस्थ, तार्किक और निष्पक्ष संवाद की स्थापना करना।" 
    },
    { 
      title: "पर्यावरणीय उत्तरदायित्व", 
      icon: Milestone, 
      desc: "प्रकृति और मानव के बीच सह-अस्तित्व की भावना को बढ़ावा देना और पर्यावरणीय संरक्षण पर बल देना।" 
    },
    { 
      title: "साहित्यिक सृजन", 
      icon: BookOpen, 
      desc: "मौलिक रचनाओं, कविता, दर्शन और वैचारिक लेखन के माध्यम से हिंदी साहित्य की समृद्ध परंपरा को समृद्ध करना।" 
    },
    { 
      title: "वैज्ञानिक दृष्टिकोण", 
      icon: Sparkles, 
      desc: "अंधविश्वासों के परे तार्किक सोच, अनुसंधान-उन्मुख विमर्श और वैज्ञानिक सोच को प्रोत्साहित करना।" 
    }
  ];

  const missionPoints = [
    {
      title: "निष्पक्ष पत्रकारिता",
      desc: "बिना किसी राजनीतिक या वाणिज्यिक दबाव के पूर्ण सत्य और निष्पक्षता के साथ समाज के समक्ष मुद्दों को रखना।"
    },
    {
      title: "रचनात्मक विमर्श",
      desc: "समाज में केवल समस्या नहीं, अपितु समाधान-आधारित सकारात्मक बौद्धिक चर्चाओं को दिशा प्रदान करना।"
    },
    {
      title: "भारतीय ज्ञान परंपरा",
      desc: "भारत के प्राचीन चिंतन, दर्शन और ज्ञान प्रणालियों को वर्तमान युग की आवश्यकताओं के अनुसार पुनर्जीवित और व्याख्यायित करना।"
    },
    {
      title: "युवाओं को मंच",
      desc: "युवा विचारकों, पत्रकारों और रचनाकारों को उनकी आवाज और लेखन कौशल को वैश्विक स्तर पर प्रस्तुत करने का स्वतंत्र मंच देना।"
    },
    {
      title: "सामाजिक उत्तरदायित्व",
      desc: "हाशिए के मुद्दों, सामाजिक सरोकारों और राष्ट्रीय विकास की दिशा में जागरूक नागरिक समाज का निर्माण करना।"
    }
  ];

  const valuesList = [
    { title: "सत्य", desc: "तथ्यों की पूर्ण सत्यता और ईमानदारी के साथ सामग्री का प्रस्तुतीकरण।" },
    { title: "स्वतंत्रता", desc: "अभिव्यक्ति की स्वतंत्रता और स्वतंत्र चिंतन का निडरतापूर्वक समर्थन।" },
    { title: "जवाबदेही", desc: "प्रत्येक शब्द और तथ्य के प्रति जनता और समाज के प्रति जवाबदेह रहना।" },
    { title: "संवाद", desc: "बहुलतावादी विचारों का सम्मान और स्वस्थ संवाद की संस्कृति।" },
    { title: "रचनात्मकता", desc: "कला, साहित्य और भाषा के क्षेत्र में नए प्रतिमानों और सृजन को बढ़ावा देना।" },
    { title: "समावेशिता", desc: "सभी पृष्ठभूमि, श्रेणियों और दृष्टिकोणों को समान प्रतिनिधित्व और सम्मान प्रदान करना।" }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen space-y-16 select-none bg-white dark:bg-[#0A0F1D] text-[#1E1E1E] dark:text-slate-200">
      
      {/* १. हीरो अनुभाग (Hero Section) */}
      <div className="text-center space-y-4 border-b border-[#E7E2D8] dark:border-slate-800 pb-8">
        <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-orange-600 dark:text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full bg-orange-500/5">
          मूल घोषणापत्र
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-extrabold tracking-tight mt-6 text-slate-900 dark:text-white font-hindi">
          युवाक्षर : लेखन, चिंतन और परिवर्तन का राष्ट्रीय अभियान
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-hindi max-w-2xl mx-auto leading-relaxed">
          भारत की युवा चेतना, ज्ञान और राष्ट्रनिर्माण का डिजिटल आंदोलन
        </p>
      </div>

      {/* २. विस्तृत परिचय (Detailed Introduction) */}
      <div className="space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-350 leading-relaxed font-serif text-justify font-hindi">
        <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-orange-600 first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 font-hindi text-justify">
          युवाक्षर केवल एक सामान्य ब्लॉगिंग प्लेटफ़ॉर्म, समाचार एग्रीगेटर या डिजिटल पत्रिका नहीं है। यह भारतीय युवा चेतना का एक जीवंत बौद्धिक आंदोलन है, जिसका उद्देश्य राष्ट्र के बौद्धिक परिदृश्य को नया आयाम देना है। आज का युग तकनीकी गतिशीलता और सूचनाओं के अनियंत्रित प्रवाह का युग है। इस डिजिटल परिदृश्य में, जहाँ ध्यान खींचने वाले एल्गोरिदम और सनसनीखेज खबरें समाज के सोचने-समझने की क्षमता को सीमित कर रही हैं, स्वतंत्र और गंभीर चिंतन की रक्षा करना हमारा प्राथमिक दायित्व बन गया है। युवाक्षर इसी दायित्व को पूरा करने के लिए एक वैचारिक शरणस्थली के रूप में खड़ा है, जहाँ सतही जानकारी के बजाय गहन चिंतन और तार्किक विमर्श को प्राथमिकता दी जाती है।
        </p>
        
        <p>
          हमारी स्थापना का मूल उद्देश्य आधुनिक भारत के युवाओं को एक ऐसा मंच प्रदान करना है जहाँ वे अपनी वैचारिक और रचनात्मक प्रतिभा का प्रदर्शन कर सकें। हम मानते हैं कि पत्रकारिता का सच्चा मूल्य उसकी निष्पक्षता और सत्यनिष्ठा में निहित है, जबकि साहित्य समाज की आत्मा का आईना होता है। जब स्वतंत्र पत्रकारिता और समृद्ध साहित्य का मिलन होता है, तब एक जागरूक और विचारशील समाज का जन्म होता है। युवाक्षर इसी सुंदर समन्वय का साक्षी है, जहाँ समाचारों के केवल सतही पक्ष को दिखाने के बजाय उनके गहरे निहितार्थों और सामाजिक प्रभावों पर चर्चा की जाती है।
        </p>

        <p>
          राष्ट्र निर्माण में युवाओं की बौद्धिक भूमिका सर्वोपरि है। युवा केवल देश के भविष्य के मतदाता या उपभोक्ता नहीं हैं, वे ज्ञान आधारित समाज के सबसे सक्रिय निर्माता हैं। बौद्धिक योगदान का अर्थ केवल अकादमिक शोध तक सीमित नहीं है, बल्कि इसका अर्थ है समाज की तात्कालिक समस्याओं पर तर्कसंगत ढंग से सोचना और उनके रचनात्मक समाधान तलाशना। स्वतंत्र चिंतन वह कुंजी है जो किसी भी लोकतंत्र को जीवित और संवेदनशील बनाए रखती है। लोकतंत्र केवल संस्थाओं और कानूनों से नहीं चलता, वह संवाद, असहमति के सम्मान और विचारों की बहुलता से समृद्ध होता है। युवाक्षर संवाद की इसी लोकतांत्रिक संस्कृति को जीवित रखने के लिए प्रतिबद्ध है, जहाँ हर गंभीर विचार का स्वागत है।
        </p>

        <p>
          ज्ञान संस्कृति का अर्थ है एक ऐसा समाज जहाँ तर्क, विज्ञान, दर्शन और कला को सम्मान मिले। भारतीय ज्ञान परंपरा प्राचीन काल से ही जिज्ञासा और मुक्त विमर्श की पोषक रही है। हमारी उपनिषदिक परंपरा में प्रश्न पूछने की स्वतंत्रता को ज्ञान का आधार माना गया है। युवाक्षर इसी प्राचीन ज्ञान परंपरा को आधुनिक परिप्रेक्ष्य में पुनर्परिभाषित कर रहा है। हम युवाओं को केवल सूचना का प्राप्तकर्ता नहीं बनाना चाहते, बल्कि उन्हें ज्ञान का सक्रिय सर्जक और समीक्षक बनाना चाहते हैं। यहाँ प्रकाशित होने वाली प्रत्येक रचना, चाहे वह साहित्य हो, इतिहास का पुनर्पाठ हो, समसामयिक मुद्दों पर तीखी टिप्पणी हो या पर्यावरणीय चिंताएँ, वैज्ञानिक और तार्किक कसौटी पर कसी जाती हैं। इस अभियान में हमारा प्रत्येक कदम एक अधिक प्रबुद्ध, समतावादी और प्रगतिशील राष्ट्र की स्थापना की ओर बढ़ता हुआ एक प्रयास है।
        </p>

        {/* ३. प्रेरणादायक विचार (Swami Vivekananda Section) */}
        <div className="p-6 border-l-4 border-orange-500 bg-slate-50 dark:bg-slate-900/50 rounded-r-2xl my-8">
          <p className="font-serif text-base md:text-lg text-orange-600 dark:text-orange-400 font-bold italic leading-relaxed font-hindi">
            “ज्ञान स्वयं में वर्तमान है, मनुष्य केवल उसका आविष्कार करता है। युवा शक्ति जब ज्ञान और निस्वार्थ सेवा से जागृत होती है, तब राष्ट्र निर्माण का महायज्ञ सफल होता है।”
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-2 text-right font-mono">— स्वामी विवेकानन्द से प्रेरित विचार</p>
        </div>
      </div>

      {/* ४. वैचारिक स्तंभ (Intellectual Pillars) */}
      <div className="space-y-6 pt-6">
        <h3 className="font-serif text-2xl font-bold text-center text-slate-900 dark:text-white font-hindi">
          हमारे वैचारिक स्तंभ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars?.map((pil, idx) => {
            const Icon = pil.icon;
            return (
              <GlassCard key={idx} glow="gold" className="p-6">
                <div className="space-y-4">
                  <div className="p-2 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/40 border border-orange-500/25 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white font-hindi">{pil.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light font-hindi">{pil.desc}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* ५. हमारा मिशन (Our Mission) */}
      <div className="space-y-6 pt-6 border-t border-[#E7E2D8] dark:border-slate-800">
        <h3 className="font-serif text-2xl font-bold text-center text-slate-900 dark:text-white font-hindi">
          हमारा मिशन
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-hindi">
          {missionPoints?.map((item, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <h4 className="font-serif text-base font-bold text-orange-600 dark:text-orange-400">{item.title}</h4>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ६. हमारे मूल्य (Our Values) */}
      <div className="space-y-6 pt-6 border-t border-[#E7E2D8] dark:border-slate-800">
        <h3 className="font-serif text-2xl font-bold text-center text-slate-900 dark:text-white font-hindi">
          हमारे मूल्य
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-hindi">
          {valuesList?.map((val, idx) => (
            <div key={idx} className="border border-[#E7E2D8] dark:border-slate-800 p-4 rounded-xl space-y-2 hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-300">
              <h4 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-200">{val.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ७. क्यों आवश्यक है युवाक्षर? (Why युवाक्षर) */}
      <div className="space-y-6 pt-6 border-t border-[#E7E2D8] dark:border-slate-800 font-hindi">
        <h3 className="font-serif text-2xl font-bold text-center text-slate-900 dark:text-white">
          क्यों आवश्यक है युवाक्षर?
        </h3>
        <div className="space-y-4 text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-350 leading-relaxed text-justify">
          <p>
            <strong>सूचना और ज्ञान में अंतर:</strong> आज के डिजिटल युग में सूचनाओं का विस्फोट तो हो रहा है, लेकिन वास्तविक ज्ञान और बोध लुप्त होता जा रहा है। सोशल मीडिया पर बहती हुई अधूरी जानकारियां युवा मस्तिष्क को भटकाने का काम कर रही हैं। युवाक्षर सतही सूचनाओं से परे जाकर गहरा बोध और विवेक प्रदान करता है ताकि पाठक हर विषय की जड़ तक पहुँच सकें।
          </p>
          <p>
            <strong>सोशल मीडिया युग की चुनौतियाँ:</strong> ध्यान केंद्रित करने की अवधि लगातार कम हो रही है क्योंकि इंटरनेट एल्गोरिदम उत्तेजक और भ्रामक सामग्री को बढ़ावा देते हैं। युवाक्षर इस वैचारिक अराजकता के विरुद्ध एक शांत मानसिक क्षेत्र है जहाँ बिना किसी व्यवधान के संतुलित सोच को पनपने का अवसर दिया जाता है।
          </p>
          <p>
            <strong>तथ्य आधारित विमर्श:</strong> बिना शोध के लिखी गई बातें और भ्रामक दावों से समाज को अपूरणीय क्षति होती है। हमारे मंच पर प्रकाशित प्रत्येक लेख की कठोरता से तथ्य-जांच और सत्यापन की प्रक्रियाओं से गुजरना पड़ता है।
          </p>
          <p>
            <strong>विचार संस्कृति का पुनर्निर्माण:</strong> समाज में वैचारिक शून्यता को भरने के लिए बौद्धिक चर्चाओं को पुनः जीवित करना और स्वस्थ संवाद का मार्ग प्रशस्त करना अत्यंत महत्वपूर्ण है ताकि युवा वर्ग देश की बौद्धिक सम्पदा का मूल्य समझ सके।
          </p>
        </div>
      </div>

      {/* ८. हमारी संपादकीय दृष्टि (Editorial Ethos) */}
      <div className="space-y-6 pt-6 border-t border-[#E7E2D8] dark:border-slate-800 font-hindi">
        <h3 className="font-serif text-2xl font-bold text-center text-slate-900 dark:text-white">
          हमारी संपादकीय दृष्टि
        </h3>
        <div className="space-y-4 text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-350 leading-relaxed text-justify">
          <p>
            <strong>तथ्य-जांच:</strong> हम अफवाहों या बिना पुष्टि किए गए दावों से दूर रहते हैं। हर घटना और तथ्य की प्रासंगिकता और सत्यता की जांच संपादकीय टीम द्वारा बारीकी से की जाती है।
          </p>
          <p>
            <strong>स्रोत सत्यापन:</strong> हम केवल विश्वसनीय, स्थापित और प्राथमिक दस्तावेजों, शोध पत्रों और प्रतिष्ठित साक्षात्कारों के आधार पर ही अपने आलेखों को अंतिम रूप प्रदान करते हैं।
          </p>
          <p>
            <strong>निष्पक्षता:</strong> किसी भी संवेदनशील राजनीतिक या सामाजिक मुद्दे पर हम विविध कोणों को संतुलित ढंग से प्रस्तुत करते हैं, ताकि पाठक स्वयं अपना स्वतंत्र मत बना सके।
          </p>
          <p>
            <strong>विविध मतों का सम्मान:</strong> विचार विविधता हमारे लोकतंत्र की आत्मा है। हम एक मर्यादित सीमा के भीतर असहमति और प्रगतिशील विचारों का सम्मान करते हुए सभी बौद्धिक रचनाओं को स्थान देते हैं।
          </p>
          <p>
            <strong>उत्तरदायी प्रकाशन:</strong> युवाक्षर देश की संप्रभुता, संवैधानिक मूल्यों, आपसी सद्भाव और मानवीय गरिमा के विरुद्ध किसी भी आपत्तिजनक या असंतुलित भाषा के प्रयोग का सर्वथा निषेध करता है।
          </p>
        </div>
      </div>

      {/* ९. संपर्क एवं कार्रवाई (Call To Action) */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-[#E7E2D8] dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 font-hindi">
        <h3 className="font-serif text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
          इस अभियान का हिस्सा बनें
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          यदि आप लेखन, पत्रकारिता, साहित्य, शोध, समाज, शिक्षा, पर्यावरण, इतिहास या राष्ट्रीय विमर्श में रुचि रखते हैं, तो युवाक्षर आपके लिए एक खुला मंच है।
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/submit-article"
            className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition duration-300"
          >
            लेख भेजें
          </Link>
          <Link
            href="/contact"
            className="px-6 py-2.5 rounded-xl border border-[#E7E2D8] dark:border-slate-700 text-slate-750 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-300"
          >
            संपर्क करें
          </Link>
          <Link
            href="/magazine"
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-850 text-white font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-750 transition duration-300"
          >
            पत्रिका पढ़ें
          </Link>
        </div>
      </div>

    </div>
  );
}
