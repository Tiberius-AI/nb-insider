import { useEffect, useRef, useState } from 'react'
import {
  Sparkles,
  Mic,
  Send,
  Volume2,
  Pause,
  Hand,
  Bot,
  Wand2,
  Star,
  FileEdit,
  Settings2,
  Check,
  X,
  ZoomIn,
} from 'lucide-react'
import { usePlatform } from '../../context/usePlatform'

export default function UnifiedTimeline() {
  const {
    selectedThread,
    activeTenant,
    setThreadHandoffMode,
    approveAlfredDraft,
    dismissAlfredDraft,
    alfredSetup,
    updateAlfredSetup,
    alfredPresets,
    setLightboxPhoto,
    sendHumanMessage,
    updateThreadStatus,
    generateCoPilotSuggestion,
    polishFieldVoiceNote,
    triggerJobCompletedCheckIn,
  } = usePlatform()

  const [composerText, setComposerText] = useState('')
  const [composerChannel, setComposerChannel] = useState('SMS')
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showAlfredSetup, setShowAlfredSetup] = useState(false)
  const [draftEdits, setDraftEdits] = useState({})
  const [rawVoiceText, setRawVoiceText] = useState(
    'tell him we looked at the flashing gap by the brick, we can seal and re-lead it tomorrow at 2pm for 580 bucks'
  )
  const [playingVoicemailId, setPlayingVoicemailId] = useState(null)

  const timelineEndRef = useRef(null)

  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedThread?.id, selectedThread?.messages?.length])

  if (!selectedThread) return null

  const currentHandoff =
    selectedThread.handoffMode || (selectedThread.aiAutopilot ? 'AI' : 'Human')
  const activeDraftText =
    selectedThread.alfredDraft &&
    draftEdits[selectedThread.alfredDraft.id] !== undefined
      ? draftEdits[selectedThread.alfredDraft.id]
      : selectedThread.alfredDraft?.text || ''

  const handleSendHuman = (e) => {
    e.preventDefault()
    if (!composerText.trim()) return
    sendHumanMessage(selectedThread.id, composerText, composerChannel)
    setComposerText('')
  }

  const handleSuggestReply = () => {
    const draft = generateCoPilotSuggestion(selectedThread.id)
    setComposerText(draft)
  }

  const handleConvertVoiceNote = () => {
    const polished = polishFieldVoiceNote(rawVoiceText, selectedThread.id)
    setComposerText(polished)
    setShowVoiceModal(false)
  }

  const spentDollars = (alfredSetup.spentMicros / 1_000_000).toFixed(2)
  const reservedDollars = (alfredSetup.reservedMicros / 1_000_000).toFixed(2)
  const limitDollars = (alfredSetup.limitMicros / 1_000_000).toFixed(2)
  const budgetPct = Math.min(
    100,
    Math.round(
      ((alfredSetup.spentMicros + alfredSetup.reservedMicros) /
        alfredSetup.limitMicros) *
        100
    )
  )

  return (
    <main className="pane-center-timeline">
      {/* Top Header with CRITICAL FEATURE: [ 🤖 AI Autopilot | 📝 Alfred Drafts | ✋ Take Over ] */}
      <div className="timeline-header">
        <div className="timeline-contact-info">
          <div className="timeline-contact-top">
            <h2>{selectedThread.contactName}</h2>
            <span className="timeline-phone-tag">{selectedThread.phone}</span>
            <select
              aria-label="AI Status Pill"
              className={`status-select-pill status-${selectedThread.aiStatus}`}
              value={selectedThread.aiStatus}
              onChange={(e) =>
                updateThreadStatus(selectedThread.id, e.target.value)
              }
            >
              <option value="qualifying">🤖 AI Qualifying</option>
              <option value="ready_for_quote">🟢 Ready for Quote</option>
              <option value="needs_human">🚨 Needs Human</option>
            </select>
          </div>
          <div className="timeline-contact-sub">
            <span>{selectedThread.address}</span>
            {selectedThread.propertyType && (
              <span>
                {' '}
                • {selectedThread.propertyType} ({selectedThread.roofAge || 'Age TBD'})
              </span>
            )}
          </div>
        </div>

        {/* CRITICAL FEATURE: 3-Mode Handoff Toggle (Blueprint Autopilot ON/OFF + Tiberius Draft Mode) */}
        <div className="autopilot-control-group">
          <div
            className={`autopilot-segmented-toggle ${
              selectedThread.aiAutopilot ? 'is-autopilot' : 'is-human'
            }`}
          >
            <button
              type="button"
              className={`seg-btn ${currentHandoff === 'AI' ? 'active-on' : ''}`}
              onClick={() => setThreadHandoffMode(selectedThread.id, 'AI')}
              title="Alfred replies automatically using contractor rules"
            >
              <Bot size={14} />
              <span>
                🤖 AI Autopilot: {currentHandoff === 'AI' ? 'ON' : 'Auto'}
              </span>
            </button>

            <button
              type="button"
              className={`seg-btn ${
                currentHandoff === 'Draft' ? 'active-draft' : ''
              }`}
              onClick={() => setThreadHandoffMode(selectedThread.id, 'Draft')}
              title="Alfred drafts a private reply for you to approve before sending"
            >
              <FileEdit size={13} />
              <span>📝 Alfred Drafts</span>
            </button>

            <button
              type="button"
              className={`seg-btn ${
                currentHandoff === 'Human' ? 'active-takeover' : ''
              }`}
              onClick={() => setThreadHandoffMode(selectedThread.id, 'Human')}
              title="Pause AI Autopilot and handle this conversation yourself"
            >
              <Hand size={14} />
              <span>✋ Take Over</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-job-complete-trigger"
            onClick={() => setShowAlfredSetup((prev) => !prev)}
            title="Configure 'Make Alfred Your Own' presets & AI budget"
          >
            <Settings2 size={13} />
            <span>Alfred Setup</span>
          </button>

          <button
            type="button"
            className="btn-job-complete-trigger"
            onClick={() => triggerJobCompletedCheckIn(selectedThread.id)}
            title="Trigger TOS-Safe Job Completed Review Check-In SMS"
          >
            <Star size={13} />
            <span>Job Completed</span>
          </button>
        </div>
      </div>

      {/* Tiberius "Make Alfred Your Own" 4-Preset Setup Drawer + AI Budget Meter (Recreated from owner-setup.mjs) */}
      {showAlfredSetup && (
        <div className="alfred-setup-drawer">
          <div className="alfred-setup-header">
            <div>
              <span
                className="section-tag"
                style={{ color: activeTenant.brandColor }}
              >
                MAKE ALFRED YOUR OWN // DEFAULT CO-PILOT BEHAVIOR
              </span>
              <h4>How should Alfred handle new homeowner inquiries?</h4>
            </div>
            <div className="alfred-budget-pill">
              <span>
                AI Budget: <strong>${spentDollars}</strong> used • ${reservedDollars}{' '}
                reserved / ${limitDollars}
              </span>
              <div className="budget-bar-track">
                <div
                  className="budget-bar-fill"
                  style={{
                    width: `${budgetPct}%`,
                    backgroundColor: activeTenant.brandColor,
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              className="icon-close-btn"
              onClick={() => setShowAlfredSetup(false)}
            >
              <X size={15} />
            </button>
          </div>

          <div className="alfred-presets-grid">
            {alfredPresets.map((preset) => {
              const isSelected = alfredSetup.preset === preset.id
              return (
                <label
                  key={preset.id}
                  className={`alfred-preset-card ${isSelected ? 'selected' : ''}`}
                  style={
                    isSelected
                      ? { borderColor: activeTenant.brandColor }
                      : undefined
                  }
                >
                  <input
                    type="radio"
                    name="alfredPreset"
                    checked={isSelected}
                    onChange={() => updateAlfredSetup(preset.id)}
                  />
                  <div>
                    <div className="preset-title-row">
                      <strong>{preset.label}</strong>
                      <span className="preset-mode-tag">
                        {preset.defaultHandoff}
                      </span>
                    </div>
                    <p>{preset.description}</p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Autopilot / Handoff Guardrail Status Banner */}
      <div
        className={`autopilot-guardrail-bar ${
          selectedThread.aiAutopilot ? 'bar-on' : 'bar-off'
        }`}
      >
        {currentHandoff === 'AI' && (
          <span>
            <strong>🤖 AI Autopilot Active (“Alfred replies”):</strong> Qualifying &
            quoting via <code>{activeTenant.companyName}</code> rules.{' '}
            <em>
              (Typing & sending a manual message below automatically flips to ✋ Human Takeover.)
            </em>
          </span>
        )}
        {currentHandoff === 'Draft' && (
          <span>
            <strong>📝 AI Draft-First Active (“Alfred drafts”):</strong> Alfred
            prepares private replies below and waits for your approval before texting the customer.
          </span>
        )}
        {currentHandoff === 'Human' && (
          <span>
            <strong>✋ Human-in-the-Loop Active (Autopilot OFF):</strong> Alfred is
            paused on this thread so you and the AI never talk over each other.
          </span>
        )}
      </div>

      {/* Chronological Multi-Channel Stream */}
      <div className="timeline-messages-stream">
        {selectedThread.messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div
                key={msg.id}
                className={`timeline-system-event event-${msg.eventType || 'info'}`}
              >
                <span>{msg.text}</span>
                <span className="sys-time">{msg.timestamp}</span>
              </div>
            )
          }

          const isCustomer = msg.sender === 'customer'
          const isAI = msg.sender === 'ai'

          return (
            <div
              key={msg.id}
              className={`timeline-msg-row ${
                isCustomer ? 'row-customer' : 'row-outbound'
              }`}
            >
              <div
                className={`timeline-bubble ${
                  isCustomer
                    ? 'bubble-customer'
                    : isAI
                    ? 'bubble-ai'
                    : 'bubble-human'
                }`}
                style={
                  !isCustomer && !isAI
                    ? { borderColor: activeTenant.brandColor }
                    : undefined
                }
              >
                <div className="bubble-meta-top">
                  <span className="sender-badge">
                    {isCustomer
                      ? `👤 ${selectedThread.contactName}`
                      : isAI
                      ? `🤖 Alfred · ${activeTenant.companyName} AI`
                      : `👷‍♂️ Human Operator (${activeTenant.companyName})`}
                  </span>
                  <span className="channel-pill-mini">{msg.channel}</span>
                  <span className="msg-time">{msg.timestamp}</span>
                </div>

                {/* Audio Voicemail Player (if present) */}
                {msg.voicemail && (
                  <div className="voicemail-card">
                    <div className="voicemail-controls">
                      <button
                        type="button"
                        className="vm-play-btn"
                        style={{ backgroundColor: activeTenant.brandColor }}
                        onClick={() =>
                          setPlayingVoicemailId(
                            playingVoicemailId === msg.id ? null : msg.id
                          )
                        }
                      >
                        {playingVoicemailId === msg.id ? (
                          <Pause size={14} />
                        ) : (
                          <Volume2 size={14} />
                        )}
                      </button>
                      <div className="vm-waveform">
                        {[38, 65, 90, 52, 84, 95, 44, 72, 60, 88, 50, 76, 40, 68].map(
                          (h, idx) => (
                            <span
                              key={idx}
                              className={`wave-bar ${
                                playingVoicemailId === msg.id ? 'animating' : ''
                              }`}
                              style={{
                                height: `${h}%`,
                                backgroundColor:
                                  playingVoicemailId === msg.id
                                    ? activeTenant.brandColor
                                    : undefined,
                              }}
                            />
                          )
                        )}
                      </div>
                      <span className="vm-duration">{msg.voicemail.duration}</span>
                    </div>
                    <div className="vm-transcript">{msg.voicemail.transcript}</div>
                  </div>
                )}

                {/* Uploaded Customer Damage Photo — Clickable for Lightbox (from conversation-photos.mjs) */}
                {msg.photoUrl && (
                  <div
                    className="timeline-photo-attachment clickable-photo"
                    onClick={() =>
                      setLightboxPhoto({
                        url: msg.photoUrl,
                        caption:
                          msg.photoCaption ||
                          `${selectedThread.contactName} Project Photo`,
                      })
                    }
                    title="Click to enlarge photo in inspection lightbox"
                  >
                    <img
                      src={msg.photoUrl}
                      alt={msg.photoCaption || 'Customer upload'}
                    />
                    <div className="photo-caption-bar">
                      <Sparkles
                        size={12}
                        style={{ color: activeTenant.brandColor }}
                      />
                      <span>{msg.photoCaption || 'Customer Inspection Photo'}</span>
                      <ZoomIn size={12} className="photo-zoom-icon" />
                    </div>
                  </div>
                )}

                <p className="bubble-text">{msg.text}</p>
              </div>
            </div>
          )
        })}
        <div ref={timelineEndRef} />
      </div>

      {/* Tiberius Private Alfred Draft Approval Box (#alfred-draft from owner.mjs) */}
      {selectedThread.alfredDraft && (
        <div className="alfred-private-draft-card">
          <div className="alfred-draft-top">
            <div className="alfred-draft-badge">
              <Sparkles size={13} style={{ color: activeTenant.brandColor }} />
              <strong>ALFRED PRIVATE DRAFT (AWAITING OWNER APPROVAL)</strong>
              <span>• {selectedThread.alfredDraft.createdAt}</span>
            </div>
            <span className="alfred-draft-reason">
              {selectedThread.alfredDraft.reason}
            </span>
          </div>
          <textarea
            aria-label="Review or edit Alfred's draft before sending"
            className="alfred-draft-textarea"
            rows={2}
            value={activeDraftText}
            onChange={(e) =>
              setDraftEdits((prev) => ({
                ...prev,
                [selectedThread.alfredDraft.id]: e.target.value,
              }))
            }
          />
          <div className="alfred-draft-actions">
            <button
              type="button"
              className="btn-xs-primary"
              disabled={!activeDraftText.trim()}
              style={{
                backgroundColor: '#283e34',
                color: '#ffffff',
                opacity: activeDraftText.trim() ? 1 : 0.55,
              }}
              onClick={() => {
                if (!activeDraftText.trim()) return
                approveAlfredDraft(selectedThread.id, activeDraftText)
              }}
            >
              <Check size={13} /> Approve &amp; Send to Homeowner
            </button>
            <button
              type="button"
              className="btn-xs-outline"
              onClick={() => {
                setComposerText(activeDraftText)
                dismissAlfredDraft(selectedThread.id)
              }}
            >
              <FileEdit size={13} /> Move to Composer
            </button>
            <button
              type="button"
              className="btn-xs-outline"
              onClick={() => dismissAlfredDraft(selectedThread.id)}
            >
              <X size={13} /> Dismiss Draft
            </button>
          </div>
        </div>
      )}

      {/* Field Voice-Note-to-Polished-SMS Drawer */}
      {showVoiceModal && (
        <div className="voice-whisper-drawer">
          <div className="voice-drawer-top">
            <div className="voice-title">
              <Mic size={15} style={{ color: activeTenant.brandColor }} />
              <strong>Field Voice-Note → Polished Client SMS</strong>
            </div>
            <span className="voice-hint">
              Speak or type rough field notes from the truck/roof:
            </span>
          </div>
          <textarea
            className="voice-raw-input"
            rows={2}
            value={rawVoiceText}
            onChange={(e) => setRawVoiceText(e.target.value)}
          />
          <div className="voice-drawer-actions">
            <button
              type="button"
              className="btn-xs-outline"
              onClick={() => setShowVoiceModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-xs-primary"
              style={{ backgroundColor: activeTenant.brandColor }}
              onClick={handleConvertVoiceNote}
            >
              <Wand2 size={13} /> Polish into Client SMS
            </button>
          </div>
        </div>
      )}

      {/* Composer with Co-Pilot Whisper + Auto-Autopilot-Off Human Send */}
      <form className="timeline-composer" onSubmit={handleSendHuman}>
        <div className="composer-copilot-bar">
          <div className="copilot-left">
            <button
              type="button"
              className="btn-copilot-whisper"
              onClick={handleSuggestReply}
            >
              <Sparkles size={14} style={{ color: activeTenant.brandColor }} />
              <span>✨ Suggest Reply (Co-Pilot Whisper)</span>
            </button>

            <button
              type="button"
              className="btn-copilot-voice"
              onClick={() => setShowVoiceModal((prev) => !prev)}
            >
              <Mic size={14} />
              <span>🎙️ Voice-Note to Polished SMS</span>
            </button>
          </div>

          <div className="composer-channel-selector">
            <span>Channel:</span>
            <select
              aria-label="Reply Channel"
              value={composerChannel}
              onChange={(e) => setComposerChannel(e.target.value)}
            >
              <option value="SMS">SMS ({activeTenant.phoneDisplay})</option>
              <option value="Webchat">Webchat</option>
            </select>
          </div>
        </div>

        <div className="composer-input-row">
          <textarea
            className="composer-textarea"
            rows={2}
            placeholder={
              selectedThread.aiAutopilot
                ? 'Type a human reply (sending automatically flips 🤖 AI Autopilot to OFF)...'
                : 'Type your reply to the homeowner...'
            }
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendHuman(e)
              }
            }}
          />
          <button
            type="submit"
            className="btn-composer-send"
            style={{ backgroundColor: activeTenant.brandColor }}
          >
            <Send size={15} />
            <span>
              {selectedThread.aiAutopilot ? 'Send & Pause AI' : 'Send Reply'}
            </span>
          </button>
        </div>
      </form>
    </main>
  )
}
