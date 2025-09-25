import { notFound } from "next/navigation";
import { getNovelById } from "@/app/actions/novel-actions";
import { NovelDetails } from "@/components/novel-details";
import { ChapterList } from "@/components/chapter-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface NovelPageProps {
  params: Promise<{ id: string }>;
}

export default async function NovelPage({ params }: NovelPageProps) {
  const { id } = await params;
  const novel = await getNovelById(id);

  if (!novel) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Novel Details */}
          <div className="xl:col-span-1">
            <NovelDetails novel={novel} />
          </div>

          {/* Chapter List */}
          <div className="xl:col-span-2">
            <ChapterList novel={novel} />
          </div>
        </div>
      </main>
    </div>
  );
}
