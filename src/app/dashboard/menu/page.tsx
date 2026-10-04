'use client';

import { useEffect, useState } from 'react';
import { getCurrentSessionProfile } from '@/lib/supabaseClient';
import MenuEditor from '@/components/MenuEditor';
import { Loader2 } from 'lucide-react';

export default function MenuManagementPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function init() {
      const s = await getCurrentSessionProfile();
      if (s) setBusinessId(s.profile.id);
      setLoading(false);
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center text-indigo-400 text-sm font-medium flex items-center justify-center space-x-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Menü yükleniyor...</span>
      </div>
    );
  }

  if (!businessId) return null;
  return <MenuEditor businessId={businessId} />;
}
