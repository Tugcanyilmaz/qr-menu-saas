'use client';

import { useState, useEffect } from 'react';
import { mockStore } from '@/lib/mockStore';
import { AuditLog } from '@/lib/types';
import { History, ShieldAlert, Store, Clock, FileText } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const list = mockStore.getAuditLogs();
    setLogs(list);
  }, []);

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 rounded-2xl border-purple-500/30">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <History className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Admin Audit Log Kayıtları</h2>
            <p className="text-xs text-slate-400">Yöneticiler tarafından gerçekleştirilen kritik işlemlerin geçmişi</p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Henüz herhangi bir audit log kaydı bulunmamaktadır.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-950/60 text-purple-400 rounded-lg border border-purple-800 shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{log.admin_name || 'Admin'}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-indigo-400 font-semibold">{log.target_business_name || 'İşletme'}</span>
                    </div>

                    <p className="text-slate-300 font-mono mt-1 font-semibold text-[11px]">
                      {log.action}
                    </p>

                    {log.details && (
                      <p className="text-[11px] text-slate-400 mt-1 bg-slate-950 p-2 rounded-lg font-mono border border-slate-800/80">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[11px] text-slate-500 shrink-0 self-end sm:self-center">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(log.created_at).toLocaleString('tr-TR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
