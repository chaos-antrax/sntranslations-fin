"use server";

import { getDatabase } from "@/lib/mongodb";
import type {
  Novel,
  NovelScrapeResponse,
  ChapterContentResponse,
  TranslationResponse,
} from "@/lib/types";
import { revalidatePath } from "next/cache";

function extractChapterTitle(translation: string): string | null {
  // Look for chapter title patterns in the first few lines
  const lines = translation.split("\n").filter((line) => line.trim());

  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();

    // Common patterns for chapter titles
    const patterns = [
      /^Chapter\s+\d+[:\-\s](.+)$/i,
      /^第\d+章[:\-\s](.+)$/,
      /^Ch\.\s*\d+[:\-\s](.+)$/i,
      /^\d+[:\-\s](.+)$/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return line; // Return the full title line
      }
    }

    // If the line looks like a title (not too long, not starting with lowercase)
    if (line.length < 100 && line.length > 5 && /^[A-Z\d第]/.test(line)) {
      return line;
    }
  }

  return null;
}

export async function scrapeNovel(url: string): Promise<Novel | null> {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/scrape?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      throw new Error("Failed to scrape novel");
    }

    const data: NovelScrapeResponse = await response.json();

    // Save to MongoDB
    const db = await getDatabase();
    const novel: Novel = {
      ...data,
      glossary: {},
      sourceUrl: url, // Save the source URL for future updates
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("novels").insertOne(novel);

    revalidatePath("/");
    return { ...novel, _id: result.insertedId.toString() };
  } catch (error) {
    console.error("Error scraping novel:", error);
    return null;
  }
}

