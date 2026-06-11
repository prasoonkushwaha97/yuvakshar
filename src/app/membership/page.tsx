"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  X, 
  Shield, 
  Crown, 
  Gem, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Building2, 
  Download, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import confetti from "canvas-confetti";

export default function MembershipPage() {
  const router = useRouter();
  const { 
    currentUser, 
    openAuthModal, 
    purchaseMembership, 
    validateCoupon,
    userMemberships,
    foundingSeatsRemaining,
    submitDonation
  } = useCms();

  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Quarterly" | "Half-Yearly" | "Yearly">("Monthly");
  const [selectedPlan, setSelectedPlan] = useState<"Premium" | "Patron" | "Founding" | "Institutional" | "Lifetime" | null>(null);
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // UPI State
  const [upiId, setUpiId] = useState("");

  // Bank State
  const [selectedBank, setSelectedBank] = useState("");

  // Payment Status
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [paymentDetails, setPaymentDetails] = useState<{ transactionId: string; date: string; invoiceUrl: string } | null>(null);

  // Donation Desk State
  const [donationName, setDonationName] = useState("");
  const [donationEmail, setDonationEmail] = useState("");
  const [donationAmount, setDonationAmount] = useState("500");
  const [donationMessage, setDonationMessage] = useState("");
  const [donationStatus, setDonationStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");

  // Prices configuration
  const prices = {
    Premium: { Monthly: 49, Quarterly: 129, "Half-Yearly": 249, Yearly: 499, "Lifetime": 499 },
    Patron: { Monthly: 199, Quarterly: 549, "Half-Yearly": 999, Yearly: 1999, "Lifetime": 1999 },
    Founding: { Monthly: 250, Quarterly: 699, "Half-Yearly": 1299, Yearly: 2500, "Lifetime": 2500 },
    Institutional: { Monthly: 999, Quarterly: 2799, "Half-Yearly": 4999, Yearly: 9999, "Lifetime": 9999 },
    Lifetime: { Monthly: 15000, Quarterly: 15000, "Half-Yearly": 15000, Yearly: 15000, "Lifetime": 15000 }
  };

  const currentPrices = {
    Premium: prices.Premium[billingCycle] || prices.Premium.Yearly,
    Patron: prices.Patron[billingCycle] || prices.Patron.Yearly,
    Founding: prices.Founding[billingCycle] || prices.Founding.Yearly,
    Institutional: prices.Institutional[billingCycle] || prices.Institutional.Yearly,
    Lifetime: prices.Lifetime[billingCycle] || prices.Lifetime.Yearly
  };

  const getBasePrice = () => {
    if (!selectedPlan) return 0;
    return prices[selectedPlan][billingCycle];
  };

  const getFinalPrice = () => {
    const base = getBasePrice();
    if (!appliedCoupon) return base;
    
    if (appliedCoupon.discountType === "percentage") {
      return Math.max(0, base - (base * appliedCoupon.value) / 100);
    } else {
      return Math.max(0, base - appliedCoupon.value);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponError("कृपया कूपन कोड दर्ज करें।");
      return;
    }

    const coupon = validateCoupon(couponCode.trim());
    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponError("");
      const base = getBasePrice();
      let discount = 0;
      if (coupon.discountType === "percentage") {
        discount = (base * coupon.value) / 100;
      } else {
        discount = coupon.value;
      }
      setDiscountAmount(discount);
    } else {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError("अमान्य या समाप्त कूपन कोड! (जैसे: FESTIVAL50 या YUVAKSHAR10)");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    setCouponError("");
  };

  const handleStartCheckout = (plan: "Premium" | "Patron" | "Founding" | "Institutional" | "Lifetime") => {
    if (!currentUser) {
      openAuthModal(
        () => {
          setSelectedPlan(plan);
          setIsCheckoutOpen(true);
        },
        "सदस्यता खरीदने के लिए कृपया पहले लॉगिन करें।"
      );
      return;
    }
    
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
    setPaymentStatus("idle");
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    setCouponError("");
  };

  const handleSimulatePayment = async (success: boolean) => {
    if (!currentUser || !selectedPlan) return;
    
    setPaymentStatus("processing");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (success) {
      const ok = await purchaseMembership(
        currentUser.id,
        selectedPlan,
        billingCycle,
        appliedCoupon?.code
      );
      
      if (ok) {
        const transId = "pay_" + Math.random().toString(36).substring(2, 10);
        setPaymentDetails({
          transactionId: transId,
          date: new Date().toLocaleDateString("hi-IN"),
          invoiceUrl: `/invoices/${transId}.pdf`
        });
        setPaymentStatus("success");
        
        // Trigger confetti celebration!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        setPaymentStatus("failed");
      }
    } else {
      setPaymentStatus("failed");
    }
  };

  const printInvoice = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const base = getBasePrice();
    const final = getFinalPrice();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>युवाक्षर सदस्यता रसीद (Yuvakshar Subscription Invoice)</title>
          <style>
            body { font-family: 'Noto Sans Devanagari', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #ea580c; }
            .title { font-size: 20px; font-weight: bold; }
            .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .details-table th, .details-table td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            .details-table th { background-color: #f8fafc; }
            .total { font-weight: bold; color: #ea580c; font-size: 18px; }
            .footer { margin-top: 50px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">युवाक्षर (Yuvakshar)</div>
              <div>लेखन, चिंतन और परिवर्तन</div>
            </div>
            <div class="title">सदस्यता चालान (INVOICE)</div>
          </div>
          <h3>चालान विवरण:</h3>
          <p><strong>लेनदेन आईडी (Transaction ID):</strong> ${paymentDetails?.transactionId}</p>
          <p><strong>दिनांक (Date):</strong> ${paymentDetails?.date}</p>
          <p><strong>ग्राहक का नाम (Customer Name):</strong> ${currentUser?.name}</p>
          <p><strong>ईमेल (Email):</strong> ${currentUser?.email}</p>
          
          <table class="details-table">
            <thead>
              <tr>
                <th>विवरण (Description)</th>
                <th>अवधि (Billing Cycle)</th>
                <th>मूल मूल्य (Base Price)</th>
                <th>छूट (Discount)</th>
                <th>कुल राशि (Total Paid)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>युवाक्षर ${selectedPlan === "Premium" ? "प्रीमियम सदस्यता" : "संरक्षक सदस्यता"}</td>
                <td>${billingCycle === "Monthly" ? "मासिक" : billingCycle === "Quarterly" ? "त्रैमासिक" : billingCycle === "Half-Yearly" ? "अर्धवार्षिक" : "वार्षिक"}</td>
                <td>₹${base}</td>
                <td>₹${discountAmount}</td>
                <td class="total">₹${final}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            यह एक कंप्यूटर जनित रसीद है और इसके लिए हस्ताक्षर की आवश्यकता नहीं है। युवाक्षर को समर्थन देने के लिए धन्यवाद।
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Get active membership details if any
  const activeMembership = userMemberships?.find(m => m.userId === currentUser?.id && m.status === "active");

  return (
    <div className="relative min-h-screen bg-yuvakshar-light-bg dark:bg-yuvakshar-dark-bg text-slate-800 dark:text-slate-200 py-12 px-4 md:px-8">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[150px] bg-amber-500/5 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-[150px] bg-rose-500/5 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-primary text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>युवाक्षर सदस्यता हब</span>
          </motion.div>
          
          <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-slate-900 dark:text-white leading-tight">
            वैचारिक स्वतंत्रता को गति दें, <span className="text-gradient-saffron">युवाक्षर के साक्षी बनें</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-serif">
            युवाक्षर केवल एक पत्रिका नहीं, एक स्वतंत्र विचार क्रांति है। हमारी सदस्यता लेकर स्वतंत्र हिंदी पत्रकारिता, गहन साहित्य समीक्षा और रचनात्मक संवाद का समर्थन करें।
          </p>
        </div>

        {/* Current Active Plan Badge */}
        {activeMembership && (
          <div className="max-w-xl mx-auto bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">आपकी वर्तमान सक्रिय योजना</p>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  युवाक्षर {activeMembership.membershipType === "Premium" ? "प्रीमियम" : "संरक्षक (Patron)"} सदस्य
                </h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">सक्रिय</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">वैधता: {activeMembership.expiryDate}</p>
            </div>
          </div>
        )}

        {/* Billing Cycle Switch */}
        <div className="flex justify-center">
          <div className="bg-slate-200 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-300 dark:border-slate-700/50 flex space-x-1 shadow-inner">
            {(["Monthly", "Quarterly", "Half-Yearly", "Yearly"] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  billingCycle === cycle
                    ? "bg-white dark:bg-slate-950 text-primary shadow-md border border-slate-200 dark:border-slate-800"
                    : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
                }`}
              >
                {cycle === "Monthly" && "मासिक"}
                {cycle === "Quarterly" && "त्रैमासिक"}
                {cycle === "Half-Yearly" && "अर्धवार्षिक"}
                {cycle === "Yearly" && "वार्षिक (20% छूट)"}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Free Tier */}
          <GlassCard glow="none" hoverEffect className="flex flex-col h-full border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f172a]/20">
            <div className="space-y-4">
              <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">निःशुल्क सदस्य (Free)</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">बुनियादी पढ़ने और संवाद के लिए आदर्श योजना।</p>
              
              <div className="py-4 border-y border-slate-200 dark:border-slate-800">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹0</span>
                <span className="text-slate-500 text-xs ml-1">/ हमेशा के लिए</span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 pt-2">
                {[
                  "निःशुल्क श्रेणी के लेख पढ़ना",
                  "पब्लिक डिजिटल मैगजीन सामग्री",
                  "लेखों पर टिप्पणी और प्रतिक्रिया देना",
                  "पसंदीदा लेखों को बुकमार्क करना",
                  "साप्ताहिक न्यूज़लेटर की सदस्यता",
                  "लेखकों को फ़ॉलो करना"
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
                {[
                  "प्रीमियम लेखों तक पहुंच",
                  "विशेष शोध और विश्लेषण",
                  "त्रैमासिक भौतिक पत्रिका वितरण",
                  "लेखक सेमिनार और वेबिनार प्रवेश"
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-2 text-slate-400 dark:text-slate-500 line-through">
                    <X className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-8 mt-auto">
              <button 
                disabled
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-center bg-slate-100 dark:bg-slate-900"
              >
                डिफ़ॉल्ट रूप से शामिल
              </button>
            </div>
          </GlassCard>

          {/* Card 2: Premium Tier */}
          <GlassCard glow="gold" hoverEffect className="flex flex-col h-full border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent relative">
            <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Crown className="w-3 h-3" />
              <span>अनुशंसित (Popular)</span>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-serif font-bold text-amber-500 flex items-center space-x-1.5">
                <Crown className="w-5 h-5" />
                <span>प्रीमियम सदस्य (Premium)</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">गहन विश्लेषण, ई-पत्रिका और संपूर्ण स्वाध्याय उपकरण तक पहुंच।</p>
              
              <div className="py-4 border-y border-slate-200 dark:border-slate-800">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{currentPrices.Premium}</span>
                <span className="text-slate-500 text-xs ml-1">
                  / {billingCycle === "Monthly" && "माह"}
                  {billingCycle === "Quarterly" && "त्रैमासिक"}
                  {billingCycle === "Half-Yearly" && "अर्धवार्षिक"}
                  {billingCycle === "Yearly" && "वार्षिक"}
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 pt-2">
                {[
                  "सभी प्रीमियम लेखों तक असीमित पहुंच",
                  "मासिक ई-पत्रिका का ऑनलाइन पाठ",
                  "पूरी तरह विज्ञापन-मुक्त अनुभव",
                  "AI अध्ययन सहायक (असीमित टोकन)",
                  "लेखकों के साथ सीधा बौद्धिक संवाद",
                  "निजी अध्ययन नोट्स निर्माण और सहेजना",
                  "रीडिंग हिस्ट्री और व्यक्तिगत अनुशंसाएं"
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
                {[
                  "त्रैमासिक मुद्रित पत्रिका आपके घर पर",
                  "मासिक वेबिनार और लेखक संगोष्ठी",
                  "संपादकीय बोर्ड चर्चा में विशेष भागीदारी"
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-2 text-slate-400 dark:text-slate-500 line-through">
                    <X className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-8 mt-auto">
              <button 
                onClick={() => handleStartCheckout("Premium")}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold transition-all shadow-md cursor-pointer hover:shadow-lg shadow-orange-500/10 text-center"
              >
                {activeMembership?.membershipType === "Premium" ? "योजना नवीनीकृत करें" : "प्रीमियम सदस्यता लें"}
              </button>
            </div>
          </GlassCard>

          {/* Card 3: Patron Tier */}
          <GlassCard glow="saffron" hoverEffect className="flex flex-col h-full border-rose-500/20 bg-gradient-to-b from-rose-500/5 to-transparent">
            <div className="space-y-4">
              <h3 className="text-xl font-serif font-bold text-rose-500 flex items-center space-x-1.5">
                <Gem className="w-5 h-5" />
                <span>संरक्षक सदस्य (Patron)</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">सच्ची बौद्धिकता के समर्थक। भौतिक प्रति और संपादकीय संवाद का विशेष अवसर।</p>
              
              <div className="py-4 border-y border-slate-200 dark:border-slate-800">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{currentPrices.Patron}</span>
                <span className="text-slate-500 text-xs ml-1">
                  / {billingCycle === "Monthly" && "माह"}
                  {billingCycle === "Quarterly" && "त्रैमासिक"}
                  {billingCycle === "Half-Yearly" && "अर्धवार्षिक"}
                  {billingCycle === "Yearly" && "वार्षिक"}
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 pt-2">
                {[
                  "प्रीमियम की सभी सुविधाएं शामिल",
                  "त्रैमासिक मुद्रित पत्रिका सीधे डाक से घर पर",
                  "विशेष वेबिनार और लेखक कार्यशालाओं तक पहुंच",
                  "वर्ष में दो बार संपादकीय चर्चा में भाग लें",
                  "मुद्रित संस्करण और वेबसाइट पर आभार सूचक नाम",
                  "प्रोफ़ाइल पर विशिष्ट 'युवाक्षर संरक्षक' बैज",
                  "साहित्यिक शोध प्रस्तावों के लिए वित्तीय समर्थन",
                  "प्राथमिकता लेख समीक्षा"
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-8 mt-auto">
              <button 
                onClick={() => handleStartCheckout("Patron")}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold transition-all shadow-md cursor-pointer hover:shadow-lg shadow-rose-500/10 text-center"
              >
                {activeMembership?.membershipType === "Patron" ? "संरक्षण नवीनीकृत करें" : "संरक्षक सदस्य बनें"}
              </button>
            </div>
          </GlassCard>

        </div>

        {/* Pricing Cards Row 2 */}
        <div className="pt-6">
          <h3 className="text-center font-serif text-lg font-bold text-slate-700 dark:text-slate-350 mb-6">विशेष सदस्यता श्रेणियां (Special Tiers)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 4: Founding Member */}
            <GlassCard glow="blue" hoverEffect className="flex flex-col h-full border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent relative">
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                <span>केवल {foundingSeatsRemaining} सीटें शेष!</span>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold text-blue-400 flex items-center space-x-1.5 font-hindi">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span>संस्थापक सदस्य (Founding)</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">स्वतंत्र वैचारिक विमर्श की स्थायी आधारशिला। संपादकीय मंडल में सर्वोच्च विशेषाधिकार।</p>
                
                <div className="py-4 border-y border-slate-200 dark:border-slate-800">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{currentPrices.Founding}</span>
                  <span className="text-slate-500 text-xs ml-1 font-hindi">
                    / {billingCycle === "Monthly" && "माह"}
                    {billingCycle === "Quarterly" && "त्रैमासिक"}
                    {billingCycle === "Half-Yearly" && "अर्धवार्षिक"}
                    {billingCycle === "Yearly" && "वार्षिक"}
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-350 pt-2 font-hindi">
                  {[
                    "प्रीमियम व संरक्षक की सभी सुविधाएं शामिल",
                    "वेबसाइट पर संस्थापक पट्टिका में नाम का स्थायी उल्लेख",
                    "वार्षिक मुद्रित विशेषांक की मानद वीआईपी प्रति",
                    "संपादकीय गोलमेज चर्चा एवं विमर्श बैठकों में आमंत्रण",
                    "भविष्य की गतिविधियों में मानद प्रवेश",
                    "शोध आलेखों के लिए सर्वोच्च समीक्षा प्राथमिकता",
                    "प्रोफ़ाइल पर स्वर्ण संस्थापक बैज"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-8 mt-auto">
                <button 
                  onClick={() => handleStartCheckout("Founding")}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold transition-all shadow-md cursor-pointer hover:shadow-lg shadow-blue-500/15 text-center"
                >
                  {activeMembership?.membershipType === "Founding" ? "नवीनीकृत करें" : "संस्थापक सदस्य बनें"}
                </button>
              </div>
            </GlassCard>

            {/* Card 5: Institutional Member */}
            <GlassCard glow="none" hoverEffect className="flex flex-col h-full border-indigo-500/25 bg-gradient-to-b from-indigo-500/5 to-transparent">
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold text-indigo-400 flex items-center space-x-1.5 font-hindi">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <span>संस्थागत सदस्य (Institutional)</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">विश्वविद्यालयों, पुस्तकालयों और ज्ञान-संगठनों के लिए बहु-उपयोगकर्ता पहुंच।</p>
                
                <div className="py-4 border-y border-slate-200 dark:border-slate-800">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{currentPrices.Institutional}</span>
                  <span className="text-slate-500 text-xs ml-1 font-hindi">
                    / {billingCycle === "Monthly" && "माह"}
                    {billingCycle === "Quarterly" && "त्रैमासिक"}
                    {billingCycle === "Half-Yearly" && "अर्धवार्षिक"}
                    {billingCycle === "Yearly" && "वार्षिक"}
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-350 pt-2 font-hindi">
                  {[
                    "एक साथ ५ उपयोगकर्ताओं के लिए पूर्ण असीमित पहुंच",
                    "त्रैमासिक मुद्रित प्रतियों का बंडल (५ प्रतियां)",
                    "अकादमिक संदर्भों और शोध के लिए विशेष डेटाबेस पहुंच",
                    "संस्था के नाम व लोगो का मुख्य पोर्टल पर प्रदर्शन",
                    "वार्षिक अकादमिक संगोष्ठियों में आमंत्रण",
                    "संस्था के शोध आलेखों के लिए विशेष समीक्षा चैनल"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-8 mt-auto">
                <button 
                  onClick={() => handleStartCheckout("Institutional")}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-indigo-650 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold transition-all shadow-md cursor-pointer hover:shadow-lg text-center"
                >
                  {activeMembership?.membershipType === "Institutional" ? "योजना नवीनीकृत करें" : "संस्थागत सदस्य बनें"}
                </button>
              </div>
            </GlassCard>

            {/* Card 6: Lifetime Member */}
            <GlassCard glow="gold" hoverEffect className="flex flex-col h-full border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent relative">
              <div className="absolute top-4 right-4 bg-purple-600 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                <span>आजीवन (Lifetime)</span>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold text-purple-400 flex items-center space-x-1.5 font-hindi">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <span>आजीवन सदस्य (Lifetime)</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">युवाक्षर के साथ जीवनभर का बौद्धिक जुड़ाव। कभी न समाप्त होने वाली बौद्धिक विरासत।</p>
                
                <div className="py-4 border-y border-slate-200 dark:border-slate-800">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹15,000</span>
                  <span className="text-slate-500 text-xs ml-1 font-hindi">/ एक बार भुगतान</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-350 pt-2 font-hindi">
                  {[
                    "आजीवन सभी प्रीमियम एवं संरक्षक सुविधाएं मुफ़्त",
                    "आगामी सभी मुद्रित अंकों की निःशुल्क आजीवन होम-डिलीवरी",
                    "युवाक्षर साहित्यिक न्यास में मानद आजीवन सदस्यता",
                    "लेखन सम्मेलनों और वार्षिकोत्सवों में मानद वीआईपी सीट",
                    "आजीवन पदक और मानद स्मृति पट्टिका",
                    "कभी भी नवीनीकरण की आवश्यकता नहीं"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-8 mt-auto">
                <button 
                  onClick={() => handleStartCheckout("Lifetime")}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-500 to-indigo-650 hover:from-purple-650 hover:to-indigo-700 text-white font-bold transition-all shadow-md cursor-pointer hover:shadow-lg shadow-purple-500/10 text-center"
                >
                  {activeMembership?.membershipType === "Lifetime" ? "सक्रिय आजीवन सदस्यता" : "आजीवन सदस्यता लें"}
                </button>
              </div>
            </GlassCard>

          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="pt-12 space-y-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-slate-900 dark:text-white">सदस्यता तुलना तालिका (Comparison Matrix)</h2>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-[#0f172a]/20 backdrop-blur-md">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 font-serif">
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">सुविधाएं (Features)</th>
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">निःशुल्क (Free)</th>
                  <th className="p-4 font-bold text-amber-500">प्रीमियम (Premium)</th>
                  <th className="p-4 font-bold text-rose-500">संरक्षक (Patron)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                  { name: "वेबसाइट के बुनियादी लेख", free: true, prem: true, patron: true },
                  { name: "लेखों पर टिप्पणी और बुकमार्क", free: true, prem: true, patron: true },
                  { name: "प्रीमियम लेख एवं शोध पत्र", free: false, prem: true, patron: true },
                  { name: "मासिक डिजिटल पत्रिका पठन", free: false, prem: true, patron: true },
                  { name: "विज्ञापन-मुक्त पठन अनुभव", free: false, prem: true, patron: true },
                  { name: "AI अध्ययन सहायक (Notes/Summaries)", free: "सीमित (Limited)", prem: "असीमित (Unlimited)", patron: "असीमित (Unlimited)" },
                  { name: "त्रैमासिक मुद्रित पत्रिका (भौतिक प्रति)", free: false, free_desc: "खरीदना होगा", prem: false, prem_desc: "खरीदना होगा", patron: true, patron_desc: "मुफ़्त डिलीवरी" },
                  { name: "लेखक सेमिनार और वेबिनार पहुंच", free: false, prem: false, patron: true },
                  { name: "संपादकीय मंडल की चर्चा बैठक", free: false, prem: false, patron: true },
                  { name: "विशिष्ट प्रोफ़ाइल बैज", free: false, prem: "प्रीमियम बैज", patron: "संरक्षक बैज" }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/20">
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-300">{row.name}</td>
                    <td className="p-4">
                      {typeof row.free === "boolean" ? (row.free ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-slate-300 dark:text-slate-600" />) : row.free}
                    </td>
                    <td className="p-4">
                      {typeof row.prem === "boolean" ? (row.prem ? <Check className="w-5 h-5 text-amber-500" /> : <X className="w-5 h-5 text-slate-300 dark:text-slate-600" />) : row.prem}
                    </td>
                    <td className="p-4">
                      {typeof row.patron === "boolean" ? (row.patron ? <Check className="w-5 h-5 text-rose-500" /> : <X className="w-5 h-5 text-slate-300 dark:text-slate-600" />) : row.patron}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security / Quality badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-center">
          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/10 flex flex-col items-center space-y-2">
            <Shield className="w-8 h-8 text-primary" />
            <h4 className="font-bold font-serif text-slate-900 dark:text-white">सुरक्षित भुगतान (Safe Checkout)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">सभी भुगतान 256-बिट एन्क्रिप्टेड भुगतान सैंडबॉक्स के माध्यम से सुरक्षित रूप से प्रोसेस किए जाते हैं।</p>
          </div>
          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/10 flex flex-col items-center space-y-2">
            <X className="w-8 h-8 text-primary" />
            <h4 className="font-bold font-serif text-slate-900 dark:text-white">कभी भी रद्द करें (Cancel Anytime)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">कोई बाध्यता नहीं। आप अपने डैशबोर्ड से कभी भी ऑटो-रिन्यूअल बंद कर सकते हैं।</p>
          </div>
          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/10 flex flex-col items-center space-y-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h4 className="font-bold font-serif text-slate-900 dark:text-white">राष्ट्र निर्माण में योगदान</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">आपका प्रत्येक योगदान स्वतंत्र विचारों, गहन विमर्श और हिंदी ज्ञान-पारिस्थितिकी के विकास में लगाया जाता है।</p>
          </div>
        </div>
      </div>

      {/* RAZORPAY SANDBOX CHECKOUT MODAL OVERLAY */}
      <AnimatePresence>
        {isCheckoutOpen && selectedPlan && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Checkout Header */}
              <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-5 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg font-serif">यु</div>
                  <div>
                    <h3 className="font-bold font-serif text-base leading-tight">युवाक्षर गेटवे (Razorpay Sandbox)</h3>
                    <p className="text-[10px] text-white/80">सुरक्षित सदस्यता भुगतान</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Processing View */}
              {paymentStatus === "processing" && (
                <div className="p-10 text-center flex flex-col items-center justify-center space-y-6 min-h-[400px]">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-2">
                    <h4 className="text-white font-bold font-serif text-lg">भुगतान प्रसंस्कृत किया जा रहा है...</h4>
                    <p className="text-slate-400 text-xs font-mono">कृपया ब्राउज़र रिफ्रेश न करें। आपके लेनदेन को सत्यापित किया जा रहा है।</p>
                  </div>
                </div>
              )}

              {/* Success View */}
              {paymentStatus === "success" && paymentDetails && (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-6 min-h-[400px]">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-white font-serif font-extrabold text-xl">भुगतान सफल! (Payment Successful)</h3>
                    <p className="text-slate-400 text-xs">युवाक्षर सदस्यता में आपका स्वागत है।</p>
                  </div>

                  {/* Receipt Box */}
                  <div className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-left text-xs font-mono space-y-2 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">लेनदेन आईडी (Transaction ID):</span>
                      <span className="text-emerald-400">{paymentDetails.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">सदस्यता योजना (Plan):</span>
                      <span className="text-white">युवाक्षर {selectedPlan === "Premium" ? "प्रीमियम" : "संरक्षक"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">भुगतान चक्र (Cycle):</span>
                      <span className="text-white">{billingCycle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">भुगतान की राशि (Amount):</span>
                      <span className="text-primary font-bold">₹{getFinalPrice()}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-2 mt-2">
                      <span className="text-slate-500">दिनांक (Date):</span>
                      <span>{paymentDetails.date}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      onClick={printInvoice}
                      className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium text-xs transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>चालान/रसीद प्रिंट करें</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        router.push("/dashboard");
                      }}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white py-3 rounded-xl font-medium text-xs transition-all cursor-pointer"
                    >
                      <span>डैशबोर्ड पर जाएं</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Failed View */}
              {paymentStatus === "failed" && (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-6 min-h-[400px]">
                  <div className="w-16 h-16 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-white font-serif font-extrabold text-xl">भुगतान विफल रहा (Payment Failed)</h3>
                    <p className="text-slate-400 text-xs">अपूर्ण प्रमाणीकरण या अपर्याप्त राशि।</p>
                  </div>

                  <p className="text-slate-400 text-xs max-w-sm">
                    आपका पैसा सुरक्षित है। यदि बैंक से पैसे कट गए हैं, तो वे 3-5 कार्य दिवसों में स्वतः वापस आ जाएंगे। कृपया पुनः प्रयास करें।
                  </p>

                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setIsCheckoutOpen(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium text-xs transition-all cursor-pointer"
                    >
                      <span>रद्द करें</span>
                    </button>
                    <button
                      onClick={() => setPaymentStatus("idle")}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white py-3 rounded-xl font-medium text-xs transition-all cursor-pointer"
                    >
                      <span>पुनः प्रयास करें</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Form Input View */}
              {paymentStatus === "idle" && (
                <div className="p-6 space-y-6 max-h-[550px] overflow-y-auto">
                  {/* Summary Box */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <p className="text-slate-500">चुनी गई योजना:</p>
                      <h4 className="text-white font-bold font-serif">युवाक्षर {selectedPlan === "Premium" ? "प्रीमियम" : "संरक्षक"} ({billingCycle === "Monthly" ? "मासिक" : billingCycle === "Quarterly" ? "त्रैमासिक" : billingCycle === "Half-Yearly" ? "अर्धवार्षिक" : "वार्षिक"})</h4>
                    </div>
                    <div className="text-right">
                      {appliedCoupon ? (
                        <>
                          <p className="text-slate-500 line-through">₹{getBasePrice()}</p>
                          <p className="text-emerald-400 font-bold text-sm">₹{getFinalPrice()}</p>
                        </>
                      ) : (
                        <p className="text-white font-bold text-sm">₹{getBasePrice()}</p>
                      )}
                    </div>
                  </div>

                  {/* Coupon Block */}
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400">प्रोमो कोड / कूपन (Coupon Code)</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="जैसे: FESTIVAL50, YUVAKSHAR10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-primary disabled:opacity-50"
                      />
                      {appliedCoupon ? (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                        >
                          हटाएं
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border border-slate-750"
                        >
                          लागू करें
                        </button>
                      )}
                    </div>
                    {couponError && <p className="text-[10px] text-red-400">{couponError}</p>}
                    {appliedCoupon && (
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>कूपन लागू: <strong>{appliedCoupon.code}</strong> (₹{discountAmount} की छूट मिली)</span>
                      </p>
                    )}
                  </form>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400">भुगतान का माध्यम (Payment Method)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "upi", name: "UPI", icon: QrCode },
                        { id: "card", name: "कार्ड", icon: CreditCard },
                        { id: "netbanking", name: "बैंकिंग", icon: Building2 },
                        { id: "wallet", name: "वॉलेट", icon: Wallet }
                      ].map((method) => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id as any)}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all ${
                              paymentMethod === method.id
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px] font-bold">{method.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Method Details Panel */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl min-h-[120px]">
                    {paymentMethod === "upi" && (
                      <div className="space-y-4 text-center">
                        <p className="text-[11px] text-slate-400">गूगल पे, फोनपे, पेटीएम या किसी भी यूपीआई ऐप से भुगतान करें।</p>
                        
                        <div className="flex flex-col items-center justify-center py-2 bg-white rounded-xl p-2 max-w-[150px] mx-auto">
                          <QrCode className="w-24 h-24 text-slate-950" />
                          <span className="text-[9px] text-slate-500 font-mono font-bold mt-1">₹{getFinalPrice()} (Yuvakshar API)</span>
                        </div>
                        
                        <div className="space-y-1 text-left">
                          <label className="block text-[10px] font-medium text-slate-400">यूपीआई आईडी (UPI ID)</label>
                          <input
                            type="text"
                            placeholder="username@okaxis"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-medium text-slate-400">कार्ड नंबर (Card Number)</label>
                          <input
                            type="text"
                            placeholder="4111 2222 3333 4444"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-medium text-slate-400">वैधता तिथि (Expiry Date)</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-medium text-slate-400">सीवीवी (CVV)</label>
                            <input
                              type="password"
                              placeholder="***"
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-medium text-slate-400">कार्डधारक का नाम (Cardholder Name)</label>
                          <input
                            type="text"
                            placeholder="नाम दर्ज करें"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "netbanking" && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-400">अपना बैंक चुनें (Select Bank)</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                        >
                          <option value="">-- बैंक का चयन करें --</option>
                          <option value="sbi">भारतीय स्टेट बैंक (SBI)</option>
                          <option value="hdfc">HDFC बैंक</option>
                          <option value="icici">ICICI बैंक</option>
                          <option value="axis">एक्सिस बैंक</option>
                          <option value="pnb">पंजाब नेशनल बैंक (PNB)</option>
                        </select>
                      </div>
                    )}

                    {paymentMethod === "wallet" && (
                      <div className="space-y-2 text-center text-xs py-4 text-slate-400">
                        <p>पेटीएम, फोनपे या अमेज़न पे वॉलेट का उपयोग करके भुगतान करें।</p>
                        <div className="flex justify-center space-x-4 pt-3 select-none">
                          <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white">PAYTM</span>
                          <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white">PHONEPE</span>
                          <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white">AMAZON</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Simulator Options */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">सैंडबॉक्स सिमुलेटर (Sandbox Simulator)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleSimulatePayment(false)}
                        className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      >
                        भुगतान विफलता का अनुकरण करें
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulatePayment(true)}
                        className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      >
                        सफल भुगतान का अनुकरण करें
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}