import { useState } from 'react'
import {
  PhoneMissed,
  Star,
  ShieldCheck,
  ThumbsUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { usePlatform } from '../../context/usePlatform'

export default function WorkflowsLabView() {
  const {
    activeTenant,
    threads,
    selectedThread,
    selectThread,
    triggerMissedCallRescue,
    triggerJobCompletedCheckIn,
    simulateCustomerReviewReply,
    setActiveView,
  } = usePlatform()

  // Missed-Call Rescue Simulator state
  const [callerName, setCallerName] = useState('Jordan Miller')
  const [callerPhone, setCallerPhone] = useState('(512) 814-2905')
  const [callerAddress, setCallerAddress] = useState(
    `3408 South Congress Ave, ${activeTenant.city}`
  )

  // TOS-Safe Review Sentiment Simulator state
  const [customCustomerReply, setCustomCustomerReply] = useState(
    'The crew showed up right on time, fixed the flashing leak, and left the yard spotless!'
  )

  const handleFireMissedCall = (e) => {
    e.preventDefault()
    triggerMissedCallRescue({
      callerName,
      callerPhone,
      callerAddress,
    })
  }

  const handleRunCustomSentiment = (e) => {
    e.preventDefault()
    if (!customCustomerReply.trim()) return
    simulateCustomerReviewReply(selectedThread.id, customCustomerReply, null)
  }

  return (
    <div className="workflows-lab-container">
      <div className="workflows-header-banner glass-panel">
        <div>
          <span
            className="section-tag"
            style={{ color: activeTenant.brandColor }}
          >
            PILLAR 3 // AUTOMATED SMS & REPUTATION ENGINE
          </span>
          <h2>
            Missed-Call Rescue & TOS-Safe Conversational Review Workflows
          </h2>
          <p>
            Every trigger below executes live against the{' '}
            <strong>3-Pane Unified Conversation Room</strong> for{' '}
            <strong>{activeTenant.companyName}</strong> ({activeTenant.city}).
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          style={{ backgroundColor: activeTenant.brandColor }}
          onClick={() => setActiveView('backoffice')}
        >
          <span>Open 3-Pane Conversation Room</span>
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="workflows-two-col">
        {/* WORKFLOW 1: Missed-Call Rescue Engine */}
        <div className="workflow-card glass-panel">
          <div className="wf-card-header">
            <div
              className="wf-icon-box"
              style={{
                backgroundColor: `${activeTenant.brandColor}22`,
                color: activeTenant.brandColor,
              }}
            >
              <PhoneMissed size={20} />
            </div>
            <div>
              <span className="wf-eyebrow">WORKFLOW 01 // ZERO LEAD LEAKAGE</span>
              <h3>Instant Missed-Call Rescue SMS</h3>
            </div>
          </div>

          <p className="wf-description">
            78% of homeowners hire the first contractor who responds. When a crew is on a ladder or under a house and misses a call, our webhook fires a natural conversational SMS in <strong>1.4 seconds</strong>.
          </p>

          <div className="sms-preview-box">
            <div className="sms-preview-label">
              LIVE AUTO-SMS TEMPLATE ({activeTenant.phoneDisplay})
            </div>
            <p>
              “Hey {callerName.split(' ')[0] || 'there'}! Sorry we missed your call at{' '}
              <strong>{activeTenant.companyName}</strong> ({activeTenant.city})—our crews are up on a job right now. How can we help today? Feel free to reply here or snap a photo of your project for an instant ballpark quote!”
            </p>
          </div>

          <form className="wf-form" onSubmit={handleFireMissedCall}>
            <div className="wf-form-row">
              <div className="wf-field">
                <label>Inbound Caller Name</label>
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                />
              </div>
              <div className="wf-field">
                <label>Caller Mobile #</label>
                <input
                  type="text"
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="wf-field">
              <label>Caller Service Address / Territory</label>
              <input
                type="text"
                value={callerAddress}
                onChange={(e) => setCallerAddress(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-wf-trigger"
              style={{ backgroundColor: activeTenant.brandColor }}
            >
              <PhoneMissed size={15} />
              <span>📞 Simulate Missed Call & Fire Rescue SMS</span>
            </button>
          </form>
        </div>

        {/* WORKFLOW 2: TOS-Safe Conversational Review Engine */}
        <div className="workflow-card glass-panel">
          <div className="wf-card-header">
            <div
              className="wf-icon-box"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.16)',
                color: '#10b981',
              }}
            >
              <Star size={20} />
            </div>
            <div>
              <span className="wf-eyebrow">
                WORKFLOW 02 // FTC & GOOGLE TOS COMPLIANT
              </span>
              <h3>Conversational Review Engine (No Illegal Star-Gating)</h3>
            </div>
          </div>

          <p className="wf-description">
            Traditional “1–5 star funnel” web pages violate Google & FTC rules. Instead, we send a natural post-job SMS check-in and use <strong>AI Sentiment Analysis</strong> to either share your direct Google link or escalate issues to <code>🚨 Needs Human</code> privately.
          </p>

          {/* Select Target Customer Thread */}
          <div className="wf-field">
            <label>Select Active Customer Thread to Test:</label>
            <select
              aria-label="Target Customer Thread"
              className="wf-select"
              value={selectedThread?.id}
              onChange={(e) => selectThread(e.target.value)}
            >
              {threads.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.contactName} ({t.phone}) — {t.jobSummary.serviceNeeded}
                </option>
              ))}
            </select>
          </div>

          {/* Step 1: Send Natural Check-in */}
          <div className="review-step-box">
            <div className="step-box-header">
              <strong>Step 1: Trigger “Job Completed” Natural Check-In</strong>
              <span className="step-badge">SMS Trigger</span>
            </div>
            <p className="step-quote">
              “Hi {selectedThread?.contactName.split(' ')[0]}! Thanks again for trusting{' '}
              {activeTenant.companyName} today. How did everything go with the crew?”
            </p>
            <button
              type="button"
              className="btn-secondary-full"
              onClick={() => triggerJobCompletedCheckIn(selectedThread.id)}
            >
              <CheckCircle2 size={14} />
              <span>Send “How did everything go today?” Check-In SMS</span>
            </button>
          </div>

          {/* Step 2: Simulate Customer Reply & AI Sentiment Routing */}
          <div className="review-step-box">
            <div className="step-box-header">
              <strong>Step 2: AI Sentiment Analysis & Automatic Routing</strong>
              <span className="step-badge">LLM Classifier</span>
            </div>

            <div className="preset-sentiment-btns">
              <button
                type="button"
                className="btn-preset-pos"
                onClick={() =>
                  simulateCustomerReviewReply(selectedThread.id, '', 'positive')
                }
              >
                <ThumbsUp size={14} />
                <div>
                  <strong>Simulate Positive Reply</strong>
                  <span>Routes direct Google Review link</span>
                </div>
              </button>

              <button
                type="button"
                className="btn-preset-neg"
                onClick={() =>
                  simulateCustomerReviewReply(selectedThread.id, '', 'negative')
                }
              >
                <AlertTriangle size={14} />
                <div>
                  <strong>Simulate Negative / Issue Reply</strong>
                  <span>Flips to 🚨 Needs Human & pauses AI</span>
                </div>
              </button>
            </div>

            <form className="custom-sentiment-form" onSubmit={handleRunCustomSentiment}>
              <label>Or type any custom homeowner reply to test live AI classification:</label>
              <div className="custom-sentiment-row">
                <input
                  type="text"
                  value={customCustomerReply}
                  onChange={(e) => setCustomCustomerReply(e.target.value)}
                  placeholder="e.g., Crew was super polite! OR They left nails in the driveway..."
                />
                <button
                  type="submit"
                  className="btn-classify"
                  style={{ backgroundColor: activeTenant.brandColor }}
                >
                  <Sparkles size={14} />
                  <span>Analyze & Route</span>
                </button>
              </div>
            </form>
          </div>

          <div className="tos-compliance-note">
            <ShieldCheck size={16} className="text-emerald" />
            <span>
              <strong>Why this is 100% TOS-Safe:</strong> We never block or hide a review form behind a star-rating gate. Asking a conversational customer service question via SMS and offering a direct Google link or human manager follow-up keeps your Google Business Profile safe.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
