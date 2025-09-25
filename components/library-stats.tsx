import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Languages, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Novel } from "@/lib/types"

interface LibraryStatsProps {
  stats: {
    totalNovels: number
    totalChapters: number
    translatedChapters: number
    recentlyAdded: Novel[]
  }
}

export function LibraryStats({ stats }: LibraryStatsProps) {
  const translationPercentage =
    stats.totalChapters > 0 ? Math.round((stats.translatedChapters / stats.totalChapters) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Novels */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Novels</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalNovels}</div>
          <p className="text-xs text-muted-foreground">In your library</p>
        </CardContent>
      </Card>

      {/* Total Chapters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalChapters}</div>
          <p className="text-xs text-muted-foreground">Available to read</p>
        </CardContent>
      </Card>

      {/* Translation Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Translated</CardTitle>
          <Languages className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.translatedChapters}</div>
          <p className="text-xs text-muted-foreground">{translationPercentage}% of all chapters</p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentlyAdded.length}</div>
          <p className="text-xs text-muted-foreground">Recently added novels</p>
        </CardContent>
      </Card>

      {/* Recently Added Novels */}
      {stats.recentlyAdded.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Recently Added</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.recentlyAdded.map((novel) => (
                <Link key={novel._id} href={`/novel/${novel._id}`} className="group">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-accent/50 transition-all duration-200">
                    <div className="w-12 h-16 relative overflow-hidden rounded bg-muted shrink-0">
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
                          <div className="text-xs font-bold text-muted-foreground/50">{novel.title.charAt(0)}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {novel.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{novel.author}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {novel.chapters.length} chapters
                        </Badge>
                        {novel.chapters.some((ch) => ch.translation) && (
                          <Badge variant="default" className="text-xs">
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
  )
}
