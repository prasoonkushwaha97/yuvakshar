"use client";

import React from "react";
import { BookOpen, HelpCircle, CheckCircle, ArrowDown, User, ShieldCheck, UserCheck, CheckSquare, Scale, Award, Globe, Share2, MessageSquare, Eye, FileEdit, RefreshCw, Database, Ban } from "lucide-react";

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1D] text-[#1E1E1E] dark:text-slate-200 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4 border-b border-[#E7E2D8] dark:border-slate-800 pb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 mb-2">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold font-hindi tracking-tight text-slate-900 dark:text-white">
            संपादकीय नीति
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            अंतिम अद्यतन तिथि: 10 जून 2026
          </p>
        </div>

        {/* सामग्री Body */}
        <div className="space-y-6 text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300 font-serif space-y-6">
          
          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            कार्य एवं उद्देश्य (मिशन एवं परिधि)
          </h2>
          <p className="text-justify font-hindi">
            युवाक्षर का प्रमुख उद्देश्य भारतीय पाठकों को उच्च-गुणवत्ता, विश्वसनीय तथा विविध विचार-विमर्श से परिपूर्ण सामग्री उपलब्ध कराना है। प्रसार के इस माध्यम के रूप में, हम साहित्य, समाचार और सांस्कृतिक विमर्श पर केंद्रित होंगे। भारतीय प्रेस परिषद के अनुसार, “पत्रकारिता का मूल उद्देश्य जनता को सार्वजनिक हित के विषयों पर निष्पक्ष, सटीक, बिना पक्षपात के, संयत एवं सभ्य भाषा में समाचार, विचार और जानकारी प्रदान करना है”। इसी आदर्श पर चलते हुए, युवाक्षर पत्रकारिता और साहित्य दोनों में मानक स्थापित करता है। BBC की एडिटोरियल गाइडलाइन्स भी इस सिद्धांत को दोहराती हैं कि श्रोताओं को “उच्चतम मानकों” के समाचार की उम्मीद होती है और इसलिए “निष्पक्षता, सत्यता और सटीकता” को प्राथमिकता देना चाहिए। अतः हमारी सामग्री का स्वरूप ऐसा होगा जो हिंदुस्तानी समाज की विविधता और बहुलता को समेटे, और पाठकों में विश्वास बनाए रखे।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            संपादकीय स्वतंत्रता
          </h2>
          <p className="text-justify font-hindi">
            युवाक्षर में संपादकीय निर्णय पूरी तरह से स्वतंत्र होंगे। मालिकाना संगठन (संस्थापक संगठन) होते हुए भी सभी समाचार निर्णयों पर केवल संपादकीय टीम का प्रभुत्व होगा। किसी भी बाहरी हित समूह, राजनीतिक दबाव या वाणिज्यिक पक्षपात का हमारे कंटेंट पर कोई प्रभुत्व नहीं होगा। BBC की गाइडलाइन्स के अनुसार, “BBC स्वतंत्र है और कोई बाहरी हित उसके संपादकीय अखंडता को प्रभावित नहीं कर सकता; दर्शकों को विश्वास होना चाहिए कि हमारे फैसले राजनीतिक या वाणिज्यिक दबावों से मुक्त हैं”। इसी तर्ज पर हम भी सुनिश्चित करेंगे कि विज्ञापन दाताओं या प्रायोजकों के किसी भी अनुरोध से हमारा संपादकीय विवेक प्रभावित न हो। युवाक्षर की स्वतन्त्रता यह गारंटी देती है कि प्रकाशन में सभी समाचार तथ्यों पर आधारित, संतुलित और निष्पक्ष प्रस्तुति होगी।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            शासन और भूमिकाएँ
          </h2>
          <p className="text-justify font-hindi">
            युवाक्षर की संरचना में विभिन्न भूमिका-स्तर होंगे:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-hindi text-justify">
            <li>
              <strong>स्वामी:</strong> पोर्टल के संस्थापक या स्वामी। रणनीतिक दिशा-निर्देश और वित्तीय व्यवस्था के लिए उत्तरदायी। संपादकीय स्वतंत्रता के हित में मालिक का दायित्व है कि वह संपादकीय टीम को पूर्ण स्वायत्तता प्रदान करे।
            </li>
            <li>
              <strong>प्रशासक:</strong> वेबसाइट/प्लेटफ़ॉर्म और तकनीकी पहलुओं के प्रबंधक। उपयोगकर्ता प्रबंधन, तकनीकी सुरक्षाएँ व साइट संचालन संभालेगा। कंटेंट में सीधे परिवर्तन नहीं करेगा, लेकिन सामग्री प्रबंधन सिस्टम का प्रशासन करेगा।
            </li>
            <li>
              <strong>प्रधान संपादक:</strong> पूरे प्रकाशन की संपादकीय ज़िम्मेदारी। सामग्री की गुणवत्ता और नीति-अनुरूपता की अंतिम जाँचें यह करेंगे। नए कंटेंट नीतियाँ बनायेंगे और विभागीय संपादकों का मार्गदर्शन करेंगे। सभी अन्तिम प्रकाशन निर्णय इनकी मंजूरी से होंगे।
            </li>
            <li>
              <strong>प्रबंध संपादक:</strong> दैनिक प्रकाशन प्रक्रिया को देखेगा। संपादकीय काल-निर्धारण, संसाधन आवंटन और समयबद्ध सम्पादन का निरीक्षण करेगा। प्रधान संपादक के निर्देशानुसार कार्य करेगा।
            </li>
            <li>
              <strong>विभागीय संपादक:</strong> साहित्य, समाचार, फीचर आदि जैसे ख़ास अनुभागों के ज़िम्मेदार। प्रत्येक अपने अनुभाग की सामग्री जांचेंगे, संपादित करेंगे और आंतरिक गुणवत्ता मानक लागू करेंगे।
            </li>
            <li>
              <strong>लेखक/योगदानकर्ता:</strong> युवाक्षर में लेख, समीक्षा, कविताएँ या अन्य सामग्री भेजने वाले प्रेषक। ये नियमित या स्वतंत्र लेखक हो सकते हैं। सभी योगदानकर्ता हमारे लेखन दिशा-निर्देशों का पालन करें, और आवश्यकताओं (जैसे मूलत्व और स्रोत) की गारंटी दें।
            </li>
          </ul>

          <p className="font-hindi font-bold pt-4 text-slate-900 dark:text-white">
            भूमिकाओं और अनुमतियों का सारांश:
          </p>
          <div className="overflow-x-auto border border-[#E7E2D8] dark:border-slate-800 rounded-xl my-4">
            <table className="w-full text-xs sm:text-sm text-left font-hindi">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-[#E7E2D8] dark:border-slate-800 text-slate-700 dark:text-slate-350">
                <tr>
                  <th className="px-4 py-3 font-bold">भूमिका</th>
                  <th className="px-4 py-3 font-bold">लेख लेखन</th>
                  <th className="px-4 py-3 font-bold">संपादन व संशोधन</th>
                  <th className="px-4 py-3 font-bold">प्रकाशन निर्णय</th>
                  <th className="px-4 py-3 font-bold">विज्ञापन/वित्तीय निर्णय</th>
                  <th className="px-4 py-3 font-bold">उपयोगकर्ता प्रबंधन</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2D8] dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-3 font-bold">स्वामी</td>
                  <td className="px-4 py-3 text-green-600">हाँ</td>
                  <td className="px-4 py-3 text-slate-500">तात्कालिक रूप से नहीं</td>
                  <td className="px-4 py-3 text-green-600">हाँ (दृष्टिकोण/नीति)</td>
                  <td className="px-4 py-3 text-green-600">हाँ (बजट, विज्ञापन नीति)</td>
                  <td className="px-4 py-3 text-green-600">हाँ (प्रशासक को चुनना)</td>
                </tr>
                <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                  <td className="px-4 py-3 font-bold">प्रशासक</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                  <td className="px-4 py-3 text-green-600">हाँ (साइट व्यवस्थापन)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold">प्रधान संपादक</td>
                  <td className="px-4 py-3 text-green-600">हाँ</td>
                  <td className="px-4 py-3 text-green-600">हाँ (अंतिम मंजूरी)</td>
                  <td className="px-4 py-3 text-green-600">हाँ</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                </tr>
                <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                  <td className="px-4 py-3 font-bold">प्रबंध संपादक</td>
                  <td className="px-4 py-3 text-green-600">हाँ</td>
                  <td className="px-4 py-3 text-green-600">हाँ (शामिल सभी सेक्शन)</td>
                  <td className="px-4 py-3 text-slate-500">कभी-कभी (प्रधान संपादक सलाह से)</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold">विभागीय संपादक</td>
                  <td className="px-4 py-3 text-green-600">हाँ</td>
                  <td className="px-4 py-3 text-green-600">हाँ (अपना अनुभाग)</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                </tr>
                <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                  <td className="px-4 py-3 font-bold">योगदानकर्ता/लेखक</td>
                  <td className="px-4 py-3 text-green-600">हाँ</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                  <td className="px-4 py-3 text-red-500">नहीं</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            प्रस्तुति और प्रकाशन प्रक्रिया
          </h2>
          <p className="text-justify font-hindi">
            सामग्री भेजने से लेकर प्रकाशित होने तक की प्रक्रिया स्पष्ट रूप से परिभाषित है। लेखक अपनी सामग्री संपादकीय नीति के अनुरूप जमा करते हैं। सबसे पहले प्राथमिक जाँच (प्रारंभिक जाँच) होती है: तकनीकी रूप से प्रशासक यह देखेगा कि सबमिशन नियमों (जैसे उचित विषय-सिराम, शब्द सीमा, फ़ाइल स्वरूप) के अनुरूप है या नहीं। फिर संपादक प्रबंध (संपादक आवंटन) के तहत काम को सम्बंधित अनुभागीय संपादक और फिर प्रधान संपादक को भेजा जाता है। संपादक और तथ्य-जांच टीम मिलकर सामग्री की वैधता, तथ्यों की सटीकता, स्रोतों की पूर्ति इत्यादि की जाँच करते हैं। आवश्यकतानुसार कानूनी समीक्षा की जाएगी (जैसे मानहानि या संवेदनशील जानकारी की पुष्टि हेतु)। अंतिम परिष्करण के बाद, मुख्य संपादक अपने विवेक से प्रकाशन का निर्णय देते हैं। प्रकाशित होने पर सामग्री को वेबसाइट पर उचित श्रेणी और टैग के साथ प्रकाशित किया जाता है।
          </p>

          <p className="font-hindi font-bold text-slate-900 dark:text-white pt-2 mb-4 text-center">
            प्रकाशन प्रक्रिया का प्रवाह:
          </p>
          <div className="flex flex-col items-center space-y-3 py-6 max-w-lg mx-auto">
            {/* Step 1 */}
            <div className="w-full text-center group">
              <div className="bg-white dark:bg-[#0D1527] border-2 border-[#E7E2D8] dark:border-slate-800 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg dark:hover:shadow-orange-500/10">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">चरण 01</span>
                </div>
                <h3 className="font-hindi font-bold text-slate-900 dark:text-white text-base md:text-lg">
                  लेखक द्वारा सामग्री सबमिशन
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-1">
                  लेखक अपनी मौलिक सामग्री, आलेख या रचना सबमिट करते हैं।
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center text-slate-350 dark:text-slate-700 animate-pulse py-1">
              <ArrowDown className="w-6 h-6" />
            </div>

            {/* Step 2 */}
            <div className="w-full text-center group">
              <div className="bg-white dark:bg-[#0D1527] border-2 border-[#E7E2D8] dark:border-slate-800 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg dark:hover:shadow-orange-500/10">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">चरण 02</span>
                </div>
                <h3 className="font-hindi font-bold text-slate-900 dark:text-white text-base md:text-lg">
                  प्राथमिक जाँच (प्रशासक द्वारा)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-1">
                  तकनीकी रूप से प्रशासक यह सुनिश्चित करता है कि सबमिशन नियमों के अनुरूप हो।
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center text-slate-350 dark:text-slate-700 animate-pulse py-1">
              <ArrowDown className="w-6 h-6" />
            </div>

            {/* Step 3 */}
            <div className="w-full text-center group">
              <div className="bg-white dark:bg-[#0D1527] border-2 border-[#E7E2D8] dark:border-slate-800 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg dark:hover:shadow-orange-500/10">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">चरण 03</span>
                </div>
                <h3 className="font-hindi font-bold text-slate-900 dark:text-white text-base md:text-lg">
                  खंड-संपादक को सौंपा गया
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-1">
                  सामग्री को संबंधित अनुभाग (जैसे साहित्य, समाचार, आदि) के संपादक को आवंटित किया जाता है।
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center text-slate-350 dark:text-slate-700 animate-pulse py-1">
              <ArrowDown className="w-6 h-6" />
            </div>

            {/* Step 4 */}
            <div className="w-full text-center group">
              <div className="bg-white dark:bg-[#0D1527] border-2 border-[#E7E2D8] dark:border-slate-800 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg dark:hover:shadow-orange-500/10">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">चरण 04</span>
                </div>
                <h3 className="font-hindi font-bold text-slate-900 dark:text-white text-base md:text-lg">
                  तथ्य-जाँचे एवं संपादन
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-1">
                  सत्यता, आंकड़ों की पुष्टि, भाषा-सुधार और साहित्यिक चोरी की गहन जाँच की जाती है।
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center text-slate-350 dark:text-slate-700 animate-pulse py-1">
              <ArrowDown className="w-6 h-6" />
            </div>

            {/* Step 5 */}
            <div className="w-full text-center group">
              <div className="bg-white dark:bg-[#0D1527] border-2 border-[#E7E2D8] dark:border-slate-800 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg dark:hover:shadow-orange-500/10">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">चरण 05</span>
                </div>
                <h3 className="font-hindi font-bold text-slate-900 dark:text-white text-base md:text-lg">
                  कानूनी समीक्षा (यदि आवश्यक)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-1">
                  मानहानि, कॉपीराइट उल्लंघन या संवेदनशील विषयों के कानूनी पहलुओं की पड़ताल।
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center text-slate-350 dark:text-slate-700 animate-pulse py-1">
              <ArrowDown className="w-6 h-6" />
            </div>

            {/* Step 6 */}
            <div className="w-full text-center group">
              <div className="bg-white dark:bg-[#0D1527] border-2 border-[#E7E2D8] dark:border-slate-800 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg dark:hover:shadow-orange-500/10">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">चरण 06</span>
                </div>
                <h3 className="font-hindi font-bold text-slate-900 dark:text-white text-base md:text-lg">
                  अंतिम संपादन/अनुमोदन (प्रधान संपादक)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-1">
                  मुख्य संपादक (प्रधान संपादक) द्वारा सामग्री का अंतिम अवलोकन एवं प्रकाशन की मंजूरी।
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center text-slate-350 dark:text-slate-700 animate-pulse py-1">
              <ArrowDown className="w-6 h-6" />
            </div>

            {/* Step 7 */}
            <div className="w-full text-center group">
              <div className="bg-white dark:bg-[#0D1527] border-2 border-[#E7E2D8] dark:border-slate-800 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg dark:hover:shadow-emerald-500/10">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">चरण 07</span>
                </div>
                <h3 className="font-hindi font-bold text-slate-900 dark:text-white text-base md:text-lg">
                  वेबसाइट पर प्रकाशन
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-1">
                  स्वीकृत आलेख को उचित अनुभाग और टैग के साथ वेबसाइट पर लाइव किया जाता है।
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center text-slate-350 dark:text-slate-700 animate-pulse py-1">
              <ArrowDown className="w-6 h-6" />
            </div>

            {/* Step 8 */}
            <div className="w-full text-center group">
              <div className="bg-white dark:bg-[#0D1527] border-2 border-[#E7E2D8] dark:border-slate-800 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg dark:hover:shadow-emerald-500/10">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">चरण 08</span>
                </div>
                <h3 className="font-hindi font-bold text-slate-900 dark:text-white text-base md:text-lg">
                  समाज माध्यम/न्यूज़लेटर में सूचना
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-1">
                  प्रकाशित आलेख को सोशल मीडिया प्लेटफॉर्म और ई-मेल न्यूज़लेटर द्वारा पाठकों तक प्रसारित किया जाता है।
                </p>
              </div>
            </div>
          </div>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            तथ्य-जांच और सत्यापन
          </h2>
          <p className="text-justify font-hindi">
            हमारी नीति स्पष्ट है कि किसी भी सामग्री में प्रकाशित तथ्य सत्यापित और विश्वसनीय स्रोतों पर आधारित होना चाहिए। सभी रिपोर्टों, लेखों और फीचर्स में प्रयुक्त आंकड़े, उद्धरण या डेटा को स्वतंत्र स्रोतों से क्रॉस-चेक किया जाएगा। Press Council के मानकों के अनुरूप, “न्यूज़पेपर गलत, बिना आधार या भ्रामक सामग्री के प्रकाशन से बचेंगे; विवादास्पद मुद्दों के सभी पक्ष प्रकट किए जाएंगे; कथित अफवाहों को तथ्यों की तरह प्रस्तुत नहीं किया जाएगा”। इसी भावना में, लेखिका/लेखक को सटीक संदर्भ देने होंगे; जहां संभव हो, मूल दस्तावेजों (सरकारी रिपोर्ट, अध्ययन आदि) के लिंक उपलब्ध कराए जाएँ। होमपेज पर फ़ीचर पोस्ट करने से पहले कम से कम दो स्वतंत्र स्रोतों द्वारा पुष्टि अनिवार्य होगी।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            सुधार और पुन:प्रकाश
          </h2>
          <p className="text-justify font-hindi">
            गलतियों की पारदर्शी जाँच और त्वरित सुधार हमारी नीति का अभिन्न अंग है। किसी भी प्रकार की तथ्यात्मक त्रुटि, संपादन में चूक या कानूनी उल्लंघन की स्थिति में, युवाक्षर तुरंत सुधारात्मक कार्रवाई करेगा।
          </p>

          <p className="font-hindi font-bold text-slate-900 dark:text-white">
            त्रुटि के प्रकार के अनुसार प्रत्युत्तर समय-सीमा:
          </p>
          <div className="overflow-x-auto border border-[#E7E2D8] dark:border-slate-800 rounded-xl my-4">
            <table className="w-full text-xs sm:text-sm text-left font-hindi">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-[#E7E2D8] dark:border-slate-800 text-slate-700 dark:text-slate-350">
                <tr>
                  <th className="px-4 py-3 font-bold">त्रुटि का प्रकार</th>
                  <th className="px-4 py-3 font-bold">प्रतिक्रिया समय</th>
                  <th className="px-4 py-3 font-bold">प्रक्रिया</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2D8] dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-3 font-bold">मामूली तथ्यात्मक त्रुटि</td>
                  <td className="px-4 py-3">24 घंटे में</td>
                  <td className="px-4 py-3">लेख में उचित संशोधन, नोट में उल्लेख</td>
                </tr>
                <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                  <td className="px-4 py-3 font-bold">गंभीर तथ्यात्मक त्रुटि</td>
                  <td className="px-4 py-3">48 घंटे में</td>
                  <td className="px-4 py-3">लेख अद्यतन, शीर्ष पर सुधार नोटिस प्रकाशित</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold">ग़लत कानूनी/नीति उल्लंघन सामग्री</td>
                  <td className="px-4 py-3 text-red-600 font-bold">तुरंत (12 घंटे में)</td>
                  <td className="px-4 py-3">लेख को तत्काल हटाएं/संशोधित करें, क्षमा नोटिस</td>
                </tr>
                <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                  <td className="px-4 py-3 font-bold">प्रायोजित/विज्ञापित सामग्री की गलती</td>
                  <td className="px-4 py-3">48 घंटे में</td>
                  <td className="px-4 py-3">स्पष्ट रूप से अद्यतन नोटिस के साथ संशोधन</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="font-hindi font-bold text-slate-900 dark:text-white pt-6 mb-4 text-center">
            सुधार प्रक्रिया का प्रवाह (सुधार एवं प्रत्याहार प्रक्रिया):
          </p>
          <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 my-4 max-w-2xl mx-auto space-y-6">
            
            {/* Top Linear Flow */}
            <div className="flex flex-col items-center space-y-3">
              {/* Step 1 */}
              <div className="w-full max-w-md bg-white dark:bg-[#0D1527] border-2 border-[#E7E2D8] dark:border-slate-800 rounded-xl p-4 text-center hover:scale-[1.01] transition-transform duration-300">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">चरण 1</span>
                </div>
                <h4 className="font-hindi font-bold text-slate-900 dark:text-white text-sm md:text-base">
                  त्रुटि या शिकायत के बारे में सूचना
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-1">
                  पाठकों, लेखकों या बाहरी स्रोतों से त्रुटि या शिकायत प्राप्त होना।
                </p>
              </div>

              {/* Arrow */}
              <ArrowDown className="w-5 h-5 text-slate-350 dark:text-slate-700 animate-pulse" />

              {/* Step 2 */}
              <div className="w-full max-w-md bg-white dark:bg-[#0D1527] border-2 border-[#E7E2D8] dark:border-slate-800 rounded-xl p-4 text-center hover:scale-[1.01] transition-transform duration-300">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">चरण 2</span>
                </div>
                <h4 className="font-hindi font-bold text-slate-900 dark:text-white text-sm md:text-base">
                  संपादक द्वारा समीक्षा
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-1">
                  संपादकीय टीम शिकायत की सत्यता और प्रासंगिकता की जांच करती है।
                </p>
              </div>

              {/* Arrow */}
              <ArrowDown className="w-5 h-5 text-slate-350 dark:text-slate-700 animate-pulse" />

              {/* Decision Diamond */}
              <div className="w-48 h-48 flex items-center justify-center relative my-2">
                {/* Visual Diamond Backing */}
                <div className="absolute inset-0 bg-amber-500/5 dark:bg-amber-500/10 border-2 border-amber-500 rounded-2xl rotate-45 transition-transform duration-300 hover:scale-[1.02]"></div>
                {/* Text inside Diamond (Not rotated) */}
                <div className="relative text-center p-4 z-10 flex flex-col items-center">
                  <HelpCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-1" />
                  <h4 className="font-hindi font-bold text-slate-900 dark:text-white text-xs md:text-sm leading-tight">
                    क्या सुधार आवश्यक है?
                  </h4>
                </div>
              </div>
            </div>

            {/* Split Flow (Yes / No) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              
              {/* Left Column: Yes (हाँ) */}
              <div className="space-y-3 border-t md:border-t-0 md:border-r border-[#E7E2D8] dark:border-slate-800 pt-4 md:pt-0 md:pr-6 flex flex-col items-center">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-hindi mb-2">
                  हाँ (सुधार आवश्यक है)
                </div>

                {/* Step 3 - Yes Flow */}
                <div className="w-full bg-white dark:bg-[#0D1527] border-2 border-emerald-500/40 dark:border-emerald-500/20 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <FileEdit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold">चरण 3A</span>
                  </div>
                  <h5 className="font-hindi font-bold text-slate-900 dark:text-white text-xs md:text-sm">
                    सुधार नोटिस तैयार करना
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-hindi mt-1">
                    त्रुटि का विवरण और सुधार की रूपरेखा तैयार की जाती है।
                  </p>
                </div>

                <ArrowDown className="w-4 h-4 text-emerald-500/60" />

                {/* Step 4 - Yes Flow */}
                <div className="w-full bg-white dark:bg-[#0D1527] border-2 border-emerald-500/40 dark:border-emerald-500/20 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold">चरण 4A</span>
                  </div>
                  <h5 className="font-hindi font-bold text-slate-900 dark:text-white text-xs md:text-sm">
                    संपादक द्वारा मंजूरी
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-hindi mt-1">
                    मुख्य संपादक या नामित संपादक सुधार नोटिस को स्वीकृत करते हैं।
                  </p>
                </div>

                <ArrowDown className="w-4 h-4 text-emerald-500/60" />

                {/* Step 5 - Yes Flow */}
                <div className="w-full bg-white dark:bg-[#0D1527] border-2 border-emerald-500/40 dark:border-emerald-500/20 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold">चरण 5A</span>
                  </div>
                  <h5 className="font-hindi font-bold text-slate-900 dark:text-white text-xs md:text-sm">
                    सुधार नोटिस प्रकाशित करना
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-hindi mt-1">
                    वेबसाइट पर सुधार नोटिस को सार्वजनिक रूप से प्रदर्शित किया जाता है।
                  </p>
                </div>

                <ArrowDown className="w-4 h-4 text-emerald-500/60" />

                {/* Step 6 - Yes Flow */}
                <div className="w-full bg-white dark:bg-[#0D1527] border-2 border-emerald-500/40 dark:border-emerald-500/20 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold">चरण 6A</span>
                  </div>
                  <h5 className="font-hindi font-bold text-slate-900 dark:text-white text-xs md:text-sm">
                    लेख अद्यतन एवं तारीख संशोधित
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-hindi mt-1">
                    मूल लेख को संशोधित कर अंतिम अद्यतन की तिथि अंकित की जाती है।
                  </p>
                </div>

                <ArrowDown className="w-4 h-4 text-emerald-500/60" />

                {/* Step 7 - Yes Flow */}
                <div className="w-full bg-white dark:bg-[#0D1527] border-2 border-emerald-500/60 dark:border-emerald-500/30 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold">चरण 7A</span>
                  </div>
                  <h5 className="font-hindi font-bold text-slate-900 dark:text-white text-xs md:text-sm">
                    सुधार रिकॉर्ड में जोड़ें एवं संबंधित पक्षों को सूचित करें
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-hindi mt-1">
                    पारदर्शिता के लिए सुधार रजिस्टर में प्रविष्टि और शिकायतकर्ता को सूचित करना।
                  </p>
                </div>
              </div>

              {/* Right Column: No (नहीं) */}
              <div className="space-y-3 pt-4 md:pt-0 flex flex-col items-center">
                <div className="inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold font-hindi mb-2">
                  नहीं (सुधार आवश्यक नहीं है)
                </div>

                {/* Step 3 - No Flow */}
                <div className="w-full bg-white dark:bg-[#0D1527] border-2 border-rose-500/40 dark:border-rose-500/20 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Ban className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold">चरण 3B</span>
                  </div>
                  <h5 className="font-hindi font-bold text-slate-900 dark:text-white text-xs md:text-sm">
                    कोई कार्रवाई नहीं, लॉग रखें
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-hindi mt-1">
                    शिकायत निराधार होने पर कोई बदलाव नहीं किया जाता, केवल संदर्भ के लिए लॉग सुरक्षित रखा जाता है।
                  </p>
                </div>
              </div>

            </div>
          </div>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            साहित्यिक चोरी और मौलिकता
          </h2>
          <p className="text-justify font-hindi">
            युवाक्षर में सबमिट की गई हर सामग्री मौलिक होनी चाहिए। लेखक यह सुनिश्चित करेंगे कि उनकी सामग्री पहले कहीं प्रकाशित नहीं हुई है और यह किसी अन्य का कॉपीराइट उल्लंघन नहीं करती। कोई भी कट-पेस्ट या चोरी का काम अस्वीकार्य है। प्रौद्योगिकी की सहायता से नियमित रूप से सामग्री की जांच की जाएगी। यदि उल्लंघन पाया जाता है, तो संबंधित लेख को डिलीट कर दिया जाएगा और योगदानकर्ता पर पाबंदी लगाई जा सकती है।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            स्रोत उद्धरण और संदर्भ
          </h2>
          <p className="text-justify font-hindi">
            सभी तथ्यों, उद्धरणों और आंकड़ों के साथ उचित स्रोत का उल्लेख अनिवार्य है। जहां बाहरी स्रोतों से उद्धरण लिया गया है, वहीं मूल लिखावट के रूप में उद्धरण चिह्न/अधिकारवार्ता के साथ स्पष्टीकरण देना होगा। उदाहरणार्थ, “समिति की रिपोर्ट के अनुसार…” या “अखबार द हिन्दू में प्रकाशित खबर के मुताबिक…।” Press Council के निर्देशानुसार, मूल लेखकों को क्रेडिट देना और श्रेयाधिकार रखना नैतिक आवश्यक है। इंटरनेट से लिए गए आंकड़ों को भी विश्वसनीय स्रोत से क्रॉस-चेक कर उचित बैकग्राउंड या फुटनोट में उद्धृत किया जाएगा।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            गुमनाम और गोपनीय स्रोत
          </h2>
          <p className="text-justify font-hindi">
            घुसपैठपूर्ण या असुरक्षित रिपोर्टिंग से बचते हुए, हम गुमनाम स्रोतों का सीमित और सावधानीपूर्वक उपयोग करेंगे। गुमनाम स्रोत तब स्वीकार्य हैं जब जानकारी अत्यंत महत्वपूर्ण हो और इसे पब्लिक रिकॉर्ड या ओपन स्रोत से पुष्टि न किया जा सके। Associated Press की नीति के मुताबिक, गुमनाम जानकारी “केवल तभी उपयोग की जानी चाहिए जब वह तथ्यात्मक हो, जरूरी हो, विश्वसनीय स्रोत से आई हो, और केवल वही तरीका हो जिससे जानकारी मिल सकती है”। स्रोत के अनुरोध पर ऑफ-द-रिकॉर्ड चर्चा केवल तभी होगी जब रिपोर्टर पहले ही रिकॉर्ड पर जाने के प्रयास कर चुका हो। किसी भी गुमनाम स्रोत के सामग्री का उपयोग प्रधान संपादक की मंजूरी से होगा, और प्रत्येक गुमनाम योगदान के पीछे एक विश्वसनीय तर्क होना चाहिए।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            हितों के टकराव
          </h2>
          <p className="text-justify font-hindi">
            हमारे पत्रकारों, संपादकों और प्रशासनिक कर्मियों को व्यक्तिगत या वित्तीय हितों से विरहित रहना चाहिए। यदि किसी संपादक या लेखक का कोई निजी संबंध या आर्थिक हित किसी रिपोर्ट या विषय से जुड़ता है, तो उसे घोषित किया जाएगा और संबंधित कार्य से अलग रखा जाएगा। सभी गतिविधियों में पारदर्शिता होनी चाहिए ताकि कोई सवाल न उठ सके।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            विज्ञापन, प्रायोजित और नेटिव सामग्री
          </h2>
          <p className="text-justify font-hindi">
            युवाक्षर में विज्ञापन और संपादकीय सामग्री को स्पष्ट रूप से अलग रखा जाएगा। कोई भी प्रायोजित लेख (Advertorial) या नेटिव विज्ञापन केवल तभी प्रकाशित होगा जब उसे स्पष्ट लेबल (“प्रायोजित पोस्ट”, “विज्ञापन” आदि) के साथ मार्क किया गया हो। Forbes के उदहारणानुसार, विज्ञापन और स्वतंत्र कंटेंट के लिए अलग संपादकीय टीमें होंगी, ताकि राजस्व प्राथमिकताओं से समाचार प्रभावित न हों। प्रायोजित सामग्री में किसी भी प्रकार के हितों को उद्घाटित करते हुए एक समर्पित पृष्ठ पर विज्ञापन नीतियाँ प्रकाशित की जाएंगी।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            AI/LLM उपयोग नीति
          </h2>
          <p className="text-justify font-hindi">
            आधुनिक युग में कृत्रिम बुद्धिमत्ता (AI) उपकरणों का प्रयोग प्रकाशन में बढ़ा है, पर इस पर पारदर्शी नियंत्रण अनिवार्य है। युवाक्षर में AI का उपयोग निम्न स्तरों पर होगा, और प्रत्येक स्तर के लिए प्रकटीकरण अनिवार्य होगा:
          </p>
          <div className="overflow-x-auto border border-[#E7E2D8] dark:border-slate-800 rounded-xl my-4">
            <table className="w-full text-xs sm:text-sm text-left font-hindi">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-[#E7E2D8] dark:border-slate-800 text-slate-700 dark:text-slate-350">
                <tr>
                  <th className="px-4 py-3 font-bold">स्तर (Level)</th>
                  <th className="px-4 py-3 font-bold">विवरण (Description)</th>
                  <th className="px-4 py-3 font-bold">प्रकटीकरण की आवश्यकता</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2D8] dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-3 font-bold">0: पूर्ण रूप से मानव निर्मित</td>
                  <td className="px-4 py-3">लेख पूरी तरह मानव लेखक ने लिखा है।</td>
                  <td className="px-4 py-3 text-slate-500">नहीं (प्रकटीकरण नहीं जरूरी)</td>
                </tr>
                <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                  <td className="px-4 py-3 font-bold">1: सहायक AI (AI-assisted)</td>
                  <td className="px-4 py-3">मानव ने लेख लिखा, केवल व्याकरण, वर्तनी, स्वरूप आदि के लिए AI टूल का उपयोग किया।</td>
                  <td className="px-4 py-3 text-blue-600">स्वैच्छिक: ‘AI-सहायता संपादन’ (नोट में उल्लेख)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold">2: मिश्रित AI (Mixed)</td>
                  <td className="px-4 py-3">लेख का मसौदा AI ने तैयार किया, पर मानव संपादक ने व्यापक संपादन और सत्यापन किया।</td>
                  <td className="px-4 py-3 text-orange-600 font-bold">अनिवार्य: सामग्री में ‘AI-जनित सामग्री’ स्पष्टता हेतु</td>
                </tr>
                <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                  <td className="px-4 py-3 font-bold">3: पूर्ण AI-जनित</td>
                  <td className="px-4 py-3">लेख या संरचना मूल रूप से AI मॉडल (LLM) द्वारा उत्पादित, मानव ने जाँच की एवं प्रकाशित किया।</td>
                  <td className="px-4 py-3 text-red-600 font-bold">अनिवार्य: शीर्षक या नोट में ‘AI-जनित सामग्री’ का उल्लेख</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            कॉपीराइट, लाइसेंस, और योगदानकर्ता समझौते
          </h2>
          <p className="text-justify font-hindi">
            सभी लेखकों और योगदानकर्ताओं के साथ स्पष्ट अनुबंध होंगे। एक योगदानकर्ता समझौते में निम्न मुख्य शर्तें शामिल होंगी:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-hindi text-justify">
            <li>
              <strong>कॉपीराइट एवं लाइसेंस:</strong> योगदानकर्ता प्रकाशक को अपने लेख को प्रकाशित करने, पुनर्प्रकाशित करने तथा किसी भी रूप में उपयोग करने का वैध, विश्वव्यापी, असीमित और गैर-रोक योग्य लाइसेंस प्रदान करता है। हालांकि लेख का मूल कॉपीराइट योगदानकर्ता के पास बना रहेगा।
            </li>
            <li>
              <strong>गारंटी एवं हर्जाना:</strong> योगदानकर्ता गारंटी देता है कि उसका लेख मौलिक है, कहीं प्रकाशित नहीं हुआ, किसी अन्य का कॉपीराइट या पेटेंट उल्लंघन नहीं करता, और इसमें कोई आपत्तिजनक या मानहानिकारक सामग्री नहीं है।
            </li>
          </ul>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            गोपनीयता एवं व्यक्तिगत डेटा
          </h2>
          <p className="text-justify font-hindi">
            किसी भी रिपोर्ट में व्यक्तिगत या संवेदनशील जानकारी का उपयोग भारतीय कानूनों के दायरे में होगा। सूचना प्रसारण के विनियम (IT नियम) और सुप्रीम कोर्ट के रुख के अनुसार, प्रत्येक व्यक्ति को निजता का अधिकार है। Press Council के नियमों में स्पष्ट है कि “व्यक्ति की निजता का उल्लंघन तभी स्वीकार्य है जब उसे वास्तविक जनहित से तौलने पर भारी तौल का परिणाम प्राप्त हो, न कि कोई रोगात्मक जिज्ञासा के कारण”। अतः युवाक्षर व्यक्तिगत डेटा प्रकटीकरण में सावधानी रखेगा।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            अल्पवयस्क एवं संवेदनशील विषय
          </h2>
          <p className="text-justify font-hindi">
            बच्चों और संवेदनशील विषयों (जैसे मानसिक स्वास्थ्य, इत्यादि) पर रिपोर्टिंग विशेष सावधानी से की जाएगी। भारत में बाल आश्रय और संरक्षण अधिनियम (JJ Act) के अंतर्गत, नाबालिग की पहचान का प्रकटीकरण प्रतिबंधित है। Press Council के दिशा-निर्देशों के अनुसार, “बच्चों की पहचान उजागर नहीं करनी चाहिए; पीड़ितों के नाम और तस्वीरें नहीं दिखानी चाहिए”। संवेदनशील मुद्दों पर लेख में अभद्र भाषा या तस्वीरें इस्तेमाल नहीं होंगी।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            कानूनी जोखिम प्रबंधन
          </h2>
          <p className="text-justify font-hindi">
            युवाक्षर सभी कानूनी प्रावधानों का पालन करेगा। मानहानि (IPC धारा 499/500), अपमान (IPC 501), अप्रकाशित सामग्री की चोरी, राष्ट्रीय सुरक्षा (IT अधिनियम की धारा 69A इत्यादि) आदि का विशेष ध्यान रखा जाएगा। पत्रकारों को मानहानि कानून की समझ होगी कि बिना ठोस सबूत के किसी की प्रतिष्ठा पर आघात न करें।
          </p>

          <h2 className="font-serif text-xl md:text-2xl font-bold font-hindi text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            संवेदनशील विषयों पर कवरेज
          </h2>
          <p className="text-justify font-hindi">
            युवाक्षर में साम्प्रदायिक तनाव, वैमनस्य, अश्लीलता, नफ़रत भरे भाषण, या किसी समूह के प्रति द्वेषपूर्ण कंटेंट को कड़ाई से नज़रअंदाज़ किया जाएगा। Press Council के अधीन, “अश्लीलता और अपवित्रता को त्याग देना चाहिए”। भारत में संविधान की मूल धाराएं 14, 19(1)(a) आदि के अंतर्गत प्रेस की स्वतंत्रता है, लेकिन इसे कानून द्वारा सीमित भी किया जा सकता है।
          </p>

          {/* Contact Details Card */}
          <div className="bg-[#FAF8F3] dark:bg-[#0F172A]/50 border border-[#E7E2D8] dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 mt-8">
            <h3 className="font-serif text-lg md:text-xl font-bold text-slate-900 dark:text-white border-l-2 border-orange-600 pl-3">
              संपादकीय प्रश्न व शिकायत
            </h3>
            <p className="text-sm font-hindi">
              यदि आपको इस संपादकीय नीति, सुधार अनुरोध या किसी संबंधित विषय पर कोई प्रश्न हो, तो आप हमसे संपर्क कर सकते हैं:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-2">
              <div className="space-y-1">
                <span className="text-slate-400 block">ईमेल</span>
                <a 
                  href="mailto:yuvakshar.editor@gmail.com" 
                  className="text-[#EA580C] hover:underline font-bold text-sm"
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
