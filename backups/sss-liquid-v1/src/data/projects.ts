export interface Project {
  slug: string
  legacySlug: string
  title: string
  category: string
  year: string
  note: string
  description: string
  image: string
  imageAlt: string
  imageWidth: number
  imageHeight: number
  gallery: { src: string; alt: string; caption: string }[]
  credits: { role: string; name: string }[]
}

// PLACEHOLDER CONTENT. Add real copy and local image paths here when ready.
// Legacy slugs preserve links from the first prototype.
const legacySlugs = ['off-form', 'tender-matter', 'common-ground', 'after-hours', 'nothing-personal', 'soft-systems']

export const projects: Project[] = legacySlugs.map((legacySlug, index) => ({
  slug: `project-${index + 1}`,
  legacySlug,
  title: `Project ${index + 1}`,
  category: 'Category / Category',
  year: '20XX',
  note: 'Lorem ipsum dolor sit amet.',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  image: '',
  imageAlt: `Project ${index + 1}: empty grey image placeholder.`,
  imageWidth: 1600,
  imageHeight: 1200,
  gallery: [
    { src: '', alt: 'Empty grey image placeholder.', caption: '02 / Image placeholder' },
    { src: '', alt: 'Empty grey image placeholder.', caption: '03 / Image placeholder' },
  ],
  credits: [{ role: 'Role', name: 'Name placeholder' }, { role: 'Role', name: 'Name placeholder' }, { role: 'Status', name: 'Placeholder project' }],
}))
