'use client';

import { useState, useEffect } from 'react';
import { mockStore } from '@/lib/mockStore';
import { Profile, SessionUser } from '@/lib/types';
import Link from 'next/link';
import { Search, Building2, Store, ExternalLink, Edit3, ShieldAlert, CheckCircle2, XCircle, Power, Lock } from 'lucide-react';

export default function AdminBusinessesPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [businesses, setBusinesses] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const s = mockStore.getCurrentSession();
    setSession(s);
    loadBusinesses();
  }, []);

  const loadBusinesses = () => {
    const profiles = mockStore.getProfiles().filter(p => p.role === 'BUSINESS');
    setBusinesses(profiles);
  };

  const handleToggleStatus = (target: Profile) => {
    if (!session || session.profile.role !== 'ADMIN') return;

    const newStatus = !target.is_active;
    const updated = mockStore.updateProfile(
      target.id,
      { is_active: newStatus },
      session.profile // Records audit log
    );

    loadBusinesses();
  };

  const filtered = businesses.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.address?.toLowerCase().includes(q)
    );
  });

  const activeCount = businesses.filter(b => b.is_active).length;
  const passiveCount = businesses.filter(b => !b.is_active).length;

  return (
    <div className="space-y-6">
      
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-slate-800">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Toplam Kayıtlı İşletme</p>
          <p className="text-3xl font-extrabold text-white mt-2 font-mono">{businesses.length}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-emerald-500/20 bg-emerald-950/10">
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Aktif İşletmeler</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">{activeCount}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-rose-500/20 bg-rose-950/10">
          <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Pasif İşletmeler</p>
          <p className="text-3xl font-extrabold text-rose-400 mt-2 font-mono">{passiveCount}</p>
        </div>
      </div>

      {/* Search Bar & Header */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">İşletme Listesi</h2>
            <p className="text-xs text-slate-400">Sistemdeki tüm kayıtlı işletmelerin hesap durumunu inceleyin</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="İşletme adı veya slug ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Business Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">İşletme Adı & Logo</th>
                <th className="pb-3 px-3">Kalıcı Slug (URL)</th>
                <th className="pb-3 px-3">İletişim</th>
                <th className="pb-3 px-3">Hesap Durumu</th>
                <th className="pb-3 px-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/50 transition-colors group">
                  
                  {/* Name & Logo */}
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-3">
                      {b.logo_url ? (
                        /* eslint-disable-next-html-element */
                        <img src={b.logo_url} alt={b.name} className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-700" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-purple-950 text-purple-400 font-bold flex items-center justify-center shrink-0 border border-purple-800">
                          <Store className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-100 group-hover:text-purple-300 transition-colors">{b.name}</p>
                        <p className="text-[10px] text-slate-500">Kayıt: {new Date(b.created_at).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                  </td>

                  {/* Permanent Slug */}
                  <td className="py-3 px-3 font-mono text-indigo-400">
                    <span className="flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>/{b.slug}</span>
                    </span>
                  </td>

                  {/* Phone / Address */}
                  <td className="py-3 px-3 text-slate-300">
                    <p>{b.phone || '-'}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{b.address || '-'}</p>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleStatus(b)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center space-x-1 transition-all ${
                        b.is_active ? 'badge-active' : 'badge-passive'
                      }`}
                      title="Tıkla ve Durumu Değiştir"
                    >
                      <Power className="w-3 h-3" />
                      <span>{b.is_active ? 'Aktif' : 'Pasif'}</span>
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/${b.slug}`}
                        target="_blank"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                        title="Canlı Menüyü Gör"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/admin/business/${b.id}`}
                        className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Müdahale Et</span>
                      </Link>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
