import { supabase } from "../../../lib/supabaseClient";
import { Article } from "../../../store/types";
import { mapDbProfileToProfile } from "../../../lib/repositoryService";
import { getArticleImage } from "../../../utils/imageHelper";

export interface IArticleRepository {
  getArticles(): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  saveArticle(article: Article): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
}

export class SupabaseArticleRepository implements IArticleRepository {
  async getArticles(): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*, author:author_id(*), category:category_id(*)');
    
    if (error) {
      console.error("Error fetching articles from Supabase", error);
      return [];
    }
    
    // Map DB schema to Article type if needed
    return data.map(this.mapDbToArticle);
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*, author:author_id(*), category:category_id(*)')
      .eq('slug', slug)
      .single();
    
    if (error || !data) return null;
    return this.mapDbToArticle(data);
  }

  async saveArticle(article: Article): Promise<Article> {
    const dbPayload = this.mapArticleToDb(article);
    const { data, error } = await supabase
      .from('articles')
      .upsert(dbPayload, { onConflict: 'id' })
      .select('*, author:author_id(*), category:category_id(*)')
      .single();
      
    if (error) throw error;
    return this.mapDbToArticle(data);
  }

  async deleteArticle(id: string): Promise<void> {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw error;
  }

  // Maps DB Row to Frontend Type
  private mapDbToArticle(row: any): Article {
    return {
      id: row.id,
      title: row.title,
      englishTitle: row.english_title || "",
      slug: row.slug,
      summary: row.summary || "",
      content: row.content || "",
      category: row.category?.name || "Uncategorized",
      authorId: row.author_id,
      authorName: row.author?.name || "Unknown",
      authorAvatar: row.author?.avatar_url || "",
      author: row.author?.name || "Unknown",
      authorProfile: row.author ? mapDbProfileToProfile(row.author) : undefined,
      authorRole: row.author?.role || "Author",
      date: row.created_at, // mapped to UI date
      status: row.status as any,
      featured: row.featured,
      coverImage: getArticleImage(row.cover_image || row.coverImage),
      cover_image: getArticleImage(row.cover_image || row.coverImage),
      views: row.views,
      likes: row.likes,
      readTime: row.read_time,
      tags: row.tags || [],
      versions: [], // Needs article_versions join
      language: row.language_code === 'en' ? 'English' : 'Hindi'
    };
  }

  // Maps Frontend Type to DB Row
  private mapArticleToDb(article: Article): any {
    return {
      id: article.id,
      title: article.title,
      english_title: article.englishTitle,
      slug: article.slug,
      summary: article.summary,
      content: article.content,
      // Note: category_id needs resolution from Category name to ID in a real app
      author_id: article.authorId,
      cover_image: article.cover_image || article.coverImage || null,
      featured: article.featured,
      status: article.status,
      views: article.views,
      likes: article.likes,
      read_time: article.readTime,
      tags: article.tags || [],
      language_code: article.language === 'English' ? 'en' : 'hi'
    };
  }
}
