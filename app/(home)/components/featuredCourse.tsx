import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const FeaturedCourses = () => {
  const courses = [
    {
      id: 1,
      title: "Web Development",
      description: "Learn full-stack web development",
      image: "/web-dev.jpg",
    },
    {
      id: 2,
      title: "Data Science",
      description: "Master data analysis and machine learning",
      image: "/data-science.jpg",
    },
    // Add more courses as needed
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-12"
        >
          Featured Courses
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
