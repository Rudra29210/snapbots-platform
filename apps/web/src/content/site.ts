/**
 * Editable site content. In production, the admin "Content" area writes to
 * Firestore `siteContent` documents; this file is the seed/fallback copy.
 *
 * Status labels are deliberate: anything not confirmed by the founder is
 * marked `demonstration`, `in_development` or `planned`. Do not change a status
 * to `live` unless the claim has been verified.
 */
import type { ContentStatus } from '@/types';

export const company = {
  name: 'SNAPBOTS',
  tagline: 'BUILD. INNOVATE. IMPACT.',
  founder: 'Rudra Chandra Mishra',
  email: 'mishrarudra641@gmail.com',
  instagram: 'https://instagram.com/snap.bots',
  founderInstagram: 'https://instagram.com/_rudraa_aaa/',
  location: 'Gaya, Bihar, India',
  mission:
    'SNAPBOTS turns robotics and embedded engineering into practical products, services and learning for people who want to build things that work in the real world.',
  approach:
    'We start from the problem, prototype quickly, validate with real hardware and then harden what works. Every project is scoped in writing, reviewed with the client and documented so it can be maintained.',
};

export const navLinks = [
  { to: '/products', label: 'Products' },
  { to: '/community', label: 'Community' },
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/innovation', label: 'Innovation & AI' },
  { to: '/learn', label: 'Learn' },
  { to: '/about', label: 'About' },
] as const;

export interface ServiceItem {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
}

export const services: ServiceItem[] = [
  {
    id: 'robotics',
    title: 'Robotics',
    summary:
      'Mobile, manipulator and educational robots designed, built and tested end to end.',
    bullets: [
      'Chassis and drivetrain design',
      'Motion control and sensor fusion',
      'Field testing and tuning',
    ],
  },
  {
    id: 'embedded',
    title: 'Embedded systems',
    summary:
      'Firmware and board-level work on microcontrollers and single-board computers.',
    bullets: [
      'Firmware for ESP32, STM32 and Raspberry Pi',
      'Sensor and actuator integration',
      'Power and signal debugging',
    ],
  },
  {
    id: 'iot',
    title: 'IoT',
    summary:
      'Connected devices that report reliably and can be managed remotely.',
    bullets: [
      'Device-to-cloud telemetry',
      'Dashboards and alerting',
      'Secure provisioning and updates',
    ],
  },
  {
    id: 'ai',
    title: 'AI applications',
    summary:
      'Practical AI features for vision, voice and decision support, scoped to what the hardware can do.',
    bullets: [
      'Computer vision prototypes',
      'On-device and cloud inference',
      'Evaluation before deployment',
    ],
  },
  {
    id: 'custom',
    title: 'Custom engineering',
    summary:
      'One-off machines, fixtures and automation built to a written specification.',
    bullets: [
      'Requirements and feasibility review',
      'Mechanical, electrical and software design',
      'Documentation and handover',
    ],
  },
  {
    id: 'prototyping',
    title: 'Prototyping',
    summary:
      'Fast, low-cost prototypes to test an idea before committing to production.',
    bullets: [
      'Proof-of-concept builds',
      'Bench validation reports',
      'Clear next-step recommendations',
    ],
  },
];

export interface ProductItem {
  id: string;
  name: string;
  category: 'Components' | 'Kits' | 'Custom builds';
  summary: string;
  status: ContentStatus;
  availability: string;
}

export const products: ProductItem[] = [
  {
    id: 'sensor-modules',
    name: 'Sensor modules',
    category: 'Components',
    summary:
      'Common sensing components for distance, motion and environment, sold as individual modules.',
    status: 'demonstration',
    availability:
      'Catalogue entry only. Stock, pricing and checkout are not yet connected.',
  },
  {
    id: 'motor-drivers',
    name: 'Motor driver boards',
    category: 'Components',
    summary:
      'Driver boards for DC and stepper motors with protection and clear wiring notes.',
    status: 'demonstration',
    availability: 'Catalogue entry only. Enquire for availability.',
  },
  {
    id: 'learning-kit',
    name: 'Robotics learning kit',
    category: 'Kits',
    summary:
      'A structured kit and guide for students learning embedded control and sensors.',
    status: 'planned',
    availability: 'Planned. Register interest via the enquiry form.',
  },
  {
    id: 'custom-robot',
    name: 'Custom robot build',
    category: 'Custom builds',
    summary:
      'A robot designed around your application, scoped and priced per project.',
    status: 'live',
    availability: 'Available by project enquiry. Scoped individually.',
  },
];

export interface ProjectItem {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  status: ContentStatus;
  details: string;
}