export async function getAllNovels(): Promise<Novel[]> {
  try {
    const db = await getDatabase();
    const novels = await db
      .collection("novels")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return novels.map((novel) => ({
      ...novel,
      _id: novel._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching novels:", error);
    return [];
  }
}

export async function getNovelById(id: string): Promise<Novel | null> {
  try {
    const db = await getDatabase();
    const { ObjectId } = require("mongodb");
    const novel = await db
      .collection("novels")
      .findOne({ _id: new ObjectId(id) });

    if (!novel) return null;

    return {
      ...novel,
      _id: novel._id.toString(),
    };
  } catch (error) {
    console.error("Error fetching novel:", error);
    return null;
  }
}

export async function getChapterContent(
  chapterUrl: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/extract?url=${encodeURIComponent(chapterUrl)}`
    );

    if (!response.ok) {
      throw new Error("Failed to extract chapter content");
    }

    const data: ChapterContentResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to extract content");
    }

    return data.content;
  } catch (error) {
    console.error("Error fetching chapter content:", error);
    return null;
  }
}

export async function translateChapter(
  novelId: string,
  chapterNumber: string,
  content: string
): Promise<string | null> {
  try {
    console.log("[v0] Starting translation for chapter:", chapterNumber);
    console.log("[v0] Content length:", content.length);

    const response = await fetch("http://127.0.0.1:8000/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: content }),
    });

    if (!response.ok) {
      throw new Error("Failed to translate chapter");
    }

    const data: TranslationResponse = await response.json();
    console.log("[v0] Translation API response:", data);
    console.log("[v0] Translation text:", data.translation);

    const translatedTitle = extractChapterTitle(data.translation);
    console.log("[v0] Extracted translated title:", translatedTitle);

    // Update the novel with translation and glossary
    const db = await getDatabase();
    const { ObjectId } = require("mongodb");

    const updateFields: any = {
      [`chapters.${Number.parseInt(chapterNumber) - 1}.translation`]:
        data.translation,
      glossary: data.glossary,
      updatedAt: new Date(),
    };

    if (translatedTitle) {
      updateFields[
        `chapters.${
          Number.parseInt(chapterNumber) - 1
        }.translated_chapter_title`
      ] = translatedTitle;
    }

    const updateResult = await db
      .collection("novels")
      .updateOne({ _id: new ObjectId(novelId) }, { $set: updateFields });

    console.log("[v0] Database update result:", updateResult);
    console.log("[v0] Saved translation:", data.translation);

    revalidatePath(`/novel/${novelId}/chapter/${chapterNumber}`);
    return data.translation;
  } catch (error) {
    console.error("Error translating chapter:", error);
    return null;
  }
}

export async function saveChapterContent(
  novelId: string,
  chapterNumber: string,
  content: string
): Promise<void> {
  try {
    const db = await getDatabase();
    const { ObjectId } = require("mongodb");

    await db.collection("novels").updateOne(
      { _id: new ObjectId(novelId) },
      {
        $set: {
          [`chapters.${Number.parseInt(chapterNumber) - 1}.content`]: content,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath(`/novel/${novelId}/chapter/${chapterNumber}`);
  } catch (error) {
    console.error("Error saving chapter content:", error);
  }
}

export async function deleteNovel(id: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const { ObjectId } = require("mongodb");

    const result = await db
      .collection("novels")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      revalidatePath("/");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting novel:", error);
    return false;
  }
}

export async function updateNovelMetadata(
  id: string,
  updates: { title?: string; author?: string }
): Promise<boolean> {
  try {
    const db = await getDatabase();
    const { ObjectId } = require("mongodb");

    const result = await db.collection("novels").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 1) {
      revalidatePath(`/novel/${id}`);
      revalidatePath("/");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating novel metadata:", error);
    return false;
  }
}

export async function getLibraryStats(): Promise<{
  totalNovels: number;
  totalChapters: number;
  translatedChapters: number;
  recentlyAdded: Novel[];
}> {
  try {
    const db = await getDatabase();
    const novels = await db.collection("novels").find({}).toArray();

    const totalNovels = novels.length;
    const totalChapters = novels.reduce(
      (sum, novel) => sum + novel.chapters.length,
      0
    );
    const translatedChapters = novels.reduce(
      (sum, novel) =>
        sum + novel.chapters.filter((ch: any) => ch.translation).length,
      0
    );

    const recentlyAdded = novels
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3)
      .map((novel) => ({
        ...novel,
        _id: novel._id.toString(),
      }));

    return {
      totalNovels,
      totalChapters,
      translatedChapters,
      recentlyAdded,
    };
  } catch (error) {
    console.error("Error fetching library stats:", error);
    return {
      totalNovels: 0,
      totalChapters: 0,
      translatedChapters: 0,
      recentlyAdded: [],
    };
  }
}

export async function retranslateChapter(
  novelId: string,
  chapterNumber: string,
  content: string
): Promise<string | null> {
  try {
    const response = await fetch("http://127.0.0.1:8000/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: content }),
    });

    if (!response.ok) {
      throw new Error("Failed to retranslate chapter");
    }

    const data: TranslationResponse = await response.json();

    const translatedTitle = extractChapterTitle(data.translation);

    // Update the novel with new translation and merge glossary
    const db = await getDatabase();
    const { ObjectId } = require("mongodb");

    // Get current novel to merge glossaries
    const currentNovel = await db
      .collection("novels")
      .findOne({ _id: new ObjectId(novelId) });
    const mergedGlossary = { ...currentNovel?.glossary, ...data.glossary };

    const updateFields: any = {
      [`chapters.${Number.parseInt(chapterNumber) - 1}.translation`]:
        data.translation,
      glossary: mergedGlossary,
      updatedAt: new Date(),
    };

    if (translatedTitle) {
      updateFields[
        `chapters.${
          Number.parseInt(chapterNumber) - 1
        }.translated_chapter_title`
      ] = translatedTitle;
    }

    const updateResult = await db
      .collection("novels")
      .updateOne({ _id: new ObjectId(novelId) }, { $set: updateFields });

    revalidatePath(`/novel/${novelId}/chapter/${chapterNumber}`);
    return data.translation;
  } catch (error) {
    console.error("Error retranslating chapter:", error);
    return null;
  }
}

export async function updateGlossaryTerm(
  novelId: string,
  chineseTerm: string,
  englishTerm: string
): Promise<boolean> {
  try {
    const db = await getDatabase();
    const { ObjectId } = require("mongodb");

    const result = await db.collection("novels").updateOne(
      { _id: new ObjectId(novelId) },
      {
        $set: {
          [`glossary.${chineseTerm}`]: englishTerm,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 1) {
      revalidatePath(`/novel/${novelId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating glossary term:", error);
    return false;
  }
}

export async function saveManualTranslation(
  novelId: string,
  chapterNumber: string,
  translation: string
): Promise<boolean> {
  try {
    const lines = translation.split("\n").filter((line) => line.trim() !== "");
    const translatedTitle = lines.length > 0 ? lines[0].trim() : "";
    const translationBody = lines.slice(1).join("\n").trim();

    const db = await getDatabase();
    const { ObjectId } = require("mongodb");

    const updateFields: any = {
      [`chapters.${Number.parseInt(chapterNumber) - 1}.translation`]:
        translationBody,
      updatedAt: new Date(),
    };

    if (translatedTitle) {
      updateFields[
        `chapters.${
          Number.parseInt(chapterNumber) - 1
        }.translated_chapter_title`
      ] = translatedTitle;
    }

    const result = await db
      .collection("novels")
      .updateOne({ _id: new ObjectId(novelId) }, { $set: updateFields });

    if (result.modifiedCount === 1) {
      revalidatePath(`/novel/${novelId}/chapter/${chapterNumber}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error saving manual translation:", error);
    return false;
  }
}

export async function deleteChapter(
  novelId: string,
  chapterNumber: string
): Promise<boolean> {
  try {
    const db = await getDatabase();
    const { ObjectId } = require("mongodb");

    // Get the current novel
    const novel = await db
      .collection("novels")
      .findOne({ _id: new ObjectId(novelId) });
    if (!novel) return false;

    // Remove the chapter from the chapters array
    const updatedChapters = novel.chapters.filter(
      (chapter: any) => chapter.chapter_number !== chapterNumber
    );

    const result = await db.collection("novels").updateOne(
      { _id: new ObjectId(novelId) },
      {
        $set: {
          chapters: updatedChapters,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 1) {
      revalidatePath(`/novel/${novelId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return false;
  }
}

export async function deleteChaptersBatch(
  novelId: string,
  chapterNumbers: string[]
): Promise<boolean> {
  try {
    const db = await getDatabase();
    const { ObjectId } = require("mongodb");

    // Get the current novel
    const novel = await db
      .collection("novels")
      .findOne({ _id: new ObjectId(novelId) });
    if (!novel) return false;

    // Remove the chapters from the chapters array
    const updatedChapters = novel.chapters.filter(
      (chapter: any) => !chapterNumbers.includes(chapter.chapter_number)
    );

    const result = await db.collection("novels").updateOne(
      { _id: new ObjectId(novelId) },
      {
        $set: {
          chapters: updatedChapters,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 1) {
      revalidatePath(`/novel/${novelId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting chapters batch:", error);
    return false;
  }
}

export async function updateNovelFromSource(novelId: string): Promise<{
  success: boolean;
  newChaptersCount: number;
  error?: string;
}> {
  try {
    const db = await getDatabase();
    const { ObjectId } = require("mongodb");

    // Get the current novel
    const novel = await db
      .collection("novels")
      .findOne({ _id: new ObjectId(novelId) });
    if (!novel || !novel.sourceUrl) {
      return {
        success: false,
        newChaptersCount: 0,
        error: "Novel not found or missing source URL",
      };
    }

    // Scrape fresh data from the source
    const response = await fetch(
      `http://127.0.0.1:8000/scrape?url=${encodeURIComponent(novel.sourceUrl)}`
    );
    if (!response.ok) {
      return {
        success: false,
        newChaptersCount: 0,
        error: "Failed to fetch updates from source",
      };
    }

    const freshData: NovelScrapeResponse = await response.json();

    // Compare chapters - find new ones
    const existingChapterNumbers = new Set(
      novel.chapters.map((ch: any) => ch.chapter_number)
    );
    const newChapters = freshData.chapters.filter(
      (ch) => !existingChapterNumbers.has(ch.chapter_number)
    );

    if (newChapters.length === 0) {
      return { success: true, newChaptersCount: 0 };
    }

    // Add new chapters to the existing novel
    const updatedChapters = [...novel.chapters, ...newChapters];

    const result = await db.collection("novels").updateOne(
      { _id: new ObjectId(novelId) },
      {
        $set: {
          chapters: updatedChapters,
          title: freshData.title, // Update title in case it changed
          author: freshData.author, // Update author in case it changed
          coverImg: freshData.coverImg, // Update cover in case it changed
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 1) {
      revalidatePath(`/novel/${novelId}`);
      revalidatePath("/");
      return { success: true, newChaptersCount: newChapters.length };
    }

    return {
      success: false,
      newChaptersCount: 0,
      error: "Failed to update database",
    };
  } catch (error) {
    console.error("Error updating novel from source:", error);
    return {
      success: false,
      newChaptersCount: 0,
      error: "An unexpected error occurred",
    };
  }
}
