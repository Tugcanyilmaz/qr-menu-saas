import { fetchProfileBySlug, fetchCategoriesDB, fetchProductsDB } from '@/lib/supabaseClient';
import PublicMenuViewer from '@/components/PublicMenuViewer';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;

  // Live lookup profile from Supabase DB by permanent slug
  const business = await fetchProfileBySlug(slug);

  if (!business) {
    notFound();
  }

  const [categories, products] = await Promise.all([
    fetchCategoriesDB(business.id),
    fetchProductsDB(business.id)
  ]);

  return (
    <PublicMenuViewer
      business={business}
      categories={categories}
      products={products}
    />
  );
}
