import React from "react";
import { type getDictionary } from "@/get-dictionary";

interface StatsSectionProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["home"]["stats"];
}

const StatsSection = ({ dictionary }: StatsSectionProps) => {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="bg-eduscape-light rounded-3xl p-8 md:p-12 animate-fade-in">
          <div className="mb-6">
            <span className="text-7xl md:text-8xl font-display font-bold text-eduscape">
              {dictionary.completionRate.percentage}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-medium mb-4 text-eduscape-text">
            {dictionary.completionRate.title}
          </h3>
          <p className="text-eduscape-muted">
            {dictionary.completionRate.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            number={dictionary.expertLed.number}
            label={dictionary.expertLed.title}
            description={dictionary.expertLed.description}
          />
          <StatCard
            number={dictionary.learningAccess.number}
            label={dictionary.learningAccess.title}
            description={dictionary.learningAccess.description}
          />
          <StatCard
            number={dictionary.activeStudents.number}
            label={dictionary.activeStudents.title}
            description={dictionary.activeStudents.description}
          />
          <StatCard
            number={dictionary.satisfactionRate.number}
            label={dictionary.satisfactionRate.title}
            description={dictionary.satisfactionRate.description}
          />
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  number: string;
  label: string;
  description: string;
}

const StatCard = ({ number, label, description }: StatCardProps) => {
  return (
    <div className="glass-card p-6 animate-scale-in">
      <div className="mb-2">
        <span className="text-3xl font-display font-bold text-eduscape-text">
          {number}
        </span>
      </div>
      <h4 className="text-lg font-medium mb-2 text-eduscape-text">{label}</h4>
      <p className="text-sm text-eduscape-muted">{description}</p>
    </div>
  );
};

export default StatsSection;
