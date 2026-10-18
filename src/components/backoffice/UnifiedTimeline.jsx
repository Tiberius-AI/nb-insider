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
} from 'lucide-react'
import { usePlatform } from '../../context/usePlatform'

export default function UnifiedTimeline() {
  const {
    selectedThread,
    activeTenant,
    toggleAutopilot,
    sendHumanMessage,
    updateThreadStatus,
    generateCoPilotSuggestion,
    polishFieldVoiceNote,
    triggerJobCompletedCheckIn,
  } = usePlatform()

  const [composerText, setComposerText] = useState('')
  const [composerChannel, setComposerChannel] = useState('SMS')
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [rawVoiceText, setRawVoiceText] = useState(
    'tell him we looked at the flashing gap by the brick, we can seal and re-lead it tomorrow at 2pm for 580 bucks'
  )
  const [playingVoicemailId, setPlayingVoicemailId] = useState(null)

  const timelineEndRef = useRef(null)

  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedThread?.id, selectedThread?.messages?.length])

  if (!selectedThread) return null

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

  return (
    <main className="pane-center-timeline">
      {/* Top Header with CRITICAL FEATURE: [ ðŸ¤– AI Autopilot: ON | âœ‹ Take Over ] */}
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
              <option value="qualifying">ðŸ¤– AI Qualifying</option>
              <option value="ready_for_quote">ðŸŸ¢ Ready for Quote</option>
              <option value="needs_human">ðŸš¨ Needs Human</option>
            </select>
          </div>
          <div className="timeline-contact-sub">
            <span>{selectedThread.address}</span>
          </div>
        </div>

        {/* CRITICAL FEATURE: Top Header Toggle [ ðŸ¤– AI Autopilot: ON | âœ‹ Take Over ] */}
        <div className="autopilot-control-group">
          <div
            className={`autopilot-segmented-toggle ${
              selectedThread.aiAutopilot ? 'is-autopilot' : 'is-human'
            }`}
          >
            <button
              type="button"
              className={`seg-btn ${selectedThread.aiAutopilot ? 'active-on' : ''}`}
              onClick={() => toggleAutopilot(selectedThread.id, true)}
            >
              <Bot size={14} />
              <span>ðŸ¤– AI Autopilot: {selectedThread.aiAutopilot ? 'ON' : 'OFF'}</span>
            </button>
            <button
              type="button"
              className={`seg-btn ${!selectedThread.aiAutopilot ? 'active-takeover' : ''}`}
              onClick={() => toggleAutopilot(selectedThread.id, false)}
            >
              <Hand size={14} />
              <span>âœ‹ Take Over</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-job-complete-trigger"
            onClick={() => triggerJobCompletedCheckIn(selectedThread.id)}
            title="Trigger TOS-Safe Job Completed Review Check-In SMS"
          >
            <Star size={13} />
            <span>Job Completed Check-In</span>
          </button>
        </div>
      </div>

      {/* Autopilot Guardrail Status Banner */}
      <div
        className={`autopilot-guardrail-bar ${
          selectedThread.aiAutopilot ? 'bar-on' : 'bar-off'
        }`}
      >
        {selectedThread.aiAutopilot ? (
          <span>
            <strong>ðŸ¤– AI Autopilot Active:</strong> Qualifying & quoting via{' '}
            <code>{activeTenant.companyName}</code> rules.{' '}
            <em>
              (Typing & sending a manual message below will automatically flip Autopilot to OFF.)
            </em>
          </span>
        ) : (
          <span>
            <strong>âœ‹ Human-in-the-Loop Active (Autopilot OFF):</strong> AI is silenced on this thread so you and the AI never talk over each other.
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
                      ? `ðŸ‘¤ ${selectedThread.contactName}`
                      : isAI
                      ? `ðŸ¤– ${activeTenant.companyName} AI`
                      : `ðŸ‘·â€â™‚ï¸ Human Operator (${activeTenant.companyName})`}
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

                {/* Uploaded Customer Damage Photo (if present) */}
                {msg.photoUrl && (
                  <div className="timeline-photo-attachment">
                    <img src={msg.photoUrl} alt={msg.photoCaption || 'Customer upload'} />
                    {msg.photoCaption && (
                      <div className="photo-caption-bar">
                        <Sparkles size={12} style={{ color: activeTenant.brandColor }} />
                        <span>{msg.photoCaption}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="bubble-text">{msg.text}</p>
              </div>
            </div>
          )
        })}
        <div ref={timelineEndRef} />
      </div>

      {/* Field Voice-Note-to-Polished-SMS Drawer */}
      {showVoiceModal && (
        <div className="voice-whisper-drawer glass-panel">
          <div className="voice-drawer-top">
            <div className="voice-title">
              <Mic size={15} style={{ color: activeTenant.brandColor }} />
              <strong>Field Voice-Note â†’ Polished Client SMS</strong>
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
              <span>âœ¨ Suggest Reply (Co-Pilot Whisper)</span>
            </button>

            <button
              type="button"
              className="btn-copilot-voice"
              onClick={() => setShowVoiceModal((prev) => !prev)}
            >
              <Mic size={14} />
              <span>ðŸŽ™ï¸ Voice-Note to Polished SMS</span>
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
                ? 'Type a human reply (sending automatically flips ðŸ¤– AI Autopilot to OFF)...'
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
              {selectedThread.aiAutopilot
                ? 'Send & Pause AI'
                : 'Send Reply'}
            </span>
          </button>
        </div>
      </form>
    </main>
  )
}
