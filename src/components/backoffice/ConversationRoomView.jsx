import { X, Sparkles } from 'lucide-react'
import { usePlatform } from '../../context/usePlatform'
import ThreadQueue from './ThreadQueue'
import UnifiedTimeline from './UnifiedTimeline'
import JobSummaryCard from './JobSummaryCard'

export default function ConversationRoomView() {
  const { lightboxPhoto, setLightboxPhoto, activeTenant } = usePlatform()

  return (
    <section
      className="conversation-room-3pane"
      aria-label="3-Pane Unified Conversation Room"
    >
      {/* Left Pane (25%): Thread Queue */}
      <ThreadQueue />

      {/* Center Pane (50%): Unified Timeline */}
      <UnifiedTimeline />

      {/* Right Pane (25%): Live AI Job Summary Card */}
      <JobSummaryCard />

      {/* Tiberius Enlargeable Conversation Photo Lightbox (from conversation-photos.mjs) */}
      {lightboxPhoto && (
        <div
          className="tiberius-lightbox-backdrop"
          onClick={() => setLightboxPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged customer photo"
        >
          <div
            className="tiberius-lightbox-modal glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <div className="lightbox-title">
                <Sparkles size={15} style={{ color: activeTenant.brandColor }} />
                <strong>{lightboxPhoto.caption}</strong>
              </div>
              <button
                type="button"
                className="helper-close-btn"
                onClick={() => setLightboxPhoto(null)}
                aria-label="Close photo viewer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="lightbox-img-wrap">
              <img src={lightboxPhoto.url} alt={lightboxPhoto.caption} />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
