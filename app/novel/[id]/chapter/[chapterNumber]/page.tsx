import { notFound } from "next/navigation";
import {
  getNovelById,
  getChapterContent,
  saveChapterContent,
} from "@/app/actions/novel-actions";
import { ChapterReader } from "@/components/chapter-reader";
import { ChapterNavigation } from "@/components/chapter-navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ChapterPageProps {
  params: Promise<{ id: string; chapterNumber: string }>;
  searchParams: Promise<{ url?: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChapterPage({
  params,
  searchParams,
}: ChapterPageProps) {
  const { id, chapterNumber } = await params;
  const { url } = await searchParams;

  console.log("[v0] Fetching novel with ID:", id);
  const novel = await getNovelById(id);
  console.log("[v0] Novel fetched:", novel ? "success" : "not found");

  if (!novel) {
    notFound();
  }

  const chapterIndex = novel.chapters.findIndex(
    (ch) => ch.chapter_number === chapterNumber
  );
  const chapter = novel.chapters[chapterIndex];

  console.log("[v0] Chapter found:", chapter ? "yes" : "no");
  console.log(
    "[v0] Chapter translation exists:",
    chapter?.translation ? "yes" : "no"
  );
  console.log("[v0] Chapter translation content:", chapter?.translation);

  if (!chapter) {
    notFound();
  }

  // Load chapter content if not already loaded
  let content = chapter.content;
  if (!content && url) {
    content = await getChapterContent(url);
    if (content) {
      await saveChapterContent(id, chapterNumber, content);
    }
  }

  const prevChapter =
    chapterIndex > 0 ? novel.chapters[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex < novel.chapters.length - 1
      ? novel.chapters[chapterIndex + 1]
      : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/novel/${id}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Novel
                </Button>
              </Link>
              <div className="hidden md:block">
                <h1 className="font-semibold text-sm text-muted-foreground">
                  {novel.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Chapter {chapterNumber}
                </p>
              </div>
            </div>
            <ChapterNavigation
              novelId={id}
              currentChapter={chapter}
              prevChapter={prevChapter}
              nextChapter={nextChapter}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <ChapterReader
          novel={novel}
          chapter={chapter}
          content={content}
          chapterUrl={url}
        />
      </main>
    </div>
  );
}
