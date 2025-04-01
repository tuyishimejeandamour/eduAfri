import React from "react";
import {
  ArrowRight,
  BookOpen,
  Download,
  Award,
  Headphones,
} from "lucide-react";
import { Button } from "@/app/[lang]/components/ui/button";
import { type getDictionary } from "@/get-dictionary";

interface DetailsSectionProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["home"]["details"];
}

const DetailsSection = ({ dictionary }: DetailsSectionProps) => {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-center mb-16">
          <div className="text-center max-w-3xl">
            <div className="pill mx-auto">{dictionary.pill}</div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-eduscape-text">
              {dictionary.heading}
            </h2>
            <p className="text-eduscape-muted">
              {dictionary.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DetailCard
            icon={<BookOpen size={24} />}
            title={dictionary.expertCurriculum.title}
            description={dictionary.expertCurriculum.description}
          />

          <DetailCard
            icon={<Download size={24} />}
            title={dictionary.offlineLearning.title}
            description={dictionary.offlineLearning.description}
          />

          <DetailCard
            icon={<Award size={24} />}
            title={dictionary.certifications.title}
            description={dictionary.certifications.description}
          />

          <DetailCard
            icon={<Headphones size={24} />}
            title={dictionary.support.title}
            description={dictionary.support.description}
          />
        </div>

        <div className="mt-16 flex justify-center">
          <Button className="rounded-full bg-eduscape hover:bg-eduscape-dark group">
            <span>{dictionary.startLearning}</span>
            <ArrowRight
              size={16}
              className="ml-2 group-hover:translate-x-1 transition-transform"
            />
          </Button>
        </div>
      </div>
    </section>
  );
};

interface DetailCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DetailCard = ({ icon, title, description }: DetailCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="bg-eduscape/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 text-eduscape">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-4 text-eduscape-text">{title}</h3>
      <p className="text-eduscape-muted">{description}</p>
    </div>
  );
};

export default DetailsSection;
