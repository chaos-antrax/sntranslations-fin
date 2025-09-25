import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Chapter } from "@/lib/types"

interface ChapterNavigationProps {
  novelId: string
  currentChapter: Chapter
  prevChapter: Chapter | null
  nextChapter: Chapter | null
}

export function ChapterNavigation({ novelId, currentChapter, prevChapter, nextChapter }: ChapterNavigationProps) {
  return (
    <div className="flex items-center gap-2">
      {prevChapter ? (
        <Link
          href={`/novel/${novelId}/chapter/${prevChapter.chapter_number}?url=${encodeURIComponent(prevChapter.url)}`}
        >
          <Button variant="outline" size="sm" className="gap-1 bg-transparent">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled className="gap-1 bg-transparent">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
      )}

      {nextChapter ? (
        <Link
          href={`/novel/${novelId}/chapter/${nextChapter.chapter_number}?url=${encodeURIComponent(nextChapter.url)}`}
        >
          <Button variant="outline" size="sm" className="gap-1 bg-transparent">
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled className="gap-1 bg-transparent">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
