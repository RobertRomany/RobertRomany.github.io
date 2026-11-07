export interface Project {
  id: string; slug?: string; title: string; description: string;
  thumbnail?: string;
  cover?: string; coverFit?: 'cover' | 'contain'; coverFocus?: string; // case-study banner, any aspect ratio
  screens?: string[]; // phone screenshots for the case study, in YOUR order
  platforms?: string[]; technologies?: string[]; sourceLink?: string; liveLink?: string;
  role?: string; problem?: string; result?: string;
  why?: string; architecture?: string; video?: string;
}
export interface Screen { url: string; caption?: string }
export interface FeaturedPick { projectId: string; image?: string; fit?: 'cover' | 'contain'; focus?: string }
export interface HomeContent { subtitle?: string; phoneScreens?: Screen[]; featured?: FeaturedPick[] }
export interface Skill { id: string; name: string; iconClass: string }
export interface ProposalItem { id: string; name: string; description?: string; price: number; tier: 'base' | 'optional'; categoryId: string; recurrence?: string; recurrenceNote?: string }
export interface ProposalRow extends ProposalDoc { id: string }
export interface ProposalDoc {
  projectTitle?: string; clientName?: string; currency?: string; notes?: string; status: 'open' | 'locked';
  categories: { id: string; name: string }[]; items: ProposalItem[]; selections?: Record<string, boolean>;
}
export interface TimelineItem { id: string; year?: string; date?: string; role?: string; title?: string; company?: string; desc?: string; description?: string; tags?: string[] }
export interface Testimonial { id: string; name: string; role?: string; message: string; rating?: number; status: 'pending' | 'approved' }
export interface Principle { id: string; title: string; description?: string }
