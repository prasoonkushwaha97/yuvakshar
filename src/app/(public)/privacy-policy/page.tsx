"use client";

import React from "react";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1D] text-[#1E1E1E] dark:text-slate-200 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4 border-b border-[#E7E2D8] dark:border-slate-800 pb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-500/20 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold font-hindi tracking-tight text-slate-900 dark:text-white">
            गोपनीयता नीति
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            अंतिम अद्यतन तिथि: 10 जून 2026
          </p>
        </div>

        {/* सामग्री Body */}
        <div className="space-y-6 text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300 font-serif space-y-6">
          <p className="text-justify font-hindi">
            युवाक्षर ("हम", "हमारा", "संस्था", "पोर्टल" या "वेबसाइट") आपके व्यक्तिगत डेटा, गोपनीयता और डिजिटल अधिकारों का सम्मान करता है। यह गोपनीयता नीति बताती है कि जब आप हमारी वेबसाइट, मोबाइल अनुप्रयोग, पत्रिका, न्यूज़लेटर, लेख प्रस्तुति मंच, टिप्पणी प्रणाली अथवा अन्य डिजिटल सेवाओं का उपयोग करते हैं, तब हम आपकी जानकारी किस प्रकार एकत्रित करते हैं, उसका उपयोग करते हैं, सुरक्षित रखते हैं तथा आवश्यक परिस्थितियों में उसका प्रकटीकरण करते हैं।
          </p>

          <p className="text-justify font-hindi">
            युवाक्षर का उद्देश्य स्वतंत्र लेखन, चिंतन, संवाद, पत्रकारिता, साहित्य, शिक्षा और सामाजिक विमर्श को बढ़ावा देना है। इस उद्देश्य की पूर्ति करते समय हम उपयोगकर्ताओं की निजता की रक्षा को अपनी महत्वपूर्ण जिम्मेदारी मानते हैं। हमारी नीति पारदर्शिता, उत्तरदायित्व, न्यूनतम डेटा संग्रह और सुरक्षित प्रबंधन के सिद्धांतों पर आधारित है।
          </p>

          <p className="text-justify font-hindi">
            जब भी आप हमारी वेबसाइट का उपयोग करते हैं, लेख पढ़ते हैं, न्यूज़लेटर की सदस्यता लेते हैं, टिप्पणी करते हैं, अपनी रचना भेजते हैं, संपर्क प्रपत्र भरते हैं अथवा किसी अन्य सुविधा का उपयोग करते हैं, तब आप इस गोपनीयता नीति में वर्णित शर्तों को स्वीकार करते हैं।
          </p>

          <div className="p-5 border-l-4 border-orange-600 bg-slate-50 dark:bg-slate-900/40 rounded-r-2xl my-6">
            <p className="font-serif text-sm font-semibold font-hindi text-orange-600 dark:text-orange-500 italic">
              "शब्द केवल अभिव्यक्ति का माध्यम नहीं, समाज और विचारों के निर्माण का आधार भी हैं। इसी उत्तरदायित्व के साथ हम आपकी निजता की रक्षा के प्रति वचनबद्ध हैं।"
            </p>
          </div>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            1. जानकारी जो हम एकत्रित करते हैं
          </h2>
          <p className="text-justify font-hindi">
            हम आपके द्वारा स्वेच्छा से प्रदान की गई जानकारी एकत्रित कर सकते हैं। इसमें आपका नाम, ईमेल पता, मोबाइल नंबर, सामाजिक मीडिया प्रोफ़ाइल, लेखक परिचय, प्रोफ़ाइल चित्र, टिप्पणी सामग्री, लेख प्रस्तुति सामग्री, संपर्क संदेश, प्रतिक्रिया, सुझाव तथा अन्य ऐसी जानकारी शामिल हो सकती है जिसे आप स्वयं हमारे साथ साझा करते हैं। हम केवल उतनी ही जानकारी एकत्रित करने का प्रयास करते हैं जितनी हमारी सेवाओं के संचालन, संचार, प्रकाशन और उपयोगकर्ता सहायता के लिए आवश्यक हो।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            2. स्वतः एकत्रित होने वाली तकनीकी जानकारी
          </h2>
          <p className="text-justify font-hindi">
            वेबसाइट के उपयोग के दौरान कुछ तकनीकी जानकारी भी स्वतः एकत्रित हो सकती है। इसमें आपके ब्राउज़र का प्रकार, उपकरण की जानकारी, ऑपरेटिंग सिस्टम, आईपी पता, भाषा सेटिंग, स्क्रीन आकार, रेफरर पृष्ठ, उपयोग का समय, क्लिक गतिविधियाँ तथा अन्य विश्लेषणात्मक डेटा शामिल हो सकता है। यह जानकारी मुख्य रूप से वेबसाइट की कार्यक्षमता सुधारने, सुरक्षा बनाए रखने, त्रुटियों की पहचान करने और उपयोगकर्ता अनुभव को बेहतर बनाने के लिए उपयोग की जाती है।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            3. न्यूज़लेटर और संचार सेवाएं
          </h2>
          <p className="text-justify font-hindi">
            यदि आप हमारी न्यूज़लेटर सेवा की सदस्यता लेते हैं, तो आपका ईमेल पता सुरक्षित रूप से संग्रहीत किया जा सकता है ताकि हम आपको समाचार, संपादकीय सामग्री, पत्रिका संस्करण, विशेष घोषणाएँ, साहित्यिक गतिविधियाँ, आयोजन संबंधी जानकारी तथा अन्य प्रासंगिक सामग्री भेज सकें। आप किसी भी समय सदस्यता समाप्त करने का अधिकार रखते हैं। प्रत्येक न्यूज़लेटर संदेश में सदस्यता समाप्त करने का विकल्प उपलब्ध कराया जाएगा।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            4. लेखक योगदान और रचना प्रस्तुति
          </h2>
          <p className="text-justify font-hindi">
            जब कोई लेखक या योगदानकर्ता अपनी रचना, लेख, कविता, कहानी, शोध, रिपोर्ट या अन्य सामग्री प्रस्तुत करता है, तब प्रस्तुत सामग्री की समीक्षा, संपादन, प्रकाशन और अभिलेखीकरण के उद्देश्य से संबंधित जानकारी संग्रहित की जा सकती है। प्रकाशित सामग्री वेबसाइट के सार्वजनिक अभिलेख का हिस्सा बन सकती है। लेखक यह सुनिश्चित करने के लिए उत्तरदायी होगा कि प्रस्तुत सामग्री में किसी तीसरे पक्ष के अधिकारों का उल्लंघन न हो।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            5. टिप्पणी और सार्वजनिक संवाद
          </h2>
          <p className="text-justify font-hindi">
            टिप्पणी प्रणाली का उपयोग करते समय आपके द्वारा प्रकाशित टिप्पणियाँ, उत्तर, प्रतिक्रियाएँ और संबंधित जानकारी सार्वजनिक रूप से दिखाई दे सकती हैं। हम स्वस्थ संवाद को प्रोत्साहित करते हैं, किन्तु घृणा, हिंसा, भ्रामक जानकारी, स्पैम, अपमानजनक सामग्री अथवा अवैध गतिविधियों को बढ़ावा देने वाली टिप्पणियों को हटाने, संपादित करने या प्रतिबंधित करने का अधिकार सुरक्षित रखते हैं।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            6. कुकीज़ और ट्रैकिंग तकनीकें
          </h2>
          <p className="text-justify font-hindi">
            हम उपयोगकर्ता अनुभव को बेहतर बनाने के लिए कुकीज़ और समान तकनीकों का उपयोग कर सकते हैं। कुकीज़ छोटी डेटा फ़ाइलें होती हैं जो आपके उपकरण में संग्रहीत की जाती हैं। इनके माध्यम से हम आपकी प्राथमिकताओं को याद रख सकते हैं, लॉगिन सत्र बनाए रख सकते हैं, वेबसाइट प्रदर्शन का विश्लेषण कर सकते हैं और सुरक्षा उपायों को बेहतर बना सकते हैं। आप अपने ब्राउज़र की सेटिंग्स के माध्यम से कुकीज़ को नियंत्रित या निष्क्रिय कर सकते हैं, हालांकि इससे कुछ सुविधाओं की कार्यक्षमता प्रभावित हो सकती है।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            7. डेटा प्रकटीकरण और साझाकरण
          </h2>
          <p className="text-justify font-hindi">
            युवाक्षर आपके व्यक्तिगत डेटा को बेचता नहीं है और न ही व्यावसायिक लाभ के लिए किसी तीसरे पक्ष को हस्तांतरित करता है। हालांकि, कुछ परिस्थितियों में तकनीकी सेवा प्रदाताओं, ईमेल वितरण सेवाओं, होस्टिंग प्लेटफ़ॉर्म, विश्लेषण सेवाओं या कानूनी आवश्यकताओं के तहत सीमित जानकारी साझा की जा सकती है। ऐसी सभी साझेदारियाँ उचित सुरक्षा उपायों और गोपनीयता मानकों के अधीन होंगी।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            8. डेटा सुरक्षा और उपयोगकर्ता उत्तरदायित्व
          </h2>
          <p className="text-justify font-hindi">
            हम आपकी जानकारी की सुरक्षा के लिए उचित तकनीकी और प्रशासनिक उपाय अपनाते हैं। इसमें सुरक्षित सर्वर, अभिगम नियंत्रण, प्रमाणीकरण प्रणाली, बैकअप प्रक्रियाएँ और निगरानी तंत्र शामिल हो सकते हैं। यद्यपि हम डेटा सुरक्षा के लिए सर्वोत्तम प्रयास करते हैं, इंटरनेट पर कोई भी प्रणाली पूर्णतः सुरक्षित नहीं होती। इसलिए उपयोगकर्ताओं को भी अपने लॉगिन विवरण और व्यक्तिगत जानकारी की सुरक्षा के प्रति सतर्क रहना चाहिए।
          </p>
          <p className="text-justify font-hindi">
            यदि आप उपयोगकर्ता खाता बनाते हैं, तो आप अपने खाते की जानकारी की शुद्धता बनाए रखने के लिए उत्तरदायी होंगे। आपको अपने पासवर्ड को गोपनीय रखना चाहिए और किसी भी अनधिकृत गतिविधि की सूचना हमें तुरंत देनी चाहिए।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            9. बच्चों की निजता का संरक्षण
          </h2>
          <p className="text-justify font-hindi">
            युवाक्षर बच्चों की गोपनीयता का सम्मान करता है। यदि किसी नाबालिग उपयोगकर्ता की जानकारी अनजाने में एकत्रित हो जाती है और अभिभावक हमें इसकी सूचना देते हैं, तो हम उचित सत्यापन के बाद संबंधित जानकारी हटाने का प्रयास करेंगे।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            10. बाहरी कड़ियाँ
          </h2>
          <p className="text-justify font-hindi">
            हमारी वेबसाइट में अन्य वेबसाइटों, सेवाओं, प्रकाशनों या सामाजिक मीडिया मंचों के लिंक हो सकते हैं। इन बाहरी वेबसाइटों की अपनी गोपनीयता नीतियाँ होती हैं और हम उनकी सामग्री या डेटा प्रथाओं के लिए उत्तरदायी नहीं हैं। उपयोगकर्ताओं को सलाह दी जाती है कि वे किसी भी बाहरी वेबसाइट का उपयोग करने से पूर्व उसकी गोपनीयता नीति अवश्य पढ़ें।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            11. कानूनी दायित्व और सुरक्षा
          </h2>
          <p className="text-justify font-hindi">
            कानूनी दायित्वों, न्यायालय के आदेश, सरकारी अनुरोध, सुरक्षा जांच, धोखाधड़ी रोकथाम, बौद्धिक संपदा संरक्षण या अन्य वैध कारणों से आवश्यक होने पर हम प्रासंगिक जानकारी का सीमित प्रकटीकरण कर सकते हैं। ऐसा प्रकटीकरण केवल कानून द्वारा आवश्यक या अनुमत परिस्थितियों में ही किया जाएगा।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            12. गोपनीयता नीति में परिवर्तन
          </h2>
          <p className="text-justify font-hindi">
            समय-समय पर हमारी गोपनीयता नीति में संशोधन किया जा सकता है। संशोधित संस्करण वेबसाइट पर प्रकाशित होने के साथ प्रभावी माना जाएगा। महत्वपूर्ण परिवर्तनों की स्थिति में हम उपयुक्त सूचना देने का प्रयास करेंगे। उपयोगकर्ताओं को समय-समय पर इस नीति की समीक्षा करने की सलाह दी जाती है।
          </p>
          <p className="text-justify font-hindi">
            युवाक्षर का उपयोग जारी रखने का अर्थ है कि आप इस गोपनीयता नीति और समय-समय पर किए गए संशोधनों को स्वीकार करते हैं। हम आपकी निजता का सम्मान करते हैं और एक सुरक्षित, पारदर्शी तथा उत्तरदायी डिजिटल वातावरण उपलब्ध कराने के लिए प्रतिबद्ध हैं।
          </p>

          {/* Contact Details Card */}
          <div className="bg-[#FAF8F3] dark:bg-[#0F172A]/50 border border-[#E7E2D8] dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 mt-8">
            <h3 className="font-serif text-lg md:text-xl font-bold text-slate-900 dark:text-white border-l-2 border-orange-600 pl-3">
              संपर्क करें
            </h3>
            <p className="text-sm font-hindi">
              यदि आपको इस गोपनीयता नीति, डेटा सुरक्षा, उपयोगकर्ता अधिकारों या किसी संबंधित विषय पर कोई प्रश्न हो, तो आप हमसे संपर्क कर सकते हैं:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-2">
              <div className="space-y-1">
                <span className="text-slate-400 block">ईमेल</span>
                <a 
                  href="mailto:yuvakshar.editor@gmail.com" 
                  className="text-orange-600 dark:text-orange-500 hover:underline font-bold text-sm"
                >
                  yuvakshar.editor@gmail.com
                </a>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">संपादकीय विभाग</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold text-sm font-serif font-hindi">
                  युवाक्षर – लेखन, चिंतन और परिवर्तन
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
