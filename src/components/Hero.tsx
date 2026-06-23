/*
  Hero Section redesign – Trusted Women
  • Premium full-width hero with animated background gallery
  • Glassmorphism content card on the left
  • 4-second fade and zoom transitions
  • Mobile-auto height, desktop 85vh
*/

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PhoneCall, CheckCircle2 } from "lucide-react";

const heroImages = [
  "/aa.png",
  "/bb.png",
  "/cc.png",
  "/dd.png",
  "/ee.png",
  "/ff.png",
  "/img8.png",
  "/img8.2.png",
  "/img83.png",
  "/img84.png",
  "/rail.png",
  "/to3.png",
  "/to4.png"
];

interface HeroProps {
  onBookNowClick: () => void;
}

export default function Hero({ onBookNowClick }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % heroImages.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative w-full overflow-hidden min-h-[72vh] lg:min-h-[85vh] bg-slate-950">
      <div className="absolute inset-0 overflow-hidden">
        {heroImages.map((src, idx) => (
          <motion.div
            key={src}
            className="absolute inset-0"
            style={{ zIndex: currentIndex === idx ? 10 : 0 }}
            initial={false}
            animate={
              currentIndex === idx
                ? { opacity: 1, scale: 1.03 }
                : { opacity: 0, scale: 1 }
            }
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <Image
              src={src}
              alt={`Hero background ${idx + 1}`}
              fill
              sizes="100vw"
              className="object-cover object-top"
              priority={idx === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-transparent" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[72vh] lg:min-h-[85vh] items-center px-5 py-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="w-full max-w-[1280px]"
        >
          <div className="w-full max-w-3xl p-8 drop-shadow-xl">
            <span className="mb-6 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-sm backdrop-blur-md">
              Premium care for every stage
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-md sm:text-5xl">
              Trusted Women Attendants for Every Stage of Care
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white drop-shadow sm:text-lg font-medium">
              Safe, verified and compassionate support for elderly care, hospital assistance, travel support and home services.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onBookNowClick}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/40 transition duration-300 hover:from-sky-400 hover:to-cyan-400"
              >
                Book a Service
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="tel:+919876543210"
                className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-black/30 px-8 py-3 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition duration-300 hover:border-white/60 hover:bg-black/50"
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                Call Support
              </motion.a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Verified Attendants",
                "Police Verified",
                "Transparent Pricing",
                "24/7 Support",
              ].map((text) => (
                <div
                  key={text}
                  className="inline-flex items-center gap-2 rounded-2xl bg-black/40 px-4 py-3 text-sm font-semibold text-white shadow-md backdrop-blur-md"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
