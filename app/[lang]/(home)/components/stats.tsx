import React from "react";

const StatsSection = () => {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="bg-eduscape-light rounded-3xl p-8 md:p-12 animate-fade-in">
          <div className="mb-6">
            <span className="text-7xl md:text-8xl font-display font-bold text-eduscape">
              95%
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-medium mb-4 text-eduscape-text">
            Course Completion Rate
          </h3>
          <p className="text-eduscape-muted">
            Our offline learning feature helps students complete courses even
            with limited connectivity, resulting in industry-leading completion
            rates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            number="500+"
            label="Expert-Led Courses"
            description="Courses crafted by industry professionals and academic experts"
          />
          <StatCard
            number="24/7"
            label="Learning Access"
            description="Download once, learn anytime, anywhere, even offline"
          />
          <StatCard
            number="1.2M+"
            label="Active Students"
            description="Join our global community of lifelong learners"
          />
          <StatCard
            number="98%"
            label="Satisfaction Rate"
            description="Consistently high ratings across all course categories"
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
