import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { type getDictionary } from "@/get-dictionary";


interface FeaturedCoursesProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["home"]["featuredCourses"];
}

const FeaturedCourses = ({ dictionary }: FeaturedCoursesProps) => {
  console.log(dictionary);
  const courses = [
    {
      id: 1,
      title: dictionary.courses.webDev.title,
      description: dictionary.courses.webDev.description,
      image: "/web-dev.png",
    },
    {
      id: 2,
      title: dictionary.courses.dataScience.title,
      description: dictionary.courses.dataScience.description,
      image: "/data-science.png",
    },
    // Add more courses as needed
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl font-bold text-center mb-12"
        >
          {dictionary.heading}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
            >
              <Link href={`/courses/${course.id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-video relative">
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={600}
                      height={400}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
