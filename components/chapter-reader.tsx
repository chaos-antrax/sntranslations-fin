"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Languages } from "lucide-react";
import { TranslationToggle } from "@/components/translation-toggle";
import type { Novel, Chapter } from "@/lib/types";

interface ChapterReaderProps {
  novel: Novel;
  chapter: Chapter;
  content: string | null;
  chapterUrl?: string;
}

export function ChapterReader({
  novel,
  chapter,
  content,
  chapterUrl,
}: ChapterReaderProps) {
  const [isLoading, setIsLoading] = useState(!content);
  const [showTranslatedTitle, setShowTranslatedTitle] = useState(false);

  useEffect(() => {
    if (content) {
      setIsLoading(false);
    }
  }, [content]);

  const getChapterTitle = () => {
    if (chapter.translated_chapter_title) {
      return showTranslatedTitle
        ? chapter.chapter_name
        : chapter.translated_chapter_title;
    }
    return chapter.chapter_name;
  };

  const toggleTitleLanguage = () => {
    setShowTranslatedTitle(!showTranslatedTitle);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading chapter content...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Failed to load chapter content
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chapter Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between relative">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono">
                  Chapter {chapter.chapter_number}
                </Badge>
                {chapter.translation && (
                  <Badge variant="default" className="text-xs">
                    Translated
                  </Badge>
                )}
                {/* {chapter.translated_chapter_title && (
                  <Badge variant="outline" className="text-xs">
                    Title Translated
                  </Badge>
                )} */}
              </div>
              <CardTitle className="text-2xl text-balance pt-2 xl:pt-0">
                {getChapterTitle()}
              </CardTitle>
            </div>
            {chapter.translated_chapter_title && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTitleLanguage}
                className="gap-2 ml-4 bg-transparent absolute right-[-10px] top-[-10px]"
              >
                <Languages className="h-4 w-4" />
                {showTranslatedTitle ? "CN" : "EN"}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Chapter Content */}
      {/* <Card>
        <CardContent className="p-8"> */}
      <div className="p-4">
        <div className="relative">
          <TranslationToggle
            novelId={novel._id!}
            chapter={chapter}
            originalContent={content}
            existingTranslation={chapter.translation}
          />
        </div>
      </div>
      {/* </CardContent>
      </Card> */}
    </div>
  );
}
