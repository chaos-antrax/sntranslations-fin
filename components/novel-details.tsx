import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, BookOpen, RefreshCw } from "lucide-react";
import { TranslationStatus } from "@/components/translation-status";
import { GlossaryViewer } from "@/components/glossary-viewer";
import { UpdateNovelDialog } from "@/components/update-novel-dialog";
import type { Novel } from "@/lib/types";

interface NovelDetailsProps {
  novel: Novel;
}

export function NovelDetails({ novel }: NovelDetailsProps) {
  return (
    <div className="space-y-6">
      <Card className="">
        <CardHeader className="pb-4">
          <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-muted mb-4">
            {novel.coverImg ? (
              <Image
                src={novel.coverImg || "/placeholder.svg"}
                alt={novel.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <div className="text-6xl font-bold text-muted-foreground/30">
                  {novel.title.charAt(0)}
                </div>
              </div>
            )}
          </div>
          <CardTitle className="text-xl text-balance">{novel.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{novel.author}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{novel.chapters.length} chapters</span>
          </div>

          {novel.createdAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Added {new Date(novel.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="pt-2">
            <Badge variant="secondary" className="text-xs">
              Chinese Novel
            </Badge>
          </div>

          <div className="pt-4 border-t border-border">
            <UpdateNovelDialog
              novelId={novel._id!}
              novelTitle={novel.title}
              hasSourceUrl={!!novel.sourceUrl}
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Check for Updates
              </Button>
            </UpdateNovelDialog>
          </div>

          <div className="pt-4 border-t border-border">
            <TranslationStatus novel={novel} />
          </div>
        </CardContent>
      </Card>

      <GlossaryViewer novel={novel} />
    </div>
  );
}
