import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { articlesData, getArticleBySlug } from '../../../data/articlesData';
import ArticleViewClient from '../../../components/ArticleView';

export async function generateStaticParams() {
  return articlesData.map((a) => ({ slug: a.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} | Naveen Karthik`,
    description: article.excerpt,
    alternates: { canonical: `/articles/${slug}/` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      ...(article.image && {
        images: [{ url: `/articles/images/${article.image}`, width: 1536, height: 864 }],
      }),
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  let content = article.content || '';

  if (!content) {
    const mdPath = path.join(process.cwd(), 'src', 'articles', `${article.id}.md`);
    try {
      content = fs.readFileSync(mdPath, 'utf-8');
    } catch {
      content = '';
    }
  }

  return <ArticleViewClient article={article} content={content} />;
}
