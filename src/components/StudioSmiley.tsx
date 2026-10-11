// Original studio doodle: drawn inline, with no external image dependency.
export function StudioSmiley({ mood = 0 }: { mood?: number }) {
  return <svg className={`studio-smiley mood-${mood % 3}`} viewBox="0 0 100 100" aria-hidden="true">
    <path className="smiley-outline" d="M49 6C74 3 94 25 94 50S75 94 49 94 5 76 6 49 23 8 49 6Z" />
    <path className="smiley-eye left-eye" d="M33 34v12" />
    <path className="smiley-eye right-eye" d="M67 34v12" />
    <path className="smiley-mouth" d="M27 60Q48 88 74 59" />
    {mood % 3 === 2 && <path className="smiley-tongue" d="M48 72L49 81Q52 90 59 85Q64 82 63 73Z" />}
  </svg>
}
