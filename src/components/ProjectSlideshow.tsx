import { useState, useEffect } from 'react'

interface ProjectSlideshowProps {
  projectId: string
  onClose: () => void
}

const projectData = {
  gojo: {
    title: 'GOJO',
    images: [
      'pending_properties.png',
      'home.png',
      'property_detail.png',
      'add_property.png',
      'admin_chat.png',
      'billing.png',
      'notification.png',
      'search.png',
      'setting.png',
      'property_location.png',
      'gojo_account.png',
      'insomnia_workspace.png'
    ]
  },
  'movie-chief': {
    title: 'Movie Chief',
    images: [
      'Home Page.png',
      'Movie Details.png',
      'Tv Shows Page.png'
    ]
  },
  ecommerce: {
    title: 'E-commerce',
    images: [
      'Landing Page.png',
      'checkout page.png',
      'contact admin.png',
      'finalize order.png'
    ]
  },
  notes: {
    title: 'Notes',
    images: [
      'home_page.png',
      'editor_page.png',
      'setting_page.png',
      'login_page.png',
      'splash_page.png'
    ]
  },
  poker: {
    title: 'Poker',
    images: [
      'starting screen.png',
      'player calls.png',
      'player raise.png',
      'player folded.png',
      'result screen.png'
    ]
  }
}

const ProjectSlideshow = ({ projectId, onClose }: ProjectSlideshowProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const project = projectData[projectId as keyof typeof projectData]

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onClose])

  const handlePrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? project.images.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === project.images.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="fixed top-4 right-4 md:top-8 md:right-8 text-white/80 hover:text-white z-50 bg-black/50 rounded-full p-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative w-full max-w-5xl mx-auto">
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
          <img
            src={`/src/projects/${project.title}/${project.images[currentImageIndex]}`}
            alt={`${project.title} screenshot ${currentImageIndex + 1}`}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
          <button
            onClick={handlePrevious}
            className="p-2 bg-black/50 rounded-r-lg text-white/80 hover:text-white pointer-events-auto"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="p-2 bg-black/50 rounded-l-lg text-white/80 hover:text-white pointer-events-auto"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {project.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectSlideshow