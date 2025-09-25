import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Languages, CheckCircle } from "lucide-react"
import type { Novel } from "@/lib/types"

interface TranslationStatusProps {
  novel: Novel
}

export function TranslationStatus({ novel }: TranslationStatusProps) {
  const totalChapters = novel.chapters.length
  const translatedChapters = novel.chapters.filter((chapter) => chapter.translation).length
  const progressPercentage = totalChapters > 0 ? (translatedChapters / totalChapters) * 100 : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Translation Progress</span>
        </div>
        <Badge variant={progressPercentage === 100 ? "default" : "secondary"} className="text-xs">
          {translatedChapters}/{totalChapters}
        </Badge>
      </div>

      <Progress value={progressPercentage} className="h-2" />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{Math.round(progressPercentage)}% complete</span>
        {progressPercentage === 100 && (
          <div className="flex items-center gap-1 text-primary">
            <CheckCircle className="h-3 w-3" />
            <span>Fully translated</span>
          </div>
        )}
      </div>
    </div>
  )
}
