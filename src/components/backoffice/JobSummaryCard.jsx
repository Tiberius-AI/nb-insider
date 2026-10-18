import { useState } from 'react'
import {
  MapPin,
  Sparkles,
  CalendarCheck,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Camera,
  Phone,
  Mail,
  Star,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react'
import { usePlatform } from '../../context/usePlatform'

const AVAILABLE_SLOTS = [
  'Today, 2:30 PM â€“ 4:00 PM',
  'Tomorrow, 9:00 AM â€“ 10:30 AM',
  'Tomorrow, 1:30 PM â€“ 3:00 PM',
]

export default function JobSummaryCard() {
  const {
    selectedThread,
    activeTenant,
    bookInspectionSlot,
    triggerJobCompletedCheckIn,
    simulateCustomerReviewReply,
  } = usePlatform()

  const [selectedSlot, setSelectedSlot] = useState(AVAILABLE_SLOTS[0])

  if (!selectedThread) return null

  const { jobSummary } = selectedThread

  return (
    <aside className="pane-right-summary">
      {/* Contact Details Header */}
      <div className="summary-contact-card">
        <div className="summary-section-eyebrow">
          <span>CONTACT & TERRITORY VERIFICATION</span>
          {selectedThread.zipVerified && (
            <span className="verified-pill">
              <CheckCircle2 size={11} /> Verified Zip
            </span>
          )}
        </div>
        <h4>{selectedThread.contactName}</h4>
        <div className="contact-detail-list">
          <div className="detail-item">
            <Phone size={13} />
            <span>{selectedThread.phone}</span>
          </div>
          <div className="detail-item">
            <Mail size={13} />
            <span>{selectedThread.email}</span>
          </div>
          <div className="detail-item">
            <MapPin size={13} style={{ color: activeTenant.brandColor }} />
            <span>{selectedThread.address}</span>
          </div>
        </div>
      </div>

      {/* Auto-Populated Live AI Job Summary Card */}
      <div className="llm-extraction-card">
        <div className="extraction-header">
          <Sparkles size={15} style={{ color: activeTenant.brandColor }} />
          <span>LIVE AI JOB SUMMARY CARD</span>
        </div>

        {/* 1. Service Needed & Urgency */}
        <div className="extraction-block">
          <span className="extraction-label">Service Needed & Urgency</span>
          <div className="extraction-service-title">
            {jobSummary.serviceNeeded}
          </div>
          <div className="urgency-badge-row">
            <AlertCircle size={13} style={{ color: activeTenant.brandColor }} />
            <span>{jobSummary.urgency}</span>
          </div>
        </div>

        {/* 2. Estimated Job Value */}
        <div className="extraction-block value-highlight-box">
          <div>
            <span className="extraction-label">Estimated Job Value</span>
            <div
              className="est-job-value"
              style={{ color: activeTenant.brandColor }}
            >
              ${jobSummary.estimatedValue.toLocaleString()}
              <span className="est-range-sub"> ({jobSummary.estimatedRange})</span>
            </div>
          </div>
          <DollarSign
            size={24}
            className="value-watermark-icon"
            style={{ color: activeTenant.brandColor }}
          />
        </div>

        {/* 3. Uploaded Customer Photos + Vision AI Pre-Analysis Summary */}
        <div className="extraction-block">
          <div className="block-label-row">
            <span className="extraction-label">
              <Camera size={12} /> Vision AI Pre-Analysis
            </span>
            <span className="photo-count-tag">
              {jobSummary.photos.length} Photo{jobSummary.photos.length === 1 ? '' : 's'}
            </span>
          </div>

          {jobSummary.photos.length > 0 && (
            <div className="summary-photos-grid">
              {jobSummary.photos.map((photo) => (
                <div key={photo.id} className="summary-photo-card">
                  <img src={photo.url} alt={photo.caption} />
                  <div className="summary-photo-tag">{photo.visionTag}</div>
                </div>
              ))}
            </div>
          )}

          <p className="vision-summary-text">{jobSummary.visionSummary}</p>
        </div>

        {/* 4. One-Click Calendar Booking */}
        <div className="extraction-block booking-block">
          <span className="extraction-label">
            <CalendarCheck size={12} /> One-Click Crew Calendar Booking
          </span>

          {jobSummary.bookedSlot ? (
            <div className="booked-slot-confirmed">
              <CheckCircle2 size={16} className="text-emerald" />
              <div>
                <div className="booked-title">Inspection Confirmed</div>
                <div className="booked-time">{jobSummary.bookedSlot}</div>
              </div>
            </div>
          ) : (
            <div className="booking-controls">
              <select
                aria-label="Select Inspection Slot"
                className="slot-select"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                {AVAILABLE_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-one-click-book"
                style={{ backgroundColor: activeTenant.brandColor }}
                onClick={() => bookInspectionSlot(selectedThread.id, selectedSlot)}
              >
                <CalendarCheck size={14} />
                <span>ðŸ“… Book Slot & Text Confirmation</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Pillar 3 TOS-Safe Review Engine Controls */}
        <div className="extraction-block review-mini-engine">
          <span className="extraction-label">
            <Star size={12} /> TOS-Safe Review Engine (Zero Star-Gating)
          </span>
          <div className="review-mini-buttons">
            <button
              type="button"
              className="btn-review-step"
              onClick={() => triggerJobCompletedCheckIn(selectedThread.id)}
            >
              1. Send â€œHow did everything go?â€ SMS
            </button>
            <div className="sentiment-sim-row">
              <button
                type="button"
                className="btn-sim-pos"
                onClick={() =>
                  simulateCustomerReviewReply(selectedThread.id, '', 'positive')
                }
                title="Simulate positive customer reply -> Routes to Google Review link"
              >
                <ThumbsUp size={12} /> Sim Positive Reply
              </button>
              <button
                type="button"
                className="btn-sim-neg"
                onClick={() =>
                  simulateCustomerReviewReply(selectedThread.id, '', 'negative')
                }
                title="Simulate negative customer reply -> Escalates to ðŸš¨ Needs Human"
              >
                <AlertTriangle size={12} /> Sim Issue Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
