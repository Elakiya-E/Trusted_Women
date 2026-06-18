/*
  Hero Section redesign – Trusted Women
  • Uses primary palette #4F46E5, secondary #14B8A6
  • Typography: Plus Jakarta Sans (fallback Inter)
  • Left side (55%): badge, headline, subheadline, CTA, trust indicators
  • Right side (45%): auto‑sliding image gallery (img8.png, img8.2.png, img83.png, img84.png)
  • Gallery: fade transition every 4 s, subtle zoom, overlay, rounded corners, soft shadow
  • Animations via Framer Motion (fade up, hover, button scale)
*/

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PhoneCall, CheckCircle2, Star, Users, Shield } from "lucide-react";

// Images placed in /public folder – Next.js will serve them automatically
const galleryImages = [
  "/img8.png",
  "/img8.2.png",
  "/img83.png",
  "/img84.png",
];
interface HeroProps {
  onBookNowClick: () => void;
}

// Color palette per specification
const COLORS = {
  primary: "#4F46E5",
  secondary: "#14B8A6",
  text: "#111827",
  background: "#F8FAFC",
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
  hoverAccent: "#EEF2FF",
};

// Typography (Plus Jakarta Sans fallback Inter) – assumed globally via CSS import

export default function Hero({ onBookNowClick }: HeroProps) {
  // ---------- Gallery logic ----------
  const images = ["/img8.png", "/img8.2.png", "/img83.png", "/img84.png"];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % images.length);
    }, 4000); // 4 seconds per slide
    return () => clearInterval(timer);
  }, []);

  // ---------- Animation helpers ----------
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.6 },
  });

  const buttonHover = { scale: 1.04 };
  const buttonTap = { scale: 0.97 };

  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{
        background: COLORS.background,
        paddingTop: 120,
        paddingBottom: 100,
      }}
    >
      {/* ----- Main container ----- */}
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        {/* ----- LEFT (55%) ----- */}
        <motion.div className="w-full lg:w-[55%]" {...fadeUp(0)}>
          {/* Badge */}
          <motion.span
            {...fadeUp(0.1)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium mb-6"
            style={{
              background: `${COLORS.primary}20`, // 20% opacity
              color: COLORS.primary,
              border: `1px solid ${COLORS.primary}40`,
            }}
          >
            🛡️ Trusted by Families Across Bengaluru
          </motion.span>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.18)}
            className="mb-5"
            style={{
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontSize: "48px",
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.text,
              maxWidth: "600px",
            }}
          >
            <span style={{ color: COLORS.primary }}>Trusted Women Attendants</span> for Every Stage of Care
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp(0.26)}
            className="mb-8"
            style={{
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontSize: "18px",
              lineHeight: 1.7,
              color: COLORS.text,
              maxWidth: "540px",
            }}
          >
            Safe, verified and compassionate support for elderly care, hospital assistance, travel support and home services.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div {...fadeUp(0.34)} className="flex flex-wrap items-center gap-4 mb-8">
            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              onClick={onBookNowClick}
              className="rounded-xl px-7 py-3 text-base font-semibold text-white shadow-lg cursor-pointer"
              style={{
                background: COLORS.primary,
                border: `1px solid ${COLORS.primary}`,
              }}
            >
              Book a Service
            </motion.button>

            <motion.a
              whileHover={buttonHover}
              whileTap={buttonTap}
              href="tel:+919876543210"
              className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-base font-semibold cursor-pointer"
              style={{
                borderColor: COLORS.border,
                background: COLORS.cardBg,
                color: COLORS.text,
              }}
            >
              <PhoneCall className="h-4 w-4" />
              Call Support
            </motion.a>
          </motion.div>
        </motion.div>

        {/* ----- RIGHT (45%) ----- */}
        <motion.div
          className="relative w-full lg:w-[45%] h-[500px]"
          {...fadeUp(0.4)}
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
            {images.map((src, idx) => (
              <motion.div
                key={idx}
                className="relative w-full h-full rounded-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{
                  position: current === idx ? "relative" : "absolute",
                  inset: 0,
                  opacity: current === idx ? 1 : 0,
                }}
              >
                <Image
                  src={src}
                  alt={`Gallery slide ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  className="object-cover"
                />
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/30" />
              </motion.div>
            ))}
          </div>
          {/* Statistic Cards */}
          <div className="absolute top-4 left-4 space-y-2">
            <motion.div className="flex items-center bg-white bg-opacity-80 px-3 py-1 rounded-full shadow" whileHover={{ scale: 1.05 }}>
              <Star className="w-4 h-4 text-yellow-500 mr-1" /> <span>4.9 Customer Rating</span>
            </motion.div>
            <motion.div className="flex items-center bg-white bg-opacity-80 px-3 py-1 rounded-full shadow" whileHover={{ scale: 1.05 }}>
              <Users className="w-4 h-4 text-indigo-500 mr-1" /> <span>500+ Verified Attendants</span>
            </motion.div>
            <motion.div className="flex items-center bg-white bg-opacity-80 px-3 py-1 rounded-full shadow" whileHover={{ scale: 1.05 }}>
              <Shield className="w-4 h-4 text-red-500 mr-1" /> <span>24/7 Emergency Support</span>
            </motion.div>
          </div>
          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${current===i ? 'bg-white' : 'bg-gray-400'}`}></span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
