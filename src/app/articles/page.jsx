import { Suspense } from 'react';
import ArticlesList from '../../views/ArticlesPage';

export const metadata = {
  title: 'Articles | Naveen Karthik',
  description:
    'Performance, React, JavaScript, and web engineering articles by Naveen Karthik — deep dives on browser internals, Core Web Vitals, and frontend architecture.',
  alternates: { canonical: '/articles/' },
};

export default function ArticlesRoute() {
  return (
    <Suspense fallback={null}>
      <ArticlesList />
    </Suspense>
  );
}
