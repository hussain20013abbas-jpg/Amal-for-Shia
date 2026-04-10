
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

const VoiceGuidance: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful and knowledgeable Shia Islamic scholar. You provide guidance on Hadith, Duas, and Islamic practices with wisdom and compassion. Keep your responses concise and spiritual.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startAudioCapture();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              const audioPart = message.serverContent.modelTurn.parts.find(p => p.inlineData);
              if (audioPart?.inlineData?.data) {
                const base64Audio = audioPart.inlineData.data;
                const pcmData = base64ToFloat32(base64Audio);
                audioQueueRef.current.push(pcmData);
                if (!isPlayingRef.current) {
                  playNextInQueue();
                }
              }

              const textPart = message.serverContent.modelTurn.parts.find(p => p.text);
              if (textPart?.text) {
                setTranscript(prev => [...prev, `AI: ${textPart.text}`]);
              }
            }

            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
            }
          },
          onclose: () => {
            stopSession();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error. Please try again.");
            stopSession();
          }
        }
      });

      sessionRef.current = session;
    } catch (err) {
      console.error("Failed to connect:", err);
      setError("Failed to initialize voice session.");
      setIsConnecting(false);
    }
  };

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processorRef.current.onaudioprocess = (e) => {
        if (sessionRef.current && isConnected) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = float32ToInt16(inputData);
          const base64 = int16ToBase64(pcm16);
          sessionRef.current.sendRealtimeInput({
            audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      };

      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      setError("Microphone access is required for voice guidance.");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsRecording(false);
    setIsConnecting(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  };

  const playNextInQueue = () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const pcmData = audioQueueRef.current.shift()!;
    const buffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000); // TTS usually 24kHz
    buffer.getChannelData(0).set(pcmData);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
  };

  // Helpers
  const float32ToInt16 = (buffer: Float32Array) => {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      buf[i] = Math.min(1, Math.max(-1, buffer[i])) * 0x7FFF;
    }
    return buf;
  };

  const int16ToBase64 = (buffer: Int16Array) => {
    const bytes = new Uint8Array(buffer.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const base64ToFloat32 = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    return float32;
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="min-h-screen bg-[#022c22] p-4 md:p-8 flex flex-col items-center justify-center pb-32 md:pb-8">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-black luxury-text uppercase tracking-[0.2em] mb-4">Voice Guidance</h2>
          <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] italic">Real-time Spiritual Conversation with AI</p>
        </div>

        {/* Visualizer / Status */}
        <div className="relative mb-12 flex items-center justify-center">
          <div className={`w-48 h-48 rounded-full border-2 border-[#d4af37]/20 flex items-center justify-center transition-all duration-500 ${isConnected ? 'scale-110 border-[#d4af37]' : ''}`}>
            <div className={`w-40 h-40 rounded-full bg-white/5 flex items-center justify-center relative overflow-hidden ${isConnected ? 'animate-pulse' : ''}`}>
              {isConnecting ? (
                <div className="animate-spin w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full"></div>
              ) : (
                <i className={`fas fa-microphone-lines text-4xl ${isConnected ? 'text-[#d4af37]' : 'text-white/20'}`}></i>
              )}
              
              {/* Waves effect when connected */}
              {isConnected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                      className="absolute w-20 h-20 border border-[#d4af37] rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {!isConnected ? (
            <button
              onClick={startSession}
              disabled={isConnecting}
              className="w-full py-6 rounded-3xl bg-[#d4af37] text-[#022c22] text-sm font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:scale-100"
            >
              {isConnecting ? 'Connecting...' : 'Begin Conversation'}
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="w-full py-6 rounded-3xl bg-white/5 border border-white/10 text-white/60 text-sm font-black uppercase tracking-[0.3em] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all"
            >
              End Session
            </button>
          )}

          {error && (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest animate-bounce">
              {error}
            </p>
          )}

          <p className="text-white/30 text-[8px] font-bold uppercase tracking-widest leading-relaxed">
            {isConnected 
              ? "Speak naturally. The AI is listening to provide spiritual guidance."
              : "Start a session to talk about Hadith, Duas, or Islamic history."}
          </p>
        </div>

        {/* Transcript (Optional/Hidden) */}
        <div className="mt-12 h-32 overflow-y-auto custom-scrollbar text-left px-4">
          <AnimatePresence>
            {transcript.slice(-3).map((line, i) => (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i}
                className="text-[10px] text-white/40 font-medium mb-2"
              >
                {line}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VoiceGuidance;
