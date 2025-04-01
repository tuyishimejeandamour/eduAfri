import React from "react";
import {
  ArrowRight,
  BookOpen,
  Download,
  Award,
  Headphones,
} from "lucide-react";
import { Button } from "@/app/[lang]/components/ui/button";

const DetailsSection = () => {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-center mb-16">
          <div className="text-center max-w-3xl">
            <div className="pill mx-auto">Why choose us</div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-eduscape-text">
              We take care of all the details
            </h2>
            <p className="text-eduscape-muted">
              Our platform is designed with your learning journey in mind,
              providing all the tools and resources you need to succeed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DetailCard
            icon={<BookOpen size={24} />}
            title="Expert-Crafted Curriculum"
            description="Each course is meticulously designed by industry experts and academics to provide relevant, up-to-date knowledge and skills."
          />

          <DetailCard
            icon={<Download size={24} />}
            title="Complete Offline Learning"
            description="Download entire courses including videos, quizzes, and resources to learn anywhere, even without internet connection."
          />

          <DetailCard
            icon={<Award size={24} />}
            title="Recognized Certifications"
            description="Earn industry-recognized certificates upon course completion to enhance your resume and professional credentials."
          />

          <DetailCard
            icon={<Headphones size={24} />}
            title="24/7 Learning Support"
            description="Our dedicated support team and community forums ensure you never get stuck, providing assistance whenever you need it."
          />
        </div>

        <div className="mt-16 flex justify-center">
          <Button className="rounded-full bg-eduscape hover:bg-eduscape-dark group">
            <span>Start learning today</span>
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
