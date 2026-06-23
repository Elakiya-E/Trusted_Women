"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandKeywords from "@/components/BrandKeywords";
import Services from "@/components/Services";
import Pricing from "@/components/Pricing";
import TrustSafety from "@/components/TrustSafety";
import Offers from "@/components/Offers";
import KnowledgeHub from "@/components/KnowledgeHub";
import Testimonials from "@/components/Testimonials";
import Cities from "@/components/Cities";
import WhatsAppFloating from "@/components/WhatsAppFloating";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();

  const handleSelectService = (serviceId: string) => {
    router.push(`/booking?service=${serviceId}`);
  };

  const handleBookNowScroll = () => {
    router.push("/booking");
  };

  return (
    <>
      <Navbar onBookNowClick={handleBookNowScroll} />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <Hero onBookNowClick={handleBookNowScroll} />

        {/* Why Families Trust WithYours Brand Keywords */}
        <BrandKeywords />

        {/* Services Showcase */}
        <Services onSelectService={handleSelectService} />

        {/* Transparent Pricing & Plan Comparison */}
        <Pricing onSelectService={handleSelectService} />

        {/* Trust & Safety Vetting Section */}
        <TrustSafety />

        {/* Dynamic Promotional Offers */}
        <Offers />

        {/* Knowledge Hub Resource Section */}
        <KnowledgeHub />

        {/* Customer Reviews & Testimonials Slider */}
        <Testimonials />

        {/* Metropolitan Service Cities */}
        <Cities />
      </main>

      {/* Floating Action WhatsApp Menu */}
      <WhatsAppFloating />

      {/* Corporate Info Footer */}
      <Footer />
    </>
  );
}
