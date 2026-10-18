import { useState } from 'react'
import contractorsData from '../config/contractors.json'
import { INITIAL_THREADS, SAMPLE_DAMAGE_PHOTOS, createDamagePhotoSvg } from '../data/initialConversations'
import { PlatformContext } from './usePlatform'

function formatNowTime() {
  const now = new Date()
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function PlatformProvider({ children }) {
  const [tenants, setTenants] = useState(contractorsData.tenants)
  const [activeTenantId, setActiveTenantId] = useState(contractorsData.tenants[0].id)
  const [activePlanId, setActivePlanId] = useState('rent-to-own')
  const [activeView, setActiveView] = useState('client') // 'client' | 'backoffice' | 'workflows'
  const [threads, setThreads] = useState(INITIAL_THREADS)
  const [selectedThreadId, setSelectedThreadId] = useState(INITIAL_THREADS[0].id)
  const [toastNotification, setToastNotification] = useState(null)

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0]
  const activePlan =
    contractorsData.platformPlans.find((p) => p.id === activePlanId) ||
    contractorsData.platformPlans[1]

  const selectedThread =
    threads.find((t) => t.id === selectedThreadId) || threads[0]

  const showToast = (toast) => {
    setToastNotification({ id: Date.now(), ...toast })
  }

  const updateActiveTenantConfig = (updatedConfig) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === activeTenant.id ? { ...t, ...updatedConfig } : t))
    )
    showToast({
      title: 'Multi-Tenant JSON Updated',
      message: `Live config applied for ${updatedConfig.companyName || activeTenant.companyName}.`,
      type: 'success',
    })
  }

  // Pillar 1 -> Pillar 2 Live Handshake from Embedded Contextual AI Dock
  const submitHeroLead = ({ question, photo, phone, customerName, zipCode }) => {
    const cleanPhone = phone?.trim() || '(512) 774-0192'
    const name = customerName?.trim() || 'Homeowner Lead'
    const zip = zipCode?.trim() || '78704'
    const primaryService = activeTenant.pricingRules.services[0]

    const resolvedPhotoUrl =
      photo?.url ||
      createDamagePhotoSvg({
        title: `${activeTenant.niche.toUpperCase()} PRE-SCAN`,
        zone: `ZIP ${zip} // DRIVEWAY UPLOAD`,
        confidence: '95.4%',
        accent: activeTenant.brandColor,
        finding1: primaryService.name.slice(0, 28),
        finding2: `Est: ${primaryService.range}`,
      })

    const visionAnalysis =
      photo?.visionSummary ||
      `Vision AI analyzed uploaded photo for ${activeTenant.companyName}: matched "${primaryService.name}" scope (${primaryService.urgency}). Estimated local range in ${activeTenant.city}: ${primaryService.range}.`

    const newThreadId = `thread-lead-${Date.now()}`
    const timestamp = formatNowTime()

    const userPrompt =
      question?.trim() ||
      `Hi, I uploaded a photo of my ${activeTenant.niche.toLowerCase()} issue in ${zip}. What's the ballpark cost and earliest availability?`

    const aiReply = `Hi ${name.split(' ')[0]}! This is the ${activeTenant.companyName} AI Dispatch in ${activeTenant.city}. I just received your inquiry from our website dock${
      photo ? ' and ran a Vision AI pre-scan on your photo' : ''
    }. Based on our ${activeTenant.city} pricing rules for ${primaryService.name}, our transparent range is ${primaryService.range}${
      activeTenant.pricingRules.freeInspection
        ? ' (includes a $0 on-site inspection)'
        : ` ($${activeTenant.pricingRules.baseDiagnostic} diagnostic waived with repair)`
    }. Can we text you our 2:00 PM or 4:30 PM inspection window today?`

    const newThread = {
      id: newThreadId,
      contactName: name,
      phone: cleanPhone,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@homeowner.io`,
      address: `Verified Territory (${zip}), ${activeTenant.city}`,
      zipVerified: true,
      unread: true,
      unreadCount: 1,
      lastActivity: 'Just now',
      channels: ['Webchat', 'SMS'],
      primaryChannel: 'SMS',
      aiStatus: photo ? 'ready_for_quote' : 'qualifying',
      aiAutopilot: true,
      jobSummary: {
        serviceNeeded: photo?.serviceMatch || primaryService.name,
        urgency: photo?.urgency || primaryService.urgency,
        estimatedValue: photo?.estimatedValue || primaryService.avgValue,
        estimatedRange: photo?.estimatedRange || primaryService.range,
        visionSummary: visionAnalysis,
        bookedSlot: null,
        reviewStage: 'none',
        photos: [
          {
            id: `photo-${Date.now()}`,
            caption: photo?.label || 'Customer Hero AI Dock Upload',
            url: resolvedPhotoUrl,
            visionTag: `Vision Pre-Scan: ${photo?.estimatedRange || primaryService.range}`,
          },
        ],
      },
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          sender: 'customer',
          channel: 'Webchat',
          timestamp,
          text: userPrompt,
          photoUrl: resolvedPhotoUrl,
          photoCaption: `Hero AI Dock Upload â€¢ ${photo?.label || primaryService.name}`,
        },
        {
          id: `msg-${Date.now()}-2`,
          sender: 'system',
          channel: 'SMS',
          timestamp,
          eventType: 'handshake',
          text: `âš¡ Instant SMS Handshake triggered to ${cleanPhone} via ${activeTenant.companyName} (${activeTenant.phoneDisplay})`,
        },
        {
          id: `msg-${Date.now()}-3`,
          sender: 'ai',
          channel: 'SMS',
          timestamp,
          text: aiReply,
        },
      ],
    }

    setThreads((prev) => [newThread, ...prev])
    setSelectedThreadId(newThreadId)

    showToast({
      title: 'Instant SMS Handshake Fired!',
      message: `Created live thread for ${name} (${cleanPhone}) with Vision AI pre-scan.`,
      actionLabel: 'Open in 3-Pane Back-Office â†’',
      onAction: () => setActiveView('backoffice'),
      type: 'success',
    })

    return newThreadId
  }

  // Toggle AI Autopilot explicitly
  const toggleAutopilot = (threadId, nextState) => {
    const timestamp = formatNowTime()
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread
        const resolved =
          typeof nextState === 'boolean' ? nextState : !thread.aiAutopilot
        const sysMsg = {
          id: `sys-${Date.now()}`,
          sender: 'system',
          channel: thread.primaryChannel || 'SMS',
          timestamp,
          eventType: resolved ? 'autopilot_on' : 'autopilot_off',
          text: resolved
            ? 'ðŸ¤– AI Autopilot switched ON â€” AI will qualify and quote using contractor rules.'
            : 'âœ‹ Human Takeover activated â€” AI Autopilot switched OFF.',
        }
        return {
          ...thread,
          aiAutopilot: resolved,
          messages: [...thread.messages, sysMsg],
        }
      })
    )
  }

  // CRITICAL FEATURE: Human sending a message automatically flips AI Autopilot to OFF
  const sendHumanMessage = (threadId, text, channel = 'SMS') => {
    if (!text?.trim()) return
    const timestamp = formatNowTime()

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread
        const wasAutopilotOn = thread.aiAutopilot
        const newMessages = [...thread.messages]

        if (wasAutopilotOn) {
          newMessages.push({
            id: `sys-auto-off-${Date.now()}`,
            sender: 'system',
            channel,
            timestamp,
            eventType: 'autopilot_off',
            text: 'âœ‹ Human operator sent a reply â€” AI Autopilot automatically flipped to OFF so AI and humans never talk over each other.',
          })
        }

        newMessages.push({
          id: `human-${Date.now()}`,
          sender: 'human',
          channel,
          timestamp,
          text: text.trim(),
        })

        return {
          ...thread,
          aiAutopilot: false,
          unread: false,
          unreadCount: 0,
          lastActivity: 'Just now',
          messages: newMessages,
        }
      })
    )
  }

  // Update AI Status Pill ('qualifying' | 'ready_for_quote' | 'needs_human')
  const updateThreadStatus = (threadId, newStatus) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, aiStatus: newStatus } : thread
      )
    )
  }

  // Co-Pilot Whisper: Drafts a context-aware reply based on contractor rules
  const generateCoPilotSuggestion = (threadId) => {
    const thread = threads.find((t) => t.id === threadId) || selectedThread
    const firstName = thread.contactName.split(' ')[0]
    const service = thread.jobSummary.serviceNeeded
    const range = thread.jobSummary.estimatedRange

    if (thread.aiStatus === 'needs_human') {
      return `Hi ${firstName}, this is the Senior Project Manager at ${activeTenant.companyName}. I reviewed your photo and adjuster notes for ${service}. I can personally meet on-site tomorrow at 10:00 AM with full Xactimate documentation and tarpsâ€”shall I lock you onto my calendar?`
    }
    if (thread.aiStatus === 'ready_for_quote') {
      return `Hi ${firstName}! Locking in your ${range} estimate range for ${service} here in ${activeTenant.city}. I have our lead technician available today at 2:30 PM or tomorrow at 9:00 AMâ€”reply 1 for today or 2 for tomorrow and you're all set!`
    }
    return `Hi ${firstName}, thanks for reaching out to ${activeTenant.companyName}! Based on our ${activeTenant.city} pricing for ${service} (${range}), we can get a licensed specialist out to ${thread.address} today. If you can snap one quick photo from the driveway, I'll pre-load the exact materials on the truck!`
  }

  // Field Voice-Note-to-Polished-SMS converter
  const polishFieldVoiceNote = (rawVoiceTranscript, threadId) => {
    const thread = threads.find((t) => t.id === threadId) || selectedThread
    const firstName = thread.contactName.split(' ')[0]
    const cleanRaw =
      rawVoiceTranscript?.trim() ||
      'tell him we looked at the flashing gap by the brick, we can seal and re-lead it tomorrow at 2pm for 580 bucks'

    return `Hi ${firstName}, our lead technician just reviewed your ${thread.jobSummary.serviceNeeded.toLowerCase()} details ("${cleanRaw}"). We can complete the full repair and waterproof seal tomorrow at 2:00 PM for $580 flat, backed by our ${activeTenant.companyName} workmanship warranty. Would you like me to lock in that 2:00 PM arrival window?`
  }

  // One-Click Calendar Booking in Right Pane
  const bookInspectionSlot = (threadId, slotLabel = 'Today, 2:30 PM â€“ 4:00 PM') => {
    const timestamp = formatNowTime()
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread
        const firstName = thread.contactName.split(' ')[0]
        return {
          ...thread,
          aiStatus: 'ready_for_quote',
          lastActivity: 'Just now',
          jobSummary: {
            ...thread.jobSummary,
            bookedSlot: slotLabel,
          },
          messages: [
            ...thread.messages,
            {
              id: `book-sys-${Date.now()}`,
              sender: 'system',
              channel: 'SMS',
              timestamp,
              eventType: 'booking',
              text: `ðŸ“… Calendar Slot Confirmed: ${slotLabel} (${thread.jobSummary.serviceNeeded})`,
            },
            {
              id: `book-sms-${Date.now() + 1}`,
              sender: 'ai',
              channel: 'SMS',
              timestamp,
              text: `Confirmed, ${firstName}! You are booked with ${activeTenant.companyName} for ${slotLabel} at ${thread.address}. You'll receive a live GPS link when our crew rolls out.`,
            },
          ],
        }
      })
    )
    showToast({
      title: 'Calendar Slot Booked',
      message: `Dispatched confirmation SMS for ${slotLabel}.`,
      type: 'success',
    })
  }

  // PILLAR 3.1: Missed-Call Rescue Trigger
  const triggerMissedCallRescue = ({
    callerName = 'Jordan Miller',
    callerPhone = '(512) 814-2905',
    callerAddress = '3408 South Congress Ave, Austin, TX 78704',
  } = {}) => {
    const timestamp = formatNowTime()
    const newThreadId = `thread-missed-${Date.now()}`
    const primaryService = activeTenant.pricingRules.services[0]

    const rescueSms = `Hey ${callerName.split(' ')[0]}! Sorry we missed your call at ${activeTenant.companyName} (${activeTenant.city})â€”our crews are up on a job right now. How can we help today? Feel free to reply here or snap a photo of your project for an instant ballpark quote!`

    const newThread = {
      id: newThreadId,
      contactName: callerName,
      phone: callerPhone,
      email: 'jordan.miller@southcongress.io',
      address: callerAddress,
      zipVerified: true,
      unread: true,
      unreadCount: 1,
      lastActivity: 'Just now',
      channels: ['Missed Call', 'SMS'],
      primaryChannel: 'Missed Call',
      aiStatus: 'qualifying',
      aiAutopilot: true,
      jobSummary: {
        serviceNeeded: `${primaryService.name} (Missed-Call Rescue)`,
        urgency: 'High â€” Inbound Call Rescue',
        estimatedValue: primaryService.avgValue,
        estimatedRange: primaryService.range,
        visionSummary:
          'Missed call rescued in 1.4 seconds via automated SMS. Awaiting homeowner reply or project photo.',
        bookedSlot: null,
        reviewStage: 'none',
        photos: [],
      },
      messages: [
        {
          id: `mc-1-${Date.now()}`,
          sender: 'system',
          channel: 'Missed Call',
          timestamp,
          eventType: 'missed_call',
          text: `ðŸ“ž Missed Inbound Call from ${callerPhone} â€” Automated Missed-Call Rescue fired in 1.4s`,
        },
        {
          id: `mc-2-${Date.now()}`,
          sender: 'ai',
          channel: 'SMS',
          timestamp,
          text: rescueSms,
        },
      ],
    }

    setThreads((prev) => [newThread, ...prev])
    setSelectedThreadId(newThreadId)

    showToast({
      title: 'ðŸ“ž Missed-Call Rescue Fired (1.4s)',
      message: `Sent instant conversational SMS to ${callerName} (${callerPhone}).`,
      actionLabel: 'View Thread â†’',
      onAction: () => setActiveView('backoffice'),
      type: 'info',
    })

    return newThreadId
  }

  // PILLAR 3.2: TOS-Safe Conversational Review Engine â€” Step 1: Natural Check-In
  const triggerJobCompletedCheckIn = (threadId = selectedThreadId) => {
    const timestamp = formatNowTime()
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread
        const firstName = thread.contactName.split(' ')[0]
        return {
          ...thread,
          lastActivity: 'Just now',
          jobSummary: {
            ...thread.jobSummary,
            reviewStage: 'check_in_sent',
          },
          messages: [
            ...thread.messages,
            {
              id: `rev-sys-${Date.now()}`,
              sender: 'system',
              channel: 'SMS',
              timestamp,
              eventType: 'job_completed',
              text: 'âœ… Job Marked Completed â€” TOS-Safe Conversational Check-In triggered (Zero Star-Gating)',
            },
            {
              id: `rev-sms-${Date.now() + 1}`,
              sender: 'ai',
              channel: 'SMS',
              timestamp,
              text: `Hi ${firstName}! Thanks again for trusting ${activeTenant.companyName} with your ${thread.jobSummary.serviceNeeded.toLowerCase()} today. How did everything go with the crew?`,
            },
          ],
        }
      })
    )

    showToast({
      title: 'Job Completed Check-In Sent',
      message: 'Natural SMS check-in sent. Ready for AI sentiment analysis on reply.',
      type: 'success',
    })
  }

  // PILLAR 3.2: Step 2 â€” AI Sentiment Analysis & Routing (Positive -> Google Link, Negative -> ðŸš¨ Needs Human)
  const simulateCustomerReviewReply = (
    threadId = selectedThreadId,
    customReplyText = '',
    forcedSentiment = null // 'positive' | 'negative' | null (auto-detect)
  ) => {
    const timestamp = formatNowTime()
    const negativeKeywords = [
      'bad',
      'late',
      'mess',
      'nails',
      'leak',
      'unhappy',
      'issue',
      'problem',
      'wrong',
      'uneven',
      'expensive',
      'rude',
      'disappointed',
    ]

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread
        const firstName = thread.contactName.split(' ')[0]

        const replyText =
          customReplyText?.trim() ||
          (forcedSentiment === 'negative'
            ? 'Honestly the repair looks okay, but the crew left roofing nails near our driveway and a dented downspout.'
            : 'Everything went great! The crew arrived right on time, showed me the flashing photos, and cleaned the whole driveway.')

        const isNegative =
          forcedSentiment === 'negative' ||
          (forcedSentiment !== 'positive' &&
            negativeKeywords.some((kw) =>
              replyText.toLowerCase().includes(kw)
            ))

        const customerMsg = {
          id: `rev-cust-${Date.now()}`,
          sender: 'customer',
          channel: 'SMS',
          timestamp,
          text: replyText,
        }

        if (!isNegative) {
          // Positive sentiment -> Direct Google Review link
          const sysRouteMsg = {
            id: `rev-route-pos-${Date.now() + 1}`,
            sender: 'system',
            channel: 'SMS',
            timestamp,
            eventType: 'sentiment_positive',
            text: 'ðŸŸ¢ AI Sentiment Analysis: POSITIVE (0.97) â€” Routing direct Google Review link',
          }
          const aiReviewLinkMsg = {
            id: `rev-ai-pos-${Date.now() + 2}`,
            sender: 'ai',
            channel: 'SMS',
            timestamp,
            text: `That means the world to our local crew, ${firstName}! If you have 30 seconds, would you mind sharing your experience on Google? Here is our direct link: ${activeTenant.googleReviewUrl} â€” Thank you again!`,
          }

          return {
            ...thread,
            lastActivity: 'Just now',
            jobSummary: {
              ...thread.jobSummary,
              reviewStage: 'positive_routed',
            },
            messages: [...thread.messages, customerMsg, sysRouteMsg, aiReviewLinkMsg],
          }
        } else {
          // Negative sentiment -> Private escalation to ðŸš¨ Needs Human + Autopilot OFF
          const sysEscalationMsg = {
            id: `rev-route-neg-${Date.now() + 1}`,
            sender: 'system',
            channel: 'SMS',
            timestamp,
            eventType: 'escalation',
            text: 'ðŸš¨ AI Sentiment Analysis: ISSUE DETECTED (0.94) â€” Flipped thread to [ðŸš¨ Needs Human], paused AI Autopilot, and alerted Owner privately.',
          }
          const aiEmpatheticHoldMsg = {
            id: `rev-ai-neg-${Date.now() + 2}`,
            sender: 'ai',
            channel: 'SMS',
            timestamp,
            text: `Thank you for telling us directly, ${firstName}â€”I am so sorry about that. I have flagged our owner & field supervisor right now so we can come make this 100% right today. Expect a personal call/text shortly.`,
          }

          return {
            ...thread,
            aiStatus: 'needs_human',
            aiAutopilot: false,
            unread: true,
            unreadCount: thread.unreadCount + 1,
            lastActivity: 'Just now',
            jobSummary: {
              ...thread.jobSummary,
              reviewStage: 'negative_escalated',
            },
            messages: [
              ...thread.messages,
              customerMsg,
              sysEscalationMsg,
              aiEmpatheticHoldMsg,
            ],
          }
        }
      })
    )

    showToast({
      title:
        forcedSentiment === 'negative'
          ? 'ðŸš¨ Negative Sentiment Escalated to Human'
          : 'â­ Sentiment Analyzed & Routed',
      message:
        forcedSentiment === 'negative'
          ? 'Thread flipped to ðŸš¨ Needs Human & AI Autopilot paused.'
          : 'Direct Google Review link sent in Unified Timeline.',
      actionLabel: 'Inspect Timeline â†’',
      onAction: () => setActiveView('backoffice'),
      type: forcedSentiment === 'negative' ? 'warning' : 'success',
    })
  }

  const selectThread = (threadId) => {
    setSelectedThreadId(threadId)
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, unread: false, unreadCount: 0 } : t
      )
    )
  }

  return (
    <PlatformContext.Provider
      value={{
        platformPlans: contractorsData.platformPlans,
        activePlan,
        activePlanId,
        setActivePlanId,
        tenants,
        activeTenant,
        activeTenantId,
        setActiveTenantId,
        updateActiveTenantConfig,
        activeView,
        setActiveView,
        threads,
        selectedThread,
        selectedThreadId,
        selectThread,
        submitHeroLead,
        toggleAutopilot,
        sendHumanMessage,
        updateThreadStatus,
        generateCoPilotSuggestion,
        polishFieldVoiceNote,
        bookInspectionSlot,
        triggerMissedCallRescue,
        triggerJobCompletedCheckIn,
        simulateCustomerReviewReply,
        samplePhotos: SAMPLE_DAMAGE_PHOTOS,
        toastNotification,
        setToastNotification,
      }}
    >
      {children}
    </PlatformContext.Provider>
  )
}

