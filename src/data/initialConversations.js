// Generates crisp SVG data-URI previews with Vision AI bounding-box telemetry
// so damage photos work 100% offline and look like annotated inspection frames.

export function createDamagePhotoSvg({
  title = 'CHIMNEY STEP-FLASHING SEPARATION',
  zone = 'ROOF SECTOR B-04 // MASONRY STACK',
  confidence = '96.8%',
  accent = '#f97316',
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
    label: 'Chimney Step-Flashing Leak',
    serviceMatch: 'Chimney & Step-Flashing Leak Repair',
    estimatedRange: '$450 â€“ $850',
    estimatedValue: 650,
    urgency: 'High â€” Active Water Intrusion',
    visionSummary:
      'Vision AI detected a 3.5-inch lifted aluminum step-flashing gap along the masonry chimney base plus ~6 sq. ft. of shingle granule wear.',
    url: createDamagePhotoSvg({
      title: 'CHIMNEY STEP-FLASHING SEPARATION',
      zone: 'ROOF SECTOR B-04 // MASONRY STACK',
      confidence: '96.8%',
      accent: '#f97316',
      finding1: 'Lifted Step-Flashing (3.5 in gap)',
      finding2: 'Shingle Granule Loss (~6 sq ft)',
    }),
  },
  {
    id: 'sample-hail',
    label: 'Wind-Lifted Ridge & Hail Bruising',
    serviceMatch: 'Emergency Storm Tarping & Dry-In',
    estimatedRange: '$295 â€“ $550',
    estimatedValue: 420,
    urgency: 'Critical â€” Same-Day Dispatch',
    visionSummary:
      'Vision AI identified 4 wind-creased architectural tabs along the south ridge cap and 1.25-inch hail spatter marks on the soft metal vent hood.',
    url: createDamagePhotoSvg({
      title: 'SOUTH RIDGE WIND CREASE & HAIL IMPACT',
      zone: 'RIDGE LINE A-01 // SOUTH ELEVATION',
      confidence: '94.2%',
      accent: '#fbbf24',
      finding1: 'Creased Ridge Cap Tabs (x4)',
      finding2: '1.25" Hail Spatter on Vent',
    }),
  },
  {
    id: 'sample-hvac-plate',
    label: 'HVAC Condenser & Contactor Burn',
    serviceMatch: 'Capacitor / Contactor Emergency Swap',
    estimatedRange: '$240 â€“ $420',
    estimatedValue: 330,
    urgency: 'Critical â€” AC Down in Heat',
    visionSummary:
      'Vision AI decoded 4-Ton 16-SEER split condenser plate and identified a domed dual-run 45/5 uF capacitor with pitted contactor lugs.',
    url: createDamagePhotoSvg({
      title: 'CONDENSER DUAL-RUN CAPACITOR SWELL',
      zone: 'SERVICE PANEL // 4-TON SPLIT UNIT',
      confidence: '98.1%',
      accent: '#06b6d4',
      finding1: 'Domed 45/5 uF Capacitor',
      finding2: 'Pitted 24V Contactor Lugs',
    }),
  },
]

