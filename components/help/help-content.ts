// components/help/help-content.ts

export type HelpEntry = {
  title: string;
  description: string;
  bullets: string[];
};

export const HELP_CONTENT: Record<string, HelpEntry> = {
  '/': {
    title: 'Overview Dashboard Guide',
    description:
      'The dashboard is your executive command center. It provides a real-time summary of your workspace health and platform activity.',
    bullets: [
      'Track top-level KPIs — total queries, active departments, documents indexed, and overall satisfaction score.',
      'Monitor governance alerts such as duplicate instructions or stale documents that need review.',
      'Click any department card to open its document library and AI chat workspace.',
      'The gold Public Knowledge Base card lets you share a public URL and QR code for external visitors.',
    ],
  },
  '/dashboard': {
    title: 'Overview Dashboard Guide',
    description:
      'The dashboard is your executive command center. It provides a real-time summary of your workspace health and platform activity.',
    bullets: [
      'Track top-level KPIs — total queries, active departments, documents indexed, and overall satisfaction score.',
      'Monitor governance alerts such as duplicate instructions or stale documents that need review.',
      'Click any department card to open its document library and AI chat workspace.',
      'The gold Public Knowledge Base card lets you share a public URL and QR code for external visitors.',
    ],
  },
  '/library': {
    title: 'Knowledge Library Guide',
    description:
      'This is where you manage the trusted data that powers your AI agents. Keep documents up to date and well-organised for the best AI accuracy.',
    bullets: [
      'Upload Word documents (.docx) or plain text files (.txt) via the Upload button.',
      'Check sync status — only "Synced" files are actively used by agents when answering questions.',
      'BlaRiva will warn you if two documents contain conflicting or duplicate instructions for the same topic.',
      'Use Edit and Delete actions to keep your knowledge base clean and current.',
    ],
  },
  '/chat': {
    title: 'AI Workspace Guide',
    description:
      'Interact with your deployed departmental agents securely. Every answer is grounded in your uploaded documents — nothing is invented.',
    bullets: [
      'Select a department from the pill toggles at the top to target the right knowledge container.',
      'Hover over Source Chips under AI responses to see exactly which document the answer came from.',
      'Rate each answer with Thumbs Up or Thumbs Down — these ratings feed the Analytics dashboard.',
      'Only documents you have been granted access to will be searched by the AI.',
    ],
  },
  '/builder': {
    title: 'Agent Builder Guide',
    description:
      'Configure and test custom public AI agents before deploying them to your clients or website visitors.',
    bullets: [
      "Define the agent's identity, welcome greeting, and strict behavioural instructions.",
      'Restrict which department folders the agent is allowed to search.',
      'Use the Share Public Agent button to generate a unique URL and scannable QR code.',
      "Customise the chat widget's accent colour and avatar, then embed it on any website.",
    ],
  },
  '/analytics': {
    title: 'Analytics Guide',
    description:
      'Deep dive into query volume, staff adoption, and agent performance to continuously improve your knowledge base.',
    bullets: [
      'Track query volume trends over time and identify peak usage periods.',
      'Review the Thumbs Down heatmap to find which documents are generating poor answers.',
      'The Audit Log shows every document access and edit event for compliance purposes.',
      'Unanswered query reports highlight gaps — upload new documents to fill them.',
    ],
  },
  '/admin': {
    title: 'Admin & Roles Guide',
    description:
      'Manage staff access with role-based permissions. No one sees what they should not see.',
    bullets: [
      'Add a new staff member simply by entering their email address — they receive automatic access on first sign-in.',
      'Assign each person a role per department: Viewer (read-only chat) or Editor (can upload and edit documents).',
      'Remove access instantly by deleting a staff member — their session is revoked immediately.',
      'Public agent users require no account — they access only the documents you explicitly mark as public.',
    ],
  },
  '/settings': {
    title: 'Settings Guide',
    description:
      'Configure your organisation profile, notification preferences, and security policies.',
    bullets: [
      'Update your organisation name, logo, and branding for the public-facing chat widget.',
      'Configure email notification triggers — e.g., alert admins when satisfaction drops below a threshold.',
      'Manage SSO and authentication settings for enterprise identity providers.',
      'Export your full audit log as a CSV for external compliance reporting.',
    ],
  },
};