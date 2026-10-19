import { useRef, useState } from 'react'
import { usePlatform } from '../../context/usePlatform'
import { optimizeUploadedPhotos } from '../../utils/photoOptimizer'

const DEFAULT_CHIPS = [
  'My roof is leaking',
  'Architectural or 3-tab shingles?',
  'What areas do you serve?',
  'Book a demo appointment',
]

export default function TiberiusHelperModal() {
  const {
    activeTenant,
    helperModal,
    closeHelperModal,
    openHelperModal,
    submitHeroLead,
    setActiveView,
  } = usePlatform()

  const helperAvatarSrc =
    activeTenant.media?.helperAvatar || '/assets/roofing/helper-v1/avatar.webp'

  const msgSeqRef = useRef(1)
  const [chatLog, setChatLog] = useState([
    {
      id: 'welcome-msg',
      sender: 'AI',
      author: 'Alfred · AI',
      content:
        'Hi, I’m your roof helper. Have a question, a leak, or a project in mind? Tell me what’s going on.',
      status: 'Saved in demo session',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatPhotos, setChatPhotos] = useState([])
  const [helperStatus, setHelperStatus] = useState('')
  const [activeChips, setActiveChips] = useState(DEFAULT_CHIPS)

  // 3-Step Quote Wizard State (matching reference/codex-original/index.html & widget.mjs)
  const [step, setStep] = useState(0) // 0 | 1 | 2
  const [reviewState, setReviewState] = useState('form') // 'form' | 'review' | 'saved'
  const [savedRef, setSavedRef] = useState('')
  const [helperError, setHelperError] = useState('')

  const tenantServices = activeTenant.pricingRules?.services || []
  const defaultServiceOption =
    helperModal.preselectedService ||
    tenantServices[0]?.name ||
    'Roof leak'

  const [service, setService] = useState(defaultServiceOption)
  const [lastPreselected, setLastPreselected] = useState(helperModal.preselectedService)
  const [lastTenantId, setLastTenantId] = useState(activeTenant.id)
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState('Routine')
  const [zip, setZip] = useState('03106')
  const [address, setAddress] = useState('')
  const [propertyType, setPropertyType] = useState('Single-family home')
  const [roofAge, setRoofAge] = useState('Not sure')
  const [quotePhotos, setQuotePhotos] = useState([])
  const [name, setName] = useState('')
  const [contactMethod, setContactMethod] = useState('email')
  const [contactValue, setContactValue] = useState('')
  const [intent, setIntent] = useState('Discuss an estimate')
  const [contactWindow, setContactWindow] = useState('Flexible')
  const [consent, setConsent] = useState(false)

  const [calVisible, setCalVisible] = useState(false)

  if (activeTenant.id !== lastTenantId) {
    setLastTenantId(activeTenant.id)
    setService(
      helperModal.preselectedService ||
        activeTenant.pricingRules?.services?.[0]?.name ||
        'Roof leak'
    )
    setReviewState('form')
    setStep(0)
  }

  if (helperModal.preselectedService !== lastPreselected) {
    setLastPreselected(helperModal.preselectedService)
    if (helperModal.preselectedService) {
      setService(helperModal.preselectedService)
    }
    if (reviewState === 'saved') {
      setReviewState('form')
      setStep(0)
    }
  }

  if (!helperModal.open) return null

  const currentMode = helperModal.mode || 'chat'

  const goMode = (mode, nextService) => {
    setHelperStatus('')
    setHelperError('')
    const chosenService = nextService || service
    if (nextService) setService(nextService)
    if (mode === 'quote' && reviewState === 'saved') {
      setReviewState('form')
      setStep(0)
    }
    openHelperModal(mode, chosenService)
  }

  const handleChatPhotoInput = async (e) => {
    const rawFiles = Array.from(e.target.files || [])
    e.target.value = ''
    if (!rawFiles.length) return
    if (
      rawFiles.length + chatPhotos.length > 3 ||
      rawFiles.some(
        (f) =>
          !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) ||
          f.size > 5 * 1024 * 1024
      )
    ) {
      setHelperStatus(
        'Choose up to three JPG, PNG or WebP photos, up to 5 MB each.'
      )
      return
    }
    try {
      const optimized = await optimizeUploadedPhotos(rawFiles, 3 - chatPhotos.length)
      const seq = msgSeqRef.current++
      const mapped = optimized.map((item, idx) => ({
        id: `chat-photo-${seq}-${idx}`,
        name: item.name,
        url: item.dataUrl,
        label: item.name,
        estimatedRange:
          activeTenant.pricingRules.services[0]?.range || '$450 – $950',
      }))
      setChatPhotos((prev) => [...prev, ...mapped].slice(0, 3))
      setHelperStatus('')
    } catch (err) {
      setHelperStatus(err.message || 'Could not prepare photos.')
    }
  }

  const sendChatReply = (rawText) => {
    const text = String(rawText ?? chatInput).trim()
    if (!text && chatPhotos.length === 0) return
    if (text.length > 1000) {
      setHelperStatus('Please keep the message under 1,000 characters.')
      return
    }

    if (text === 'Book a demo appointment') {
      goMode('booking')
      return
    }

    const seq = msgSeqRef.current++

    const visitorMsg = {
      id: `v-${seq}`,
      sender: 'Visitor',
      author: 'You',
      content: text || 'Sharing photos…',
      photos: chatPhotos,
      status: 'Just now · Delivered',
    }

    const primarySvcName =
      tenantServices[0]?.name || 'Roof Leak & Flashing Repair'
    const replacementSvcName =
      tenantServices[1]?.name || primarySvcName

    let matchedSvc = service || primarySvcName
    let aiReplyText = `Thanks for sharing those details. For ${activeTenant.companyName} in ${activeTenant.city}, we start by reviewing what you’ve noticed and confirming your location before scheduling an inspection.`
    if (/leak|water|drip|stain|repair/i.test(text)) {
      aiReplyText =
        'If water is coming in around flashing, a vent pipe, or a valley, tell us where you see the stain and when it started. You can also add up to 3 photos or start a repair request.'
      matchedSvc = primarySvcName
      setService(primarySvcName)
      setUrgency('Urgent')
      if (!description) setDescription(text)
    } else if (/shingle|3-tab|architectural|replace|install/i.test(text)) {
      aiReplyText =
        'Architectural shingles offer stronger wind resistance and dimensional depth compared to traditional 3-tab shingles, and we also inspect the underlayment, flashing, and attic ventilation underneath.'
      matchedSvc = replacementSvcName
      setService(replacementSvcName)
    } else if (/area|serve|where|hooksett|nh/i.test(text)) {
      aiReplyText = `${activeTenant.companyName} is based in ${activeTenant.city}. Share your 5-digit ZIP code in the request form to confirm coverage.`
    }

    const aiMsg = {
      id: `ai-${seq}`,
      sender: 'AI',
      author: 'Alfred · AI',
      content: aiReplyText,
      status: 'Just now · Saved for owner review',
    }

    setChatLog((prev) => [...prev, visitorMsg, aiMsg])
    submitHeroLead({
      question: text || `Uploaded ${chatPhotos.length} project photo(s)`,
      phone:
        contactMethod === 'phone' && contactValue
          ? contactValue
          : activeTenant.phoneDisplay || '(603) 555-0194',
      email: contactMethod === 'email' && contactValue ? contactValue : undefined,
      customerName: name || 'Website Homeowner',
      photo: chatPhotos[0] || null,
      photos: chatPhotos,
      zipCode: zip || '03106',
      address: address || activeTenant.city,
      serviceName: matchedSvc,
      urgency,
      propertyType,
      roofAge,
      preferredWindow: contactWindow,
      sourceLabel: 'Alfred Roof Assistant Chat',
    })

    setChatInput('')
    setChatPhotos([])
    setHelperStatus('Your message is saved for the demo owner in the Conversation Room.')
    setActiveChips(['Add my project details', 'Book a Tiberius demo'])
  }

  const handleChipClick = (chipLabel) => {
    if (chipLabel === 'Add my project details') {
      goMode('quote')
      return
    }
    if (chipLabel === 'Book a Tiberius demo') {
      goMode('booking')
      return
    }
    sendChatReply(chipLabel)
  }

  const handleQuotePhotoInput = async (e) => {
    const rawFiles = Array.from(e.target.files || [])
    if (!rawFiles.length) return
    if (
      rawFiles.length > 3 ||
      rawFiles.some(
        (f) =>
          !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) ||
          f.size > 5 * 1024 * 1024
      )
    ) {
      setHelperError(
        'Choose up to three JPG, PNG or WebP photos, up to 5 MB each.'
      )
      e.target.value = ''
      return
    }
    try {
      setHelperError('')
      const optimized = await optimizeUploadedPhotos(rawFiles, 3)
      const seq = msgSeqRef.current++
      setQuotePhotos(
        optimized.map((item, idx) => ({
          id: `q-photo-${seq}-${idx}`,
          name: item.name,
          url: item.dataUrl,
          label: item.name,
        }))
      )
    } catch (err) {
      setHelperError(err.message || 'Could not process selected photos.')
    }
  }

  const handleQuoteFormSubmit = (e) => {
    e.preventDefault()
    setHelperError('')

    if (step === 0) {
      if (description.trim().length < 3) {
        setHelperError('Please tell us briefly what you have noticed (at least 3 characters).')
        return
      }
      setStep(1)
      return
    }

    if (step === 1) {
      if (!/^[0-9]{5}$/.test(zip.trim())) {
        setHelperError('Please enter a valid 5-digit property ZIP code (e.g., 03106).')
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      if (!name.trim()) {
        setHelperError('Please enter your name.')
        return
      }
      if (!contactValue.trim()) {
        setHelperError(
          `Please enter your ${contactMethod === 'phone' ? 'phone number' : 'email address'}.`
        )
        return
      }
      if (!consent) {
        setHelperError('Please confirm follow-up permission for this demo inquiry.')
        return
      }
      setReviewState('review')
    }
  }

  const handleSaveLead = () => {
    const seq = msgSeqRef.current++
    const refCode = `TIB-03106-${String(seq).padStart(3, '0')}`
    setSavedRef(refCode)
    submitHeroLead({
      question: `[${service}] ${description} (Next step: ${intent})`,
      phone:
        contactMethod === 'phone'
          ? contactValue
          : activeTenant.phoneDisplay || '(603) 555-0199',
      email:
        contactMethod === 'email'
          ? contactValue
          : `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@homeowner.io`,
      customerName: name,
      photo: quotePhotos[0] || null,
      photos: quotePhotos,
      zipCode: zip,
      address: address ? `${address} (${zip})` : `ZIP ${zip}`,
      serviceName: service,
      urgency,
      propertyType,
      roofAge,
      preferredWindow: contactWindow,
      sourceLabel: '3-Step Quote Request',
    })
    setReviewState('saved')
  }

  function handleCloseModal() {
    if (reviewState === 'saved') {
      setReviewState('form')
      setStep(0)
    }
    closeHelperModal()
  }

  return (
    <div
      className="codex-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal()
      }}
    >
      <dialog
        className={`helper-dialog ${currentMode === 'booking' ? 'is-booking' : ''}`}
        id="roof-helper"
        open
        aria-labelledby="helper-title"
        aria-describedby="helper-disclosure"
      >
        <header className="helper-header">
          <img src={helperAvatarSrc} width="50" height="50" alt="" />
          <div>
            <h2 id="helper-title" tabIndex={-1}>
              Your roof assistant
            </h2>
            <p>Roofing questions &amp; Tiberius demo appointments</p>
          </div>
          <button
            className="helper-close"
            type="button"
            aria-label="Close roof assistant"
            onClick={handleCloseModal}
          >
            ×
          </button>
        </header>

        <p className="helper-disclosure" id="helper-disclosure">
          Live Tiberius demo · Please use sample details. Not an SCG service.
        </p>

        <nav className="helper-modes" aria-label="Choose how to get help">
          <button
            type="button"
            data-mode="chat"
            aria-pressed={currentMode === 'chat'}
            onClick={() => goMode('chat')}
          >
            Ask a question
          </button>
          <button
            type="button"
            data-mode="quote"
            aria-pressed={currentMode === 'quote'}
            onClick={() => goMode('quote')}
          >
            Get a quote
          </button>
          <button
            type="button"
            data-mode="booking"
            aria-pressed={currentMode === 'booking'}
            onClick={() => goMode('booking')}
          >
            Book a demo
          </button>
        </nav>

        <div className="helper-scroll">
          {/* PANEL 1: CHAT */}
          <section
            data-panel="chat"
            hidden={currentMode !== 'chat'}
            aria-label="Roofing conversation"
          >
            <p className="helper-hint" id="helper-chat-mode">
              AI mode · Alfred answers roofing questions.
            </p>

            <div
              className="helper-log"
              id="helper-log"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-label="Roof assistant conversation"
            >
              {chatLog.map((m) => (
                <div
                  key={m.id}
                  className={`helper-bubble${
                    m.sender === 'Visitor'
                      ? ' from-visitor'
                      : m.sender === 'Owner'
                        ? ' from-owner'
                        : ''
                  }`}
                >
                  <span className="message-author">{m.author}</span>
                  <p className="message-content">{m.content}</p>
                  {m.photos?.length > 0 && (
                    <div className="conversation-photos">
                      {m.photos.map((p) => (
                        <div key={p.id} className="conversation-photo">
                          <img src={p.url} alt={p.name} />
                          <span>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <small className="message-meta">{m.status}</small>
                </div>
              ))}
            </div>

            <div className="helper-chips" id="helper-chips">
              {activeChips.map((chipLabel) => (
                <button
                  key={chipLabel}
                  type="button"
                  onClick={() => handleChipClick(chipLabel)}
                >
                  {chipLabel}
                </button>
              ))}
            </div>

            <div className="chat-photo-toolbar">
              <label className="chat-add-photos" htmlFor="chat-photos">
                ＋ Add photos
                <input
                  id="chat-photos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleChatPhotoInput}
                />
              </label>
              <span>Up to 3 photos · Use sample images in this demo</span>
            </div>

            <div
              id="chat-photo-previews"
              className="chat-photo-previews"
              aria-label="Photos ready to send"
            >
              {chatPhotos.map((file, index) => (
                <div key={file.id} className="chat-photo-selection">
                  <img src={file.url} alt={`Ready to send: ${file.name}`} />
                  <button
                    type="button"
                    onClick={() =>
                      setChatPhotos((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    Remove {file.name}
                  </button>
                </div>
              ))}
            </div>

            <form
              id="helper-chat-form"
              className="helper-chat-form"
              onSubmit={(e) => {
                e.preventDefault()
                sendChatReply(chatInput)
              }}
            >
              <label className="visually-hidden" htmlFor="helper-message">
                Your roofing question
              </label>
              <textarea
                id="helper-message"
                name="message"
                placeholder="Tell us what’s happening, or add a photo…"
                maxLength={1000}
                rows={3}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" aria-label="Send question">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </button>
            </form>

            <p className="helper-hint" id="helper-connection" role="status">
              Conversation saved · synced with Owner Inbox
            </p>

            <button
              className="helper-plain"
              type="button"
              data-mode="quote"
              onClick={() => goMode('quote')}
            >
              Use the free request form
            </button>
          </section>

          {/* PANEL 2: QUOTE (3-STEP WIZARD) */}
          <section
            data-panel="quote"
            hidden={currentMode !== 'quote'}
            aria-label="Quote request"
          >
            {reviewState === 'form' && (
              <div id="quote-content">
                <p className="quote-step" id="quote-step">
                  Step {step + 1} of 3 ·{' '}
                  {['Your project', 'The property', 'How to follow up'][step]}
                </p>
                <h3 id="quote-title" tabIndex={-1}>
                  {
                    [
                      'Let’s start with your roof.',
                      'A little about the property.',
                      'How should we follow up?',
                    ][step]
                  }
                </h3>
                <p className="helper-intro">
                  A few useful details for an estimate discussion. A price comes after
                  measurement and review.
                </p>

                <form id="helper-quote-form" noValidate onSubmit={handleQuoteFormSubmit}>
                  <fieldset data-step="0" hidden={step !== 0}>
                    <legend className="visually-hidden">Your project</legend>
                    <label>
                      What can we help with?
                      <select
                        name="service"
                        required
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                      >
                        {tenantServices.map((svc) => (
                          <option key={svc.name} value={svc.name}>
                            {svc.name} ({svc.range})
                          </option>
                        ))}
                        {activeTenant.id === 'scg-roofing' && (
                          <>
                            <option value="Roof leak">Roof inspection &amp; repair</option>
                            <option value="Roof replacement">Roof installation</option>
                            <option value="Attic ventilation">Attic ventilation</option>
                            <option value="Gutters">Gutter installation &amp; cleaning</option>
                            <option value="Skylights">Skylight installation &amp; repair</option>
                            <option value="Decking / underlayment">
                              Roof decking &amp; underlayment
                            </option>
                            <option value="Inspection">Inspection</option>
                            <option value="Storm damage">Storm damage</option>
                          </>
                        )}
                      </select>
                    </label>
                    <label>
                      What have you noticed?
                      <textarea
                        name="description"
                        rows={3}
                        minLength={3}
                        maxLength={1000}
                        required
                        placeholder="A leak over the kitchen, or a new roof you’re planning…"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </label>
                    <label>
                      How urgent is it?
                      <select
                        name="urgency"
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value)}
                      >
                        <option value="Routine">Planning ahead / no active leak</option>
                        <option value="Urgent">Water is coming in now</option>
                        <option value="Needs review">I’m not sure</option>
                      </select>
                    </label>
                  </fieldset>

                  <fieldset data-step="1" hidden={step !== 1}>
                    <legend className="visually-hidden">The property</legend>
                    <label>
                      Property ZIP code
                      <input
                        name="zip"
                        spellCheck="false"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        pattern="[0-9]{5}"
                        maxLength={5}
                        required
                        placeholder="03106"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                    </label>
                    <p className="helper-hint">
                      {activeTenant.companyName} confirms coverage for your exact location.
                    </p>
                    <label>
                      Street address <span className="optional">(optional)</span>
                      <input
                        name="address"
                        autoComplete="street-address"
                        maxLength={200}
                        placeholder="123 Example Lane"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </label>
                    <div className="helper-field-pair">
                      <label>
                        Property type
                        <select
                          name="propertyType"
                          value={propertyType}
                          onChange={(e) => setPropertyType(e.target.value)}
                        >
                          <option>Single-family home</option>
                          <option>Multi-family home</option>
                          <option>Other / not sure</option>
                        </select>
                      </label>
                      <label>
                        Approximate roof age
                        <select
                          name="roofAge"
                          value={roofAge}
                          onChange={(e) => setRoofAge(e.target.value)}
                        >
                          <option>Not sure</option>
                          <option>Under 10 years</option>
                          <option>10–20 years</option>
                          <option>Over 20 years</option>
                        </select>
                      </label>
                    </div>
                    <label className="helper-upload">
                      Add photos <span className="optional">(optional)</span>
                      <input
                        id="helper-photos"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleQuotePhotoInput}
                      />
                    </label>
                    <p className="helper-hint">
                      Up to 3 photos, 5 MB each. Saved privately with your demo inquiry; use
                      sample photos.
                    </p>
                    <div id="helper-photo-previews" className="helper-photos">
                      {quotePhotos.map((p) => (
                        <img
                          key={p.id}
                          src={p.url}
                          alt={`Selected photo: ${p.name}`}
                          width={80}
                          height={64}
                        />
                      ))}
                    </div>
                  </fieldset>

                  <fieldset data-step="2" hidden={step !== 2}>
                    <legend className="visually-hidden">How to follow up</legend>
                    <label>
                      Your name
                      <input
                        name="name"
                        autoComplete="name"
                        maxLength={100}
                        required
                        placeholder="Alex Example"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </label>
                    <label>
                      Preferred contact
                      <select
                        name="method"
                        value={contactMethod}
                        onChange={(e) => setContactMethod(e.target.value)}
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone call</option>
                      </select>
                    </label>
                    <label>
                      <span id="helper-contact-label">
                        {contactMethod === 'phone' ? 'Phone number' : 'Email address'}
                      </span>
                      <input
                        name="value"
                        spellCheck="false"
                        type={contactMethod === 'phone' ? 'tel' : 'email'}
                        autoComplete={contactMethod === 'phone' ? 'tel' : 'email'}
                        maxLength={200}
                        required
                        placeholder={
                          contactMethod === 'phone' ? '(603) 555-0194' : 'alex@example.com'
                        }
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                      />
                    </label>
                    <label>
                      Next step
                      <select
                        name="intent"
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                      >
                        <option>Discuss an estimate</option>
                        <option>Request an inspection</option>
                        <option>Speak with a person</option>
                      </select>
                    </label>
                    <label>
                      Preferred time to be contacted
                      <select
                        name="contactWindow"
                        value={contactWindow}
                        onChange={(e) => setContactWindow(e.target.value)}
                      >
                        <option>Flexible</option>
                        <option>Morning</option>
                        <option>Afternoon</option>
                      </select>
                    </label>
                    <label className="helper-consent">
                      <input
                        name="consent"
                        type="checkbox"
                        required
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      <span>
                        I agree to follow-up about this inquiry by my chosen method. No
                        marketing consent. This demo saves the request with Tiberius, not SCG
                        Roofing. It does not send marketing messages.
                      </span>
                    </label>
                  </fieldset>

                  <p className="helper-error" id="helper-error" role="alert">
                    {helperError}
                  </p>

                  <div className="quote-actions">
                    <button
                      className="helper-back"
                      type="button"
                      id="quote-back"
                      hidden={step === 0}
                      onClick={() => {
                        setHelperError('')
                        setStep((s) => Math.max(0, s - 1))
                      }}
                    >
                      Back
                    </button>
                    <button className="button" type="submit" id="quote-next">
                      {step === 2 ? 'Review my request' : 'Continue'}{' '}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {reviewState === 'review' && (
              <div id="helper-review">
                <h3>Your request, ready to review.</h3>
                <p className="helper-intro">
                  This demonstration sends the request to Tiberius, not SCG. It does not
                  confirm a price or appointment.
                </p>
                <dl>
                  <dt>Project</dt>
                  <dd>
                    {service}: {description}
                  </dd>
                  <dt>Location</dt>
                  <dd>
                    {zip}
                    {address ? ` · ${address}` : ''}
                  </dd>
                  <dt>Contact</dt>
                  <dd>
                    {name} · {contactValue}
                  </dd>
                  <dt>Photos</dt>
                  <dd>{quotePhotos.map((f) => f.name).join(', ') || 'None'}</dd>
                  <dt>Permission</dt>
                  <dd>Follow-up about this inquiry only; no marketing.</dd>
                </dl>
                <div className="quote-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewState('form')
                      setStep(2)
                    }}
                  >
                    Edit details
                  </button>
                  <button type="button" className="button" onClick={handleSaveLead}>
                    Submit demo request
                  </button>
                </div>
              </div>
            )}

            {reviewState === 'saved' && (
              <div id="helper-review">
                <div className="request-saved">✓</div>
                <h3>Your demo request is saved.</h3>
                <p className="helper-intro">
                  Tiberius can now review the project details. Nothing was sent to SCG, and no
                  appointment has been booked.
                </p>
                <p className="helper-hint">Reference: {savedRef}</p>
                <div className="quote-actions">
                  <button
                    type="button"
                    className="button"
                    onClick={() => {
                      setReviewState('form')
                      setStep(0)
                      goMode('booking')
                    }}
                  >
                    Choose a Tiberius demo time
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewState('form')
                      setStep(0)
                      setDescription('')
                      setQuotePhotos([])
                    }}
                  >
                    Start another request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewState('form')
                      setStep(0)
                      closeHelperModal()
                      setActiveView('backoffice')
                    }}
                  >
                    View in Owner Inbox ↗
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* PANEL 3: BOOKING */}
          <section
            data-panel="booking"
            hidden={currentMode !== 'booking'}
            aria-label="Inspection request"
          >
            <span className="panel-symbol">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 5h16v16H4zM8 2v6M16 2v6M4 10h16M8 14h3M14 14h3M8 18h3" />
              </svg>
            </span>
            <h3>A time to talk.</h3>
            <p className="helper-intro" id="booking-explanation">
              Choose a real demo appointment with Michael at Tiberius. This does not book a
              visit from SCG Roofing. The calendar shows available times in your selected time
              zone.
            </p>
            <div id="booking-action">
              <button
                type="button"
                className="button"
                disabled={calVisible}
                onClick={() => setCalVisible(true)}
              >
                Show available demo times
              </button>
              <a
                className="helper-plain"
                href={activeTenant.bookingUrl || 'https://cal.com/tiberius/contractor'}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the calendar in a new tab
              </a>
            </div>
            {calVisible && (
              <div id="cal-embed" className="cal-embed">
                <iframe
                  title="Tiberius Demo Calendar"
                  src="https://cal.com/tiberius/contractor?embed=true&theme=light"
                  loading="lazy"
                />
              </div>
            )}
            <p className="helper-hint">
              This calendar books with Tiberius. Cal.com confirms the appointment; saving an
              inquiry alone does not reserve a time.
            </p>
          </section>

          {/* PANEL 4: TEXT */}
          <section
            data-panel="text"
            hidden={currentMode !== 'text'}
            aria-label="Business texting"
          >
            <span className="panel-symbol">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2A8.5 8.5 0 0 1 21 11.5Z" />
                <path d="M7 10h9M7 14h6" />
              </svg>
            </span>
            <h3>A quick text. A useful start.</h3>
            <p className="helper-intro" id="text-explanation">
              The demo texting number is not connected yet. You can leave a request or book a
              Tiberius demo appointment.
            </p>
            <div className="sms-preview">
              <small>Suggested message</small>
              <p>Hi, I need some help with my roof and would like to get an estimate.</p>
            </div>
            <div id="text-action">
              <button type="button" onClick={() => goMode('quote')}>
                Use the request form
              </button>
            </div>
          </section>

          {/* PANEL 5: CALL */}
          <section data-panel="call" hidden={currentMode !== 'call'}>
            <h3>Phone testing is coming next.</h3>
            <p className="helper-intro">
              The demo phone line is not connected yet. Ask the assistant a question or book a
              Tiberius demo appointment.
            </p>
            <button
              className="button"
              type="button"
              data-mode="booking"
              onClick={() => goMode('booking')}
            >
              See demo booking options
            </button>
          </section>

          <p className="helper-status" id="helper-status" role="status">
            {helperStatus}
          </p>
        </div>

        <div className="helper-bottom">
          <a href="#inquiry" onClick={(e) => { e.preventDefault(); closeHelperModal(); }}>
            How this demo uses information
          </a>
          <span>Tiberius Smart Sites</span>
        </div>
      </dialog>
    </div>
  )
}
