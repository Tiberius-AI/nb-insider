import { useRef, useState } from 'react'
import {
  Camera,
  Send,
  Phone,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  X,
  ArrowUpRight,
  MapPin,
} from 'lucide-react'
import { usePlatform } from '../../context/usePlatform'

export default function ContextualAIDock() {
  const {
    activeTenant,
    submitHeroLead,
    samplePhotos,
    setActiveView,
  } = usePlatform()

  const [question, setQuestion] = useState('')
  const [phone, setPhone] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [showSamplePicker, setShowSamplePicker] = useState(false)
  const [handshakeSuccess, setHandshakeSuccess] = useState(false)

  const fileInputRef = useRef(null)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const primarySvc = activeTenant.pricingRules.services[0]
      setSelectedPhoto({
        id: `upload-${Date.now()}`,
        label: file.name,
        serviceMatch: primarySvc.name,
        estimatedRange: primarySvc.range,
        estimatedValue: primarySvc.avgValue,
        urgency: primarySvc.urgency,
        visionSummary: `Vision AI analyzed "${file.name}": matched ${primarySvc.name} (${primarySvc.range} in ${activeTenant.city}).`,
        url: reader.result,
      })
      setShowSamplePicker(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    submitHeroLead({
      question,
      photo: selectedPhoto,
      phone: phone || '(512) 639-1842',
      customerName: 'Alex Mercer',
      zipCode: zipCode || '78704',
    })
    setHandshakeSuccess(true)
  }

  const quickPrompts = activeTenant.pricingRules.services.slice(0, 3).map((s) => ({
    label: s.name.split(' ').slice(0, 3).join(' '),
    prompt: `Need a ballpark quote for ${s.name.toLowerCase()} in ${activeTenant.city}.`,
  }))

  return (
    <div className="contextual-ai-dock-wrapper">
      {/* Sample Photo & Vision AI Preview Popover */}
      {(showSamplePicker || selectedPhoto) && (
        <div className="dock-popover glass-panel">
          {selectedPhoto ? (
            <div className="selected-photo-preview">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.label}
                className="dock-thumb"
              />
              <div className="dock-photo-meta">
                <div className="dock-photo-badge">
                  <Sparkles size={12} />
                  <span>VISION AI PRE-SCAN READY</span>
                </div>
                <div className="dock-photo-title">{selectedPhoto.label}</div>
                <div className="dock-photo-sub">
                  Est. Local Range:{' '}
                  <strong style={{ color: activeTenant.brandColor }}>
                    {selectedPhoto.estimatedRange}
                  </strong>{' '}
                  â€¢ {selectedPhoto.urgency}
                </div>
              </div>
              <button
                type="button"
                className="dock-photo-remove"
                onClick={() => setSelectedPhoto(null)}
                title="Remove photo"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className="sample-picker-body">
              <div className="sample-picker-header">
                <span>
                  <Camera size={14} /> Upload a photo from your device or test with a sample Vision AI inspection frame:
                </span>
                <button
                  type="button"
                  className="icon-close-btn"
                  onClick={() => setShowSamplePicker(false)}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="sample-picker-grid">
                <button
                  type="button"
                  className="sample-upload-device-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={16} />
                  <span>Choose Image File...</span>
                </button>
                {samplePhotos.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    className="sample-photo-chip"
                    onClick={() => {
                      setSelectedPhoto(sample)
                      setShowSamplePicker(false)
                    }}
                  >
                    <img src={sample.url} alt={sample.label} />
                    <div>
                      <div className="chip-title">{sample.label}</div>
                      <div className="chip-range">{sample.estimatedRange}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Fixed Glassmorphic Contextual AI Dock */}
      <form className="contextual-ai-dock glass-panel" onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        <div className="dock-top-strip">
          <div className="dock-status-indicator">
            <span
              className="pulse-dot"
              style={{ backgroundColor: activeTenant.brandColor }}
            />
            <span>
              <strong>{activeTenant.companyName} AI + Field Dispatch</strong> â€¢ Instant{' '}
              {activeTenant.city} Price & Vision Analysis
            </span>
          </div>

          <div className="dock-quick-chips">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                className="dock-chip"
                onClick={() => setQuestion(qp.prompt)}
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="dock-main-controls">
          {/* 1. Project Question Input */}
          <div className="dock-input-group question-group">
            <Sparkles
              size={16}
              className="dock-field-icon"
              style={{ color: activeTenant.brandColor }}
            />
            <input
              type="text"
              className="dock-text-input"
              placeholder={`Ask a ${activeTenant.niche.toLowerCase()} question or describe damage...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          {/* 2. Snap / Upload Photo Button */}
          <button
            type="button"
            className={`dock-photo-btn ${selectedPhoto ? 'has-photo' : ''}`}
            onClick={() => setShowSamplePicker((prev) => !prev)}
            style={
              selectedPhoto
                ? { borderColor: activeTenant.brandColor }
                : undefined
            }
          >
            <Camera size={16} />
            <span>
              {selectedPhoto ? 'ðŸ“· Photo Attached' : 'ðŸ“· Snap / Upload Photo'}
            </span>
          </button>

          {/* Optional Zip Input */}
          <div className="dock-input-group zip-group">
            <MapPin size={14} className="dock-field-icon" />
            <input
              type="text"
              className="dock-text-input"
              placeholder="Zip (78704)"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={10}
            />
          </div>

          {/* 3. Mobile Number Input for Instant SMS Handshake */}
          <div className="dock-input-group phone-group">
            <Phone size={15} className="dock-field-icon" />
            <input
              type="tel"
              className="dock-text-input"
              placeholder="Mobile # for instant SMS quote"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Submit Handshake CTA */}
          <button
            type="submit"
            className="dock-submit-btn"
            style={{ backgroundColor: activeTenant.brandColor }}
          >
            <Send size={15} />
            <span>Instant SMS Quote</span>
          </button>
        </div>

        {handshakeSuccess && (
          <div className="dock-Confirmation-bar">
            <div className="dock-confirm-left">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>
                <strong>SMS Handshake Sent!</strong> Vision AI pre-analysis & quote thread created in the Back-Office.
              </span>
            </div>
            <button
              type="button"
              className="dock-jump-btn"
              onClick={() => setActiveView('backoffice')}
            >
              <span>Open Live Thread in 3-Pane Room</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
