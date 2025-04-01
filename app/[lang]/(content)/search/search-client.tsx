"use client";

import React, { useState } from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/[lang]/components/ui/card";
import { Button } from "@/app/[lang]/components/ui/button";
import { Input } from "@/app/[lang]/components/ui/input";
import { BookOpen, FileText, HelpCircle, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Content = {
  id: string;
  title: string;
  description: string;
  content_type: "course" | "lesson" | "quiz";
  created_at: string;
};

export default function SearchPageClient({
  dictionary,
  contentDictionary,
  searchResults,
  downloadedIds,
  q,
}: {
  dictionary: any;
  contentDictionary: any;
  searchResults: Content[] | null;
  downloadedIds: string[];
  q: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(q);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getIconForContentType = (type: string) => {
    switch (type) {
      case "course":
        return <BookOpen className="h-6 w-6" />;
      case "lesson":
        return <FileText className="h-6 w-6" />;
      case "quiz":
        return <HelpCircle className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  return (
    <div className="container py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{dictionary.title}</h1>
        <p className="text-muted-foreground">{dictionary.description}</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={dictionary.inputPlaceholder}
          className="max-w-xl"
        />
        <Button type="submit">
          <SearchIcon className="h-4 w-4 mr-2" />
          {dictionary.title}
        </Button>
      </form>

      {searchResults && searchResults.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-center gap-2">
                  {getIconForContentType(item.content_type)}
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Link href={`/content/${item.id}`}>
                  <Button variant="outline">{contentDictionary.view}</Button>
                </Link>
                {downloadedIds.includes(item.id) ? (
                  <Button variant="secondary" disabled>
                    {contentDictionary.downloaded}
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      // Download functionality would be implemented here
                    }}
                  >
                    {contentDictionary.download}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : q ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">
            {dictionary.noResults} "{q}"
          </h2>
          <p className="text-muted-foreground mb-4">
            {dictionary.tryDifferent}
          </p>
          <Button asChild variant="outline">
            <Link href="/courses">{dictionary.browseAll}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">
              {dictionary.popularSearches}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/search?q=programming">
                  {dictionary.subjects.programming.title}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/search?q=mathematics">
                  {dictionary.subjects.mathematics.title}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/search?q=science">
                  {dictionary.subjects.science.title}
                </Link>
              </Button>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              {dictionary.browseBySubject}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(dictionary.subjects).map(([key, subject]: [string, any]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle>{subject.title}</CardTitle>
                    <CardDescription>{subject.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="outline">
                      <Link href={`/search?q=${encodeURIComponent(subject.title)}`}>
                        {dictionary.title}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}