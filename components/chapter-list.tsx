"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUpDown,
  ChevronRight,
  Languages,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  CheckIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  deleteChapter,
  deleteChaptersBatch,
} from "@/app/actions/novel-actions";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import type { Novel } from "@/lib/types";

interface ChapterListProps {
  novel: Novel;
}

export function ChapterList({ novel }: ChapterListProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showTranslatedTitles, setShowTranslatedTitles] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const sortedChapters = [...novel.chapters].sort((a, b) => {
    const aNum = Number.parseInt(a.chapter_number);
    const bNum = Number.parseInt(b.chapter_number);
    return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const toggleTitleLanguage = () => {
    setShowTranslatedTitles(!showTranslatedTitles);
  };

  const getChapterTitle = (chapter: any) => {
    if (showTranslatedTitles && chapter.translated_chapter_title) {
      return chapter.translated_chapter_title;
    }
    return chapter.chapter_name;
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedChapters(new Set());
  };

  const toggleChapterSelection = (chapterNumber: string) => {
    const newSelected = new Set(selectedChapters);
    if (newSelected.has(chapterNumber)) {
      newSelected.delete(chapterNumber);
    } else {
      newSelected.add(chapterNumber);
    }
    setSelectedChapters(newSelected);
  };

  const selectAllChapters = () => {
    if (selectedChapters.size === sortedChapters.length) {
      setSelectedChapters(new Set());
    } else {
      setSelectedChapters(
        new Set(sortedChapters.map((ch) => ch.chapter_number))
      );
    }
  };

  const handleDeleteSingle = async (chapterNumber: string) => {
    setIsDeleting(true);
    try {
      const success = await deleteChapter(novel._id, chapterNumber);
      if (success) {
        toast({
          title: "Chapter deleted",
          description: `Chapter ${chapterNumber} has been deleted successfully.`,
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete chapter. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the chapter.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (selectedChapters.size === 0) return;

    setIsDeleting(true);
    try {
      const success = await deleteChaptersBatch(
        novel._id,
        Array.from(selectedChapters)
      );
      if (success) {
        toast({
          title: "Chapters deleted",
          description: `${selectedChapters.size} chapters have been deleted successfully.`,
        });
        setSelectedChapters(new Set());
        setIsDeleteMode(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete chapters. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the chapters.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl">Chapters</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {isDeleteMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllChapters}
                  className="gap-2 bg-transparent"
                >
                  {selectedChapters.size === sortedChapters.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {selectedChapters.size === sortedChapters.length
                      ? "Deselect All"
                      : "Select All"}
                  </span>
                  <span className="sm:hidden">
                    {selectedChapters.size === sortedChapters.length
                      ? "Deselect"
                      : "Select"}
                  </span>
                </Button>
                {selectedChapters.size > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          Delete Selected ({selectedChapters.size})
                        </span>
                        <span className="sm:hidden">
                          Delete ({selectedChapters.size})
                        </span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Selected Chapters
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete{" "}
                          {selectedChapters.size} selected chapters? This action
                          cannot be undone and will permanently remove all
                          chapter content and translations.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteBatch}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Chapters
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDeleteMode}
              className="gap-2 bg-transparent"
            >
              {isDeleteMode ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Done</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTitleLanguage}
              className="gap-2 bg-transparent"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">
                {showTranslatedTitles ? "English" : "Chinese"}
              </span>
              <span className="sm:hidden">
                {showTranslatedTitles ? "EN" : "CN"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="gap-2 bg-transparent"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden md:inline">
                {sortOrder === "asc" ? "Oldest First" : "Newest First"}
              </span>
              <span className="md:hidden">
                {sortOrder === "asc" ? "Oldest First" : "Newest First"}
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedChapters.map((chapter, index) => (
            <div key={`${chapter.chapter_number}-${index}`} className="group">
              {isDeleteMode ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border hover:bg-accent/50 transition-all duration-200">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedChapters.has(chapter.chapter_number)}
                      onCheckedChange={() =>
                        toggleChapterSelection(chapter.chapter_number)
                      }
                      className="shrink-0"
                    />
                    <Badge
                      variant="outline"
                      className="text-xs font-mono shrink-0"
                    >
                      <span className="hidden sm:inline">Ch. </span>
                      {chapter.chapter_number}
                    </Badge>
                    <h3 className="font-medium text-sm truncate">
                      {getChapterTitle(chapter)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="hidden sm:flex items-center gap-1">
                      {chapter.content && (
                        <Badge variant="secondary" className="text-xs">
                          Content Loaded
                        </Badge>
                      )}
                      {chapter.translation && (
                        <Badge variant="default" className="text-xs">
                          Translated
                        </Badge>
                      )}
                      {chapter.translated_chapter_title && (
                        <Badge variant="outline" className="text-xs">
                          Title Translated
                        </Badge>
                      )}
                    </div>
                    <div className="sm:hidden flex items-center gap-1">
                      {chapter.content && (
                        <Badge variant="secondary" className="text-xs px-1">
                          C
                        </Badge>
                      )}
                      {chapter.translation && (
                        <Badge variant="default" className="text-xs px-1">
                          T
                        </Badge>
                      )}
                      {chapter.translated_chapter_title && (
                        <Badge variant="outline" className="text-xs px-1">
                          TT
                        </Badge>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Chapter {chapter.chapter_number}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this chapter? This
                            action cannot be undone and will permanently remove
                            all chapter content and translations.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteSingle(chapter.chapter_number)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Chapter
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/novel/${novel._id}/chapter/${
                    chapter.chapter_number
                  }?url=${encodeURIComponent(chapter.url)}`}
                  className="group"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border hover:bg-accent/50 transition-all duration-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Badge
                          variant="outline"
                          className="text-xs font-mono shrink-0"
                        >
                          <span className="hidden sm:inline">Ch. </span>
                          {chapter.chapter_number}
                        </Badge>
                        <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {getChapterTitle(chapter)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        {/* Desktop badges */}
                        <div className="hidden sm:flex items-center gap-2">
                          {chapter.content && (
                            <Badge variant="secondary" className="text-xs">
                              Content Loaded
                            </Badge>
                          )}
                          {chapter.translation && (
                            <Badge variant="default" className="text-xs">
                              Translated
                            </Badge>
                          )}
                        </div>
                        {/* Mobile compact badges */}
                        <div className="sm:hidden flex items-center gap-1">
                          {chapter.content && (
                            <Badge variant="secondary" className="text-xs px-4">
                              Content Loaded
                            </Badge>
                          )}
                          {chapter.translation && (
                            <Badge variant="default" className="text-xs px-4">
                              Translated
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
