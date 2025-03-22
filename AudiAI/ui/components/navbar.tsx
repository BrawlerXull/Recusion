"use client";
import React, { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed w-full bg-transparent backdrop-blur-sm z-50 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo Section */}
            <Link href="/" className="flex items-center space-x-2 animate-fadeIn">
              <img src={""} className="w-8 h-10" alt="Logo" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600">
                Automus
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 z-50">
              <Link href="/aigen" className="text-gray-600 font-medium hover:text-pink-500 transition-colors">
                AiGen
              </Link>
              <Link href="/dashboard" className="text-gray-600 font-medium hover:text-pink-500 transition-colors">
                Dashboard
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-pink-500"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Implementation */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-transparent backdrop-blur-sm">
          <div className="p-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-pink-500"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col space-y-4 p-4">
              <Link
                href="/dashboard"
                className="text-gray-600 font-medium hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/health"
                className="text-gray-600 font-medium hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Diagnose
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
