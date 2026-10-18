import { useState } from 'react'
import {
  Sparkles,
  MessageSquare,
  Workflow,
  Settings2,
  Building2,
  CheckCircle2,
  AlertTriangle,
  X,
  Code2,
  ArrowRight,
  Layers,
} from 'lucide-react'
import { usePlatform } from '../../context/usePlatform'

export default function PlatformTopBar() {
  const {
    platformPlans,
    activePlan,
    activePlanId,
    setActivePlanId,
    tenants,
    activeTenant,
    setActiveTenantId,
    updateActiveTenantConfig,
    activeView,
    setActiveView,
    threads,
    toastNotification,
    setToastNotification,
  } = usePlatform()

  const [showConfigModal, setShowConfigModal] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')

  const unreadTotal = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0)
  const needsHumanCount = threads.filter((t) => t.aiStatus === 'needs_human').length

  const openConfigDrawer = () => {
    const editableSubset = {
      companyName: activeTenant.companyName,
      niche: activeTenant.niche,
      city: activeTenant.city,
      brandColor: activeTenant.brandColor,
      phoneDisplay: activeTenant.phoneDisplay,
      pricingRules: activeTenant.pricingRules,
    }
    setJsonText(JSON.stringify(editableSubset, null, 2))
    setJsonError('')
    setShowConfigModal(true)
  }

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText)
      if (!parsed.companyName || !parsed.brandColor || !parsed.city) {
        setJsonError('Config must include companyName, brandColor, and city.')
        return
      }
      updateActiveTenantConfig(parsed)
      setShowConfigModal(false)
    } catch (err) {
      setJsonError(`Invalid JSON: ${err.message}`)
    }
  }

  return (
    <>
      <header className="platform-topbar">
        <div className="topbar-left">
          <div className="platform-brand">
            <span
              className="brand-dot"
              style={{ backgroundColor: activeTenant.brandColor }}
            />
            <div>
              <div className="platform-title">
                HIGGSFIELD <span className="text-muted">//</span> CONTRACTOR AI OS
              </div>
              <div className="platform-subtitle">
                Proprietary GHL-Replacement Engine •{' '}
                <strong style={{ color: activeTenant.brandColor }}>
                  {activePlan.name.split(' ')[0]} ({activePlan.priceRange})
                </strong>
              </div>
            </div>
          </div>

          <div className="tenant-selector-wrap">
            <Building2 size={14} className="icon-muted" />
            <span className="tenant-label">Tenant:</span>
            <select
              aria-label="Select Contractor Tenant"
              className="tenant-select"
              value={activeTenant.id}
              onChange={(e) => setActiveTenantId(e.target.value)}
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.companyName} ({t.city})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-json-config"
              onClick={openConfigDrawer}
              title="Inspect or edit single JSON config & Rent/Buy pricing tiers"
            >
              <Code2 size={14} />
              <span>JSON Config & Tiers</span>
            </button>
          </div>
        </div>

        <nav className="pillar-nav" aria-label="Platform Pillars">
          <button
            type="button"
            className={`pillar-tab ${activeView === 'client' ? 'active' : ''}`}
            onClick={() => setActiveView('client')}
          >
            <Sparkles size={15} />
            <span>Pillar 1: Client Scrollytelling Site</span>
          </button>

          <button
            type="button"
            className={`pillar-tab ${activeView === 'backoffice' ? 'active' : ''}`}
            onClick={() => setActiveView('backoffice')}
          >
            <MessageSquare size={15} />
            <span>Pillar 2: 3-Pane Conversation Room</span>
            {unreadTotal > 0 && (
              <span className="nav-badge unread">{unreadTotal}</span>
            )}
            {needsHumanCount > 0 && (
              <span className="nav-badge human" title="Threads needing human intervention">
                🚨 {needsHumanCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`pillar-tab ${activeView === 'workflows' ? 'active' : ''}`}
            onClick={() => setActiveView('workflows')}
          >
            <Workflow size={15} />
            <span>Pillar 3: SMS & Review Workflows</span>
          </button>
        </nav>
      </header>

      {/* Live Cross-Pillar Toast Notification */}
      {toastNotification && (
        <div className={`platform-toast ${toastNotification.type || 'info'}`}>
          <div className="toast-icon">
            {toastNotification.type === 'warning' ? (
              <AlertTriangle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
          </div>
          <div className="toast-body">
            <div className="toast-title">{toastNotification.title}</div>
            <div className="toast-msg">{toastNotification.message}</div>
          </div>
          {toastNotification.actionLabel && toastNotification.onAction && (
            <button
              type="button"
              className="toast-action-btn"
              onClick={() => {
                toastNotification.onAction()
                setToastNotification(null)
              }}
            >
              <span>{toastNotification.actionLabel}</span>
              <ArrowRight size={14} />
            </button>
          )}
          <button
            type="button"
            className="toast-close"
            onClick={() => setToastNotification(null)}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Multi-Tenant JSON Config & Commercial Model Modal */}
      {showConfigModal && (
        <div className="modal-backdrop" onClick={() => setShowConfigModal(false)}>
          <div
            className="config-modal glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <Settings2 size={20} style={{ color: activeTenant.brandColor }} />
                <div>
                  <h3>Multi-Tenant JSON Config & Licensing Model</h3>
                  <p>
                    Single JSON config drives the Scrollytelling Hero, Contextual AI Dock, and Back-Office Pricing Rules.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="icon-close-btn"
                onClick={() => setShowConfigModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-grid">
              {/* Left Column: Commercial Tiers */}
              <div className="modal-col">
                <div className="section-eyebrow">
                  <Layers size={13} /> COMMERCIAL PRICING ARCHITECTURE
                </div>
                <div className="tier-cards-stack">
                  {platformPlans.map((plan) => {
                    const isSelected = plan.id === activePlanId
                    return (
                      <div
                        key={plan.id}
                        className={`tier-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setActivePlanId(plan.id)}
                        style={
                          isSelected
                            ? { borderColor: activeTenant.brandColor }
                            : undefined
                        }
                      >
                        <div className="tier-card-top">
                          <div>
                            <span className="tier-badge">{plan.badge}</span>
                            <h4>{plan.name}</h4>
                          </div>
                          <div
                            className="tier-price"
                            style={{ color: activeTenant.brandColor }}
                          >
                            {plan.priceRange}
                          </div>
                        </div>
                        <ul className="tier-highlights">
                          {plan.highlights.map((item, i) => (
                            <li key={i}>✓ {item}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: Live Tenant JSON Editor */}
              <div className="modal-col">
                <div className="section-eyebrow">
                  <Code2 size={13} /> LIVE CONTRACTOR JSON CONFIG ({activeTenant.id})
                </div>
                <textarea
                  className="json-editor-textarea"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  spellCheck={false}
                />
                {jsonError && <div className="json-error">{jsonError}</div>}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowConfigModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ backgroundColor: activeTenant.brandColor }}
                    onClick={handleApplyJson}
                  >
                    Apply Live JSON Config
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
