import React from "react";
import Image from "next/image";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="section bg-eduscape-light relative pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex flex-col md:flex-row items-center">
        {/* Left Column - Text Content */}
        <div className="md:w-1/2 z-10 py-12 md:py-0 animate-fade-in">
          <div className="pill">Learn from anywhere</div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-balance leading-tight text-eduscape-text">
            Explore the <br />
            world of learning <br /> with us
          </h1>
          <p className="text-eduscape-muted mb-8 max-w-md text-balance">
            Discover expert-led courses in technology, business, arts, and more.
            Download and learn at your own pace, anywhere, anytime.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="rounded-full bg-eduscape hover:bg-eduscape-dark group">
              <span>Get started</span>
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Button>
            <Button variant="outline" className="rounded-full">
              Explore courses
            </Button>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="md:w-1/2 relative mt-8 md:mt-0 z-10 animate-fade-in-right">
          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/hero-image.jpg"
              alt="Hero"
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
            />

            {/* Floating Card */}
            <div className="absolute bottom-4 right-4 glass-card p-4 shadow-lg animate-float">
              <h3 className="font-medium text-eduscape-text">
                Explore our catalog of
              </h3>
              <p className="text-sm text-eduscape-muted">
                500+ premium courses available offline
              </p>
            </div>
          </div>

          {/* Download Feature Highlight */}
          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-md flex items-center animate-fade-in">
            <div className="bg-eduscape/10 p-2 rounded-full mr-3">
              <Download className="text-eduscape" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-eduscape-text">
                Download courses
              </p>
              <p className="text-xs text-eduscape-muted">
                Learn offline, anywhere
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-teal-200 rounded-full filter blur-3xl opacity-30"></div>
    </section>
  );
};

export default HeroSection;
