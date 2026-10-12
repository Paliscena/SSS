export interface Project {
  slug: string
  legacySlug: string
  title: string
  category: string
  client: string
  videoUrl: string
  previewLoop?: boolean
  previewSrc?: string
  previewFit?: 'contain' | 'cover'
  filmSrc?: string
  films?: { title: string; src: string; poster: string; portrait?: boolean }[]
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
  category: ['Campaign', 'Film', 'Experience'][index % 3],
  client: 'Client placeholder',
  videoUrl: '',
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

// First real project supplied by the studio; remaining entries are placeholders.
Object.assign(projects[0], {
  title: 'Road Game', client: 'New Era', category: 'Campaign', year: '2026',
  videoUrl: 'https://vimeo.com/1174541944', previewLoop: true,
  image: 'https://i.vimeocdn.com/video/2158858079-b515b41bb743400592477f37d0c921a83106322d0c9446993d4389bdc3093e8b-d_295x166?region=us',
  imageAlt: 'Road Game — New Era SS26 film preview.',
  description: 'Project description to come.', note: 'Project details to come.',
})

Object.assign(projects[1], {
  title: 'Legacy Fan', client: 'New Era', category: 'Campaign', year: '2026',
  videoUrl: 'https://vimeo.com/1224665860', previewLoop: true,
  image: 'https://i.vimeocdn.com/video/2198183142-ae6f4fa913232765661cacb810a3390a1390cdab69a49919b84719192575c8dc-d_295x166?region=us',
  imageAlt: 'Legacy Fan — New Era FW26 film preview.',
  description: 'Project description to come.', note: 'Project details to come.',
})
Object.assign(projects[2], {
  title: 'EYBL & Chosen 1’s Invitational — Las Vegas Recap',
  client: 'Client details to come', category: 'Film', year: '2024',
  videoUrl: 'https://www.youtube.com/watch?v=DLFpI6Vq_9U', previewLoop: true,
  image: 'https://i.ytimg.com/vi/DLFpI6Vq_9U/hqdefault.jpg',
  imageAlt: 'EYBL and Chosen 1’s Invitational 2024 Las Vegas recap.',
  description: 'Project description to come.', note: 'Project details to come.',
})

Object.assign(projects[3], {
  title: 'The Art of Training', client: 'Nike × Beats by Dre', category: 'Film',
  videoUrl: 'https://www.youtube.com/watch?v=sKEneed_Xjo', previewLoop: true,
  image: 'https://i.ytimg.com/vi/sKEneed_Xjo/hqdefault.jpg',
  imageAlt: 'The Art of Training — Nike, Beats by Dre, LeBron James and Art Basel.',
  description: 'Project description to come.', note: 'Project details to come.',
  year: 'Year to come',
})

// Optimized silent loops derived from the studio-supplied source files.
Object.assign(projects[2], { previewSrc:'/media/eybl-preview.mp4', image:'/media/eybl-poster.jpg' })
Object.assign(projects[3], { previewSrc:'/media/art-of-training-preview.mp4', image:'/media/art-of-training-poster.jpg' })

projects[2].filmSrc = 'https://media.superstupidstudios.com/eybl-film.mp4'
projects[3].filmSrc = 'https://media.superstupidstudios.com/art-of-training-film.mp4'

Object.assign(projects[4], {
  slug:'built-different', title:'Built Different', client:'Google × NBA', category:'Campaign',
  year:'Year to come', videoUrl:'', previewLoop:true,
  previewSrc:'/media/built-different-preview.mp4',
  image:'/media/built-different-anthem-poster.jpg', imageAlt:'Google × NBA — Built Different Launch Anthem.',
  imageWidth:1280,imageHeight:720,
  note:'Google × NBA', description:'Three films for Google × NBA’s Built Different project.',
  gallery:[], credits:[],
  films:[
    {title:'Launch Anthem',src:'https://media.superstupidstudios.com/built-different-anthem.mp4',poster:'/media/built-different-anthem-poster.jpg'},
    {title:'Druski’s Declaration',src:'https://media.superstupidstudios.com/built-different-declaration.mp4',poster:'/media/built-different-declaration-poster.jpg',portrait:true},
    {title:'Druski’s Hoopstape',src:'https://media.superstupidstudios.com/built-different-hoopstape.mp4',poster:'/media/built-different-hoopstape-poster.jpg',portrait:true},
  ],
})

Object.assign(projects[5], {
  slug:'road-to-all-star', title:'Road to All-Star', client:'Google × NBA', category:'Film',
  year:'Year to come', videoUrl:'', previewLoop:true, previewFit:'contain',
  previewSrc:'/media/road-to-all-star-preview.mp4',
  image:'/media/road-to-all-star-ep-1-poster.jpg', imageAlt:'Google × NBA — Road to All-Star Episode 1.',
  imageWidth:720,imageHeight:1280,
  note:'Google × NBA', description:'A three-episode series for Google × NBA.',
  gallery:[], credits:[],
  films:[
    {title:'Episode 1',src:'https://media.superstupidstudios.com/road-to-all-star-ep-1.mp4',poster:'/media/road-to-all-star-ep-1-poster.jpg',portrait:true},
    {title:'Episode 2',src:'https://media.superstupidstudios.com/road-to-all-star-ep-2.mp4',poster:'/media/road-to-all-star-ep-2-poster.jpg',portrait:true},
    {title:'Episode 3',src:'https://media.superstupidstudios.com/road-to-all-star-ep-3.mp4',poster:'/media/road-to-all-star-ep-3-poster.jpg',portrait:true},
  ],
})


projects.push({
  slug:'arirang-world-tour', legacySlug:'project-7', title:'Arirang World Tour',
  client:'HYBE × BTS', category:'Experience', year:'Year to come',
  videoUrl:'', previewLoop:true, previewSrc:'/media/arirang-preview.mp4',
  filmSrc:'https://media.superstupidstudios.com/arirang-world-tour.mp4',
  image:'/media/arirang-poster.jpg', imageAlt:'HYBE × BTS — Arirang World Tour pop-up recap.',
  imageWidth:3840, imageHeight:2160, note:'HYBE × BTS',
  description:'Arirang World Tour pop-up recap for HYBE × BTS.', gallery:[], credits:[],
})


projects.push({
  slug:'hope-on-the-stage', legacySlug:'project-8', title:'Hope on the Stage World Tour',
  client:'HYBE × J-Hope', category:'Experience', year:'Year to come',
  videoUrl:'', previewLoop:true, previewSrc:'/media/hope-on-the-stage-preview.mp4',
  filmSrc:'https://media.superstupidstudios.com/hope-on-the-stage.mp4',
  image:'/media/hope-on-the-stage-poster.jpg', imageAlt:'HYBE × J-Hope — Hope on the Stage World Tour Los Angeles pop-up recap.',
  imageWidth:3840, imageHeight:2160, note:'HYBE × J-Hope',
  description:'Hope on the Stage World Tour Los Angeles pop-up recap for HYBE × J-Hope.', gallery:[], credits:[],
})


projects.push({
  slug:'go-dega', legacySlug:'project-9', title:'GO-DEGA', client:'HOKA × Extra Butter',
  category:'Experience', year:'Year to come', videoUrl:'', previewLoop:true,
  previewSrc:'/media/go-dega-preview.mp4', image:'/media/go-dega-spot-poster.jpg',
  imageAlt:'HOKA × Extra Butter — GO-DEGA Spot 5.', imageWidth:3840, imageHeight:2160,
  note:'HOKA × Extra Butter', description:'Three films from HOKA × Extra Butter’s GO-DEGA project.',
  gallery:[], credits:[], films:[
    {title:'Spot 5', src:'https://media.superstupidstudios.com/go-dega-spot.mp4', poster:'/media/go-dega-spot-poster.jpg'},
    {title:'Bodega Preview', src:'https://media.superstupidstudios.com/go-dega-bodega.mp4', poster:'/media/go-dega-bodega-poster.jpg'},
    {title:'Store Recap', src:'https://media.superstupidstudios.com/go-dega-store.mp4', poster:'/media/go-dega-store-poster.jpg', portrait:true},
  ],
})


projects.push({
  slug:'all-in-my-mind', legacySlug:'project-10', title:'All in My Mind', client:'Aneesa Strings',
  category:'Music Video', year:'Year to come', videoUrl:'https://vimeo.com/1142227388', previewLoop:true,
  image:'https://i.vimeocdn.com/video/2165314949-256436ae84f88ae1fe06468bbe7f449a04d1dae46a770958ff724c797c8ab8fa-d_295x166?region=us',
  imageAlt:'Aneesa Strings — All in My Mind music video.', imageWidth:1600,imageHeight:900,
  note:'Aneesa Strings',description:'All in My Mind — music video for Aneesa Strings.',gallery:[],credits:[],
})
