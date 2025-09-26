"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Languages, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Novel } from "@/lib/types";
import { Button } from "./ui/button";
import { useState } from "react";

interface LibraryStatsProps {
  stats: {
    totalNovels: number;
    totalChapters: number;
    translatedChapters: number;
    recentlyAdded: Novel[];
  };
}

export function LibraryStats({ stats }: LibraryStatsProps) {
  const translationPercentage =
    stats.totalChapters > 0
      ? Math.round((stats.translatedChapters / stats.totalChapters) * 100)
      : 0;

  const [showStats, setShowStats] = useState(false);

  const cards = [
    {
      title: "Total Novels",
      value: stats.totalNovels,
      description: "In your library",
      icon: BookOpen,
    },
    {
      title: "Total Chapters",
      value: stats.totalChapters,
      description: "Available to read",
      icon: FileText,
    },
    {
      title: "Translated",
      value: stats.translatedChapters,
      description: `${translationPercentage}% of all chapters`,
      icon: Languages,
    },
    {
      title: "Recent Activity",
      value: stats.recentlyAdded.length,
      description: "Recently added novels",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Button
        className="col-span-2 lg:col-span-4"
        onClick={() => setShowStats(!showStats)}
      >
        Show Library Stats
      </Button>
      {showStats == true &&
        cards.map(({ title, value, description, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}

      {/* Recently Added Novels */}
      {showStats == true && stats.recentlyAdded.length > 0 && (
        <Card className="col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Recently Added</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.recentlyAdded.map((novel) => (
                <Link
                  key={novel._id}
                  href={`/novel/${novel._id}`}
                  className="group"
                >
                  <div className="flex items-center xl:items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-accent/50 transition-all duration-200">
                    <div className="aspect-[2/3] h-24 xl:h-40 relative overflow-hidden rounded bg-muted shrink-0">
                      {novel.coverImg ? (
                        <Image
                          src={novel.coverImg || "/placeholder.svg"}
                          alt={novel.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <div className="text-xs font-bold text-muted-foreground/50">
                            {novel.title.charAt(0)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm xl:text-xl line-clamp-1 group-hover:text-primary transition-colors">
                        {novel.title}
                      </h4>
                      <p className="text-xs lg:text-sm xl:text-lg text-muted-foreground line-clamp-1">
                        {novel.author}
                      </p>
                      <div className="flex flex-col items-start gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="text-xs w-28 items-center justify-center flex rounded-full"
                        >
                          {novel.chapters.length} chapters
                        </Badge>
                        {novel.chapters.some((ch) => ch.translation) && (
                          <Badge
                            variant="default"
                            className="text-xs w-28 items-center justify-center flex rounded-full"
                          >
                            Translated
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
