import { ProjectsList } from '../../views/ProjectsPage';

export const metadata = {
  title: 'Projects | Naveen Karthik',
  description:
    'A portfolio of frontend and full-stack projects by Naveen Karthik — including React dashboards, performance tools, and web applications.',
  alternates: { canonical: '/projects/' },
};

export default function ProjectsRoute() {
  return <ProjectsList />;
}
