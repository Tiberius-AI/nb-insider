// Generates crisp SVG data-URI previews with Vision AI bounding-box telemetry
// so damage photos work 100% offline and look like annotated inspection frames.

export function createDamagePhotoSvg({
  title = 'CHIMNEY STEP-FLASHING SEPARATION',
  zone = 'ROOF SECTOR B-04 // MASONRY STACK',
  confidence = '96.8%',
  accent = '#d97742',
  finding1 = 'Lifted Aluminum Step-Flashing (3.5 in gap)',
  finding2 = 'Granule Loss / Exposed Mat (~6 sq ft)',
}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="55%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#090d16"/>
      </linearGradient>
      <pattern id="shingles" width="48" height="24" patternUnits="userSpaceOnUse">
        <path d="M0 24 L48 24 M24 0 L24 24" stroke="#334155" stroke-width="1" fill="none" opacity="0.55"/>
      </pattern>
      <pattern id="brick" width="36" height="18" patternUnits="userSpaceOnUse">
        <rect width="36" height="18" fill="#451a03" opacity="0.45"/>
        <path d="M0 18 L36 18 M18 0 L18 9 M0 9 L36 9 M30 9 L30 18" stroke="#78350f" stroke-width="1.2" fill="none"/>
      </pattern>
    </defs>

    <!-- Background Roof Deck -->
    <rect width="640" height="400" fill="url(#bg)"/>
    <polygon points="0,120 640,40 640,400 0,400" fill="url(#shingles)"/>

    <!-- Roof Ridge & Slope Lines -->
    <line x1="0" y1="120" x2="640" y2="40" stroke="#64748b" stroke-width="3"/>
    <line x1="0" y1="260" x2="640" y2="170" stroke="#475569" stroke-width="1" stroke-dasharray="6 4"/>

    <!-- Chimney / Structure Mass -->
    <rect x="330" y="35" width="165" height="215" fill="url(#brick)" stroke="#9a3412" stroke-width="2"/>
    <polygon points="325,250 498,225 510,248 315,272" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>

    <!-- Simulated Water / Flashing Gap Shadow -->
    <polygon points="328,242 445,226 458,265 318,284" fill="${accent}" opacity="0.22"/>
    <path d="M332,248 Q390,234 442,232" stroke="#ef4444" stroke-width="4" fill="none"/>

    <!-- Vision AI Bounding Box 1 -->
    <rect x="308" y="205" width="192" height="92" rx="6" fill="none" stroke="${accent}" stroke-width="2.5" stroke-dasharray="8 4"/>
    <rect x="308" y="181" width="184" height="22" rx="4" fill="${accent}"/>
    <text x="316" y="196" fill="#090d16" font-family="monospace" font-weight="bold" font-size="11">${finding1}</text>

    <!-- Vision AI Bounding Box 2 -->
    <rect x="155" y="235" width="135" height="84" rx="6" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5 3"/>
    <rect x="155" y="213" width="150" height="20" rx="4" fill="#0284c7"/>
    <text x="162" y="227" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="10">${finding2}</text>

    <!-- HUD Header Bar -->
    <rect x="14" y="14" width="612" height="34" rx="6" fill="#090d16" opacity="0.86" stroke="#334155" stroke-width="1"/>
    <circle cx="32" cy="31" r="5" fill="#22c55e"/>
    <text x="46" y="35" fill="#f8fafc" font-family="monospace" font-size="12" font-weight="bold">VISION-AI // ${title}</text>
    <text x="480" y="35" fill="${accent}" font-family="monospace" font-size="12" font-weight="bold">CONF: ${confidence}</text>

    <!-- Footer Telemetry -->
    <rect x="14" y="354" width="612" height="32" rx="6" fill="#090d16" opacity="0.86" stroke="#1e293b"/>
    <text x="26" y="374" fill="#94a3b8" font-family="monospace" font-size="11">${zone}</text>
    <text x="440" y="374" fill="#38bdf8" font-family="monospace" font-size="11">PRE-SCAN: READY FOR QUOTE</text>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const SAMPLE_DAMAGE_PHOTOS = [
  {
    id: 'sample-flashing',
    label: 'Chimney Step-Flashing & Shingle Detail',
    serviceMatch: 'Roof Leak & Flashing Repair',
    estimatedRange: '$450 – $950',
    estimatedValue: 680,
    urgency: 'High — Active Water Intrusion',
    visionSummary:
      'Vision AI detected a 3.5-inch lifted aluminum step-flashing gap along the masonry chimney base plus ~6 sq. ft. of shingle granule wear.',
    url: createDamagePhotoSvg({
      title: 'CHIMNEY STEP-FLASHING SEPARATION',
      zone: 'ROOF SECTOR B-04 // MASONRY STACK',
      confidence: '96.8%',
      accent: '#d97742',
      finding1: 'Lifted Step-Flashing (3.5 in gap)',
      finding2: 'Shingle Granule Loss (~6 sq ft)',
    }),
  },
  {
    id: 'sample-shingle-close',
    label: 'Architectural Shingle & Ridge Course',
    serviceMatch: 'Full Architectural Roof Replacement',
    estimatedRange: '$12,500 – $21,500',
    estimatedValue: 16200,
    urgency: 'Scheduled Capital Project',
    visionSummary:
      'High-resolution architectural shingle inspection photo showing ridge cap alignment, starter strip overhang, and attic ventilation course.',
    url: '/assets/roofing/reveal-v2/roof-detail.webp',
  },
  {
    id: 'sample-hail',
    label: 'Wind-Lifted Ridge & Valley Wear',
    serviceMatch: 'Underlayment & Roof Decking Repair',
    estimatedRange: '$550 – $1,650',
    estimatedValue: 1050,
    urgency: 'High — Structural Integrity',
    visionSummary:
      'Vision AI identified 4 wind-creased architectural tabs along the south ridge cap and localized valley underlayment wear.',
    url: createDamagePhotoSvg({
      title: 'SOUTH RIDGE WIND CREASE & VALLEY WEAR',
      zone: 'RIDGE LINE A-01 // SOUTH ELEVATION',
      confidence: '94.2%',
      accent: '#fbbf24',
      finding1: 'Creased Ridge Cap Tabs (x4)',
      finding2: 'Valley Underlayment Exposure',
    }),
  },
]

export const INITIAL_THREADS = [
  {
    id: 'thread-marcus',
    contactName: 'Marcus Vance',
    phone: '(603) 639-1842',
    email: 'marcus.vance@nhhomeowner.com',
    address: '184 N River Rd, Manchester, NH 03104',
    zipVerified: true,
    propertyType: 'Single-family home',
    roofAge: '10–20 years',
    preferredWindow: 'Afternoon',
    unread: true,
    unreadCount: 2,
    lastActivity: '2m ago',
    channels: ['Webchat', 'SMS'],
    primaryChannel: 'SMS',
    aiStatus: 'ready_for_quote', // 'qualifying' | 'ready_for_quote' | 'needs_human'
    opportunityStage: 'quote_sent', // 'new_lead' | 'qualifying' | 'quote_sent' | 'appointment_booked' | 'job_won'
    aiAutopilot: true,
    handoffMode: 'AI', // 'AI' (Alfred replies) | 'Draft' (Alfred drafts for approval) | 'Human' (I'll handle it)
    alfredDraft: {
      id: 'draft-marcus-1',
      createdAt: '10:19 AM',
      reason: 'Customer confirmed Today 2:30 PM inspection window & $450–$950 flashing repair ballpark.',
      text: 'Locked in, Marcus! Our Hooksett lead estimator Patrick is scheduled for Today at 2:30 PM at 184 N River Rd (03104). We have your chimney step-flashing photo loaded on the truck and will text you when we are 15 minutes out.',
    },
    jobSummary: {
      serviceNeeded: 'Roof Leak & Flashing Repair',
      urgency: 'High — Active Water Intrusion',
      estimatedValue: 680,
      estimatedRange: '$450 – $950',
      visionSummary:
        'Detected 3.5-inch lifted aluminum step-flashing along chimney masonry wall + localized shingle granule loss (~6 sq. ft.). Decking appears intact.',
      bookedSlot: null,
      reviewStage: 'none',
      photos: [
        {
          id: 'photo-marcus-1',
          caption: 'Driveway zoom of chimney flashing after last night’s rain',
          url: SAMPLE_DAMAGE_PHOTOS[0].url,
          visionTag: '96.8% Match: Lifted Step-Flashing',
        },
        {
          id: 'photo-marcus-2',
          caption: 'Adjacent architectural shingle course',
          url: '/assets/roofing/reveal-v2/roof-detail.webp',
          visionTag: 'Shingle Granule Check: Good',
        },
      ],
    },
    messages: [
      {
        id: 'm-1',
        sender: 'customer',
        channel: 'Webchat',
        timestamp: '10:14 AM',
        text: 'Water dripped near our fireplace brick after the rain last night in Manchester (03104). Snapped this from the yard—is this a full roof or just flashing?',
        photoUrl: SAMPLE_DAMAGE_PHOTOS[0].url,
        photoCaption: 'Vision AI Pre-Scan: Lifted Step-Flashing (3.5 in gap) + 6 sq ft granule loss',
      },
      {
        id: 'm-2',
        sender: 'ai',
        channel: 'SMS',
        timestamp: '10:14 AM',
        text: 'Hi Marcus! This is Alfred, the SCG Roofing assistant in Hooksett. I just ran our Vision AI scan on your chimney photo and texted you here so you have a direct line. Good news: your surrounding shingles look solid—the leak is coming from a ~3.5" separated step-flashing joint along the brickwork.',
        kbCitations: [
          {
            id: 'kb-territory-zips',
            category: 'Service Territory',
            title: 'Verified Coverage Area & ZIP Codes (03104)',
          },
        ],
      },
      {
        id: 'm-3',
        sender: 'ai',
        channel: 'SMS',
        timestamp: '10:15 AM',
        text: 'For a chimney step-flashing re-seal, counter-flashing repair & decking moisture check in Manchester (03104), our transparent ballpark is $450–$950 including a $0 on-site inspection. Would you like our crew lead to stop by today at 2:30 PM or tomorrow at 9:00 AM?',
        kbCitations: [
          {
            id: 'kb-pricing-matrix',
            category: 'Pricing & Diagnostics',
            title: 'Roof Leak & Flashing Repair ($450–$950)',
          },
          {
            id: 'kb-calendar-sop',
            category: 'Cal.com Scheduling',
            title: 'Cal.com Live Inspection Windows',
          },
        ],
      },
      {
        id: 'm-4',
        sender: 'customer',
        channel: 'SMS',
        timestamp: '10:18 AM',
        text: 'That is a huge relief. Today at 2:30 PM works great if you can lock in that $450–$950 ballpark.',
      },
    ],
  },
  {
    id: 'thread-elena',
    contactName: 'Elena Rostova',
    phone: '(603) 904-7719',
    email: 'elena.r@doverhomes.org',
    address: '42 Silver St, Dover, NH 03820',
    zipVerified: true,
    propertyType: 'Single-family home',
    roofAge: 'Over 20 years',
    preferredWindow: 'Morning',
    unread: true,
    unreadCount: 1,
    lastActivity: '9m ago',
    channels: ['Missed Call', 'SMS'],
    primaryChannel: 'Missed Call',
    aiStatus: 'needs_human',
    opportunityStage: 'qualifying',
    aiAutopilot: false,
    handoffMode: 'Human',
    alfredDraft: {
      id: 'draft-elena-1',
      createdAt: '9:59 AM',
      reason: 'Private Alfred Draft prepared for high-value insurance & decking scope ($16,200 est.).',
      text: 'Hi Elena, this is Patrick at SCG Roofing in Hooksett. I reviewed your valley photo and voicemail—yes, I can personally meet your adjuster at 42 Silver St tomorrow morning at 10:00 AM with full decking/underlayment documentation and tarps.',
    },
    jobSummary: {
      serviceNeeded: 'Full Architectural Roof Replacement',
      urgency: 'Critical — Adjuster Meeting Tomorrow 10 AM',
      estimatedValue: 16200,
      estimatedRange: '$12,500 – $21,500',
      visionSummary:
        'Multiple wind-creased ridge tabs + oak limb impact over back valley on a 20+ year roof. Customer left audio voicemail requesting supervisor callback regarding adjuster meeting.',
      bookedSlot: null,
      reviewStage: 'none',
      photos: [
        {
          id: 'photo-elena-1',
          caption: 'South ridge cap + oak branch damage',
          url: SAMPLE_DAMAGE_PHOTOS[2].url,
          visionTag: '94.2% Match: Ridge Crease & Valley',
        },
        {
          id: 'photo-elena-2',
          caption: 'Dover elevation reference photo',
          url: '/assets/roofing/scg-projects/dover.webp',
          visionTag: 'Property Elevation Verified',
        },
      ],
    },
    messages: [
      {
        id: 'e-1',
        sender: 'system',
        channel: 'Missed Call',
        timestamp: '9:52 AM',
        eventType: 'missed_call',
        text: '📞 Missed Call from (603) 904-7719 — Instant Missed-Call Rescue SMS fired in 1.4s',
      },
      {
        id: 'e-2',
        sender: 'customer',
        channel: 'Missed Call',
        timestamp: '9:53 AM',
        voicemail: {
          duration: '0:24',
          transcript:
            '“Hi, this is Elena in Dover. A large oak limb hit our back valley and our insurance adjuster is coming tomorrow morning at 10. Need to know if your senior estimator can meet him on-site to check the decking underneath.”',
        },
        text: '🎙️ Audio Voicemail (0:24) — Auto-transcribed by AI Whisper',
      },
      {
        id: 'e-3',
        sender: 'ai',
        channel: 'SMS',
        timestamp: '9:53 AM',
        text: 'Hi Elena! Sorry we missed your call—our crews are up on a roof in Hooksett. I transcribed your voicemail about the oak limb & your adjuster meeting tomorrow at 10 AM. Can you snap a quick photo of the valley so we bring the right tarps and decking materials today?',
      },
      {
        id: 'e-4',
        sender: 'customer',
        channel: 'SMS',
        timestamp: '9:58 AM',
        text: 'Here is the photo. Since the roof is 22 years old, we also want to look beyond the shingles at the attic ventilation and plywood decking. Can an owner or senior estimator text me directly?',
        photoUrl: SAMPLE_DAMAGE_PHOTOS[2].url,
        photoCaption: 'Vision AI Pre-Scan: South Ridge Wind Crease & Valley Underlayment Zone',
      },
      {
        id: 'e-5',
        sender: 'system',
        channel: 'SMS',
        timestamp: '9:58 AM',
        eventType: 'escalation',
        text: '🚨 Alfred AI flagged high-value replacement + adjuster request ($16.2k est.) — Escalated to [🚨 Needs Human], paused Autopilot, and drafted a reply for approval.',
      },
    ],
  },
  {
    id: 'thread-devon',
    contactName: 'Devon Brooks',
    phone: '(603) 418-3309',
    email: 'dbrooks@nottinghamnh.io',
    address: '78 Stage Rd, Nottingham, NH 03290',
    zipVerified: true,
    propertyType: 'Single-family home',
    roofAge: 'Under 10 years',
    preferredWindow: 'Flexible',
    unread: false,
    unreadCount: 0,
    lastActivity: '34m ago',
    channels: ['SMS'],
    primaryChannel: 'SMS',
    aiStatus: 'qualifying',
    aiAutopilot: true,
    handoffMode: 'Draft',
    alfredDraft: {
      id: 'draft-devon-1',
      createdAt: '9:32 AM',
      reason: 'Alfred operating in "Write a reply for me to approve" (Draft Mode).',
      text: 'Hi Devon! Balancing your soffit intake and ridge vent in Nottingham (03290) typically runs $650–$1,450 and stops winter attic condensation cold. Would you like a free attic airflow & decking check this Thursday morning?',
    },
    jobSummary: {
      serviceNeeded: 'Attic Ventilation & Ridge Vent Upgrade',
      urgency: 'Medium — Preventative Efficiency',
      estimatedValue: 980,
      estimatedRange: '$650 – $1,450',
      visionSummary:
        'Homeowner noticed winter frost/moisture in attic rafters in Nottingham (03290). Verified Southern NH coverage territory.',
      bookedSlot: null,
      reviewStage: 'none',
      photos: [
        {
          id: 'photo-devon-1',
          caption: 'Nottingham roof ridge line reference',
          url: '/assets/roofing/scg-projects/nottingham.webp',
          visionTag: 'Ridge Vent & Soffit Intake Scope',
        },
      ],
    },
    messages: [
      {
        id: 'd-1',
        sender: 'customer',
        channel: 'SMS',
        timestamp: '9:30 AM',
        text: 'Hey, our home inspector noted poor attic ventilation and baffle blockage on our colonial in Nottingham (03290). Do you handle ridge vents and attic airflow without replacing the whole roof?',
      },
      {
        id: 'd-2',
        sender: 'ai',
        channel: 'SMS',
        timestamp: '9:30 AM',
        text: 'Hey Devon! Yes—at SCG Roofing we look beyond the shingles at the whole roof structure, including attic ventilation, baffles, and underlayment. I put together a ballpark estimate for our estimator to approve for you shortly!',
      },
    ],
  },
]
