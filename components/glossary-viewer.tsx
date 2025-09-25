"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Edit2, Check, X } from "lucide-react";
import { updateGlossaryTerm } from "@/app/actions/novel-actions";
import { toast } from "@/hooks/use-toast";
import type { Novel } from "@/lib/types";

interface GlossaryViewerProps {
  novel: Novel;
}

export function GlossaryViewer({ novel }: GlossaryViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const glossary = novel.glossary || {};
  const glossaryEntries = Object.entries(glossary);

  const filteredEntries = glossaryEntries.filter(
    ([chinese, english]) =>
      chinese.toLowerCase().includes(searchTerm.toLowerCase()) ||
      english.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEditing = (chineseTerm: string, englishTerm: string) => {
    setEditingTerm(chineseTerm);
    setEditValue(englishTerm);
  };

  const cancelEditing = () => {
    setEditingTerm(null);
    setEditValue("");
  };

  const saveEdit = async (chineseTerm: string) => {
    if (!editValue.trim()) {
      toast({
        title: "Error",
        description: "English translation cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const success = await updateGlossaryTerm(
      novel._id!,
      chineseTerm,
      editValue.trim()
    );

    if (success) {
      toast({
        title: "Glossary updated!",
        description: "The term translation has been updated.",
      });
      setEditingTerm(null);
      setEditValue("");
    } else {
      toast({
        title: "Update failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (glossaryEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full gap-2 bg-transparent"
      >
        <BookOpen className="h-4 w-4" />
        Translation Glossary ({glossaryEntries.length} terms)
      </Button>

      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Translation Glossary</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEntries.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No terms found
                </p>
              ) : (
                filteredEntries.map(([chinese, english]) => (
                  <div
                    key={chinese}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="font-mono">
                        {chinese}
                      </Badge>
                      <span className="text-sm text-muted-foreground">→</span>
                      {editingTerm === chinese ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveEdit(chinese);
                              } else if (e.key === "Escape") {
                                cancelEditing();
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => saveEdit(chinese)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditing}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm flex-1">{english}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(chinese, english)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Click the edit icon to modify English translations. Press Enter
                to save or Escape to cancel.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
