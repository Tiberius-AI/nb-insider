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
} from 'lucide-react'
import { usePlatform } from '../../context/usePlatform'
import { renderScrubFrame } from '../../utils/wireframeOrbitRenderer'
import ContextualAIDock from './ContextualAIDock'

gsap.registerPlugin(ScrollTrigger)

const TOTAL_FRAMES = 150

export default function ClientWebsiteView() {
  const { activeTenant, activePlan, triggerMissedCallRescue } = usePlatform()

  const heroPinRef = useRef(null)
  const canvasRef = useRef(null)
  const customFramesRef = useRef([])
  const frameStateRef = useRef({ frame: 0 })

  const [currentFrame, setCurrentFrame] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [loadedWebpCount, setLoadedWebpCount] = useState(0)
  const [showPipelineDrawer, setShowPipelineDrawer] = useState(false)

  const folderInputRef = useRef(null)

  // Attempt to preload .webp frames from public /sequences/<tenant>/frame_0001.webp
  // while gracefully falling back to the 150-frame procedural 3D wireframe orbit
  useEffect(() => {
    let cancelled = false
    const frames = new Array(TOTAL_FRAMES)
    let loadedCount = 0

    // Probe frame_0001.webp first to avoid 150 404s if sequence folder isn't dropped in yet
    const probeImg = new Image()
    const basePath = activeTenant.frameSequence?.basePath || '/sequences/default/frame_'
    probeImg.src = `${basePath}0001.webp`

    probeImg.onload = () => {
      if (cancelled) return
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image()
        const padded = String(i + 1).padStart(4, '0')
        img.src = `${basePath}${padded}.webp`
        img.onload = () => {
          if (cancelled) return
          loadedCount += 1
          frames[i] = img
          customFramesRef.current = frames
          if (loadedCount === 1 || loadedCount % 25 === 0 || loadedCount === TOTAL_FRAMES) {
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

  // Allow user to load local .webp sequence files directly from disk for instant testing
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
      img.src = url
      img.onload = () => {
        count += 1
        frames[idx] = img
        customFramesRef.current = frames
        setLoadedWebpCount(count)
      }
    })
  }

  // Draw current frame whenever frame index, tenant, or viewport changes
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
      renderScrubFrame(
        ctx,
        rect.width,
        rect.height,
        frameStateRef.current.frame,
        TOTAL_FRAMES,
        activeTenant,
        customFramesRef.current
      )
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTenant, currentFrame, loadedWebpCount])

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
  }, [activeTenant.id])

  const formattedFrame = String(currentFrame + 1).padStart(3, '0')
  const pct = Math.round(scrollProgress * 100)

  return (
    <div className="client-website-container">
      {/* Pinned GSAP Scroll-Scrubbing Hero Section */}
      <section ref={heroPinRef} className="scrub-hero-section">
        <canvas ref={canvasRef} className="scrub-hero-canvas" />

        {/* Subtle Top Contractor Brand Header inside Hero */}
        <div className="hero-overlay-header">
          <div className="contractor-badge glass-pill">
            <span
              className="contractor-dot"
              style={{ backgroundColor: activeTenant.brandColor }}
            />
            <strong>{activeTenant.companyName}</strong>
            <span className="divider">â€¢</span>
            <span>{activeTenant.city}</span>
            <span className="divider">â€¢</span>
            <span className="niche-tag">{activeTenant.niche}</span>
          </div>

          <div className="hero-telemetry-pills">
            <div className="telemetry-pill glass-pill">
              <span className="mono-label">GSAP SCRUB: 0.4s</span>
              <span className="divider">|</span>
              <span
                className="mono-highlight"
                style={{ color: activeTenant.brandColor }}
              >
                FRAME {formattedFrame} / {TOTAL_FRAMES} ({pct}%)
              </span>
            </div>

            <button
              type="button"
              className="telemetry-pill glass-pill clickable"
              onClick={() => setShowPipelineDrawer((prev) => !prev)}
            >
              <Terminal size={13} />
              <span>
                {loadedWebpCount > 0
                  ? `.WEBP SEQUENCE (${loadedWebpCount}/${TOTAL_FRAMES})`
                  : '3D WIREFRAME FALLBACK (FFMPEG PIPELINE)'}
              </span>
            </button>

            <button
              type="button"
              className="telemetry-pill glass-pill clickable rescue-btn"
              onClick={() => triggerMissedCallRescue()}
              title="Simulate a customer calling and triggering Missed-Call Rescue SMS"
            >
              <PhoneCall size={13} />
              <span>Test Missed Call ({activeTenant.phoneDisplay})</span>
            </button>
          </div>
        </div>

        {/* FFmpeg .webp Pipeline & Sequence Uploader Popover */}
        {showPipelineDrawer && (
          <div className="pipeline-drawer glass-panel">
            <div className="pipeline-drawer-top">
              <strong>Higgsfield 5s Orbit â†’ 150-Frame .webp Video Pipeline</strong>
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
              Extract 150 ultra-lightweight <code>.webp</code> frames from any 5-second 30fps Higgsfield camera orbit MP4:
            </p>
            <pre className="ffmpeg-code">
              {`ffmpeg -i higgsfield_orbit_5s.mp4 -vf "fps=30,scale=1920:-1:flags=lanczos" -c:v libwebp -lossless 0 -compression_level 6 -q:v 78 public${activeTenant.frameSequence?.basePath}0%03d.webp`}
            </pre>
          </div>
        )}

        {/* Intro Hero Headline (Fades out smoothly as user begins scrubbing) */}
        <div
          className="hero-center-headline"
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 5.2),
            transform: `translateY(${-scrollProgress * 90}px)`,
            pointerEvents: scrollProgress > 0.18 ? 'none' : 'auto',
          }}
        >
          <div className="eyebrow-pill" style={{ borderColor: activeTenant.brandColor }}>
            <Sparkles size={13} style={{ color: activeTenant.brandColor }} />
            <span>{activeTenant.frameSequence?.cameraLabel}</span>
          </div>
          <h1>
            {activeTenant.companyName}
            <span
              className="headline-accent"
              style={{ color: activeTenant.brandColor }}
            >
              {' '}
              â€” Instant AI Scope & Pricing in {activeTenant.city}
            </span>
          </h1>
          <p>
            Scroll to scrub our 150-frame 3D inspection orbit, or drop a project photo in the AI Dock below for an instant SMS quote.
          </p>
          <div className="scroll-cue">
            <ArrowDown size={15} />
            <span>Scroll to Scrub 150-Frame Camera Orbit ({pct}%)</span>
          </div>
        </div>

        {/* Choreographed Glassmorphic Value Callouts */}
        <div className="choreographed-callouts-layer">
          {activeTenant.callouts.map((callout) => {
            const isVisible =
              scrollProgress >= callout.startProgress &&
              scrollProgress <= callout.endProgress

            // Calculate smooth bell-curve opacity inside the callout window
            const windowSpan = callout.endProgress - callout.startProgress
            const localProgress =
              (scrollProgress - callout.startProgress) / windowSpan
            const opacity = isVisible
              ? Math.min(
                  1,
                  Math.sin(Math.max(0, Math.min(1, localProgress)) * Math.PI) * 1.65
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
                  borderColor: isVisible ? `${activeTenant.brandColor}66` : undefined,
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

      {/* Below-the-Fold Multi-Tenant Algorithmic Pricing & Platform Value Section */}
      <section className="below-fold-section">
        <div className="below-fold-inner">
          <div className="section-heading-block">
            <span
              className="section-tag"
              style={{ color: activeTenant.brandColor }}
            >
              MULTI-TENANT JSON PRICING ENGINE // {activeTenant.city.toUpperCase()}
            </span>
            <h2>
              Transparent {activeTenant.niche} Menu for {activeTenant.companyName}
            </h2>
            <p>
              Driven by <code>pricingRules</code> in our single contractor JSON configâ€”powering both website visitors and the AI Co-Pilot in the 3-Pane Back-Office.
            </p>
          </div>

          <div className="services-pricing-grid">
            {activeTenant.pricingRules.services.map((svc, idx) => (
              <div key={idx} className="service-price-card glass-panel">
                <div className="svc-card-top">
                  <span className="svc-urgency">{svc.urgency}</span>
                  <span className="svc-duration">
                    <Clock size={13} /> {svc.duration}
                  </span>
                </div>
                <h3>{svc.name}</h3>
                <div
                  className="svc-price-range"
                  style={{ color: activeTenant.brandColor }}
                >
                  {svc.range}
                </div>
                <div className="svc-rule-note">
                  <ShieldCheck size={14} className="text-emerald" />
                  <span>
                    {activeTenant.pricingRules.freeInspection
                      ? 'Includes $0 Drone & Thermal Moisture Check'
                      : `$${activeTenant.pricingRules.baseDiagnostic} Diagnostic Waived With Repair`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="ai-rule-banner glass-panel">
            <div>
              <div className="rule-banner-label">
                ACTIVE LLM GUARDRAIL PROMPT (<code>pricingRules.aiPromptRules</code>)
              </div>
              <p className="rule-banner-text">
                â€œ{activeTenant.pricingRules.aiPromptRules}â€
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
    </div>
  )
}
