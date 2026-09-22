import { mockStore } from '@/lib/mockStore';
import PublicMenuViewer from '@/components/PublicMenuViewer';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;

  // Lookup business by permanent slug
  const business = mockStore.getProfileBySlug(slug);

  if (!business) {
    notFound();
  }

  const categories = mockStore.getCategories(business.id);
  const products = mockStore.getProducts(business.id);

  return (
    <PublicMenuViewer
      business={business}
      categories={categories}
      products={products}
    />
  );
}
