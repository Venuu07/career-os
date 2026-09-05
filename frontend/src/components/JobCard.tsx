"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Accepts both JobResponse (public page) and JobItem (builder preview)
interface JobCardJob {
  id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  job_type?: string;
  experience_level?: string | null;
  created_at?: string;
}

interface JobCardProps {
  job: JobCardJob;
  companySlug?: string;
  primaryColor?: string;
}

function formatJobType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatExperience(level: string): string {
  if (level === "mid") return "Mid Level";
  return level.charAt(0).toUpperCase() + level.slice(1) + " Level";
}

function getDaysAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Posted today";
  if (diffDays === 1) return "Posted yesterday";
  if (diffDays < 30) return `Posted ${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "Posted 1 month ago";
  return `Posted ${diffMonths} months ago`;
}

export function JobCard({ job, companySlug, primaryColor }: JobCardProps) {
  const color = primaryColor || "#18181b"; // Default to zinc-900

  const primaryMeta = [job.location, job.job_type ? formatJobType(job.job_type) : null].filter(Boolean);
  const secondaryMeta = [job.experience_level ? formatExperience(job.experience_level) : null, job.created_at ? getDaysAgo(job.created_at) : null].filter(Boolean);

  const inner = (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all duration-200 cursor-pointer">
      <div className="flex-1">
        {job.department && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            {job.department}
          </p>
        )}
        <h3 
          className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2 transition-colors"
          style={{ "--hover-color": color } as React.CSSProperties}
        >
          <span className="group-hover:text-[var(--hover-color)]">{job.title}</span>
        </h3>
        
        <div className="flex flex-col gap-1.5 sm:gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          {primaryMeta.length > 0 && (
            <div className="flex items-center gap-2">
              {primaryMeta.map((m, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-zinc-300 dark:text-zinc-700">·</span>}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{m}</span>
                </span>
              ))}
            </div>
          )}
          
          {secondaryMeta.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {secondaryMeta.map((m, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-zinc-300 dark:text-zinc-700">·</span>}
                  <span>{m}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 sm:mt-0 flex items-center self-end sm:self-auto gap-2">
        <span 
          className="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"
          style={{ color }}
        >
          View role
        </span>
        <div 
          className="h-8 w-8 rounded-full bg-zinc-50 dark:bg-zinc-900 group-hover:bg-[var(--hover-bg)] flex items-center justify-center transition-colors border border-zinc-100 dark:border-zinc-800 group-hover:border-[var(--hover-color)]"
          style={{ 
            "--hover-bg": `${color}15`, 
            "--hover-color": color 
          } as React.CSSProperties}
        >
          <ChevronRight 
            className="h-4 w-4 text-zinc-400 group-hover:text-[var(--hover-color)] transition-colors" 
          />
        </div>
      </div>
    </div>
  );

  if (companySlug) {
    return (
      <Link href={`/${companySlug}/careers/jobs/${job.id}`} className="block">
        {inner}
      </Link>
    );
  }

  return <div className="block">{inner}</div>;
}
