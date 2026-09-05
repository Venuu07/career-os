import { ThemeConfig, BaseSectionData } from "@/lib/types";
import { HeroPreview, HeroInspector } from "./HeroSection";
import { AboutPreview, AboutInspector } from "./AboutSection";
import { CulturePreview, CultureInspector } from "./CultureSection";
import { BenefitsPreview, BenefitsInspector } from "./BenefitsSection";
import { VideoPreview, VideoInspector } from "./VideoSection";
import { JobsPreview, JobsInspector } from "./JobsSection";
import { CustomPreview, CustomInspector } from "./CustomSection";

export interface PreviewProps {
  data: BaseSectionData;
  theme: ThemeConfig;
  jobs?: JobItem[]; // Passed down to Jobs section
  companySlug?: string; // Passed on public pages for job detail links
}

export interface JobItem {
  id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  job_type?: string;
  experience_level?: string | null;
  status?: string;
  description?: string | null;
}

export interface InspectorProps {
  data: BaseSectionData;
  updateData: (newData: BaseSectionData) => void;
}

export interface SectionDefinition {
  type: string;
  label: string;
  description: string;
  icon: string;
  defaultData: Record<string, unknown>;
  Preview: React.FC<PreviewProps>;
  Inspector: React.FC<InspectorProps>;
}

export const sectionRegistry: Record<string, SectionDefinition> = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "The main attention-grabbing header for your careers page.",
    icon: "◆",
    defaultData: {
      headline: "Come build with us.",
      subheadline: "We're a team obsessed with craft. Join us to solve hard problems and ship products people love.",
      ctaText: "View Open Roles",
      ctaUrl: "#jobs",
      alignment: "center",
    },
    Preview: HeroPreview,
    Inspector: HeroInspector,
  },
  about: {
    type: "about",
    label: "About Us",
    description: "Tell your company story and share your mission.",
    icon: "○",
    defaultData: {
      title: "Our Story",
      content: "We started with a simple belief: that the best teams build the best products. We're on a mission to make work more meaningful for everyone.",
      layout: "text-only",
    },
    Preview: AboutPreview,
    Inspector: AboutInspector,
  },
  culture: {
    type: "culture",
    label: "Culture",
    description: "Showcase your values and what life is like at your company.",
    icon: "✦",
    defaultData: {
      title: "Life at the company",
      introduction: "We believe great culture is built through trust, transparency, and shared purpose.",
      values: [
        { icon: "🚀", title: "Move fast", description: "We ship quickly and iterate based on real feedback." },
        { icon: "🤝", title: "Trust by default", description: "We give each other the benefit of the doubt and assume good intent." },
        { icon: "💡", title: "Always learning", description: "We invest in our team's growth and celebrate curiosity." },
      ],
    },
    Preview: CulturePreview,
    Inspector: CultureInspector,
  },
  benefits: {
    type: "benefits",
    label: "Benefits",
    description: "List the perks and benefits you offer to employees.",
    icon: "◇",
    defaultData: {
      title: "Benefits & Perks",
      subtitle: "We take care of our team so they can do their best work.",
      items: [
        { icon: "🏥", title: "Health insurance", description: "Comprehensive medical, dental and vision coverage." },
        { icon: "🏖️", title: "Flexible PTO", description: "Take time off when you need it. No approval required." },
        { icon: "💻", title: "Remote-first", description: "Work from anywhere. We're async and distributed." },
        { icon: "📚", title: "Learning budget", description: "$2,000/year for books, courses, and conferences." },
        { icon: "💰", title: "Equity", description: "Meaningful equity stake for all full-time employees." },
        { icon: "🌍", title: "Sabbatical", description: "4-week paid sabbatical after 4 years of tenure." },
      ],
    },
    Preview: BenefitsPreview,
    Inspector: BenefitsInspector,
  },
  video: {
    type: "video",
    label: "Video",
    description: "Embed a YouTube or Vimeo video to showcase your team or culture.",
    icon: "▶",
    defaultData: {
      title: "See us in action",
      description: "Watch what a day in the life looks like at our company.",
      videoUrl: "",
    },
    Preview: VideoPreview,
    Inspector: VideoInspector,
  },
  jobs: {
    type: "jobs",
    label: "Open Roles",
    description: "Automatically displays your active job listings with search and filter.",
    icon: "≡",
    defaultData: {
      title: "Open Roles",
      subtitle: "Find your next opportunity.",
    },
    Preview: JobsPreview,
    Inspector: JobsInspector,
  },
  custom: {
    type: "custom",
    label: "Custom Content",
    description: "Add any freeform heading, body text, or a call-to-action.",
    icon: "□",
    defaultData: {
      heading: "Custom section",
      body: "Add any content you'd like here.",
      alignment: "left",
    },
    Preview: CustomPreview,
    Inspector: CustomInspector,
  },
};
