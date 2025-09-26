"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { updateNovelFromSource } from "@/app/actions/novel-actions";
import { toast } from "@/hooks/use-toast";

interface UpdateNovelDialogProps {
  novelId: string;
  novelTitle: string;
  hasSourceUrl: boolean;
  children: React.ReactNode;
}

export function UpdateNovelDialog({
  novelId,
  novelTitle,
  hasSourceUrl,
  children,
}: UpdateNovelDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    newChaptersCount: number;
    error?: string;
  } | null>(null);

  const handleUpdate = async () => {
    if (!hasSourceUrl) {
      toast({
        title: "Cannot update novel",
        description:
          "This novel doesn't have a source URL saved. Only novels added after this update can be refreshed.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const updateResult = await updateNovelFromSource(novelId);
      setResult(updateResult);

      if (updateResult.success) {
        if (updateResult.newChaptersCount > 0) {
          toast({
            title: "Novel updated successfully!",
            description: `Found ${updateResult.newChaptersCount} new chapter${
              updateResult.newChaptersCount === 1 ? "" : "s"
            }.`,
          });
        } else {
          toast({
            title: "Novel is up to date",
            description: "No new chapters were found.",
          });
        }
      } else {
        toast({
          title: "Update failed",
          description: updateResult.error || "Failed to update novel",
          variant: "destructive",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        newChaptersCount: 0,
        error: "An unexpected error occurred",
      });
      toast({
        title: "Error",
        description: "An error occurred while updating the novel.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (!newOpen) {
        setResult(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div onClick={() => setOpen(true)}>{children}</div>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Update Novel
          </DialogTitle>
          <DialogDescription>
            Check for new chapters from the original source for "{novelTitle}".
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {isLoading && (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div>
                <p className="font-medium">Checking for updates...</p>
                <p className="text-sm text-muted-foreground">
                  This may take a few moments
                </p>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div className="flex flex-col items-center gap-4 text-center">
              {result.success ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    {result.newChaptersCount > 0 ? (
                      <>
                        <p className="font-medium">Update successful!</p>
                        <p className="text-sm text-muted-foreground">
                          Found {result.newChaptersCount} new chapter
                          {result.newChaptersCount === 1 ? "" : "s"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">Novel is up to date</p>
                        <p className="text-sm text-muted-foreground">
                          No new chapters were found
                        </p>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-medium">Update failed</p>
                    <p className="text-sm text-muted-foreground">
                      {result.error}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {!isLoading && !result && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                This will check the original source for any new chapters and add
                them to your library.
              </p>
              <Button
                onClick={handleUpdate}
                disabled={!hasSourceUrl}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Check for Updates
              </Button>
              {!hasSourceUrl && (
                <p className="text-xs text-muted-foreground mt-2">
                  This novel cannot be updated as it doesn't have a source URL
                  saved.
                </p>
              )}
            </div>
          )}
        </div>

        {(result || !isLoading) && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
