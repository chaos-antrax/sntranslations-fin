"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, RotateCcw, Copy, FileText, Check } from "lucide-react";
import {
  translateChapter,
  retranslateChapter,
  saveManualTranslation,
} from "@/app/actions/novel-actions";
import { toast } from "@/hooks/use-toast";
import type { Chapter } from "@/lib/types";

interface TranslationToggleProps {
  novelId: string;
  chapter: Chapter;
  originalContent: string;
  existingTranslation?: string;
}

export function TranslationToggle({
  novelId,
  chapter,
  originalContent,
  existingTranslation,
}: TranslationToggleProps) {
  const [showTranslation, setShowTranslation] = useState(true);
  const [translation, setTranslation] = useState(existingTranslation || "");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRetranslating, setIsRetranslating] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [manualTranslation, setManualTranslation] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);

  const handleCopyToClipboard = async () => {
    const formattedText = `Translate the following chapter to english......${originalContent}*......`;

    try {
      await navigator.clipboard.writeText(formattedText);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        description:
          "Chapter text has been formatted and copied for translation.",
      });

      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveManualTranslation = async () => {
    if (!manualTranslation.trim()) {
      toast({
        title: "Empty translation",
        description: "Please enter a translation before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingManual(true);
    try {
      const success = await saveManualTranslation(
        novelId,
        chapter.chapter_number,
        manualTranslation.trim()
      );

      if (success) {
        setTranslation(manualTranslation.trim());
        setShowTranslation(true);
        setIsManualDialogOpen(false);
        setManualTranslation("");
        toast({
          title: "Translation saved!",
          description: "Your manual translation has been saved successfully.",
        });
      } else {
        toast({
          title: "Save failed",
          description: "Unable to save the translation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving manual translation:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving the translation.",
        variant: "destructive",
      });
    } finally {
      setIsSavingManual(false);
    }
  };

  const handleTranslate = async () => {
    if (translation) {
      setShowTranslation(true);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateChapter(
        novelId,
        chapter.chapter_number,
        originalContent
      );

      if (result) {
        setTranslation(result);
        setShowTranslation(true);
        toast({
          title: "Translation completed!",
          description: "The chapter has been translated and saved.",
        });
      } else {
        toast({
          title: "Translation failed",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Error",
        description: "An error occurred during translation.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRetranslate = async () => {
    setIsRetranslating(true);
    try {
      const result = await retranslateChapter(
        novelId,
        chapter.chapter_number,
        originalContent
      );

      if (result) {
        setTranslation(result);
        toast({
          title: "Retranslation completed!",
          description:
            "The chapter has been retranslated with updated content.",
        });
      } else {
        toast({
          title: "Retranslation failed",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Retranslation error:", error);
      toast({
        title: "Error",
        description: "An error occurred during retranslation.",
        variant: "destructive",
      });
    } finally {
      setIsRetranslating(false);
    }
  };

  const toggleView = () => {
    if (showTranslation) {
      setShowTranslation(false);
    } else if (translation) {
      setShowTranslation(true);
    } else {
      handleTranslate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Display */}
      <div className="reading-content prose prose-lg text-[16px] xl:text-[18px] max-w-none">
        {showTranslation && translation ? (
          <div className="space-y-4">
            {/* <p className="text-xs text-muted-foreground mb-4">
              English Translation:
            </p> */}
            {translation.split("\n").map((paragraph, index) => (
              <p key={index} className="text-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
            <div className="pt-6 border-t border-border">
              <Button
                onClick={handleRetranslate}
                disabled={isRetranslating}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                {isRetranslating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                {isRetranslating ? "Retranslating..." : "Retranslate"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Generate a new translation for this chapter
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-end mb-4">
              {/* <p className="text-xs hidden xl:block text-muted-foreground">
                Original Chinese
              </p> */}
              <div className="flex gap-2 flex-row">
                <Button
                  onClick={handleCopyToClipboard}
                  variant="outline"
                  size="sm"
                  className="hidden xl:flex gap-2 bg-transparent"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {isCopied ? "Copied!" : "Copy Text"}
                </Button>
                <Dialog
                  open={isManualDialogOpen}
                  onOpenChange={setIsManualDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      <FileText className="h-4 w-4" />
                      Manual Translation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Manual Translation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Paste your own translation for Chapter{" "}
                        {chapter.chapter_number}: {chapter.chapter_name}
                      </p>
                      <Textarea
                        placeholder="Paste your English translation here..."
                        value={manualTranslation}
                        onChange={(e) => setManualTranslation(e.target.value)}
                        className="max-h-[600px] resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsManualDialogOpen(false);
                            setManualTranslation("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveManualTranslation}
                          disabled={isSavingManual || !manualTranslation.trim()}
                        >
                          {isSavingManual ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            "Save Translation"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={handleCopyToClipboard}
                  variant="outline"
                  size="sm"
                  className="xl:hidden max-w-fit gap-2 bg-transparent"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {isCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
            {originalContent.split("\n").map((paragraph, index) => (
              <p key={index} className="text-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Floating Translation Toggle */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={toggleView}
          disabled={isTranslating}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isTranslating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : showTranslation ? (
            <span className="font-bold text-lg">原</span>
          ) : translation ? (
            <span className="font-bold text-lg">译</span>
          ) : (
            <span className="font-bold text-lg">T</span>
          )}
        </Button>
      </div>

      {/* Translation Options for First Time */}
      {!translation && !isTranslating && (
        <div className="text-center pt-8 border-t border-border space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleTranslate}
              variant="outline"
              className="gap-2 bg-transparent"
            >
              AI Translate This Chapter
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Choose how you want to translate this chapter
          </p>
        </div>
      )}
    </div>
  );
}
