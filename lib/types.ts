export interface Chapter {
  chapter_number: string;
  chapter_name: string;
  url: string;
  content?: string;
  translation?: string;
  translated_chapter_title?: string;
}

export interface Novel {
  _id?: string;
  title: string;
  author: string;
  coverImg: string;
  chapters: Chapter[];
  glossary?: Record<string, string>;
  sourceUrl?: string; // Added source URL field for update functionality
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NovelScrapeResponse {
  title: string;
  author: string;
  coverImg: string;
  chapters: Chapter[];
}

export interface ChapterContentResponse {
  success: boolean;
  content: string;
}

export interface TranslationResponse {
  translation: string;
  new_terms: Record<string, string>;
  glossary: Record<string, string>;
}