export const INITIAL_THREADS = [
  {
    id: 'thread-marcus',
    contactName: 'Marcus Vance',
    phone: '(512) 639-1842',
    email: 'marcus.vance@austinmail.com',
    address: '4812 Shoal Creek Blvd, Austin, TX 78756',
    zipVerified: true,
    unread: true,
    unreadCount: 2,
    lastActivity: '2m ago',
    channels: ['Webchat', 'SMS'],
    primaryChannel: 'SMS',
    aiStatus: 'ready_for_quote', // 'qualifying' | 'ready_for_quote' | 'needs_human'
    aiAutopilot: true,
    jobSummary: {
      serviceNeeded: 'Chimney & Step-Flashing Leak Repair',
      urgency: 'High â€” Active Water Intrusion',
      estimatedValue: 650,
      estimatedRange: '$450 â€“ $850',
      visionSummary:
        'Detected 3.5-inch lifted aluminum step-flashing along chimney masonry wall + localized shingle granule loss (~6 sq. ft.). Decking appears intact.',
      bookedSlot: null,
      reviewStage: 'none', // 'none' | 'check_in_sent' | 'positive_routed' | 'negative_escalated'
      photos: [
        {
          id: 'photo-marcus-1',
          caption: 'Driveway zoom of chimney flashing after last nightâ€™s storm',
          url: SAMPLE_DAMAGE_PHOTOS[0].url,
          visionTag: '96.8% Match: Lifted Step-Flashing',
        },
      ],
    },
    messages: [
      {
        id: 'm-1',
        sender: 'customer',
        channel: 'Webchat',
        timestamp: '10:14 AM',
        text: 'Water dripped down the fireplace brick during the storm last night. Snapped this from the yardâ€”is this a full roof or just flashing?',
        photoUrl: SAMPLE_DAMAGE_PHOTOS[0].url,
        photoCaption: 'Vision AI Pre-Scan: Lifted Step-Flashing (3.5 in gap) + 6 sq ft granule loss',
      },
      {
        id: 'm-2',
        sender: 'ai',
        channel: 'SMS',
        timestamp: '10:14 AM',
        text: 'Hi Marcus! I just ran our Vision AI scan on your chimney photo and texted you here so you have a direct line. Good news: your surrounding shingles look solidâ€”the leak is coming from a ~3.5" separated step-flashing joint along the brickwork.',
      },
      {
        id: 'm-3',
        sender: 'ai',
        channel: 'SMS',
        timestamp: '10:15 AM',
        text: 'For a chimney step-flashing re-seal & counter-flashing repair in Austin (78756), our upfront range is $450â€“$850 including a free thermal moisture check inside the attic. Would you like our crew lead to stop by today at 2:30 PM or tomorrow at 9:00 AM?',
      },
      {
        id: 'm-4',
        sender: 'customer',
        channel: 'SMS',
        timestamp: '10:18 AM',
        text: 'That is a huge relief. Today at 2:30 PM works great if you can lock in that $450â€“$850 ballpark.',
      },
    ],
  },
  {
    id: 'thread-elena',
    contactName: 'Elena Rostova',
    phone: '(512) 904-7719',
    email: 'elena.r@westlakehills.org',
    address: '1904 Toro Canyon Rd, Austin, TX 78746',
    zipVerified: true,
    unread: true,
    unreadCount: 1,
    lastActivity: '9m ago',
    channels: ['Missed Call', 'SMS'],
    primaryChannel: 'Missed Call',
    aiStatus: 'needs_human',
    aiAutopilot: false,
    jobSummary: {
      serviceNeeded: 'Emergency Storm Tarping & Insurance Scope',
      urgency: 'Critical â€” Same-Day Dispatch',
      estimatedValue: 14800,
      estimatedRange: '$11,500 â€“ $19,800 (Insurance Claim)',
      visionSummary:
        'Multiple wind-creased ridge tabs + oak limb impact over garage valley. Customer left audio voicemail requesting supervisor callback regarding adjuster meeting.',
      bookedSlot: null,
      reviewStage: 'none',
      photos: [
        {
          id: 'photo-elena-1',
          caption: 'South ridge cap + oak branch damage',
          url: SAMPLE_DAMAGE_PHOTOS[1].url,
          visionTag: '94.2% Match: Ridge Crease & Impact',
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
        text: 'ðŸ“ž Missed Call from (512) 904-7719 â€” Instant Missed-Call Rescue SMS fired in 1.8s',
      },
      {
        id: 'e-2',
        sender: 'customer',
        channel: 'Missed Call',
        timestamp: '9:53 AM',
        voicemail: {
          duration: '0:24',
          transcript:
            'â€œHi, this is Elena on Toro Canyon. A large oak limb hit our back valley and my State Farm adjuster is coming tomorrow morning at 10. Need to know if your senior estimator can meet him on-site.â€',
        },
        text: 'ðŸŽ™ï¸ Audio Voicemail (0:24) â€” Auto-transcribed by AI Whisper',
      },
      {
        id: 'e-3',
        sender: 'ai',
        channel: 'SMS',
        timestamp: '9:53 AM',
        text: 'Hi Elena! Sorry we missed your callâ€”our crews are out on storm calls in Austin. I transcribed your voicemail about the oak limb & your State Farm adjuster meeting tomorrow at 10 AM. Can you snap a quick photo of the valley so we bring the right tarps today?',
      },
      {
        id: 'e-4',
        sender: 'customer',
        channel: 'SMS',
        timestamp: '9:58 AM',
        text: 'Here is the photo. Also, my adjuster asked for your license # and whether you use Xactimate for supplement documentation. Can a project manager call or text me directly?',
        photoUrl: SAMPLE_DAMAGE_PHOTOS[1].url,
        photoCaption: 'Vision AI Pre-Scan: South Ridge Wind Crease & Impact Zone',
      },
      {
        id: 'e-5',
        sender: 'system',
        channel: 'SMS',
        timestamp: '9:58 AM',
        eventType: 'escalation',
        text: 'ðŸš¨ AI flagged high-value insurance adjuster request ($14.8k est.) â€” Escalated to Needs Human & paused Autopilot.',
      },
    ],
  },
  {
    id: 'thread-devon',
    contactName: 'Devon Brooks',
    phone: '(512) 418-3309',
    email: 'dbrooks@MuellerHomes.io',
    address: '2110 Zach Scott St, Austin, TX 78723',
    zipVerified: true,
    unread: false,
    unreadCount: 0,
    lastActivity: '34m ago',
    channels: ['SMS'],
    primaryChannel: 'SMS',
    aiStatus: 'qualifying',
    aiAutopilot: true,
    jobSummary: {
      serviceNeeded: 'Ridge Vent & Pipe Boot Replacement',
      urgency: 'Medium â€” Preventative Seal',
      estimatedValue: 540,
      estimatedRange: '$380 â€“ $720',
      visionSummary:
        'Awaiting customer driveway photo of plumbing vent boots. Address verified in 78723 service territory (11 mins from Austin yard).',
      bookedSlot: null,
      reviewStage: 'none',
      photos: [],
    },
    messages: [
      {
        id: 'd-1',
        sender: 'customer',
        channel: 'SMS',
        timestamp: '9:30 AM',
        text: 'Hey, home inspector noted two cracked neoprene plumbing pipe boots on our roof in Mueller (78723). How much to swap them for lifetime lead/silicone boots?',
      },
      {
        id: 'd-2',
        sender: 'ai',
        channel: 'SMS',
        timestamp: '9:30 AM',
        text: 'Hey Devon! We replace cracked neoprene boots in Mueller all the time. Upgrading two pipe jacks to lifetime Perma-Boot / lead flashing typically runs $380â€“$720 total depending on roof pitch. If you have the inspection photo (or can snap one from the street), drop it here and I can narrow that down!',
      },
    ],
  },
]
