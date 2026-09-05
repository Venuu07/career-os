import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicCareerPageResponse } from "@/lib/types";
import { API_BASE_URL } from "@/lib/api";
import { CareersPageClient } from "./CareersPageClient";

interface Props {
  params: Promise<{ companySlug: string }>;
}

async function getPublicCareerPage(slug: string): Promise<PublicCareerPageResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/companies/${slug}/careers-page`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Fetch failed: ${res.status}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching public careers page:", err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companySlug } = await params;
  const page = await getPublicCareerPage(companySlug);

  if (!page) {
    return { title: "Careers Page Not Found" };
  }

  const title = page.title || `${page.company_name} Careers`;
  const description =
    page.meta_description ||
    `Join ${page.company_name}. Browse ${page.open_jobs.length} open role${page.open_jobs.length !== 1 ? "s" : ""} and learn about our culture.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function PublicCareersPage({ params }: Props) {
  const { companySlug } = await params;
  const page = await getPublicCareerPage(companySlug);

  if (!page) {
    notFound();
  }

  return <CareersPageClient page={page} companySlug={companySlug} />;
}
