import { useRef, useState } from 'react'
import {
  X,
  MessageSquare,
  FileText,
  Calendar,
  Phone,
  Sparkles,
  Camera,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react'
import { usePlatform } from '../../context/usePlatform'
import { optimizeUploadedPhotos } from '../../utils/photoOptimizer'

export default function TiberiusHelperModal() {
  const {
    activeTenant,
    helperModal,
    closeHelperModal,
    openHelperModal,
    submitHeroLead,
    samplePhotos,
    setActiveView,
  } = usePlatform()

  const [chatLog, setChatLog] = useState([
    {
      role: 'assistant',
      text: `Hi, I’m Alfred—your ${activeTenant.companyName} assistant in ${activeTenant.city}. Have a question, a leak, or a project in mind? Tell me what’s going on or attach up to 3 photos.`,
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatPhotos, setChatPhotos] = useState([])
  const [chatStatus, setChatStatus] = useState('')

  // 3-Step Quote Wizard State (from Tiberius widget.mjs)
  const [quoteStep, setQuoteStep] = useState(0) // 0 | 1 | 2 | 3 (submitted review)
  const [quoteService, setQuoteService] = useState(
    helperModal.preselectedService ||
      activeTenant.pricingRules.services[0]?.name ||
      'Roof Leak & Flashing Repair'
  )
  const [quoteDescription, setQuoteDescription] = useState('')
  const [quoteUrgency, setQuoteUrgency] = useState('Water is coming in now')
  const [quoteZip, setQuoteZip] = useState('03106')
  const [quoteAddress, setQuoteAddress] = useState('146 Londonderry Tpke')
  const [quotePropertyType, setQuotePropertyType] = useState('Single-family home')
  const [quoteRoofAge, setQuoteRoofAge] = useState('10–20 years')
  const [quotePhotos, setQuotePhotos] = useState([])
  const [quoteName, setQuoteName] = useState('Alex Mercer')
  const [quotePhone, setQuotePhone] = useState('(603) 555-0194')
  const [quoteEmail, setQuoteEmail] = useState('alex.mercer@nhhome.io')
  const [quoteWindow, setQuoteWindow] = useState('Afternoon')
  const [quoteConsent, setQuoteConsent] = useState(true)
  const [quoteError, setQuoteError] = useState('')
  const [submittedSummary, setSubmittedSummary] = useState(null)

  const chatPhotoInputRef = useRef(null)
  const quotePhotoInputRef = useRef(null)

  if (!helperModal.open) return null

  const currentMode = helperModal.mode || 'chat'

  const handleChatPhotoChange = async (e) => {
    try {
      setChatStatus('Optimizing photos (max 1280px JPEG via createImageBitmap)...')
      const files = await optimizeUploadedPhotos(e.target.files, 3)
      const mapped = files.map((f, idx) => ({
        id: `chat-p-${Date.now()}-${idx}`,
        label: f.name,
        url: f.dataUrl,
        estimatedRange: activeTenant.pricingRules.services[0]?.range || '$450 – $950',
      }))
      setChatPhotos(mapped)
      setChatStatus(`${mapped.length} photo(s) optimized & ready for Vision AI scan.`)
    } catch (err) {
      setChatStatus(err.message || 'Could not process photo')
    }
  }

  const handleQuotePhotoChange = async (e) => {
    try {
      setQuoteError('')
      const files = await optimizeUploadedPhotos(e.target.files, 3)
      const mapped = files.map((f, idx) => ({
        id: `quote-p-${Date.now()}-${idx}`,
        label: f.name,
        url: f.dataUrl,
      }))
      setQuotePhotos(mapped)
    } catch (err) {
      setQuoteError(err.message || 'Could not process photo')
    }
  }

  const handleChatSubmit = (e) => {
    e.preventDefault()
    if (!chatInput.trim() && chatPhotos.length === 0) return

    const userText =
      chatInput.trim() || `Uploaded ${chatPhotos.length} project photo(s) for inspection.`
    const primarySvc = activeTenant.pricingRules.services[0]

    const reply = `Thanks! Based on ${activeTenant.companyName}'s ${
      activeTenant.city
    } guidelines, ${primarySvc.name} typically ranges ${
      primarySvc.range
    }. I have logged this conversation${
      chatPhotos.length ? ` and your ${chatPhotos.length} photo(s)` : ''
    } into our 3-Pane Back-Office so our estimator can follow up right away.`

    setChatLog((prev) => [
      ...prev,
      { role: 'user', text: userText, photos: chatPhotos },
      { role: 'assistant', text: reply },
    ])

    submitHeroLead({
      question: userText,
      photos: chatPhotos,
      phone: '(603) 555-0199',
      customerName: 'Homeowner Chat Lead',
      zipCode: '03106',
      serviceName: primarySvc.name,
      sourceLabel: 'Roof Helper Chat',
    })

    setChatInput('')
    setChatPhotos([])
    setChatStatus('Synced live thread to 3-Pane Back-Office!')
  }

  const handleQuoteStepSubmit = (e) => {
    e.preventDefault()
    setQuoteError('')

    if (quoteStep === 0) {
      if (quoteDescription.trim().length < 3) {
        setQuoteError('Tell us a little about what you noticed (at least 3 characters).')
        return
      }
      setQuoteStep(1)
      return
    }

    if (quoteStep === 1) {
      if (!/^[0-9]{5}$/.test(quoteZip.trim())) {
        setQuoteError('Enter a valid 5-digit ZIP code (e.g., 03106 or 78704).')
        return
      }
      setQuoteStep(2)
      return
    }

    if (quoteStep === 2) {
      if (!quoteName.trim()) {
        setQuoteError('Please enter your name.')
        return
      }
      if (!quoteConsent) {
        setQuoteError('Please agree to follow-up about this inquiry.')
        return
      }

      const matchedSvc =
        activeTenant.pricingRules.services.find((s) => s.name === quoteService) ||
        activeTenant.pricingRules.services[0]

      submitHeroLead({
        question: quoteDescription,
        photos: quotePhotos,
        phone: quotePhone,
        customerName: quoteName,
        email: quoteEmail,
        zipCode: quoteZip,
        address: quoteAddress,
        serviceName: matchedSvc.name,
        urgency: quoteUrgency,
        propertyType: quotePropertyType,
        roofAge: quoteRoofAge,
        preferredWindow: quoteWindow,
        sourceLabel: '3-Step Guided Quote Wizard',
      })

      setSubmittedSummary({
        service: matchedSvc.name,
        range: matchedSvc.range,
        urgency: quoteUrgency,
        zip: quoteZip,
        address: quoteAddress,
        propertyType: quotePropertyType,
        roofAge: quoteRoofAge,
        name: quoteName,
        contact: `${quotePhone} • ${quoteEmail}`,
        window: quoteWindow,
        photoCount: quotePhotos.length,
      })
      setQuoteStep(3)
    }
  }

  return (
    <div className="tiberius-modal-backdrop" onClick={closeHelperModal}>
      <div
        className="tiberius-helper-dialog glass-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tiberius-helper-title"
      >
        {/* Dialog Header */}
        <header className="tiberius-helper-header">
          <div className="helper-header-left">
            <img
              src={
                activeTenant.media?.helperAvatar ||
                '/assets/roofing/helper-v1/avatar.webp'
              }
              alt="Alfred Roof Assistant"
              className="helper-avatar-img"
            />
            <div>
              <h2 id="tiberius-helper-title">
                Alfred · {activeTenant.companyName} Assistant
              </h2>
              <p>
                Live AI Qualification, Up-to-3 Photo Pre-Scan & Instant Back-Office Sync
              </p>
            </div>
          </div>
          <button
            type="button"
            className="helper-close-btn"
            onClick={closeHelperModal}
            aria-label="Close assistant"
          >
            <X size={18} />
          </button>
        </header>

        {/* 4-Mode Navigation Tabs (Recreated from Tiberius widget.mjs) */}
        <nav className="tiberius-helper-modes" aria-label="Choose how to get help">
          <button
            type="button"
            className={`mode-tab ${currentMode === 'chat' ? 'active' : ''}`}
            onClick={() => openHelperModal('chat', quoteService)}
          >
            <MessageSquare size={14} />
            <span>Ask a question</span>
          </button>
          <button
            type="button"
            className={`mode-tab ${currentMode === 'quote' ? 'active' : ''}`}
            onClick={() => {
              setQuoteStep(0)
              setSubmittedSummary(null)
              openHelperModal('quote', quoteService)
            }}
          >
            <FileText size={14} />
            <span>Get a quote (3-Step)</span>
          </button>
          <button
            type="button"
            className={`mode-tab ${currentMode === 'booking' ? 'active' : ''}`}
            onClick={() => openHelperModal('booking', quoteService)}
          >
            <Calendar size={14} />
            <span>Book inspection</span>
          </button>
          <button
            type="button"
            className={`mode-tab ${currentMode === 'text' ? 'active' : ''}`}
            onClick={() => openHelperModal('text', quoteService)}
          >
            <Phone size={14} />
            <span>Text us</span>
          </button>
        </nav>

        {/* Modal Body */}
        <div className="tiberius-helper-body">
          {/* PANEL 1: ASK A QUESTION (AI CHAT + PHOTO PRE-SCAN) */}
          {currentMode === 'chat' && (
            <div className="helper-panel-chat">
              <div className="helper-chat-log">
                {chatLog.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`helper-chat-bubble ${
                      entry.role === 'user' ? 'user-bubble' : 'assistant-bubble'
                    }`}
                  >
                    <p>{entry.text}</p>
                    {entry.photos?.length > 0 && (
                      <div className="bubble-photo-strip">
                        {entry.photos.map((p) => (
                          <img key={p.id} src={p.url} alt={p.label} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Service Quick Chips */}
              <div className="helper-service-chips">
                {activeTenant.pricingRules.services.slice(0, 4).map((svc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="helper-chip"
                    onClick={() =>
                      setChatInput(
                        `We have a question about ${svc.name.toLowerCase()} in ${
                          activeTenant.city
                        } (${svc.range}).`
                      )
                    }
                  >
                    {svc.name}
                  </button>
                ))}
              </div>

              {/* Photo Attachment Toolbar */}
              <div className="helper-photo-bar">
                <input
                  ref={chatPhotoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleChatPhotoChange}
                />
                <button
                  type="button"
                  className="btn-xs-outline"
                  onClick={() => chatPhotoInputRef.current?.click()}
                >
                  <Camera size={13} /> ＋ Add up to 3 photos
                </button>
                <button
                  type="button"
                  className="btn-xs-outline"
                  onClick={() => {
                    setChatPhotos([samplePhotos[0]])
                    setChatStatus('Attached sample chimney step-flashing photo.')
                  }}
                >
                  <Sparkles size={13} /> Use Sample Roof Photo
                </button>
                {chatStatus && <span className="helper-status-note">{chatStatus}</span>}
              </div>

              {chatPhotos.length > 0 && (
                <div className="helper-photo-previews">
                  {chatPhotos.map((p) => (
                    <div key={p.id} className="preview-chip">
                      <img src={p.url} alt={p.label} />
                      <span>{p.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <form className="helper-chat-form" onSubmit={handleChatSubmit}>
                <textarea
                  rows={2}
                  placeholder="Tell us what’s happening, or add a photo..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-helper-send"
                  style={{ backgroundColor: activeTenant.brandColor }}
                >
                  <span>Send</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            </div>
          )}

          {/* PANEL 2: 3-STEP GUIDED QUOTE WIZARD (Recreated from widget.mjs) */}
          {currentMode === 'quote' && (
            <div className="helper-panel-quote">
              {quoteStep < 3 ? (
                <form onSubmit={handleQuoteStepSubmit} className="guided-quote-form">
                  <div className="quote-step-indicator">
                    <span style={{ color: activeTenant.brandColor }}>
                      Step {quoteStep + 1} of 3 ·{' '}
                      {quoteStep === 0
                        ? 'Your project'
                        : quoteStep === 1
                        ? 'The property & photos'
                        : 'How to follow up'}
                    </span>
                    <div className="step-dots">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className={`step-dot ${d <= quoteStep ? 'active' : ''}`}
                          style={
                            d <= quoteStep
                              ? { backgroundColor: activeTenant.brandColor }
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {quoteStep === 0 && (
                    <div className="quote-fieldset">
                      <h3>Let’s start with your roof or exterior project.</h3>
                      <label className="quote-field">
                        <span>What can we help with?</span>
                        <select
                          value={quoteService}
                          onChange={(e) => setQuoteService(e.target.value)}
                        >
                          {activeTenant.pricingRules.services.map((svc, idx) => (
                            <option key={idx} value={svc.name}>
                              {svc.name} ({svc.range})
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="quote-field">
                        <span>What have you noticed?</span>
                        <textarea
                          rows={3}
                          placeholder="A leak over the kitchen after rain, lifted flashing by the chimney, or an aging roof you are planning to replace..."
                          value={quoteDescription}
                          onChange={(e) => setQuoteDescription(e.target.value)}
                        />
                      </label>

                      <label className="quote-field">
                        <span>How urgent is it?</span>
                        <select
                          value={quoteUrgency}
                          onChange={(e) => setQuoteUrgency(e.target.value)}
                        >
                          <option value="Water is coming in now (Urgent)">
                            Water is coming in now (Urgent)
                          </option>
                          <option value="Planning ahead / no active leak">
                            Planning ahead / no active leak
                          </option>
                          <option value="Needs inspection review">
                            I’m not sure — needs a closer look
                          </option>
                        </select>
                      </label>
                    </div>
                  )}

                  {quoteStep === 1 && (
                    <div className="quote-fieldset">
                      <h3>Where is the property located?</h3>
                      <div className="quote-grid-2">
                        <label className="quote-field">
                          <span>Property ZIP code</span>
                          <input
                            type="text"
                            maxLength={5}
                            value={quoteZip}
                            onChange={(e) => setQuoteZip(e.target.value)}
                            placeholder="03106"
                          />
                        </label>
                        <label className="quote-field">
                          <span>Street address (optional)</span>
                          <input
                            type="text"
                            value={quoteAddress}
                            onChange={(e) => setQuoteAddress(e.target.value)}
                            placeholder="146 Londonderry Tpke"
                          />
                        </label>
                      </div>

                      <div className="quote-grid-2">
                        <label className="quote-field">
                          <span>Property type</span>
                          <select
                            value={quotePropertyType}
                            onChange={(e) => setQuotePropertyType(e.target.value)}
                          >
                            <option>Single-family home</option>
                            <option>Multi-family home</option>
                            <option>Commercial / other</option>
                          </select>
                        </label>
                        <label className="quote-field">
                          <span>Approximate roof age</span>
                          <select
                            value={quoteRoofAge}
                            onChange={(e) => setQuoteRoofAge(e.target.value)}
                          >
                            <option>Not sure</option>
                            <option>Under 10 years</option>
                            <option>10–20 years</option>
                            <option>Over 20 years</option>
                          </select>
                        </label>
                      </div>

                      <div className="quote-field">
                        <span>Add photos (up to 3 · auto-optimized via createImageBitmap)</span>
                        <div className="helper-photo-bar">
                          <input
                            ref={quotePhotoInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleQuotePhotoChange}
                          />
                          <button
                            type="button"
                            className="btn-xs-outline"
                            onClick={() => quotePhotoInputRef.current?.click()}
                          >
                            <Camera size={13} /> Choose Photos...
                          </button>
                          <button
                            type="button"
                            className="btn-xs-outline"
                            onClick={() => setQuotePhotos([samplePhotos[0], samplePhotos[1]])}
                          >
                            <Sparkles size={13} /> Attach 2 Sample Roof Photos
                          </button>
                        </div>
                        {quotePhotos.length > 0 && (
                          <div className="helper-photo-previews">
                            {quotePhotos.map((p) => (
                              <div key={p.id} className="preview-chip">
                                <img src={p.url} alt={p.label} />
                                <span>{p.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {quoteStep === 2 && (
                    <div className="quote-fieldset">
                      <h3>How should we follow up with your estimate?</h3>
                      <div className="quote-grid-2">
                        <label className="quote-field">
                          <span>Your name</span>
                          <input
                            type="text"
                            value={quoteName}
                            onChange={(e) => setQuoteName(e.target.value)}
                          />
                        </label>
                        <label className="quote-field">
                          <span>Mobile phone (for SMS handshake)</span>
                          <input
                            type="tel"
                            value={quotePhone}
                            onChange={(e) => setQuotePhone(e.target.value)}
                          />
                        </label>
                      </div>

                      <div className="quote-grid-2">
                        <label className="quote-field">
                          <span>Email address</span>
                          <input
                            type="email"
                            value={quoteEmail}
                            onChange={(e) => setQuoteEmail(e.target.value)}
                          />
                        </label>
                        <label className="quote-field">
                          <span>Preferred time window</span>
                          <select
                            value={quoteWindow}
                            onChange={(e) => setQuoteWindow(e.target.value)}
                          >
                            <option>Flexible</option>
                            <option>Morning (8 AM – 12 PM)</option>
                            <option>Afternoon (12 PM – 5 PM)</option>
                          </select>
                        </label>
                      </div>

                      <label className="quote-consent-row">
                        <input
                          type="checkbox"
                          checked={quoteConsent}
                          onChange={(e) => setQuoteConsent(e.target.checked)}
                        />
                        <span>
                          I agree to follow-up about this inquiry via SMS/phone/email. No spam or marketing lists.
                        </span>
                      </label>
                    </div>
                  )}

                  {quoteError && <div className="quote-error-banner">{quoteError}</div>}

                  <div className="quote-wizard-actions">
                    {quoteStep > 0 ? (
                      <button
                        type="button"
                        className="btn-xs-outline"
                        onClick={() => setQuoteStep((s) => s - 1)}
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="submit"
                      className="btn-helper-send"
                      style={{ backgroundColor: activeTenant.brandColor }}
                    >
                      <span>
                        {quoteStep === 2
                          ? 'Submit Quote Request & Sync to Back-Office'
                          : 'Continue'}
                      </span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 4: Structured Review Summary DL (Recreated from widget.mjs #helper-review) */
                <div className="quote-review-summary">
                  <div className="review-badge-top">
                    <CheckCircle2 size={18} className="text-emerald" />
                    <strong>Request Saved & Synced to 3-Pane Back-Office!</strong>
                  </div>
                  <p className="review-sub">
                    Alfred pre-scanned your project details and triggered an instant SMS handshake.
                  </p>
                  {submittedSummary && (
                    <dl className="tiberius-review-dl">
                      <div>
                        <dt>Service & Ballpark</dt>
                        <dd>
                          {submittedSummary.service} ({submittedSummary.range})
                        </dd>
                      </div>
                      <div>
                        <dt>Urgency</dt>
                        <dd>{submittedSummary.urgency}</dd>
                      </div>
                      <div>
                        <dt>Property & Roof Age</dt>
                        <dd>
                          {submittedSummary.address} ({submittedSummary.zip}) ·{' '}
                          {submittedSummary.propertyType} · {submittedSummary.roofAge}
                        </dd>
                      </div>
                      <div>
                        <dt>Contact & Window</dt>
                        <dd>
                          {submittedSummary.name} · {submittedSummary.contact} (
                          {submittedSummary.window})
                        </dd>
                      </div>
                      <div>
                        <dt>Attached Photos</dt>
                        <dd>{submittedSummary.photoCount || 1} Vision AI frame(s)</dd>
                      </div>
                    </dl>
                  )}
                  <div className="review-action-buttons">
                    <button
                      type="button"
                      className="btn-helper-send"
                      style={{ backgroundColor: activeTenant.brandColor }}
                      onClick={() => {
                        closeHelperModal()
                        setActiveView('backoffice')
                      }}
                    >
                      <span>Inspect Live Thread in 3-Pane Back-Office</span>
                      <ArrowUpRight size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn-xs-outline"
                      onClick={() => openHelperModal('booking', quoteService)}
                    >
                      Book Inspection Slot →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PANEL 3: BOOK INSPECTION (Cal.com + Instant Slot Picker) */}
          {currentMode === 'booking' && (
            <div className="helper-panel-booking">
              <h3>Schedule a Roof & Structural Inspection</h3>
              <p>
                Reserve a time directly with {activeTenant.companyName} in{' '}
                {activeTenant.city}, or open the live Tiberius Cal.com scheduler.
              </p>
              <div className="booking-quick-slots">
                {[
                  'Today, 2:30 PM – 4:00 PM',
                  'Tomorrow, 9:00 AM – 10:30 AM',
                  'Thursday, 1:00 PM – 2:30 PM',
                ].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className="booking-slot-card"
                    onClick={() => {
                      submitHeroLead({
                        question: `Requested on-site inspection for slot: ${slot}`,
                        phone: '(603) 555-0144',
                        customerName: 'Inspection Booking Lead',
                        zipCode: '03106',
                        preferredWindow: slot,
                        sourceLabel: 'Inspection Scheduler',
                      })
                      closeHelperModal()
                      setActiveView('backoffice')
                    }}
                  >
                    <Calendar size={15} style={{ color: activeTenant.brandColor }} />
                    <div>
                      <strong>{slot}</strong>
                      <span>Instant SMS confirmation + Back-Office sync</span>
                    </div>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
              <div className="cal-external-box">
                <span>Prefer the external Tiberius Cal.com calendar?</span>
                <a
                  href={
                    activeTenant.bookingUrl || 'https://cal.com/tiberius/contractor'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-xs-outline"
                >
                  <span>Open Cal.com Scheduler</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          )}

          {/* PANEL 4: TEXT US (SMS Handshake Preview) */}
          {currentMode === 'text' && (
            <div className="helper-panel-text">
              <h3>A quick text. A useful start.</h3>
              <p>
                Send a pre-filled SMS to {activeTenant.companyName} (
                {activeTenant.phoneDisplay}) and watch Alfred respond in real time:
              </p>
              <div className="sms-preview-box">
                <small>Suggested SMS message</small>
                <p>
                  “Hi {activeTenant.companyName}, I need some help with my roof in{' '}
                  {activeTenant.city} and would like to get an estimate.”
                </p>
              </div>
              <button
                type="button"
                className="btn-helper-send"
                style={{ backgroundColor: activeTenant.brandColor }}
                onClick={() => {
                  submitHeroLead({
                    question: `Hi ${activeTenant.companyName}, I need some help with my roof in ${activeTenant.city} and would like to get an estimate.`,
                    phone: '(603) 555-0188',
                    customerName: 'Mobile SMS Lead',
                    zipCode: '03106',
                    sourceLabel: 'Text Us Quick-Launch',
                  })
                  closeHelperModal()
                  setActiveView('backoffice')
                }}
              >
                <Phone size={15} />
                <span>Send Text & Open in 3-Pane Room</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
