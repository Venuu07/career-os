import { SectionConfig, ThemeConfig } from "@/lib/types";
import { sectionRegistry, JobItem } from "./registry";

interface CareerPageRendererProps {
  sections: SectionConfig[];
  theme: ThemeConfig;
  jobs?: JobItem[];
  companySlug?: string; // Passed on public pages for job links
}

/**
 * Universal renderer for Career Pages.
 * Used by the Builder Preview, Candidate Preview mode, and Public Career Page.
 */
export function CareerPageRenderer({
  sections,
  theme,
  jobs = [],
  companySlug,
}: CareerPageRendererProps) {
  const visibleSections = [...sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const fontFamilyStyle = theme.font_family ? { fontFamily: theme.font_family } : {};

  return (
    <div className="w-full flex flex-col min-h-screen" style={{ ...fontFamilyStyle, backgroundColor: "var(--canvas)" }}>
      {visibleSections.length === 0 ? (
        <div
          className="flex-1 flex flex-col items-center justify-center p-12 gap-3"
          style={{ color: "var(--muted-ink)" }}
        >
          <div className="text-4xl" style={{ opacity: 0.3 }}>□</div>
          <p className="text-sm">No sections to display.</p>
        </div>
      ) : (
        visibleSections.map((section) => {
          const SectionDef = sectionRegistry[section.type];
          if (!SectionDef) {
            console.warn(`Unknown section type: "${section.type}"`);
            return null;
          }
          const PreviewComponent = SectionDef.Preview;
          return (
            <PreviewComponent
              key={section.id}
              data={section.data}
              theme={theme}
              jobs={jobs}
              companySlug={companySlug}
            />
          );
        })
      )}
    </div>
  );
}
