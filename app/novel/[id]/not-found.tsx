import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="p-6 bg-muted/30 rounded-full mb-6 inline-block">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Novel Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The novel you're looking for doesn't exist or may have been removed from your library.
        </p>
        <Link href="/">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Button>
        </Link>
      </div>
    </div>
  )
}
