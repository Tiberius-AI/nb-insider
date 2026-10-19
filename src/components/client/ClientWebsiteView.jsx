import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePlatform } from '../../context/usePlatform'
import { renderScrubFrame } from '../../utils/wireframeOrbitRenderer'
import ContextualAIDock from './ContextualAIDock'
import TiberiusHelperModal from './TiberiusHelperModal'

gsap.registerPlugin(ScrollTrigger)

const TOTAL_FRAMES = 150

// Exact timeAt formula from reference/codex-original/packages/animation-engine/scroll-video.mjs
function timeAt(progress, duration = 8, fps = 24) {
  if (!Number.isFinite(duration) || duration <= 0) return 0
  const clamped = Math.min(1, Math.max(0, Number(progress) || 0))
  return clamped * Math.max(0, duration - 1 / fps)
}

export default function ClientWebsiteView() {
  const {
    activeTenant,
    triggerMissedCallRescue,
    openHelperModal,
    setActiveView,
  } = usePlatform()

  const heroSectionRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const customFramesRef = useRef([])
  const folderInputRef = useRef(null)

  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [motionPaused, setMotionPaused] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loadedWebpCount, setLoadedWebpCount] = useState(0)

  // Default to pure Codex video reveal ('video') if tenant has video; fallback to 'wireframe' only if no video
  const hasVideo = Boolean(activeTenant.media?.video || activeTenant.id === 'scg-roofing')
  const [engineMode, setEngineMode] = useState('video')
  const activeVisualMode = hasVideo && engineMode === 'video' ? 'video' : 'wireframe'

  const posterSrc =
    activeTenant.media?.poster || '/assets/roofing/reveal-v1/poster.webp'
  const videoSrc =
    activeTenant.media?.video || '/assets/roofing/reveal-v3/scrub.mp4'
  const detailImgSrc =
    activeTenant.media?.detailImage || '/assets/roofing/reveal-v2/roof-detail.webp'
  const helperAvatarSrc =
    activeTenant.media?.helperAvatar || '/assets/roofing/helper-v1/avatar.webp'

  // Preload 150-frame .webp sequence if present in /sequences/<tenant>/frame_0001.webp
  useEffect(() => {
    let cancelled = false
    const frames = new Array(TOTAL_FRAMES)
    let loadedCount = 0

    const probeImg = new Image()
    const basePath = activeTenant.frameSequence?.basePath || '/sequences/default/frame_'
    probeImg.src = `${basePath}0001.webp`

    probeImg.onload = () => {
      if (cancelled) return
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image()
        img.decoding = 'async'
        const padded = String(i + 1).padStart(4, '0')
        img.src = `${basePath}${padded}.webp`
        img.onload = () => {
          if (cancelled) return
          loadedCount += 1
          frames[i] = img
          customFramesRef.current = frames
          if (
            loadedCount === 1 ||
            loadedCount % 25 === 0 ||
            loadedCount === TOTAL_FRAMES
          ) {
            setLoadedWebpCount(loadedCount)
          }
        }
      }
    }

    probeImg.onerror = () => {
      if (!cancelled) setLoadedWebpCount(0)
    }

    return () => {
      cancelled = true
    }
  }, [activeTenant])

  const handleCustomFramesUpload = (e) => {
    const files = Array.from(e.target.files || []).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    )
    if (!files.length) return

    const frames = new Array(TOTAL_FRAMES)
    let loaded = 0
    files.slice(0, TOTAL_FRAMES).forEach((file, idx) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.decoding = 'async'
      img.src = url
      img.onload = () => {
        loaded += 1
        frames[idx] = img
        customFramesRef.current = frames
        setLoadedWebpCount(loaded)
        setEngineMode('wireframe')
      }
    })
  }

  // Sync video timestamp or 150-frame canvas with scrollProgress
  useEffect(() => {
    if (motionPaused) return

    if (activeVisualMode === 'video') {
      const video = videoRef.current
      if (video && video.readyState >= 2) {
        const duration = Math.min(8, video.duration || 8)
        const targetTime = timeAt(scrollProgress, duration, 24)
        if (Math.abs(video.currentTime - targetTime) > 1 / 48) {
          try {
            video.currentTime = targetTime
          } catch {
            // Ignore seek errors while buffering
          }
        }
      }
    } else if (activeVisualMode === 'wireframe') {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      if (
        canvas.width !== Math.floor(rect.width * dpr) ||
        canvas.height !== Math.floor(rect.height * dpr)
      ) {
        canvas.width = Math.floor(rect.width * dpr)
        canvas.height = Math.floor(rect.height * dpr)
      }

      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.scale(dpr, dpr)
      renderScrubFrame(
        ctx,
        rect.width,
        rect.height,
        currentFrame,
        TOTAL_FRAMES,
        activeTenant,
        customFramesRef.current,
        false
      )
      ctx.restore()
    }
  }, [scrollProgress, currentFrame, activeVisualMode, activeTenant, motionPaused])

  // Bind GSAP ScrollTrigger (scrub: 0.4) to Codex's native 240svh .hero + sticky .hero-sticky
  useEffect(() => {
    const section = heroSectionRef.current
    if (!section) return

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate: (self) => {
        if (motionPaused) return
        const p = Math.min(1, Math.max(0, self.progress))
        setScrollProgress(p)
        setCurrentFrame(
          Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(p * (TOTAL_FRAMES - 1))))
        )
      },
    })

    return () => st.kill()
  }, [activeTenant.id, motionPaused])

  const isScg = activeTenant.id === 'scg-roofing'
  const brandWords = activeTenant.companyName.split(' ')
  const brandMain = isScg ? 'SCG' : brandWords[0]?.toUpperCase() || 'SCG'
  const brandSub = isScg
    ? 'ROOFING'
    : brandWords.slice(1).join(' ').toUpperCase() || activeTenant.niche.toUpperCase()

  const activeCallout = activeTenant.callouts?.find(
    (c) => scrollProgress >= c.startProgress && scrollProgress <= c.endProgress
  )

  return (
    <div
      className="codex-site-wrapper"
      style={{ '--accent': activeTenant.brandColor || '#b72c28' }}
    >
      <a className="skip" href="#main">
        Skip to content
      </a>

      {/* DEMO BAR (Exact Codex reference/codex-original/index.html line 1) */}
      <div className="demo-bar">
        <span>
          <b>TIBERIUS SMART SITES</b>
          <span className="demo-separator"> / </span>
          {isScg
            ? 'Live Tiberius demo · Not affiliated with SCG'
            : `Live Tiberius demo · ${activeTenant.companyName} (${activeTenant.city})`}
        </span>
        <a
          href="#owner"
          onClick={(e) => {
            e.preventDefault()
            setActiveView('backoffice')
          }}
        >
          Owner sign-in <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* SITE HEADER (Exact Codex reference/codex-original/index.html line 1) */}
      <header className="site-header">
        <a
          className="brand"
          href="#hero"
          aria-label={`${activeTenant.companyName} home`}
        >
          <svg viewBox="0 0 48 40" aria-hidden="true">
            <path d="M3 30L24 8l21 22M12 30l12-12 12 12" />
          </svg>
          <span>
            {brandMain}
            <small>{brandSub}</small>
          </span>
        </a>

        <button
          className="menu-toggle"
          id="menu-toggle"
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls="site-nav"
          aria-label="Open navigation"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          Menu <span aria-hidden="true">☰</span>
        </button>

        <nav
          id="site-nav"
          className={`site-nav ${mobileMenuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
        >
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>
            Services
          </a>
          <a href="#approach" onClick={() => setMobileMenuOpen(false)}>
            Our approach
          </a>
          <a href="#proof" onClick={() => setMobileMenuOpen(false)}>
            Projects &amp; reviews
          </a>
          <a href="#faqs" onClick={() => setMobileMenuOpen(false)}>
            FAQs
          </a>
          <a
            className="mobile-contact"
            href="#inquiry"
            onClick={() => setMobileMenuOpen(false)}
          >
            Start an inquiry <span aria-hidden="true">↗</span>
          </a>
        </nav>

        <a
          className="button button-small header-cta"
          href="#inquiry"
          data-engage="quote"
          data-cta
          onClick={(e) => {
            e.preventDefault()
            openHelperModal('quote')
          }}
        >
          Get a quote <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main id="main">
        {/* HERO SECTION (Exact Codex reference/codex-original/index.html lines 1-13) */}
        <section
          ref={heroSectionRef}
          className="hero"
          id="hero"
          data-motion={motionPaused ? 'paused' : 'scroll'}
          data-progress={scrollProgress.toFixed(3)}
          style={{ '--scene-progress': String(scrollProgress) }}
          aria-labelledby="hero-title"
        >
          <div className="hero-sticky">
            <img
              className="hero-art"
              src={posterSrc}
              width="960"
              height="540"
              fetchPriority="high"
              alt="AI-generated concept home with a charcoal shingle roof. Not a completed contractor project."
            />

            <video
              ref={videoRef}
              className="hero-video"
              src={videoSrc}
              data-ready={
                videoReady && activeVisualMode === 'video' ? 'true' : 'false'
              }
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-hidden="true"
              tabIndex={-1}
              onLoadedData={() => setVideoReady(true)}
            />

            <canvas
              ref={canvasRef}
              className="hero-canvas"
              data-ready={activeVisualMode === 'wireframe' ? 'true' : 'false'}
              aria-hidden="true"
            />

            <div className="hero-shade"></div>

            <div className="hero-copy wrap">
              <p className="eyebrow">
                <span className="small-line"></span>{' '}
                {isScg
                  ? 'SOUTHERN NEW HAMPSHIRE / BASED IN HOOKSETT'
                  : `${activeTenant.city.toUpperCase()} / ${activeTenant.niche.toUpperCase()}`}
              </p>

              <h1 id="hero-title">
                {isScg ? (
                  <>
                    For the home
                    <br />
                    <em>under your roof.</em>
                  </>
                ) : (
                  <>
                    {activeTenant.heroHeadline}
                    <br />
                    <em>{activeTenant.companyName}.</em>
                  </>
                )}
              </h1>

              <p className="hero-description">
                {isScg
                  ? 'A drip after rain. Shingles showing their age. A project you’re ready to start. Let’s work out the next step.'
                  : activeTenant.heroSubheadline}
              </p>

              <a
                className="button"
                href="#inquiry"
                data-cta
                onClick={(e) => {
                  e.preventDefault()
                  openHelperModal('quote')
                }}
              >
                Request a roof inspection <span aria-hidden="true">↗</span>
              </a>

              <div className="hero-proof">
                <ul
                  className="trust-indicators"
                  aria-label="SCG-published business credentials"
                >
                  {(
                    activeTenant.trustCredentials || [
                      { metric: '325+', label: 'Roofs completed' },
                      { metric: '40+', label: 'Years of experience' },
                      {
                        metric: 'Licensed & insured',
                        label: 'As published by SCG',
                      },
                      { metric: 'Locally based', label: 'Hooksett, NH' },
                    ]
                  ).map((cred, idx) => (
                    <li key={idx}>
                      <strong>{cred.metric}</strong>
                      <span>{cred.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="trust-source">
                  <a
                    href="https://www.scgroofs.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SCG-published claims <span aria-hidden="true">↗</span>
                    <span className="proof-sr"> (opens in a new tab)</span>
                  </a>
                  <span className="proof-sr">
                    Claims published by SCG; not independently verified by Tiberius.
                  </span>
                </div>
              </div>
            </div>

            {/* Choreographed Value Callout (Subtle editorial card on scroll) */}
            {activeCallout && (
              <aside
                className="codex-scroll-callout"
                aria-label={activeCallout.title}
              >
                <span className="codex-callout-eyebrow">
                  {activeCallout.eyebrow} · {activeCallout.frameRange}
                </span>
                <strong>{activeCallout.title}</strong>
                <p>{activeCallout.body}</p>
                <small>{activeCallout.metric}</small>
              </aside>
            )}

            {/* Embedded Contextual AI Dock (Anchored above hero-bottom) */}
            <ContextualAIDock />

            <div className="scene-meter" aria-hidden="true">
              <span></span>
            </div>

            <div className="hero-bottom wrap">
              <span>
                <i></i> AI CONCEPT / NOT A COMPLETED PROJECT
              </span>
              <div className="motion-tools">
                <button
                  id="motion-toggle"
                  className="text-button"
                  type="button"
                  aria-pressed={motionPaused}
                  onClick={() => setMotionPaused((prev) => !prev)}
                >
                  {motionPaused ? 'Enable motion' : 'Pause motion'}
                </button>
                <span className="scroll-hint">
                  {scrollProgress >= 0.98
                    ? 'THE WHOLE PICTURE ↓'
                    : 'SCROLL TO REVEAL ↓'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* HELP DOCK (Exact Codex reference/codex-original/index.html lines 16-20) */}
        <div className="help-dock wrap" aria-label="Choose your next step">
          <button
            type="button"
            data-engage="chat"
            onClick={() => openHelperModal('chat')}
          >
            <span className="dock-icon">
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
            <span>
              <strong>Have a roofing question?</strong>
              <small>Ask the roof assistant</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>

          <button
            type="button"
            data-engage="quote"
            onClick={() => openHelperModal('quote')}
          >
            <span className="dock-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h2M14 15h1M9 18h2M14 18h1" />
              </svg>
            </span>
            <span>
              <strong>Planning a project?</strong>
              <small>Start your quote request</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>

          <button
            type="button"
            data-engage="booking"
            onClick={() => openHelperModal('booking')}
          >
            <span className="dock-icon">
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
            <span>
              <strong>Need a closer look?</strong>
              <small>Request an inspection</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>

        {/* ROOF SERVICES (Exact Codex reference/codex-original/index.html lines 21-23) */}
        <section className="roof-services wrap" id="services">
          <div className="roof-section-heading">
            <div>
              <p className="section-kicker">
                {isScg ? 'Roofing & home services' : `${activeTenant.niche} services`}
              </p>
              <h2>
                {isScg ? (
                  <>
                    Whatever’s happening up there,
                    <br />
                    start here.
                  </>
                ) : (
                  <>
                    Transparent scope &amp; pricing
                    <br />
                    for {activeTenant.city}.
                  </>
                )}
              </h2>
            </div>
            <p>
              {isScg
                ? 'A leak you can’t ignore. A roof you’re ready to replace. Find the right starting point for your home.'
                : activeTenant.heroSubheadline}
            </p>
          </div>

          <div className="roof-service-layout">
            <div className="primary-services">
              {isScg ? (
                <>
                  <a
                    href="#inquiry"
                    data-engage="quote"
                    data-service="Roof leak"
                    className="primary-service"
                    onClick={(e) => {
                      e.preventDefault()
                      openHelperModal('quote', 'Roof leak')
                    }}
                  >
                    <span className="service-symbol">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m2 12 10-9 10 9M5 10v11h14V10M9 21v-7h6v7" />
                      </svg>
                    </span>
                    <div>
                      <h3>Fix a problem.</h3>
                      <p>
                        Leaks, damaged shingles, or a ceiling stain that appeared after the
                        rain. Start with an inspection and repair discussion.
                      </p>
                      <span>
                        Roof inspection &amp; repair <span aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </a>

                  <a
                    href="#inquiry"
                    data-engage="quote"
                    data-service="Roof replacement"
                    className="primary-service"
                    onClick={(e) => {
                      e.preventDefault()
                      openHelperModal('quote', 'Roof replacement')
                    }}
                  >
                    <span className="service-symbol">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m5 12 4 4L20 5" />
                      </svg>
                    </span>
                    <div>
                      <h3>Plan a new roof.</h3>
                      <p>
                        Aging roof? New construction? Talk through the scope, materials, and
                        next steps before making a decision.
                      </p>
                      <span>
                        Roof installation &amp; replacement{' '}
                        <span aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </a>
                </>
              ) : (
                (activeTenant.pricingRules?.services || []).slice(0, 2).map((svc, idx) => (
                  <a
                    key={svc.name}
                    href="#inquiry"
                    data-engage="quote"
                    data-service={svc.name}
                    className="primary-service"
                    onClick={(e) => {
                      e.preventDefault()
                      openHelperModal('quote', svc.name)
                    }}
                  >
                    <span className="service-symbol">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {idx === 0 ? (
                          <path d="m2 12 10-9 10 9M5 10v11h14V10M9 21v-7h6v7" />
                        ) : (
                          <path d="m5 12 4 4L20 5" />
                        )}
                      </svg>
                    </span>
                    <div>
                      <h3>{svc.name}</h3>
                      <p>{svc.description}</p>
                      <span>
                        {svc.range} · Request quote <span aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </a>
                ))
              )}
            </div>

            <figure className="roof-material">
              <img
                src={detailImgSrc}
                width="960"
                height="540"
                loading="lazy"
                alt="Charcoal roof shingles in a generated design concept"
              />
              <figcaption>
                Every home starts with a roof worth looking after.
                <small>AI-generated design imagery</small>
              </figcaption>
            </figure>
          </div>

          <div className="service-grid">
            {isScg ? (
              <>
                <a
                  className="service-tile"
                  href="#inquiry"
                  data-engage="quote"
                  data-service="Attic ventilation"
                  onClick={(e) => {
                    e.preventDefault()
                    openHelperModal('quote', 'Attic ventilation')
                  }}
                >
                  <h3>
                    Attic venting <span aria-hidden="true">↗</span>
                  </h3>
                  <p>
                    Help heat and moisture escape your attic with ventilation suited to your
                    roof and home.
                  </p>
                </a>

                <a
                  className="service-tile"
                  href="#inquiry"
                  data-engage="quote"
                  data-service="Gutters"
                  onClick={(e) => {
                    e.preventDefault()
                    openHelperModal('quote', 'Gutters')
                  }}
                >
                  <h3>
                    Gutter installation &amp; cleaning <span aria-hidden="true">↗</span>
                  </h3>
                  <p>
                    Keep rainwater moving away from your home with gutter installation and
                    help clearing built-up debris.
                  </p>
                </a>

                <a
                  className="service-tile"
                  href="#inquiry"
                  data-engage="quote"
                  data-service="Decking / underlayment"
                  onClick={(e) => {
                    e.preventDefault()
                    openHelperModal('quote', 'Decking / underlayment')
                  }}
                >
                  <h3>
                    Underlayment / roof decking repair <span aria-hidden="true">↗</span>
                  </h3>
                  <p>
                    Address damaged roof decking and the protective layers beneath your
                    shingles before problems spread further.
                  </p>
                </a>

                <a
                  className="service-tile"
                  href="#inquiry"
                  data-engage="quote"
                  data-service="Skylights"
                  onClick={(e) => {
                    e.preventDefault()
                    openHelperModal('quote', 'Skylights')
                  }}
                >
                  <h3>
                    Skylight installation &amp; repair <span aria-hidden="true">↗</span>
                  </h3>
                  <p>
                    Bring daylight into your home with a new skylight, or get help with an
                    existing one.
                  </p>
                </a>
              </>
            ) : (
              (activeTenant.pricingRules?.services || []).slice(2).map((svc) => (
                <a
                  key={svc.name}
                  className="service-tile"
                  href="#inquiry"
                  data-engage="quote"
                  data-service={svc.name}
                  onClick={(e) => {
                    e.preventDefault()
                    openHelperModal('quote', svc.name)
                  }}
                >
                  <h3>
                    {svc.name} <span aria-hidden="true">↗</span>
                  </h3>
                  <p>
                    {svc.description} ({svc.range})
                  </p>
                </a>
              ))
            )}
          </div>
        </section>

        {/* STRUCTURAL APPROACH (Exact Codex reference/codex-original/index.html line 24) */}
        <section className="roof-process structural-approach" id="approach">
          <div className="wrap roof-process-grid">
            <figure>
              <img
                src={posterSrc}
                width="960"
                height="540"
                loading="lazy"
                alt="Generated architectural concept of a home with a charcoal roof"
              />
              <figcaption>
                Design inspiration · AI-generated, not an SCG project
              </figcaption>
            </figure>
            <div>
              <p className="section-kicker">Look beyond the shingles</p>
              <h2>
                There’s more protecting your home than the shingles you see.
              </h2>
              <p className="process-intro">
                You don’t need to be a roofing expert. {activeTenant.companyName}’s background in construction
                and structural work helps it look beyond the surface.
              </p>
              <ul className="structural-details">
                <li>Hidden rot and flashing problems</li>
                <li>Attic ventilation that isn’t doing its job</li>
                <li>Damaged underlayment and roof decking</li>
              </ul>
              <p className="approach-source">
                Based on{' '}
                <a
                  href="https://www.scgroofs.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SCG’s published approach <span aria-hidden="true">↗</span>
                  <span className="proof-sr"> (opens in a new tab)</span>
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* CUSTOMER PROOF (Exact Codex reference/codex-original/index.html line 25) */}
        <section
          className="customer-proof wrap"
          id="proof"
          aria-labelledby="proof-title"
        >
          <div className="proof-heading">
            <p className="section-kicker">
              {isScg
                ? 'From SCG’s projects & homeowners'
                : `From ${activeTenant.companyName}’s projects & homeowners`}
            </p>
            <h2 id="proof-title">
              Good work speaks for itself.
              <br />
              So do homeowners.
            </h2>
          </div>

          <div className="proof-layout">
            <div className="project-showcase">
              {isScg || !activeTenant.projects?.length ? (
                <>
                  <figure>
                    <div className="project-photo">
                      <img
                        src="/assets/roofing/scg-projects/manchester.webp"
                        width="1100"
                        height="1467"
                        loading="lazy"
                        decoding="async"
                        alt="SCG project photograph of a roof installation in Manchester, New Hampshire"
                      />
                    </div>
                    <figcaption>Manchester, NH</figcaption>
                  </figure>
                  <figure>
                    <div className="project-photo">
                      <img
                        src="/assets/roofing/scg-projects/dover.webp"
                        width="1100"
                        height="733"
                        loading="lazy"
                        decoding="async"
                        alt="SCG project photograph of a roof installation in Dover, New Hampshire"
                      />
                    </div>
                    <figcaption>Dover, NH</figcaption>
                  </figure>
                  <figure>
                    <div className="project-photo">
                      <img
                        src="/assets/roofing/scg-projects/nottingham.webp"
                        width="1100"
                        height="733"
                        loading="lazy"
                        decoding="async"
                        alt="Property featured in SCG’s Nottingham, New Hampshire project gallery"
                      />
                    </div>
                    <figcaption>Nottingham, NH</figcaption>
                  </figure>
                </>
              ) : (
                activeTenant.projects.map((proj) => (
                  <figure key={proj.city}>
                    <div className="project-photo">
                      <img
                        src={proj.image || '/assets/roofing/scg-projects/manchester.webp'}
                        width="1100"
                        height="733"
                        loading="lazy"
                        decoding="async"
                        alt={`${activeTenant.companyName} project in ${proj.city}`}
                      />
                    </div>
                    <figcaption>{proj.city}</figcaption>
                  </figure>
                ))
              )}
            </div>

            <div
              className="testimonial-section"
              aria-label="Excerpts from testimonials on SCG’s website"
            >
              {isScg || !activeTenant.projects?.length ? (
                <>
                  <figure>
                    <blockquote>
                      <p>“Completely replaced our existing roof”</p>
                    </blockquote>
                    <figcaption>
                      <strong>Sue</strong>
                      <span>Nottingham, NH</span>
                      <small>Excerpt · SCG website</small>
                    </figcaption>
                  </figure>
                  <figure>
                    <blockquote>
                      <p>“Patrick and his team were fantastic to deal with”</p>
                    </blockquote>
                    <figcaption>
                      <strong>John</strong>
                      <span>Manchester, NH</span>
                      <small>Excerpt · SCG website</small>
                    </figcaption>
                  </figure>
                  <figure>
                    <blockquote>
                      <p>“professional, responsive, and does excellent work.”</p>
                    </blockquote>
                    <figcaption>
                      <strong>Joyce</strong>
                      <span>Londonderry, NH</span>
                      <small>Excerpt · SCG website</small>
                    </figcaption>
                  </figure>
                </>
              ) : (
                activeTenant.projects.map((proj) => (
                  <figure key={proj.author}>
                    <blockquote>
                      <p>“{proj.quote}”</p>
                    </blockquote>
                    <figcaption>
                      <strong>{proj.author}</strong>
                      <span>{proj.scope}</span>
                      <small>Verified homeowner · {activeTenant.city}</small>
                    </figcaption>
                  </figure>
                ))
              )}
            </div>
          </div>

          <div className="proof-source">
            <span>
              SCG project photographs and published testimonial excerpts, reproduced
              with permission.
            </span>
            <a
              href="https://www.scgroofs.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              View original projects &amp; testimonials{' '}
              <span aria-hidden="true">↗</span>
              <span className="proof-sr"> (opens in a new tab)</span>
            </a>
          </div>
        </section>

        {/* QUOTE INVITATION (Exact Codex reference/codex-original/index.html line 26) */}
        <section
          className="quote-invitation wrap"
          aria-labelledby="quote-invite-title"
        >
          <div>
            <p className="section-kicker">Let’s talk about your project</p>
            <h2 id="quote-invite-title">
              Less guesswork.
              <br />A better first conversation.
            </h2>
            <p>
              Not sure what to ask? The roof helper can guide you. Already have a
              project in mind? Start with a few details for an estimate request.
            </p>
            <div className="invitation-actions">
              <button
                className="button"
                type="button"
                data-engage="quote"
                onClick={() => openHelperModal('quote')}
              >
                Get a quote{' '}
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
              <button
                className="quiet-button"
                type="button"
                data-engage="chat"
                onClick={() => openHelperModal('chat')}
              >
                Ask a question{' '}
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
              </button>
            </div>
            <small>Prices follow property measurement and business review.</small>
          </div>

          <div className="helper-feature">
            <img
              src={helperAvatarSrc}
              width="210"
              height="210"
              loading="lazy"
              alt="Fictional cartoon roof helper wearing a red hard hat"
            />
            <div>
              <span>Hi, homeowner.</span>
              <p>
                What can I help
                <br />
                you figure out?
              </p>
              <button
                type="button"
                data-engage="chat"
                onClick={() => openHelperModal('chat')}
              >
                Start a conversation <span aria-hidden="true">↗</span>
              </button>
              <small>Ask the live roofing assistant</small>
            </div>
          </div>
        </section>

        {/* LOCAL QUESTIONS & FAQS (Exact Codex reference/codex-original/index.html line 27) */}
        <section className="local-questions">
          <div className="wrap local-questions-grid">
            <div className="local-business" id="service-area">
              <p className="section-kicker">Close to home</p>
              <h2>
                {isScg ? (
                  <>
                    Southern New Hampshire.
                    <br />
                    Starting in Hooksett.
                  </>
                ) : (
                  <>
                    Serving {activeTenant.city}.
                    <br />
                    Local &amp; responsive.
                  </>
                )}
              </h2>
              <p>
                {activeTenant.companyName} lists {activeTenant.city} as its service
                region. Share your property location to confirm coverage.
              </p>
              <address>
                <strong>{activeTenant.companyName}</strong>
                <span>
                  {activeTenant.addressLine ||
                    '146 Londonderry Turnpike, Unit 20, Hooksett, NH 03106'}
                </span>
                <span>{activeTenant.phoneDisplay} · published business reference</span>
              </address>
            </div>

            <div className="home-questions" id="faqs">
              <h2>Before you reach out.</h2>
              <div className="faq-list">
                {isScg || !activeTenant.faqs?.length ? (
                  <>
                    <details>
                      <summary>
                        Can I start with a leak or a small repair?
                        <span aria-hidden="true">+</span>
                      </summary>
                      <p>
                        Yes. SCG lists roof inspection and repair. Tell us what you’ve
                        noticed and when it began; you don’t need to diagnose the cause
                        first.
                      </p>
                    </details>
                    <details>
                      <summary>
                        Do you also handle gutters and attic ventilation?
                        <span aria-hidden="true">+</span>
                      </summary>
                      <p>
                        SCG’s current website lists gutter installation and cleaning, attic
                        ventilation, and skylight work alongside roofing services. Choose the
                        service that fits your question.
                      </p>
                    </details>
                    <details>
                      <summary>
                        Where is SCG based?<span aria-hidden="true">+</span>
                      </summary>
                      <p>
                        SCG publishes a Hooksett, New Hampshire address and describes its
                        service region as Southern New Hampshire. Your exact location and
                        scheduling still need confirmation.
                      </p>
                    </details>
                    <details>
                      <summary>
                        Can I include photos?<span aria-hidden="true">+</span>
                      </summary>
                      <p>
                        Yes. Add up to three JPG, PNG or WebP images to a demo inquiry.
                        Please use sample photos without faces, addresses or other private
                        information. Images are stored privately for the demo owner.
                      </p>
                    </details>
                    <details>
                      <summary>
                        Can I get a price or book an inspection here?
                        <span aria-hidden="true">+</span>
                      </summary>
                      <p>
                        You can try a sample inspection request or open Tiberius’s live demo
                        calendar. A booking on that calendar is with Tiberius, not SCG
                        Roofing. Roofing prices and SCG appointments must be confirmed
                        directly with the business.
                      </p>
                    </details>
                    <details>
                      <summary>
                        Can I use a simple form?<span aria-hidden="true">+</span>
                      </summary>
                      <p>
                        Yes. The request form works without AI usage. Demo inquiries go to
                        Tiberius, not SCG Roofing.
                      </p>
                    </details>
                    <details>
                      <summary>
                        Is this SCG’s live website?<span aria-hidden="true">+</span>
                      </summary>
                      <p>
                        No. This is an independent Tiberius demonstration. The AI answers
                        roofing questions, requests are saved for the demo owner, and the
                        booking calendar is Michael’s Tiberius calendar. This site does not
                        contact or schedule SCG Roofing.
                      </p>
                    </details>
                  </>
                ) : (
                  activeTenant.faqs.map((faq) => (
                    <details key={faq.q}>
                      <summary>
                        {faq.q}
                        <span aria-hidden="true">+</span>
                      </summary>
                      <p>{faq.a}</p>
                    </details>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* INQUIRY GRID (Exact Codex reference/codex-original/index.html line 28) */}
        <section
          className="section wrap inquiry-grid"
          id="inquiry"
          aria-labelledby="inquiry-title"
        >
          <div className="inquiry-copy">
            <p className="eyebrow">Your roof. Your next step.</p>
            <h2 id="inquiry-title">
              Let’s get the
              <br />
              details down.
            </h2>
            <p>
              Start with a question or tell us what you’ve noticed. The roof assistant
              can help you put together a useful inquiry.
            </p>
            <div className="expectations">
              <h3>A clearer conversation</h3>
              <ul>
                <li>Answers to roofing questions</li>
                <li>A request with the useful project details</li>
                <li>A real demo appointment with Tiberius</li>
              </ul>
            </div>
            <p className="demo-note">
              Independent Tiberius demo. Please use sample details. Nothing is sent to
              SCG Roofing.
            </p>
          </div>

          <div className="intake-shell live-intake-card">
            <img
              src={helperAvatarSrc}
              width="110"
              height="110"
              loading="lazy"
              alt="Fictional roof helper"
            />
            <h3>What can I help you figure out?</h3>
            <p>
              Ask about materials, leaks, ventilation or planning your next roof.
            </p>
            <button
              className="button"
              type="button"
              data-engage="chat"
              onClick={() => openHelperModal('chat')}
            >
              Ask the roof assistant ↗
            </button>
            <button
              className="quiet-button"
              type="button"
              data-engage="quote"
              onClick={() => openHelperModal('quote')}
            >
              Use the request form
            </button>
            <button
              className="quiet-button"
              type="button"
              data-engage="booking"
              onClick={() => openHelperModal('booking')}
            >
              Book a Tiberius demo
            </button>
          </div>
        </section>

        {/* NATIVE CODEX .demo-lab FOR TESTING 150-FRAME .WEBP FALLBACK & MISSED CALL RESCUE */}
        <details className="demo-lab wrap">
          <summary>
            Tiberius Demo Lab · Video Scrubbing &amp; Missed-Call Rescue Controls
          </summary>
          <div>
            <span>
              Hero Engine:{' '}
              <strong>
                {activeVisualMode === 'video'
                  ? '24fps MP4 Scroll Video (scrub.mp4)'
                  : `150-Frame .webp / 3D CAD Fallback (Frame ${currentFrame + 1}/${TOTAL_FRAMES})`}
              </strong>
              {loadedWebpCount > 0 && ` · ${loadedWebpCount} .webp frames loaded`}
            </span>
            <button
              type="button"
              className="text-button"
              onClick={() =>
                setEngineMode((prev) => (prev === 'video' ? 'wireframe' : 'video'))
              }
            >
              Switch to{' '}
              {activeVisualMode === 'video'
                ? '150-Frame .webp / 3D CAD Fallback'
                : '24fps MP4 Video'}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => folderInputRef.current?.click()}
            >
              Load local .webp sequence
            </button>
            <input
              ref={folderInputRef}
              type="file"
              accept="image/webp,image/png,image/jpeg"
              multiple
              hidden
              onChange={handleCustomFramesUpload}
            />
            <button
              type="button"
              className="text-button"
              onClick={() => triggerMissedCallRescue()}
            >
              Simulate Missed-Call Rescue SMS ({activeTenant.phoneDisplay})
            </button>
          </div>
        </details>
      </main>

      {/* FULL FOOTER (Exact Codex reference/codex-original/index.html line 28) */}
      <footer className="full-footer">
        <div className="wrap footer-grid">
          <div>
            <a
              className="brand"
              href="#hero"
              aria-label={`${activeTenant.companyName} home`}
            >
              <svg viewBox="0 0 48 40" aria-hidden="true">
                <path d="M3 30L24 8l21 22M12 30l12-12 12 12" />
              </svg>
              <span>
                {brandMain}
                <small>{brandSub}</small>
              </span>
            </a>
            <p>
              For the home under your roof.
              <br />
              {activeTenant.city}.
            </p>
            <small>
              Independent redesign concept by Tiberius Smart Sites.
              <br />
              Hero and approach: AI-generated concepts.
              <br />
              Project gallery: authorized SCG photographs.
            </small>
          </div>

          <div>
            <h2>Explore</h2>
            <a href="#services">Roofing &amp; home services</a>
            <a href="#approach">Our approach</a>
            <a href="#service-area">Service area</a>
            <a href="#faqs">Common questions</a>
          </div>

          <div>
            <h2>Published business details</h2>
            <span>{activeTenant.phoneDisplay}</span>
            <span>info@SCGRoofs.com</span>
            <p>
              146 Londonderry Turnpike, Unit 20
              <br />
              Hooksett, NH 03106
            </p>
            <a href="#inquiry">About this preview</a>
            <a
              href="#owner"
              onClick={(e) => {
                e.preventDefault()
                setActiveView('backoffice')
              }}
            >
              Owner sign-in <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="wrap footer-bottom">
          <span>TIBERIUS SMART SITES / SCG ROOFING CONCEPT</span>
          <a
            href="https://www.scgroofs.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Existing business website <span aria-hidden="true">↗</span>
          </a>
          <span>Demo inquiries go to Tiberius, not SCG.</span>
        </div>
      </footer>

      {/* ENGAGEMENT TOOLS (Exact Codex reference/codex-original/index.html lines 28-46) */}
      <div className="engagement-tools">
        <button
          className="helper-launcher"
          type="button"
          aria-label="Open roof assistant"
          data-engage="chat"
          aria-haspopup="dialog"
          aria-controls="roof-helper"
          onClick={() => openHelperModal('chat')}
        >
          <img src={helperAvatarSrc} width="64" height="64" alt="" />
          <span>
            Roof questions?
            <strong>Let’s talk</strong>
          </span>
          <span className="launcher-icon">
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
        </button>

        <div className="mobile-contact-bar" aria-label="Quick contact">
          <button
            type="button"
            data-engage="call"
            onClick={() => openHelperModal('call')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m7 3 3 5-3 2c1 3 4 6 7 7l2-3 5 3c0 3-2 5-5 4C9 19 5 15 3 8 2 5 4 3 7 3Z" />
            </svg>
            <span>Call us</span>
          </button>
          <button
            type="button"
            data-engage="text"
            onClick={() => openHelperModal('text')}
          >
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
            <span>Text us</span>
          </button>
        </div>

        <TiberiusHelperModal />
      </div>
    </div>
  )
}
