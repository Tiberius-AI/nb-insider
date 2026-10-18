import ThreadQueue from './ThreadQueue'
import UnifiedTimeline from './UnifiedTimeline'
import JobSummaryCard from './JobSummaryCard'

export default function ConversationRoomView() {
  return (
    <section className="conversation-room-3pane" aria-label="3-Pane Unified Conversation Room">
      {/* Left Pane (25%): Thread Queue */}
      <ThreadQueue />

      {/* Center Pane (50%): Unified Timeline */}
      <UnifiedTimeline />

      {/* Right Pane (25%): Live AI Job Summary Card */}
      <JobSummaryCard />
    </section>
  )
}
