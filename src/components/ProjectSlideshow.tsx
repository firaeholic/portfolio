import { useState, useEffect } from 'react'

interface ProjectSlideshowProps {
  projectId: string
  onClose: () => void
}

const projectData = {
  'GOJO': {
    title: 'GOJO',
    images: [
      'pending_properties.png',
      'home.png',
      'property_detail.png',
      'property_location.png',
      'notification.png',
      'search.png',
      'setting.png',
      'insomnia_workspace.png'
    ]
  },
  'Movie Chief': {
    title: 'Movie Chief',
    images: [
      'Home Page.png',
      'Movie Details.png',
      'Tv Shows Page.png'
    ]
  },
  'E-Commerce': {
    title: 'E-commerce',
    images: [
      'Landing Page.png',
      'checkout page.png',
      'contact admin.png',
      'finalize order.png'
    ]
  },
  'Notes': {
    title: 'Notes',
    images: [
      'home_page.png',
      'editor_page.png',
      'setting_page.png',
      'login_page.png',
      'splash_page.png'
    ]
  },
  'Poker': {
    title: 'Poker',
    images: [
      'starting screen.png',
      'player calls.png',
      'player folded.png',
      'player raise.png',
      'result screen.png'
    ]
  },
  'Calorie Tracker': {
    title: 'Calorie Tracker',
    images: [
      'Start Page.png',
      'Search Food.png',
      'Added Items.png',
      'Exported Diet.png'
    ]
  },
  'Web Scraper': {
    title: 'Web Scraper',
    images: [
      'original data.png',
      'selection.png',
      'scraping.png',
      'finish scrape.png',
      'scraped data.png',
      'dashboard.png',
      'search.png',
      'exported.png'
    ]
  },
  'Email Filter TG Bot': {
    title: 'Email Filter TG Bot',
    images: [
      'start.jpg',
      'add email.jpg',
      'add filter.jpg',
      'change mode.jpg'
    ]
  }
}

export default function ProjectSlideshow({ projectId, onClose }: ProjectSlideshowProps) {
  const project = projectData[projectId as keyof typeof projectData]
  const images = project.images
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage()
      } else if (e.key === 'ArrowRight') {
        nextImage()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onClose])

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-5xl w-full bg-gray-900/50 backdrop-blur-sm rounded-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-black/50 rounded-full p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative aspect-video">
          <img
            src={`/projects/${projectId}/${images[currentIndex]}`}
            alt={`${project.title} - ${images[currentIndex]}`}
            className="w-full h-full object-contain bg-gray-800"
          />
        </div>

        <div className="absolute left-0 right-0 bottom-0 p-4 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
          <button
            onClick={prevImage}
            className="text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white text-sm">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            onClick={nextImage}
            className="text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}