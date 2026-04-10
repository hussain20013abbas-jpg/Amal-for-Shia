import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface LiveVoiceChatProps {
  school: string;
  scholar: string;
}

export const LiveVoiceChat: React.FC<LiveVoiceChatProps> = ({ school, scholar }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{ text: string, isUser: boolean }[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Audio playback
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    setTranscript([]);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are a knowledgeable and respectful Islamic scholar assistant. 
You are providing guidance based on the ${school} school of thought, specifically referencing the views of ${scholar} where applicable.
Always be respectful, and clarify that your advice is for educational purposes. Keep your answers concise and conversational.`;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startAudioCapture(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              playAudioChunk(base64Audio);
            }
            
            // Handle interruption
            if (message.serverContent?.interrupted) {
              playbackQueueRef.current = [];
            }
            
            // Handle transcription
            if (message.serverContent?.modelTurn?.parts[0]?.text) {
               // This is text response, but we requested audio. Sometimes it sends text too.
            }
            
            // Handle output transcription
            if (message.serverContent?.modelTurn?.parts?.some(p => p.text)) {
               // Handle text if needed
            }
          },
          onclose: () => {
            setIsConnected(false);
            stopAudioCapture();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error occurred.");
            setIsConnected(false);
            stopAudioCapture();
          }
        }
      });
      
      sessionRef.current = sessionPromise;
      
    } catch (err: any) {
      console.error("Failed to connect:", err);
      setError(err.message || "Failed to connect to the scholar.");
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
      sessionRef.current = null;
    }
    setIsConnected(false);
    stopAudioCapture();
  };

  const startAudioCapture = async (sessionPromise: Promise<any>) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32Array to Int16Array
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Convert Int16Array to Base64
        const buffer = new ArrayBuffer(pcmData.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < pcmData.length; i++) {
          view.setInt16(i * 2, pcmData[i], true); // true for little-endian
        }
        
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);
        
        sessionPromise.then((session) => {
          session.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        });
      };
      
      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied.");
      disconnect();
    }
  };

  const stopAudioCapture = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const playAudioChunk = (base64Audio: string) => {
    if (!audioContextRef.current) return;
    
    // Decode base64 PCM data (24kHz, 16-bit, mono)
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 0x7FFF;
    }
    
    playbackQueueRef.current.push(float32Array);
    scheduleNextPlayback();
  };

  const scheduleNextPlayback = () => {
    if (isPlayingRef.current || playbackQueueRef.current.length === 0 || !audioContextRef.current) return;
    
    isPlayingRef.current = true;
    const audioData = playbackQueueRef.current.shift()!;
    
    const audioBuffer = audioContextRef.current.createBuffer(1, audioData.length, 24000);
    audioBuffer.getChannelData(0).set(audioData);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    const currentTime = audioContextRef.current.currentTime;
    const startTime = Math.max(currentTime, nextPlayTimeRef.current);
    
    source.start(startTime);
    nextPlayTimeRef.current = startTime + audioBuffer.duration;
    
    source.onended = () => {
      isPlayingRef.current = false;
      scheduleNextPlayback();
    };
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="glass-card p-10 rounded-[3rem] border-white/10 border-2 mt-8 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <i className="fas fa-microphone-alt text-9xl"></i>
      </div>
      <h3 className="text-3xl font-black luxury-text uppercase mb-4 tracking-tighter">Live Voice Consultation</h3>
      <p className="text-white/60 mb-8 max-w-2xl mx-auto">
        Speak directly with the AI scholar. Ensure your microphone is enabled.
      </p>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8">
          {error}
        </div>
      )}
      
      <div className="flex justify-center items-center gap-6">
        {!isConnected && !isConnecting && (
          <button 
            onClick={connect}
            className="bg-[#d4af37] text-[#011a14] px-12 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-3"
          >
            <i className="fas fa-phone-alt"></i> Start Voice Chat
          </button>
        )}
        
        {isConnecting && (
          <div className="flex items-center gap-4 text-[#d4af37]">
            <div className="w-6 h-6 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin"></div>
            <span className="font-black uppercase tracking-widest">Connecting...</span>
          </div>
        )}
        
        {isConnected && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
              <span className="text-white font-black uppercase tracking-widest">Live Session Active</span>
            </div>
            
            <div className="flex gap-2 h-12 items-end">
              {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                <div 
                  key={i} 
                  className="w-2 bg-[#d4af37] rounded-full animate-bounce" 
                  style={{ height: `${h * 20}%`, animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
            
            <button 
              onClick={disconnect}
              className="bg-red-500/20 text-red-500 border border-red-500/30 px-10 py-4 rounded-full font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-3"
            >
              <i className="fas fa-phone-slash"></i> End Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
