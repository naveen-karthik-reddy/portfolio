import { notFound } from 'next/navigation';
import { Box } from '@mui/material';
import { projectData } from '../../../data/projectData';
import { ProjectView } from '../../../views/ProjectsPage';

export async function generateStaticParams() {
  return projectData.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projectData.find((p) => p.id === slug);
  if (!project) return {};
  return {
    title: `${project.name} | Naveen Karthik`,
    description: project.excerpt,
    alternates: { canonical: `/projects/${slug}/` },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = projectData.find((p) => p.id === slug);
  if (!project) notFound();

  return (
    <Box sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '100%', width: '100%' }}>
      <ProjectView project={project} />
    </Box>
  );
}
