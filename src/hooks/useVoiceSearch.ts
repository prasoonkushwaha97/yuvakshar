import { useState, useCallback, useEffect } from "react";

export function useVoiceSearch(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize speech recognition only on the client side
    if (typeof window !== "undefined") {
      // @ts-expect-error - SpeechRecognition is not fully typed in standard lib
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = 'hi-IN'; // Default to Hindi
        rec.interimResults = true; // Show results while speaking
        rec.maxAlternatives = 1;
        setRecognition(rec);
      }
    }
  }, []);

  const startVoiceSearch = useCallback(() => {
    if (!recognition) {
      setSpeechError("आपका ब्राउज़र वॉइस सर्च को सपोर्ट नहीं करता।");
      return;
    }

    setSpeechError("");
    
    recognition.onstart = () => {
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      // Get the latest transcript
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const transcript = finalTranscript || interimTranscript;
      if (transcript) {
        onResult(transcript);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setSpeechError("माइक्रोफ़ोन की अनुमति नहीं दी गई है।");
      } else {
        setSpeechError("कृपया दोबारा बोलें।");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Speech recognition start error", e);
      setIsListening(false);
    }
  }, [recognition, onResult]);

  const stopVoiceSearch = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  return {
    isListening,
    speechError,
    startVoiceSearch,
    stopVoiceSearch,
    isSupported: !!recognition
  };
}
