import React from "react";
import {
  ArrowUpRight,
  PlayCircle,
  Clock,
  BookOpen,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

const courseData = [
  {
    id: 1,
    title: "Web Development Bootcamp",
    category: "Coding & Development",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    duration: "42 hours",
    lessons: 108,
    featured: true,
  },
  {
    id: 2,
    title: "Data Science Fundamentals",
    category: "Data & Analytics",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    duration: "38 hours",
    lessons: 92,
    featured: false,
  },
  {
    id: 3,
    title: "UX/UI Design Masterclass",
    category: "Design & Creativity",
    image:
      "https://images.unsplash.com/photo-1534670007418-bc0f2458c5d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    duration: "28 hours",
    lessons: 76,
    featured: false,
  },
];

const CourseCard = ({ course }: { course: (typeof courseData)[0] }) => {
  return (
    <div
      className={`image-card card-hover overflow-hidden rounded-2xl bg-white ${
        course.featured ? "md:col-span-2" : ""
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {course.featured && (
          <div className="absolute top-4 left-4 pill bg-white/80 text-eduscape-dark backdrop-blur-sm">
            Featured Course
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full h-8 w-8"
        >
          <PlayCircle size={16} className="text-eduscape-dark" />
        </Button>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs text-eduscape-muted">{course.category}</p>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 hover:bg-eduscape/10"
          >
            <Download size={16} className="text-eduscape" />
          </Button>
        </div>
        <h3 className="text-lg font-medium mb-3 text-eduscape-text">
          {course.title}
        </h3>
        <div className="flex items-center text-sm text-eduscape-muted space-x-4">
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center">
            <BookOpen size={14} className="mr-1" />
            <span>{course.lessons} lessons</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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
                    <img
                      src={course.image}
                      alt={course.title}
                      className="object-cover w-full h-full"
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
