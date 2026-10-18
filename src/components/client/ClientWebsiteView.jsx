import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Terminal,
  Upload,
  CheckCircle2,
  ArrowDown,
  PhoneCall,
  Film,
  Layers,
  Box,
  Pause,
  Play,
  MessageSquare,
  FileText,
  Calendar,
  ArrowUpRight,
  Wrench,
  Home,
  MapPin,
  Quote,
  HelpCircle,
} from 'lucide-react'
import { usePlatform } from '../../context/usePlatform'
import { renderScrubFrame } from '../../utils/wireframeOrbitRenderer'
import ContextualAIDock from './ContextualAIDock'
import TiberiusHelperModal from './TiberiusHelperModal'

gsap.registerPlugin(ScrollTrigger)

const TOTAL_FRAMES = 150

// Exact timeAt formula recovered via REA from Tiberius `packages/animation-engine/scroll-video.mjs`
function timeAt(progress, duration = 8, fps = 24) {
  const clamped = Math.min(1, Math.max(0, Number(progress) || 0))
  const safeDuration = Math.max(0, (Number(duration) || 8) - 1 / (Number(fps) || 24))
  return Number((clamped * safeDuration).toFixed(4))
}

export default function ClientWebsiteView() {
  const {
    activeTenant,
    activePlan,
    triggerMissedCallRescue,
    openHelperModal,
  } = usePlatform()

  const heroPinRef = useRef(null)
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const customFramesRef = useRef([])
  const frameStateRef = useRef({ frame: 0 })

  const [currentFrame, setCurrentFrame] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [loadedWebpCount, setLoadedWebpCount] = useState(0)
  const [showPipelineDrawer, setShowPipelineDrawer] = useState(false)

  // Scrubbing visual mode: 'hybrid' (Real Video + Telemetry), 'video' (Pure Tiberius Video), 'wireframe' (150-Frame .webp / 3D CAD)
  const [visualMode, setVisualMode] = useState('hybrid')
  const [motionPaused, setMotionPaused] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  const folderInputRef = useRef(null)

  // Preload .webp sequence if present in /sequences/<tenant>/frame_0001.webp
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
      if (!cancelled) {
        setLoadedWebpCount(0)
      }
    }

    return () => {
      cancelled = true
    }
  }, [activeTenant])

  // Load local .webp sequence files from disk for testing
  const handleCustomFramesUpload = (e) => {
    const files = Array.from(e.target.files || []).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    )
    if (!files.length) return

    const frames = []
    let count = 0
    files.slice(0, TOTAL_FRAMES).forEach((file, idx) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.decoding = 'async'
      img.src = url
      img.onload = () => {
        count += 1
        frames[idx] = img
        customFramesRef.current = frames
        setLoadedWebpCount(count)
        setVisualMode('wireframe')
      }
    })
  }

  // Scrub the HTML5 <video> using Tiberius's exact `timeAt(progress, duration, fps)`
  useEffect(() => {
    const vid = videoRef.current
    if (!vid || motionPaused || visualMode === 'wireframe') return

    const duration = vid.duration || activeTenant.media?.duration || 8
    const fps = activeTenant.media?.fps || 24
    const nextTime = timeAt(scrollProgress, duration, fps)

    if (
      vid.readyState >= 1 &&
      Math.abs((vid.currentTime || 0) - nextTime) > 1 / (fps * 2)
    ) {
      try {
        vid.currentTime = nextTime
      } catch {
        // Ignore seek before metadata ready
      }
    }
  }, [scrollProgress, motionPaused, visualMode, activeTenant])

  // Draw canvas frame whenever frame index, tenant, mode, or viewport changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (visualMode === 'video') {
        ctx.clearRect(0, 0, rect.width, rect.height)
        return
      }

      renderScrubFrame(
        ctx,
        rect.width,
        rect.height,
        frameStateRef.current.frame,
        TOTAL_FRAMES,
        activeTenant,
        customFramesRef.current,
        visualMode === 'hybrid' && videoReady && !motionPaused
      )
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTenant, currentFrame, loadedWebpCount, visualMode, videoReady, motionPaused])

  // GSAP ScrollTrigger Pinned Scrubbing Engine (scrub: 0.4, 150 frames)
  useEffect(() => {
    const heroEl = heroPinRef.current
    if (!heroEl) return

    frameStateRef.current.frame = 0

    const ctx = gsap.context(() => {
      gsap.to(frameStateRef.current, {
        frame: TOTAL_FRAMES - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          end: '+=2600',
          scrub: 0.4,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (motionPaused) return
            const idx = Math.min(
              TOTAL_FRAMES - 1,
              Math.max(0, Math.round(self.progress * (TOTAL_FRAMES - 1)))
            )
            frameStateRef.current.frame = idx
            setCurrentFrame(idx)
            setScrollProgress(self.progress)
          },
        },
      })
    }, heroEl)

    return () => ctx.revert()
  }, [activeTenant.id, motionPaused])

  const formattedFrame = String(currentFrame + 1).padStart(3, '0')
  const pct = Math.round(scrollProgress * 100)
  const posterSrc =
    activeTenant.media?.poster || '/assets/roofing/reveal-v1/poster.webp'
  const videoSrc =
    activeTenant.media?.video || '/assets/roofing/reveal-v3/scrub.mp4'
  const detailImgSrc =
    activeTenant.media?.detailImage || '/assets/roofing/reveal-v2/roof-detail.webp'
  const helperAvatarSrc =
    activeTenant.media?.helperAvatar || '/assets/roofing/helper-v1/avatar.webp'

  const defaultProjects = activeTenant.projects || [
    {
      city: 'Manchester, NH',
      image: '/assets/roofing/scg-projects/manchester.webp',
      scope: 'Architectural Shingle & Ridge Ventilation System',
      quote: 'Patrick and his team were fantastic to deal with.',
      author: 'John · Manchester, NH',
    },
    {
      city: 'Dover, NH',
      image: '/assets/roofing/scg-projects/dover.webp',
      scope: 'Complete Tear-Off, Ice & Water Shield + New Flashing',
      quote: 'Professional, responsive, and does excellent work.',
      author: 'Joyce · Londonderry, NH',
    },
    {
      city: 'Nottingham, NH',
      image: '/assets/roofing/scg-projects/nottingham.webp',
      scope: 'Full Roof Replacement & Structural Decking Check',
      quote: 'Completely replaced our existing roof.',
      author: 'Sue · Nottingham, NH',
    },
  ]

  const defaultFaqs = activeTenant.faqs || [
    {
      q: 'Can I start with a leak or a small repair?',
      a: `Yes. ${activeTenant.companyName} handles leak diagnostics, flashing repairs, and full replacements in ${activeTenant.city}. Upload a driveway photo in the AI Dock and you don’t need to diagnose the cause first.`,
    },
    {
      q: 'Can I include photos with my question or quote request?',
      a: 'Yes! Add up to 3 JPG, PNG, or WebP photos. Our client-side optimizer resizes them automatically and runs a Vision AI pre-scan for our estimator.',
    },
    {
      q: 'How do ballpark ranges and inspections work?',
      a: 'Alfred provides transparent local ballpark ranges right away based on our contractor pricing table and helps you lock in a confirmed inspection slot.',
    },
  ]

  const primaryServices = activeTenant.pricingRules.services.slice(0, 2)
  const supportingServices = activeTenant.pricingRules.services.slice(2)

  return (
    <div className="client-website-container">
      {/* Pinned GSAP Scroll-Scrubbing Hero Section (Fusing Tiberius Video + Higgsfield 150-Frame Canvas) */}
      <section
        ref={heroPinRef}
        className="scrub-hero-section"
        data-motion={motionPaused ? 'paused' : 'scrubbing'}
      >
        {/* Layer 1: Tiberius Real Poster & Scroll-Scrubbed MP4 Video (`scroll-video.mjs`) */}
        {visualMode !== 'wireframe' && (
          <div className="tiberius-video-stage" aria-hidden="true">
            <img
              src={posterSrc}
              alt=""
              className="tiberius-hero-poster"
              fetchPriority="high"
            />
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              className={`tiberius-hero-video ${videoReady ? 'is-ready' : ''}`}
              onLoadedData={() => setVideoReady(true)}
            />
            <div className="tiberius-hero-shade" />
          </div>
        )}

        {/* Layer 2: HTML5 <canvas> for 150-Frame .webp Sequence OR Hybrid 3D Telemetry Overlay */}
        <canvas
          ref={canvasRef}
          className={`scrub-hero-canvas ${
            visualMode === 'hybrid' && videoReady ? 'canvas-hybrid-overlay' : ''
          }`}
        />

        {/* Top Contractor Brand & Scrub Engine Controls */}
        <div className="hero-overlay-header">
          <div className="contractor-badge glass-pill">
            <span
              className="contractor-dot"
              style={{ backgroundColor: activeTenant.brandColor }}
            />
            <strong>{activeTenant.companyName}</strong>
            <span className="divider">•</span>
            <span>{activeTenant.city}</span>
            <span className="divider">•</span>
            <span className="niche-tag">{activeTenant.niche}</span>
          </div>

          <div className="hero-telemetry-pills">
            {/* Switch between Hybrid Video+HUD, Pure Video, and 3D Wireframe/.webp */}
            <div className="visual-mode-switcher glass-pill">
              <button
                type="button"
                className={`mode-mini-btn ${visualMode === 'hybrid' ? 'active' : ''}`}
                onClick={() => setVisualMode('hybrid')}
                title="Real Tiberius Video Orbit + 3D Telemetry HUD"
              >
                <Layers size={12} />
                <span>Hybrid Orbit</span>
              </button>
              <button
                type="button"
                className={`mode-mini-btn ${visualMode === 'video' ? 'active' : ''}`}
                onClick={() => setVisualMode('video')}
                title="Pure Tiberius 24fps Video Scrubbing (scrub.mp4)"
              >
                <Film size={12} />
                <span>Pure Video</span>
              </button>
              <button
                type="button"
                className={`mode-mini-btn ${
                  visualMode === 'wireframe' ? 'active' : ''
                }`}
                onClick={() => setVisualMode('wireframe')}
                title="150-Frame .webp Sequence / 3D CAD Wireframe"
              >
                <Box size={12} />
                <span>3D Wireframe</span>
              </button>
            </div>

            <div className="telemetry-pill glass-pill">
              <span className="mono-label">SCRUB: 0.4s</span>
              <span className="divider">|</span>
              <span
                className="mono-highlight"
                style={{ color: activeTenant.brandColor }}
              >
                FRAME {formattedFrame} / {TOTAL_FRAMES} ({pct}%)
              </span>
            </div>

            {/* Pause / Enable Motion Toggle (from Tiberius scroll-video.mjs) */}
            <button
              type="button"
              className="telemetry-pill glass-pill clickable"
              onClick={() => setMotionPaused((prev) => !prev)}
              title="Toggle scroll motion (Accessibility / Reduced Motion)"
            >
              {motionPaused ? <Play size={12} /> : <Pause size={12} />}
              <span>{motionPaused ? 'Enable motion' : 'Pause motion'}</span>
            </button>

            <button
              type="button"
              className="telemetry-pill glass-pill clickable"
              onClick={() => setShowPipelineDrawer((prev) => !prev)}
            >
              <Terminal size={13} />
              <span>
                {loadedWebpCount > 0
                  ? `.WEBP (${loadedWebpCount}/${TOTAL_FRAMES})`
                  : 'FFMPEG PIPELINE'}
              </span>
            </button>

            <button
              type="button"
              className="telemetry-pill glass-pill clickable rescue-btn"
              onClick={() => triggerMissedCallRescue()}
              title="Simulate a customer calling and triggering Missed-Call Rescue SMS"
            >
              <PhoneCall size={13} />
              <span>Missed Call ({activeTenant.phoneDisplay})</span>
            </button>
          </div>
        </div>

        {/* FFmpeg .webp Pipeline & Sequence Uploader Popover */}
        {showPipelineDrawer && (
          <div className="pipeline-drawer glass-panel">
            <div className="pipeline-drawer-top">
              <strong>
                Tiberius Dual-Engine: 24fps MP4 Video Scrub + 150-Frame .webp LRU Sequence
              </strong>
              <button
                type="button"
                className="btn-xs"
                onClick={() => folderInputRef.current?.click()}
              >
                <Upload size={13} /> Load Local .webp Frames
              </button>
              <input
                ref={folderInputRef}
                type="file"
                accept="image/webp,image/png,image/jpeg"
                multiple
                style={{ display: 'none' }}
                onChange={handleCustomFramesUpload}
              />
            </div>
            <p className="pipeline-desc">
              Extract 150 ultra-lightweight <code>.webp</code> frames from any camera orbit MP4 (or scrub <code>/assets/roofing/reveal-v3/scrub.mp4</code> directly):
            </p>
            <pre className="ffmpeg-code">
              {`ffmpeg -i public/assets/roofing/reveal-v3/scrub.mp4 -vf "fps=30,scale=1920:-1:flags=lanczos" -c:v libwebp -lossless 0 -compression_level 6 -q:v 78 public${activeTenant.frameSequence?.basePath}0%03d.webp`}
            </pre>
          </div>
        )}

        {/* Intro Editorial Hero Copy + Trust Credentials (Fades smoothly on scroll) */}
        <div
          className="hero-center-headline"
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 4.5),
            transform: `translateY(${-scrollProgress * 85}px)`,
            pointerEvents: scrollProgress > 0.22 ? 'none' : 'auto',
          }}
        >
          <div
            className="eyebrow-pill"
            style={{ borderColor: activeTenant.brandColor }}
          >
            <Sparkles size={13} style={{ color: activeTenant.brandColor }} />
            <span>
              {activeTenant.city.toUpperCase()} •{' '}
              {activeTenant.frameSequence?.cameraLabel}
            </span>
          </div>

          <h1>
            {activeTenant.heroHeadline || activeTenant.companyName}{' '}
            <span
              className="headline-accent"
              style={{ color: activeTenant.brandColor }}
            >
              — {activeTenant.companyName}
            </span>
          </h1>

          <p>
            {activeTenant.heroSubheadline ||
              'Scroll to scrub our 3D inspection orbit, or drop a project photo in the AI Dock below for an instant SMS quote.'}
          </p>

          {/* Hero Action Buttons + Trust Credentials Strip (Recreated from Tiberius index.html) */}
          <div className="hero-cta-row">
            <button
              type="button"
              className="btn-hero-primary"
              style={{ backgroundColor: activeTenant.brandColor }}
              onClick={() => openHelperModal('quote')}
            >
              <span>Start 3-Step Quote Request</span>
              <ArrowUpRight size={16} />
            </button>
            <button
              type="button"
              className="btn-hero-secondary glass-pill"
              onClick={() => openHelperModal('chat')}
            >
              <MessageSquare size={15} />
              <span>Ask Alfred (Roof Assistant)</span>
            </button>
          </div>

          {activeTenant.trustCredentials && (
            <ul className="tiberius-trust-strip" aria-label="Business credentials">
              {activeTenant.trustCredentials.map((cred, i) => (
                <li key={i}>
                  <strong style={{ color: activeTenant.brandColor }}>
                    {cred.metric}
                  </strong>
                  <span>{cred.label}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="scroll-cue">
            <ArrowDown size={15} />
            <span>
              {scrollProgress > 0.08
                ? `THE WHOLE PICTURE ↓ (${pct}%)`
                : 'SCROLL TO REVEAL ↓'}
            </span>
          </div>
        </div>

        {/* Choreographed Glassmorphic Value Callouts */}
        <div className="choreographed-callouts-layer">
          {activeTenant.callouts.map((callout) => {
            const isVisible =
              scrollProgress >= callout.startProgress &&
              scrollProgress <= callout.endProgress

            const windowSpan = callout.endProgress - callout.startProgress
            const localProgress =
              (scrollProgress - callout.startProgress) / windowSpan
            const opacity = isVisible
              ? Math.min(
                  1,
                  Math.sin(Math.max(0, Math.min(1, localProgress)) * Math.PI) *
                    1.65
                )
              : 0

            return (
              <div
                key={callout.id}
                className={`choreographed-card glass-panel pos-${callout.position}`}
                style={{
                  opacity,
                  transform: `translateY(${isVisible ? 0 : 24}px) scale(${
                    isVisible ? 1 : 0.96
                  })`,
                  borderColor: isVisible
                    ? `${activeTenant.brandColor}66`
                    : undefined,
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
              >
                <div className="callout-header">
                  <span
                    className="callout-eyebrow"
                    style={{ color: activeTenant.brandColor }}
                  >
                    {callout.eyebrow}
                  </span>
                  <span className="callout-frames">{callout.frameRange}</span>
                </div>
                <h3>{callout.title}</h3>
                <p>{callout.body}</p>
                <div className="callout-footer">
                  <span
                    className="callout-metric-pill"
                    style={{
                      backgroundColor: `${activeTenant.brandColor}22`,
                      color: activeTenant.brandColor,
                    }}
                  >
                    <CheckCircle2 size={13} />
                    {callout.metric}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tiberius Scene Progress Meter Bar at Bottom of Hero */}
        <div className="tiberius-scene-meter" aria-hidden="true">
          <div
            className="tiberius-scene-meter-fill"
            style={{
              width: `${pct}%`,
              backgroundColor: activeTenant.brandColor,
            }}
          />
        </div>

        {/* Right-Side Scroll Progress Rail */}
        <div className="hero-scroll-rail">
          <div className="rail-label">ORBIT</div>
          <div className="rail-track">
            <div
              className="rail-fill"
              style={{
                height: `${pct}%`,
                backgroundColor: activeTenant.brandColor,
              }}
            />
          </div>
          <div className="rail-frame">{formattedFrame}</div>
        </div>

        {/* Embedded Contextual AI Dock (Anchored at Bottom of Hero) */}
        <ContextualAIDock />
      </section>

      {/* TIBERIUS 3-ACTION HELP DOCK (Immediately below hero, recreated from .help-dock) */}
      <div className="tiberius-help-dock-section">
        <div className="tiberius-help-dock">
          <button
            type="button"
            className="help-dock-card glass-panel"
            onClick={() => openHelperModal('chat')}
          >
            <div
              className="help-dock-icon"
              style={{
                backgroundColor: `${activeTenant.brandColor}20`,
                color: activeTenant.brandColor,
              }}
            >
              <MessageSquare size={20} />
            </div>
            <div className="help-dock-copy">
              <strong>Have a project question?</strong>
              <small>Ask Alfred, our live AI assistant + photo scanner</small>
            </div>
            <ArrowUpRight size={16} className="help-dock-arrow" />
          </button>

          <button
            type="button"
            className="help-dock-card glass-panel"
            onClick={() => openHelperModal('quote')}
          >
            <div
              className="help-dock-icon"
              style={{
                backgroundColor: `${activeTenant.brandColor}20`,
                color: activeTenant.brandColor,
              }}
            >
              <FileText size={20} />
            </div>
            <div className="help-dock-copy">
              <strong>Planning a repair or replacement?</strong>
              <small>Start your 3-step guided quote request</small>
            </div>
            <ArrowUpRight size={16} className="help-dock-arrow" />
          </button>

          <button
            type="button"
            className="help-dock-card glass-panel"
            onClick={() => openHelperModal('booking')}
          >
            <div
              className="help-dock-icon"
              style={{
                backgroundColor: `${activeTenant.brandColor}20`,
                color: activeTenant.brandColor,
              }}
            >
              <Calendar size={20} />
            </div>
            <div className="help-dock-copy">
              <strong>Need a closer look on-site?</strong>
              <small>Request an inspection or book a slot</small>
            </div>
            <ArrowUpRight size={16} className="help-dock-arrow" />
          </button>
        </div>
      </div>

      {/* SECTION 1: PRIMARY SERVICES SPLIT + SHINGLE DETAIL + ALGORITHMIC PRICING */}
      <section className="below-fold-section" id="services">
        <div className="below-fold-inner">
          <div className="section-heading-block">
            <span
              className="section-tag"
              style={{ color: activeTenant.brandColor }}
            >
              {activeTenant.niche.toUpperCase()} // {activeTenant.city.toUpperCase()}
            </span>
            <h2>Whatever’s happening up there, start here.</h2>
            <p>
              A leak you can’t ignore. A system you’re ready to replace. Compare transparent local ranges powered by our live contractor JSON config—or click any service to launch a guided estimate.
            </p>
          </div>

          {/* Tiberius Primary Split ("Fix a problem" vs "Plan a new roof") + Shingle Detail Figure */}
          <div className="tiberius-primary-services-layout">
            <div className="primary-services-stack">
              {primaryServices.map((svc, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="tiberius-primary-service-card glass-panel"
                  onClick={() => openHelperModal('quote', svc.name)}
                >
                  <div
                    className="primary-svc-icon"
                    style={{
                      backgroundColor: `${activeTenant.brandColor}20`,
                      color: activeTenant.brandColor,
                    }}
                  >
                    {idx === 0 ? <Wrench size={22} /> : <Home size={22} />}
                  </div>
                  <div className="primary-svc-body">
                    <div className="primary-svc-top">
                      <span className="primary-svc-kicker">
                        {svc.category || (idx === 0 ? 'Fix a problem' : 'Plan a new build')}
                      </span>
                      <span
                        className="primary-svc-price"
                        style={{ color: activeTenant.brandColor }}
                      >
                        {svc.range}
                      </span>
                    </div>
                    <h3>{svc.name}</h3>
                    <p>
                      {svc.description ||
                        `Start with a diagnostic inspection and transparent scope in ${activeTenant.city}.`}
                    </p>
                    <div className="primary-svc-cta">
                      <span>Start {svc.name} quote request</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <figure className="tiberius-material-figure glass-panel">
              <img
                src={detailImgSrc}
                alt="Architectural shingle & flashing detail"
                loading="lazy"
              />
              <figcaption>
                <div>
                  <strong>Every home starts with a structure worth looking after.</strong>
                  <span>
                    {activeTenant.pricingRules.freeInspection
                      ? 'Includes $0 On-Site Structural & Moisture Inspection'
                      : `$${activeTenant.pricingRules.baseDiagnostic} Diagnostic Waived With Repair`}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-xs"
                  onClick={() => openHelperModal('chat')}
                >
                  Ask Assistant ↗
                </button>
              </figcaption>
            </figure>
          </div>

          {/* Supporting Services Grid */}
          {supportingServices.length > 0 && (
            <div className="services-pricing-grid">
              {supportingServices.map((svc, idx) => (
                <div
                  key={idx}
                  className="service-price-card glass-panel clickable-card"
                  onClick={() => openHelperModal('quote', svc.name)}
                >
                  <div className="svc-card-top">
                    <span className="svc-urgency">{svc.urgency}</span>
                    <span className="svc-duration">
                      <Clock size={13} /> {svc.duration}
                    </span>
                  </div>
                  <h3>{svc.name}</h3>
                  {svc.description && (
                    <p className="svc-desc-text">{svc.description}</p>
                  )}
                  <div
                    className="svc-price-range"
                    style={{ color: activeTenant.brandColor }}
                  >
                    {svc.range}
                  </div>
                  <div className="svc-rule-note">
                    <ShieldCheck size={14} className="text-emerald" />
                    <span>Click to start 3-step quote →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="ai-rule-banner glass-panel">
            <div>
              <div className="rule-banner-label">
                ACTIVE ALFRED LLM GUARDRAIL (<code>pricingRules.aiPromptRules</code>)
              </div>
              <p className="rule-banner-text">
                “{activeTenant.pricingRules.aiPromptRules}”
              </p>
            </div>
            <div className="rule-banner-plan">
              <span>Active License Tier:</span>
              <strong style={{ color: activeTenant.brandColor }}>
                {activePlan.name} ({activePlan.priceRange})
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TIBERIUS "LOOK BEYOND THE SHINGLES" STRUCTURAL APPROACH */}
      <section className="tiberius-structural-section" id="approach">
        <div className="below-fold-inner tiberius-structural-grid">
          <figure className="structural-figure glass-panel">
            <img
              src={posterSrc}
              alt="Architectural structural overview"
              loading="lazy"
            />
            <figcaption>
              Full-system inspection · Shingles, flashing, ventilation & decking
            </figcaption>
          </figure>

          <div className="structural-copy">
            <span
              className="section-tag"
              style={{ color: activeTenant.brandColor }}
            >
              LOOK BEYOND THE SURFACE
            </span>
            <h2>
              There’s more protecting your home than the top layer you see.
            </h2>
            <p>
              You don’t need to be a construction expert. Our background in structural diagnostics and exterior systems helps us spot hidden vulnerabilities before they become expensive interior repairs.
            </p>
            <ul className="structural-checklist">
              <li>
                <CheckCircle2 size={16} style={{ color: activeTenant.brandColor }} />
                <span>
                  <strong>Hidden rot & flashing transitions:</strong> Chimney step-flashing, valleys, and wall counter-flashing.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} style={{ color: activeTenant.brandColor }} />
                <span>
                  <strong>Attic ventilation & moisture balance:</strong> Stopping winter ice dams and summer heat bake.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} style={{ color: activeTenant.brandColor }} />
                <span>
                  <strong>Underlayment & plywood roof decking:</strong> Verifying solid nail-holding structure beneath every course.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 3: PROJECT GALLERY & HOMEOWNER TESTIMONIALS (Manchester, Dover, Nottingham) */}
      <section className="below-fold-section" id="proof">
        <div className="below-fold-inner">
          <div className="section-heading-block">
            <span
              className="section-tag"
              style={{ color: activeTenant.brandColor }}
            >
              COMPLETED PROJECTS & HOMEOWNER PROOF
            </span>
            <h2>Good work speaks for itself. So do homeowners.</h2>
            <p>
              Real residential installations paired with verified homeowner feedback and our TOS-safe conversational review engine.
            </p>
          </div>

          <div className="tiberius-proof-grid">
            {defaultProjects.map((proj, idx) => (
              <article key={idx} className="tiberius-project-card glass-panel">
                <div className="project-img-wrap">
                  <img src={proj.image} alt={proj.city} loading="lazy" />
                  <span className="project-city-pill">
                    <MapPin size={12} /> {proj.city}
                  </span>
                </div>
                <div className="project-card-body">
                  <div className="project-scope-label">{proj.scope}</div>
                  <blockquote>
                    <Quote
                      size={14}
                      style={{ color: activeTenant.brandColor }}
                      className="quote-mark"
                    />
                    “{proj.quote}”
                  </blockquote>
                  <div className="project-author">{proj.author}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: "LESS GUESSWORK" ROOF HELPER INVITATION + LOCAL FAQS */}
      <section className="tiberius-helper-invite-section" id="faqs">
        <div className="below-fold-inner">
          <div className="tiberius-invite-banner glass-panel">
            <div className="invite-copy">
              <span
                className="section-tag"
                style={{ color: activeTenant.brandColor }}
              >
                LET’S TALK ABOUT YOUR PROJECT
              </span>
              <h2>Less guesswork. A better first conversation.</h2>
              <p>
                Not sure what to ask? Alfred (our AI roof & exterior helper) can guide you, analyze up to 3 photos, and open a live thread with our estimator in seconds.
              </p>
              <div className="invite-actions">
                <button
                  type="button"
                  className="btn-hero-primary"
                  style={{ backgroundColor: activeTenant.brandColor }}
                  onClick={() => openHelperModal('quote')}
                >
                  <span>Get a Quote (3-Step Wizard)</span>
                  <ArrowUpRight size={15} />
                </button>
                <button
                  type="button"
                  className="btn-hero-secondary glass-pill"
                  onClick={() => openHelperModal('chat')}
                >
                  <MessageSquare size={15} />
                  <span>Ask a Question</span>
                </button>
              </div>
            </div>

            <div className="invite-helper-card">
              <img
                src={helperAvatarSrc}
                alt="Alfred Assistant"
                className="invite-avatar"
              />
              <div>
                <span className="helper-greeting">Hi, homeowner.</span>
                <h4>What can I help you figure out?</h4>
                <button
                  type="button"
                  className="helper-start-link"
                  style={{ color: activeTenant.brandColor }}
                  onClick={() => openHelperModal('chat')}
                >
                  Start a live conversation ↗
                </button>
              </div>
            </div>
          </div>

          {/* Local Service Area + Expandable FAQs */}
          <div className="tiberius-local-faq-grid">
            <div className="local-area-card glass-panel">
              <span
                className="section-tag"
                style={{ color: activeTenant.brandColor }}
              >
                CLOSE TO HOME
              </span>
              <h3>{activeTenant.city}</h3>
              <p>
                Share your ZIP code or street address in our quote wizard to confirm immediate crew coverage and inspection windows.
              </p>
              <div className="local-address-box">
                <strong>{activeTenant.companyName}</strong>
                <span>
                  {activeTenant.addressLine ||
                    `Verified Service Territory · ${activeTenant.city}`}
                </span>
                <span>{activeTenant.phoneDisplay}</span>
              </div>
            </div>

            <div className="faq-accordion-column">
              <h3 className="faq-heading">
                <HelpCircle size={18} style={{ color: activeTenant.brandColor }} />
                <span>Before you reach out — Common Questions</span>
              </h3>
              <div className="faq-list-stack">
                {defaultFaqs.map((item, idx) => (
                  <details
                    key={idx}
                    className="tiberius-faq-item glass-panel"
                    open={idx === 0}
                  >
                    <summary>{item.q}</summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Tiberius Helper Launcher Pill (Bottom-Right) */}
      <button
        type="button"
        className="tiberius-floating-launcher glass-panel"
        onClick={() => openHelperModal('chat')}
        title="Open Alfred Roof & Exterior Assistant"
      >
        <img src={helperAvatarSrc} alt="" className="launcher-avatar" />
        <div className="launcher-text">
          <span>Questions or photos?</span>
          <strong style={{ color: activeTenant.brandColor }}>Ask Alfred ↗</strong>
        </div>
      </button>

      {/* Multi-Mode Tiberius Helper & 3-Step Quote Modal */}
      <TiberiusHelperModal />
    </div>
  )
}
