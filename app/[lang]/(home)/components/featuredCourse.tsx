import React from "react";
import { type getDictionary } from "@/get-dictionary";
import { FeaturedCourseCard } from "@/app/[lang]/components/featured-course-card";

interface FeaturedCoursesProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["home"]["featuredCourses"];
}

const FeaturedCourses = ({ dictionary }: FeaturedCoursesProps) => {


  const courses = [
    {
      id: 1,
      title: dictionary.courses?.webDev?.title || "Web Development",
      description: dictionary.courses?.webDev?.description || "Learn full-stack web development",
      image: "/web-dev.png",
    },
    {
      id: 2,
      title: dictionary.courses?.dataScience?.title || "Data Science",
      description: dictionary.courses?.dataScience?.description || "Master data analysis and machine learning",
      image: "/data-science.png",
    },
    // Add more courses as needed
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {dictionary.heading || "Featured Courses"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id}>
              <FeaturedCourseCard
                title={course.title}
                description={course.description}
                image={course.image}
                href={`/courses/${course.id}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
