import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NovelManagement } from "@/components/novel-management";
import type { Novel } from "@/lib/types";

interface NovelGridProps {
  novels: Novel[];
}

export function NovelGrid({ novels }: NovelGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {novels.map((novel) => (
        <Card
          key={novel._id}
          className="overflow-hidden pt-0 pb-0 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border/50 group"
        >
          <Link href={`/novel/${novel._id}`} className="block">
            <div className="aspect-[3/4] relative overflow-hidden bg-muted">
              {novel.coverImg ? (
                <Image
                  src={novel.coverImg || "/placeholder.svg"}
                  alt={novel.title}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-4xl font-bold text-muted-foreground/30">
                    {novel.title.charAt(0)}
                  </div>
                </div>
              )}
            </div>
          </Link>
          <CardContent className="p-4 pt-0 mt-[-10px] h-full">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <Link href={`/novel/${novel._id}`} className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-balance group-hover:text-primary transition-colors">
                      {novel.title}
                    </h3>
                  </Link>
                  <NovelManagement novel={novel} />
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                  {novel.author}
                </p>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                  {novel.createdAt
                    ? new Date(novel.createdAt).toLocaleDateString()
                    : "Recently added"}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start gap-2">
                  <Badge
                    variant="secondary"
                    className="text-xs w-28 items-center justify-center flex"
                  >
                    {novel.chapters.length} chapters
                  </Badge>
                  {novel.chapters.some((ch) => ch.translation) && (
                    <Badge
                      variant="default"
                      className="text-xs w-28 items-center justify-center flex"
                    >
                      Translated
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