export const projects: ProjectItem[] = [
  {
    id: 'line-follower',
    title: 'Line-following robot platform',
    summary:
      'A reference platform for sensor-based line tracking with tunable control loops.',
    tags: ['Robotics', 'Control', 'Embedded'],
    status: 'demonstration',
    details:
      'A reference build used to explore PID tuning and sensor array calibration. Content is illustrative; replace with verified test results and photos before publishing.',
  },
  {
    id: 'home-monitor',
    title: 'Environmental monitoring node',
    summary:
      'A battery-powered IoT node that reports temperature, humidity and air quality.',
    tags: ['IoT', 'Sensors', 'Cloud'],
    status: 'demonstration',
    details:
      'Demonstrates telemetry, low-power sleep cycles and a simple dashboard. Replace with the actual deployment record once verified.',
  },
  {
    id: 'vision-sorter',
    title: 'Vision-assisted sorting prototype',
    summary:
      'A camera-based prototype that classifies objects and drives a sorting actuator.',
    tags: ['AI', 'Vision', 'Automation'],
    status: 'in_development',
    details:
      'In development. Accuracy and throughput figures will be published only after structured bench testing.',
  },
];

export interface InnovationItem {
  id: string;
  name: string;
  purpose: string;
  maturity: string;
  status: ContentStatus;
  features: string[];
}

export const innovation: InnovationItem[] = [
  {
    id: 'agiai',
    name: 'AgiAI',
    purpose:
      'An AI assistant concept for engineering teams: answering questions over project documentation and assisting with troubleshooting.',
    maturity: 'Early research. Not available to the public.',
    status: 'in_development',
    features: [
      'Document question answering (planned)',
      'Troubleshooting checklists (planned)',
      'Access controls for private documents (planned)',
    ],
  },
  {
    id: 'edge-vision',
    name: 'Edge vision research',
    purpose:
      'Investigating small vision models that run on low-cost boards for robotics and sorting.',
    maturity: 'Research prototype.',
    status: 'in_development',
    features: [
      'Model size and latency trade-off studies',
      'Benchmarks on target hardware (in progress)',
    ],
  },
];

export const learning = {
  intro:
    'SNAPBOTS runs hands-on learning for students and makers. Initiatives below are being shaped; express interest and we will contact you when a session is scheduled.',
  initiatives: [
    {
      title: 'Workshops',
      body: 'Short, hands-on sessions on sensors, motors and microcontrollers.',
      status: 'planned' as ContentStatus,
    },
    {
      title: 'Student projects',
      body: 'Supervised builds for school and college students, scoped to a clear outcome.',
      status: 'planned' as ContentStatus,
    },
    {
      title: 'Community meetups',
      body: 'Build nights for makers to share work and get feedback.',
      status: 'planned' as ContentStatus,
    },
  ],
};

export const partnershipIntro =
  'We work with sponsors, educational institutions, research groups and distributors. Tell us what you have in mind and we will reply with next steps.';

export const faqs: Array<{ category: string; q: string; a: string }> = [
  {
    category: 'Projects',
    q: 'How do I start a custom robotics project?',
    a: 'Submit a project enquiry with your goal, constraints and timeline. We reply with a feasibility view and, if it fits, a written scope before any work begins.',
  },
  {
    category: 'Projects',
    q: 'Do you sign NDAs?',
    a: 'Yes, on request. Mention it in your enquiry and we will arrange it before you share confidential material.',
  },
  {
    category: 'Products',
    q: 'Can I buy products directly on the website?',
    a: 'Not yet. Product pages describe what is planned or available and let you enquire. Online checkout is not connected.',
  },
  {
    category: 'Products',
    q: 'How do I check stock?',
    a: 'Stock is confirmed by our team after you enquire. We do not display live inventory counts yet.',
  },
  {
    category: 'Support',
    q: 'How do I get help with an existing order?',
    a: 'Open a support request from the Support page and include your order reference if you have one.',
  },
  {
    category: 'Support',
    q: 'How quickly will you respond?',
    a: 'We aim to respond within two working days. Response times are not guaranteed and depend on enquiry volume.',
  },
  {
    category: 'Account',
    q: 'Do I need an account to enquire?',
    a: 'No. You can enquire without an account. Creating one lets you track your own enquiries and support requests.',
  },
  {
    category: 'Account',
    q: 'How is my data used?',
    a: 'We use your details only to respond to your request. See the Privacy Policy for retention and your rights.',
  },
];

export const statusLabel: Record<ContentStatus, string> = {
  live: 'Available',
  demonstration: 'Demonstration',
  in_development: 'In development',
  planned: 'Planned',
};