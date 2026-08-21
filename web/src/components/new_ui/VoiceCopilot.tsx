import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceCopilotProps {
  onCommand: (command: string) => void;
}

export default function VoiceCopilot({ onCommand }: VoiceCopilotProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              setTranscript(event.results[i][0].transcript);
            }
          }
          
          if (finalTranscript) {
            setTranscript(finalTranscript);
            onCommand(finalTranscript.toLowerCase());
            setIsListening(false);
          }
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, [onCommand]);

  const toggleListen = useCallback(() => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  }, [isListening, recognition]);

  if (!recognition) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {isListening && transcript && (
        <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm shadow-xl max-w-xs truncate animate-pulse border border-[#00ffcc]/30">
          "{transcript}"
        </div>
      )}
      <button
        onClick={toggleListen}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-500/50' 
            : 'bg-[#00ffcc] hover:bg-[#00e6b8] text-black shadow-[#00ffcc]/30'
        }`}
        title="AI Voice Copilot"
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
    </div>
  );
}
