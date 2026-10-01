import React, { useState, useEffect } from 'react';
import { audioManager } from '../audio/AudioManager';
import { X, Send, Heart, ArrowLeft, MoreVertical, Smartphone } from 'lucide-react';

interface PhoneModalProps {
  mode: 'crush_chat' | 'wedding_story';
  isOpen: boolean;
  onClose: () => void;
}

export const PhoneModal: React.FC<PhoneModalProps> = ({ mode, isOpen, onClose }) => {
  // Crush chat state
  const [chatStep, setChatStep] = useState<number>(0);
  const [inputText, setInputText] = useState<string>('');
  const [showReply, setShowReply] = useState<boolean>(false);

  // Wedding story state
  const [storyOpened, setStoryOpened] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setChatStep(0);
      setInputText('');
      setShowReply(false);
      setStoryOpened(false);
      return;
    }

    if (mode === 'wedding_story') {
      audioManager.playPhoneVibration();
    }
  }, [isOpen, mode]);

  // Handle typing animation for crush chat
  useEffect(() => {
    if (mode !== 'crush_chat' || !isOpen) return;

    if (chatStep === 0) {
      // Type "I like you."
      const text = "I like you.";
      let idx = 0;
      const interval = setInterval(() => {
        if (idx <= text.length) {
          setInputText(text.slice(0, idx));
          idx++;
        } else {
          clearInterval(interval);
          setTimeout(() => setChatStep(1), 1200); // pause with unsent feelings
        }
      }, 90);
      return () => clearInterval(interval);
    } else if (chatStep === 1) {
      // Backspace delete
      let cur = inputText;
      const interval = setInterval(() => {
        if (cur.length > 0) {
          cur = cur.slice(0, -1);
          setInputText(cur);
        } else {
          clearInterval(interval);
          setTimeout(() => setChatStep(2), 600);
        }
      }, 50);
      return () => clearInterval(interval);
    } else if (chatStep === 2) {
      // Type "Did you reach?"
      const text2 = "Did you reach?";
      let idx = 0;
      const interval = setInterval(() => {
        if (idx <= text2.length) {
          setInputText(text2.slice(0, idx));
          idx++;
        } else {
          clearInterval(interval);
          setTimeout(() => setChatStep(3), 800);
        }
      }, 75);
      return () => clearInterval(interval);
    } else if (chatStep === 3) {
      // Sent, wait for reply
      const timer = setTimeout(() => {
        setShowReply(true);
        audioManager.playTone(523.25, 0.4, 'sine', 0.05); // high soft ping
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [chatStep, mode, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      {/* Phone device mockup */}
      <div className="relative w-full max-w-[340px] h-[640px] bg-slate-950 rounded-[44px] border-[6px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Dynamic Island / speaker notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end px-3">
          <div className="w-2 h-2 rounded-full bg-slate-800/80"></div>
        </div>

        {/* Top Status Bar */}
        <div className="pt-3 px-7 pb-2 flex justify-between items-center text-[11px] font-mono text-slate-400 z-20">
          <span>{mode === 'crush_chat' ? '08:44 PM' : '11:24 PM'}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2 border border-slate-500 rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-slate-400 rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* Content based on mode */}
        {mode === 'crush_chat' ? (
          <div className="flex-1 flex flex-col justify-between p-4 bg-slate-900/90 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mt-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-700/50 flex items-center justify-center text-xs font-semibold text-amber-200">
                  G
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-200">Classmate</div>
                  <div className="text-[10px] text-emerald-400">online</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Close Phone"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
              <div className="text-[10px] text-center text-slate-500 font-mono my-1">
                TODAY
              </div>

              {/* Sent message */}
              {chatStep >= 3 && (
                <div className="self-end max-w-[80%] bg-sky-700/80 text-white rounded-2xl rounded-tr-xs px-3.5 py-2 text-xs shadow-md fade-in">
                  Did you reach?
                  <span className="block text-[9px] text-sky-200/70 text-right mt-1">08:43 PM</span>
                </div>
              )}

              {/* Reply */}
              {showReply ? (
                <div className="self-start max-w-[80%] bg-slate-800 text-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-2 text-xs shadow-md fade-in">
                  Yes.
                  <span className="block text-[9px] text-slate-400 text-right mt-1">08:44 PM</span>
                </div>
              ) : chatStep >= 3 && (
                <div className="self-start text-[11px] text-slate-400 italic">
                  typing...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-white/10 pt-3 flex items-center gap-2">
              <div className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-full px-4 py-2 text-xs text-slate-200 min-h-[36px] flex items-center">
                <span>{inputText}</span>
                <span className="inline-block w-1.5 h-3 bg-sky-400 ml-0.5 animate-pulse"></span>
              </div>
              <button
                onClick={() => {
                  if (chatStep >= 3) onClose();
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  chatStep >= 3
                    ? 'bg-sky-600 text-white hover:bg-sky-500'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <Send size={15} />
              </button>
            </div>

            {showReply && (
              <div className="mt-3 text-center">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
                >
                  Put phone away & continue
                </button>
              </div>
            )}
          </div>
        ) : (
          /* WEDDING STORY VIEW */
          <div className="flex-1 flex flex-col bg-black text-slate-100 relative">
            {!storyOpened ? (
              /* Feed Notification */
              <div className="flex-1 flex flex-col justify-between p-6">
                <div className="mt-8 flex justify-between items-center">
                  <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                    Moments
                  </span>
                  <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center my-auto">
                  <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 cursor-pointer shadow-lg hover:scale-105 transition-transform"
                    onClick={() => setStoryOpened(true)}
                  >
                    <div className="w-20 h-20 rounded-full border-2 border-black overflow-hidden bg-slate-800 flex items-center justify-center">
                      <img
                        src="/src/assets/images/wedding_story_moment_1790866243846.jpg"
                        alt="Story preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <h3 className="mt-4 text-sm font-medium text-slate-200">
                    New Story Update
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                    2 hours ago · Celebrations
                  </p>

                  <button
                    onClick={() => setStoryOpened(true)}
                    className="mt-6 px-5 py-2 text-xs font-medium text-slate-900 bg-white rounded-full hover:bg-slate-200 transition-colors shadow-md"
                  >
                    View Story
                  </button>
                </div>

                <div className="text-center text-[11px] text-slate-500">
                  Tap to open
                </div>
              </div>
            ) : (
              /* Fullscreen Story view with photographic moment */
              <div className="flex-1 relative flex flex-col justify-between overflow-hidden">
                {/* Progress timer bar */}
                <div className="absolute top-2 left-4 right-4 z-30 flex gap-1">
                  <div className="h-0.5 flex-1 bg-white/40 rounded-full overflow-hidden">
                    <div className="h-full bg-white animate-[pulse_4s_linear_infinite]"></div>
                  </div>
                </div>

                {/* Top story header */}
                <div className="absolute top-5 left-4 right-4 z-30 flex items-center justify-between text-white drop-shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/60">
                      <img
                        src="/src/assets/images/wedding_story_moment_1790866243846.jpg"
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-xs font-medium">college_memories</span>
                    <span className="text-[10px] text-white/70">2h</span>
                  </div>

                  <button onClick={onClose} className="p-1 text-white hover:text-slate-300">
                    <X size={18} />
                  </button>
                </div>

                {/* The Wedding Photograph */}
                <div className="absolute inset-0 z-10 bg-slate-950">
                  <img
                    src="/src/assets/images/wedding_story_moment_1790866243846.jpg"
                    alt="Wedding moment"
                    className="w-full h-full object-cover object-center filter brightness-95"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40"></div>
                </div>

                {/* Bottom silent reflection */}
                <div className="relative z-30 p-6 mt-auto text-center">
                  <p className="text-xs text-slate-200/90 font-light tracking-wide italic max-w-[240px] mx-auto">
                    The quiet lights of a new life beginning.
                  </p>

                  <button
                    onClick={onClose}
                    className="mt-5 w-full py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-medium text-white transition-colors border border-white/20"
                  >
                    Lock Phone
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom home indicator bar */}
        <div className="py-2 flex justify-center bg-black">
          <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
