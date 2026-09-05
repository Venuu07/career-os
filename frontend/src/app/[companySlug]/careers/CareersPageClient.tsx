"use client";

import { useState, useMemo } from "react";
import { CareerPageRenderer } from "@/components/sections/CareerPageRenderer";
import { PublicCareerPageResponse } from "@/lib/types";
import { JobCard } from "@/components/JobCard";
import { Search, MapPin, Briefcase } from "lucide-react";

function formatJobType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  page: PublicCareerPageResponse;
  companySlug: string;
}

export function CareersPageClient({ page, companySlug }: Props) {
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Derive filter options from actual jobs
  const locations = useMemo(() => {
    const locs = page.open_jobs
      .map((j) => j.location)
      .filter((l): l is string => !!l);
    return Array.from(new Set(locs)).sort();
  }, [page.open_jobs]);

  const jobTypes = useMemo(() => {
    const types = page.open_jobs.map((j) => j.job_type).filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [page.open_jobs]);

  const filteredJobs = useMemo(() => {
    return page.open_jobs.filter((job) => {
      const matchesQuery =
        !query || job.title.toLowerCase().includes(query.toLowerCase());
      const matchesLocation =
        !locationFilter || job.location === locationFilter;
      const matchesType = !typeFilter || job.job_type === typeFilter;
      return matchesQuery && matchesLocation && matchesType;
    });
  }, [page.open_jobs, query, locationFilter, typeFilter]);

  // Build sections — inject filtered jobs into the jobs section
  const sections = page.sections_config;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Render all non-jobs sections, then render jobs section with filter */}
      <CareerPageRenderer
        sections={sections.filter((s) => s.type !== "jobs")}
        theme={page.theme_config}
        jobs={filteredJobs}
        companySlug={companySlug}
      />

      {/* Jobs section with search + filter */}
      {sections.some((s) => s.type === "jobs" && s.visible) && (
        <section id="jobs" className="py-24 md:py-32 px-6 md:px-12 bg-zinc-50 dark:bg-zinc-900/30">
          <div className="max-w-4xl mx-auto">
            {/* Section header */}
            <div className="mb-10">
              {(() => {
                const jobSection = sections.find((s) => s.type === "jobs");
                return (
                  <>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {jobSection?.data?.title || "Open Roles"}
                    </h2>
                    {jobSection?.data?.subtitle && (
                      <p className="mt-3 text-zinc-500 dark:text-zinc-400">
                        {jobSection.data.subtitle}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="search"
                  placeholder="Search roles..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search jobs"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_250)] transition"
                />
              </div>
              {locations.length > 0 && (
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    aria-label="Filter by location"
                    className="h-10 pl-9 pr-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_250)] transition appearance-none cursor-pointer"
                  >
                    <option value="">All locations</option>
                    {locations.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              )}
              {jobTypes.length > 0 && (
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    aria-label="Filter by job type"
                    className="h-10 pl-9 pr-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_250)] transition appearance-none cursor-pointer"
                  >
                    <option value="">All types</option>
                    {jobTypes.map((t) => (
                      <option key={t} value={t}>{formatJobType(t)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Results */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <p className="text-zinc-400 text-sm">
                  {page.open_jobs.length === 0
                    ? "No open roles at this time. Check back soon."
                    : "No roles match your search. Try adjusting your filters."}
                </p>
                {(query || locationFilter || typeFilter) && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setLocationFilter("");
                      setTypeFilter("");
                    }}
                    className="mt-3 text-xs text-[oklch(0.6_0.15_250)] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    companySlug={companySlug}
                    primaryColor={page.theme_config.primary_color}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

