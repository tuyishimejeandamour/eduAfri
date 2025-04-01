import React from "react";
import { WifiOff, CheckCheck, Download } from "lucide-react";
import { Button } from "@/app/[lang]/components/ui/button";
import Image from "next/image";
import { type getDictionary } from "@/get-dictionary";

interface OfflineFeatureProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["home"]["offlineFeature"];
}

const OfflineFeature = ({ dictionary }: OfflineFeatureProps) => {
  return (
    <section
      id="features"
      className="section bg-eduscape-light py-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Oval Background Shape */}
          <div className="absolute h-[400px] w-[800px] rounded-[400px/200px] bg-white/50 blur-2xl -top-40 -left-20 transform -rotate-12"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
            {/* Left Column - Text Content */}
            <div className="animate-fade-in-left order-2 md:order-1">
              <div className="pill">{dictionary.pill}</div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-eduscape-text">
                {dictionary.heading}
              </h2>
              <p className="text-eduscape-muted mb-8 max-w-md">
                {dictionary.description}
              </p>

              <div className="space-y-4 mb-8">
                <FeatureItem
                  icon={<Download size={18} />}
                  title={dictionary.downloadCourses.title}
                  description={dictionary.downloadCourses.description}
                />
                <FeatureItem
                  icon={<WifiOff size={18} />}
                  title={dictionary.learnWithoutInternet.title}
                  description={dictionary.learnWithoutInternet.description}
                />
                <FeatureItem
                  icon={<CheckCheck size={18} />}
                  title={dictionary.autoSync.title}
                  description={dictionary.autoSync.description}
                />
              </div>

              <Button className="rounded-full bg-eduscape hover:bg-eduscape-dark">
                {dictionary.tryNow}
              </Button>
            </div>

            {/* Right Column - Image */}
            <div className="relative order-1 md:order-2 animate-fade-in-right">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/feature-1.png"
                  alt="Feature description 1"
                  width={800} // adjust as needed
                  height={500} // adjust as needed
                />
              </div>

              {/* Connection Status Indicator */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-lg flex items-center animate-float">
                <div className="mr-3">
                  <div className="flex items-center">
                    <div className="bg-red-500/10 p-2 rounded-full mr-2">
                      <WifiOff className="text-red-500" size={20} />
                    </div>
                    <div className="bg-green-500/10 p-2 rounded-full">
                      <CheckCheck className="text-green-500" size={20} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-eduscape-text">
                    {dictionary.offlineModeActive}
                  </p>
                  <p className="text-xs text-eduscape-muted">
                    {dictionary.learningContinues}
                  </p>
                </div>
              </div>

              {/* Course Thumbnails */}
              <div className="absolute -right-6 bottom-1/3 flex space-x-2">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="w-16 h-16 rounded-xl overflow-hidden shadow-md animate-float"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <Image
                      src="/feature-2.png"
                      alt="Feature description 2"
                      width={800} // adjust as needed
                      height={500} // adjust as needed
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => {
  return (
    <div className="flex items-start">
      <div className="bg-white p-2 rounded-full mr-4 text-eduscape">{icon}</div>
      <div>
        <h4 className="font-medium text-eduscape-text">{title}</h4>
        <p className="text-sm text-eduscape-muted">{description}</p>
      </div>
    </div>
  );
};

export default OfflineFeature;
