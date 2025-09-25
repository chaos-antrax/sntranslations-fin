"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { scrapeNovel } from "@/app/actions/novel-actions"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface AddNovelDialogProps {
  children: React.ReactNode
}

export function AddNovelDialog({ children }: AddNovelDialogProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    try {
      const novel = await scrapeNovel(url.trim())
      if (novel) {
        toast({
          title: "Novel added successfully!",
          description: `"${novel.title}" has been added to your library.`,
        })
        setOpen(false)
        setUrl("")
        router.refresh()
      } else {
        toast({
          title: "Failed to add novel",
          description: "Please check the URL and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding the novel.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Novel</DialogTitle>
          <DialogDescription>
            Enter the URL of a Chinese novel from your favorite reading platform. We'll automatically extract the title,
            author, cover, and chapter list.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">Novel URL</Label>
              <Input
                id="url"
                placeholder="https://twkan.com/book/79291.html"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !url.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Novel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
