"use client";

import React from "react";
import { Star, Plane, Train, HeartPulse, ShieldAlert, Award, Car, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Service {
  id: string;
  title: string;
  description: string;
  startingPrice: string;
  rating: number;
  badge: "Popular" | "Trending" | "Freshly Added";
  icon: React.ComponentType<any>;
  gradient: string;
}

const services: Service[] = [
  {
    id: "airport",
    title: "Airport Pickup & Drop",
    description: "Safe, trusted female companions to assist you or your loved ones to/from the airport, helping with luggage and transport.",
    startingPrice: "₹999",
    rating: 4.9,
    badge: "Popular",
    icon: Plane,
    gradient: "from-[#FF9E7D] to-[#E07A5F]",
  },
  {
    id: "railway",
    title: "Railway Pickup & Drop",
    description: "Dedicated female companions meeting passengers right at the platform. Ensuring secure transfers to their final destination.",
    startingPrice: "₹799",
    rating: 4.8,
    badge: "Trending",
    icon: Train,
    gradient: "from-[#E07A5F] to-[#C97A8E]",
  },
  {
    id: "nursing",
    title: "Nursing Care At Home",
    description: "Qualified, empathetic female medical assistants and nurses for critical health monitoring and recovery care.",
    startingPrice: "₹1,499/day",
    rating: 4.9,
    badge: "Popular",
    icon: HeartPulse,
    gradient: "from-[#E2B380] to-[#C68B59]",
  },
  {
    id: "security",
    title: "Women Security Guards",
    description: "Highly trained, alert female security professionals for private functions, corporate events, or personal safety.",
    startingPrice: "₹1,999/day",
    rating: 5.0,
    badge: "Freshly Added",
    icon: ShieldAlert,
    gradient: "from-[#D87D56] to-[#B85C38]",
  },
  {
    id: "hospital",
    title: "Elderly Hospital Attendants",
    description: "Compassionate bedside assistance, medicine reminders, and companionship for elder family members in hospitals.",
    startingPrice: "₹1,299/day",
    rating: 4.9,
    badge: "Popular",
    icon: Award,
    gradient: "from-[#A9AF90] to-[#828A6B]",
  },
  {
    id: "driver",
    title: "Women Drivers",
    description: "Experienced, verified professional female drivers for daily city runs, errands, or outstation family trips.",
    startingPrice: "₹1,199/day",
    rating: 4.8,
    badge: "Trending",
    icon: Car,
    gradient: "from-[#EBC75A] to-[#C09A34]",
  },
];

interface ServicesProps {
  onSelectService: (serviceId: string) => void;
}

export default function Services({ onSelectService }: ServicesProps) {
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case "Popular":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Trending":
        return "bg-pink-100 text-pink-700 border-pink-200";
      case "Freshly Added":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <section id="services" className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base text-primary font-bold tracking-wide uppercase">Expanded Service Portfolio</h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Women-Led Attendant Solutions for Homes, Healthcare, Travel, Security and Lifestyle Support.
          </p>
          <p className="mt-4 text-lg text-gray-600">
            Carefully curated, highly reliable services staffed by verified, professional women attendants.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.id}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Visual Header / Banner */}
                <div className={`h-40 bg-gradient-to-r ${service.gradient} p-6 relative flex items-end justify-between`}>
                  <div className="absolute top-4 left-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getBadgeStyle(service.badge)}`}>
                      {service.badge}
                    </span>
                  </div>
                  
                  {/* Service Icon Container */}
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>

                  <div className="flex items-center space-x-1 bg-black/35 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-semibold">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span>{service.rating} Rating</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">{service.description}</p>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-auto flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">Starting Price</p>
                      <p className="text-lg font-extrabold text-primary">{service.startingPrice}</p>
                    </div>

                    <button
                      onClick={() => onSelectService(service.id)}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow hover:shadow-md transition-all hover:scale-105"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Services Button */}
        <div className="mt-16 text-center">
          <a
            href="/services"
            className="inline-flex items-center space-x-2 bg-white text-primary border-2 border-primary font-bold px-8 py-3.5 rounded-full shadow hover:bg-primary hover:text-white transition-all hover:scale-105"
          >
            <span>View All Services</span>
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>

      </div>
    </section>
  );
}
