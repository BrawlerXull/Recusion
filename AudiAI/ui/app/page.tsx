import React from "react";
import { ArrowRight, Check, Mic, Heart, AlertCircle } from "lucide-react";
import Link from "next/link";

import Navbar from "@/components/navbar";

const LandingPage = () => {
  return (
    <div
      className="font-inter bg-white min-h-screen relative"
      style={{
        backgroundImage: `
            linear-gradient(to right, #FFE5EC 1px, transparent 1px),
            linear-gradient(to bottom, #FFE5EC 1px, transparent 1px)
          `,
        backgroundSize: "40px 40px",
        zIndex: 0,
      }}
    >
      <div className="relative z-10">
        <Navbar />

        <main className="pt-24 pb-16">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 animate-fadeInUp">
              <div className="inline-flex items-center bg-pink-100 text-pink-600 rounded-full px-4 py-2 text-sm font-medium">
                <Heart className="w-4 h-4 mr-2" />
                AI-Powered Shorts Generator
                <span className="ml-2 px-2 py-0.5 bg-pink-500 text-white rounded-full text-xs">
                  New
                </span>
              </div>
              <h1 className="text-5xl text-blue-400 sm:text-6xl font-bold">
                Turn Your Videos Into{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600">
                  Engaging Shorts
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl text-gray-600">
                AI-powered tool to create{" "}
                <span className="text-pink-500 font-semibold">
                  Viral-Worthy Shorts
                </span>{" "}
                from long videos.
              </p>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our AI system intelligently extracts the best moments, optimizes
                clip length, adds captions, and ensures maximum engagement.
              </p>
              <Link href="/innerpage/aigen" className="flex justify-center gap-4 mt-8">

                <button className="rounded-full px-8 py-6 text-lg gap-2 bg-pink-500 hover:bg-pink-600 text-white inline-flex items-center">
                  Generate Shorts Now <ArrowRight className="ml-2" size={18} />
                </button>
              </Link>
            </div>

            {/* Why It Matters Section */}
            <div className="mt-24 bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-2">
                    <AlertCircle className="text-pink-500 w-6 h-6" />
                    <h2 className="text-3xl font-bold">Why Shorts Matter</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center mt-1">
                        <span className="text-pink-500 font-semibold">1</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          More Engagement
                        </h3>
                        <p className="text-gray-600">
                          Short-form videos get higher engagement and
                          visibility.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center mt-1">
                        <span className="text-pink-500 font-semibold">2</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Save Time</h3>
                        <p className="text-gray-600">
                          No need to manually edit clips—our AI does it for you.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center mt-1">
                        <span className="text-pink-500 font-semibold">3</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          Optimized for Growth
                        </h3>
                        <p className="text-gray-600">
                          AI selects the best moments to help you grow your
                          audience.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative mx-auto max-w-[600px]">
                    <div className="relative">
                      <div className="bg-gray-800 rounded-t-xl p-2 aspect-[16/10]">
                        <div className="bg-white rounded-lg h-full p-4 overflow-hidden">
                          <img
                            alt="AI Shorts Generator Dashboard"
                            className="w-full h-full object-cover rounded"
                            src={""}
                          />
                        </div>
                      </div>
                      <div className="bg-gray-800 h-4 rounded-b-lg transform perspective-1000 rotateX-12" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <section className="mt-24 grid md:grid-cols-3 gap-8 animate-fadeInUp">
              {[
                {
                  title: "Automated Highlights",
                  description:
                    "AI scans your videos to extract the most impactful moments.",
                },
                {
                  title: "Smart Captioning",
                  description:
                    "Auto-generated captions ensure better engagement and accessibility.",
                },
                {
                  title: "Optimized Formatting",
                  description:
                    "Clips are automatically resized and formatted for YouTube Shorts.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl border border-pink-100 hover:shadow-xl transition-shadow"
                >
                  <Check className="text-pink-500 mb-4" size={24} />
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </section>
          </section>
          <section className="bg-pink-500 text-white mt-24 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center animate-fadeInUp">
                <h2 className="text-3xl font-bold mb-4">
                  Share Your Voice Journey
                </h2>
                <p className="text-xl mb-8">
                  Help us improve by sharing your experience with Automus
                </p>
                <button className="px-6 py-3 bg-white text-pink-500 rounded-full hover:bg-pink-50 transition-all duration-300 ease-in-out hover:scale-105">
                  Give Feedback
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-white border-t border-pink-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Mic className="w-8 h-8 text-pink-500" />
                  ShortsAI
                </h3>
                <p className="text-gray-600">
                  Create viral Shorts effortlessly with AI-powered editing.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
