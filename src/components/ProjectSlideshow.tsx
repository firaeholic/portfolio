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
      'start.png',
      'add email.png',
      'add filter.png',
      'change mode.png'
    ]
  },
  'StoreSphere': {
    title: 'StoreSphere',
    images: [
      'landing.png',
      'home page.png',
      'stores view.png',
      'store dashboard.png',
      'admin dashboard main.png',
      'admin dashboard user.png',
      'payment.png'
    ]
  },
  'LegalLens': {
    title: 'LegalLens',
    images: [
      'home.png',
      'home 2.png',
      'in progress.png',
      'analysis.png',
      'summary.png',
      'visual.png',
      'visual 2.png'
    ]
  }
}

export default function ProjectSlideshow({ projectId, onClose }: ProjectSlideshowProps) {
  const project = projectData[projectId as keyof typeof projectData]
  const images = project.images
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set([0]))
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [loadingTimeout, setLoadingTimeout] = useState<number | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    }
  }, [loadingTimeout])

  // Preload adjacent images
  useEffect(() => {
    const preloadImage = (index: number) => {
      if (index >= 0 && index < images.length && !preloadedImages.has(index) && !imageErrors.has(index)) {
        const img = new Image()
        img.onload = () => {
          setPreloadedImages(prev => new Set([...prev, index]))
        }
        img.onerror = () => {
          setImageErrors(prev => new Set([...prev, index]))
        }
        img.src = `/projects/${projectId}/${images[index]}`
      }
    }

    // Preload current, next, and previous images
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    
    preloadImage(currentIndex)
    preloadImage(prevIndex)
    preloadImage(nextIndex)
  }, [currentIndex, images, projectId, preloadedImages, imageErrors])

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

  const clearLoadingTimeout = () => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      setLoadingTimeout(null)
    }
  }

  const prevImage = () => {
    clearLoadingTimeout()
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    if (!preloadedImages.has(newIndex) && !imageErrors.has(newIndex)) {
      setIsLoading(true)
      // Set timeout to prevent infinite loading (10 seconds)
      const timeout = setTimeout(() => {
        setIsLoading(false)
        setImageErrors(prev => new Set([...prev, newIndex]))
      }, 10000)
      setLoadingTimeout(timeout)
    }
    setCurrentIndex(newIndex)
  }

  const nextImage = () => {
    clearLoadingTimeout()
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    if (!preloadedImages.has(newIndex) && !imageErrors.has(newIndex)) {
      setIsLoading(true)
      // Set timeout to prevent infinite loading (10 seconds)
      const timeout = setTimeout(() => {
        setIsLoading(false)
        setImageErrors(prev => new Set([...prev, newIndex]))
      }, 10000)
      setLoadingTimeout(timeout)
    }
    setCurrentIndex(newIndex)
  }

  const handleImageLoad = () => {
    clearLoadingTimeout()
    setIsLoading(false)
    setPreloadedImages(prev => new Set([...prev, currentIndex]))
  }

  const handleImageError = () => {
    clearLoadingTimeout()
    setIsLoading(false)
    setImageErrors(prev => new Set([...prev, currentIndex]))
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
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
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          {imageErrors.has(currentIndex) ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
              <div className="text-center p-4">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>Failed to load image</p>
              </div>
            </div>
          ) : (
            <img
              src={`/projects/${projectId}/${images[currentIndex]}`}
              alt={`${project.title} - ${images[currentIndex]}`}
              className="w-full h-full object-contain bg-gray-800"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}
        </div>

        <div className="absolute left-0 right-0 bottom-0 p-4 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
          <button
            onClick={prevImage}
            disabled={isLoading}
            className="text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={isLoading}
            className="text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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