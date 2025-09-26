import { Suspense } from "react";
import { getAllNovels, getLibraryStats } from "./actions/novel-actions";
import { NovelGrid } from "@/components/novel-grid";
import { LibraryStats } from "@/components/library-stats";
import { AddNovelDialog } from "@/components/add-novel-dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import logo from "@/public/logo.png";
import Image from "next/image";

export default async function HomePage() {
  const [novels, stats] = await Promise.all([
    getAllNovels(),
    getLibraryStats(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg">
                <Image src={logo} alt="Logo" className="h-14 w-14" />
                {/* <BookOpen className="h-6 w-6 text-primary" /> */}
              </div>
              <div>
                <h1 className="text-xl xl:text-2xl font-bold text-foreground">
                  Chaos Translations
                </h1>
                <p className="text-xs xl:text-sm text-muted-foreground">
                  Your Translated Novels Library
                </p>
              </div>
            </div>
            <AddNovelDialog>
              <Button className="gap-2 rounded-full xl:rounded-md">
                <Plus className="h-4 w-4" />
                <span className="hidden xl:block">Add Novel</span>
              </Button>
            </AddNovelDialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {novels.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="p-6 bg-muted/30 rounded-full mb-6">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-balance">
              Welcome to Your Novel Library
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md text-pretty">
              Start building your personal collection of Chinese novels. Add
              your first novel by entering a URL from your favorite reading
              platform.
            </p>
            <AddNovelDialog>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Add Your First Novel
              </Button>
            </AddNovelDialog>
          </div>
        ) : (
          <div>
            {/* Library Statistics */}
            <Suspense
              fallback={
                <div className="text-center py-8">Loading stats...</div>
              }
            >
              <LibraryStats stats={stats} />
            </Suspense>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-balance">
                  Your Library
                </h2>
                <p className="text-muted-foreground mt-1">
                  {novels.length} novel{novels.length !== 1 ? "s were" : "was"}{" "}
                  found in your collection
                </p>
              </div>
            </div>
            <Suspense
              fallback={
                <div className="text-center py-8">Loading novels...</div>
              }
            >
              <NovelGrid novels={novels} />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
}
