'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, X, Info } from 'lucide-react';
import { DEV_MODE } from '@/lib/dev-mode';

export default function DevModeBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner
    const wasDismissed = localStorage.getItem('devModeBannerDismissed');
    if (!wasDismissed && DEV_MODE) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    localStorage.setItem('devModeBannerDismissed', 'true');
  };

  if (!show || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 flex-shrink-0 animate-pulse" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">Development Mode Active</span>
                <span className="hidden sm:inline text-sm opacity-90">
                  • Using mock contract data • Deploy contracts for real blockchain interaction
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/TROUBLESHOOTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all flex items-center gap-1"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">Help</span>
              </a>
              
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded transition-all"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
