export const dynamic = "force-dynamic";

import { IndustryDetailPage } from '@/components/marketing/IndustryDetailPage';
import { INDUSTRY_SLUGS, isValidIndustrySlug } from '@/lib/industries-data';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  if (!isValidIndustrySlug(slug)) {
    notFound();
  }

  return <IndustryDetailPage slug={slug} />;
}

export async function generateStaticParams() {
  return INDUSTRY_SLUGS.map((slug) => ({
    slug,
  }));
}
