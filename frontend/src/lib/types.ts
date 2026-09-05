export interface ThemeConfig {
  primary_color?: string;
  accent_color?: string;
  background_color?: string;
  font_family?: string;
  logo_url?: string;
}

export interface SectionConfig {
  id: string;
  type: string;
  visible: boolean;
  order: number;
  data: Record<string, unknown>;
}

export interface CareerPageVersionResponse {
  id: string;
  version_number: number;
  status: "draft" | "published" | "archived";
  sections_config: SectionConfig[];
  theme_config: ThemeConfig;
  published_at: string | null;
}

export interface CareersPageResponse {
  id: string;
  company_id: string;
  title: string;
  meta_description: string | null;
  draft_version: CareerPageVersionResponse | null;
  published_version: CareerPageVersionResponse | null;
}

export interface JobResponse {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  description: string | null;
  job_type: "full_time" | "part_time" | "contract" | "internship";
  experience_level: "junior" | "mid" | "senior" | "lead" | null;
  status: "open" | "closed" | "draft";
  created_at: string;
}

export interface PublicCareerPageResponse {
  company_name: string;
  slug: string;
  title: string;
  meta_description: string | null;
  theme_config: ThemeConfig;
  sections_config: SectionConfig[];
  open_jobs: JobResponse[];
}
