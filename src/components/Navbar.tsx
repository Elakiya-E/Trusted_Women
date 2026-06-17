"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  onBookNowClick: () => void;
}

export default function Navbar({ onBookNowClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "Booking", href: "#booking" },
    { name: "Safety", href: "#safety" },
    { name: "Knowledge Hub", href: "#knowledge" },
    { name: "Cities", href: "#cities" },
    { name: "Contact", href: "#footer" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-md py-2 border-b border-purple-100"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <a href="#home" className="flex items-center space-x-2 flex-shrink-0">
              <span className="bg-gradient-to-r from-primary to-secondary text-white p-1.5 rounded-xl">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                WithYours
              </span>
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden xl:flex items-center space-x-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary font-medium text-sm transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-3.5 py-1.5 rounded-full font-semibold text-xs transition-all hover:scale-105"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.438 2.5 1.177 3.464L6.96 18l2.67-.783a5.722 5.722 0 0 0 2.4.527h.002c3.181 0 5.767-2.586 5.768-5.767a5.758 5.758 0 0 0-5.769-5.805zm3.621 8.232c-.15.421-.767.767-1.127.81-.36.043-.82.072-2.384-.572-1.999-.823-3.276-2.854-3.376-2.987-.1-.133-.795-.923-.795-1.762 0-.839.44-1.25.59-1.416.15-.166.33-.208.44-.208.11 0 .22.001.32.007.1.006.24-.038.37.276.13.314.44 1.071.48 1.153.04.082.07.18.01.293-.05.11-.08.196-.16.293-.08.096-.17.215-.24.293-.08.082-.17.171-.07.337a7.842 7.842 0 0 0 1.43 1.777 6.486 6.486 0 0 0 2.07 1.28c.18.09.29.077.4-.049.11-.125.48-.558.61-.749.13-.191.26-.161.44-.097.18.064 1.15.542 1.35.642.2.1.33.15.38.237.05.087.05.508-.1.929z" />
                </svg>
                <span>WhatsApp</span>
              </a>

              {/* Book Now */}
              <button
                onClick={onBookNowClick}
                className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full font-semibold text-xs shadow-sm hover:shadow-md transition-all hover:scale-105"
              >
                Book Now
              </button>

              {/* Attendant Login */}
              <a
                href="/attendant-login"
                className="bg-white text-primary border border-primary px-4 py-2 rounded-full font-semibold text-xs shadow-sm hover:bg-primary/10 transition-all"
              >
                Attendant Login
              </a>
            </div>

            {/* Mobile Hamburger */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-800 focus:outline-none p-2 rounded-lg hover:bg-gray-100"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-gray-100"
            >
              <div className="px-4 pt-2 pb-6 space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-purple-50 hover:text-primary transition-all"
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-4 flex flex-col space-y-3 px-3">
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 border border-emerald-500 text-emerald-600 py-2.5 rounded-full font-semibold text-sm"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.438 2.5 1.177 3.464L6.96 18l2.67-.783a5.722 5.722 0 0 0 2.4.527h.002c3.181 0 5.767-2.586 5.768-5.767a5.758 5.758 0 0 0-5.769-5.805zm3.621 8.232c-.15.421-.767.767-1.127.81-.36.043-.82.072-2.384-.572-1.999-.823-3.276-2.854-3.376-2.987-.1-.133-.795-.923-.795-1.762 0-.839.44-1.25.59-1.416.15-.166.33-.208.44-.208.11 0 .22.001.32.007.1.006.24-.038.37.276.13.314.44 1.071.48 1.153.04.082.07.18.01.293-.05.11-.08.196-.16.293-.08.096-.17.215-.24.293-.08.082-.17.171-.07.337a7.842 7.842 0 0 0 1.43 1.777 6.486 6.486 0 0 0 2.07 1.28c.18.09.29.077.4-.049.11-.125.48-.558.61-.749.13-.191.26-.161.44-.097.18.064 1.15.542 1.35.642.2.1.33.15.38.237.05.087.05.508-.1.929z" />
                    </svg>
                    <span>WhatsApp Chat</span>
                  </a>

                  {/* Book Now */}
                  <a
                    href="#booking"
                    onClick={() => setIsOpen(false)}
                    className="bg-gradient-to-r from-primary to-secondary text-white py-2.5 rounded-full font-bold text-center shadow-md text-sm block"
                  >
                    Book Now
                  </a>

                  {/* Attendant Login */}
                  <a
                    href="/attendant-login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center space-x-2 border border-primary text-primary py-2.5 rounded-full font-semibold text-sm"
                  >
                    Attendant Login
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
