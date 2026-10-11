// Empty CSS placeholders until a project receives a real image path.
export function ProjectImage({ src, alt, width = 1600, height = 1200 }: { src?: string; alt: string; width?: number; height?: number }) {
  if (src) return <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
  return <div className="empty-image" role="img" aria-label={alt} style={{ aspectRatio: `${width} / ${height}` }} />
}
