'use client';

import { useState, ChangeEvent } from 'react';
import { uploadImageToStorage } from '@/lib/supabaseClient';
import { Upload, Image as ImageIcon, Link as LinkIcon, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  currentUrl?: string | null;
  onImageUploaded: (url: string) => void;
  folder?: 'logos' | 'products';
  label?: string;
}

export default function ImageUploader({
  currentUrl,
  onImageUploaded,
  folder = 'products',
  label = 'Görsel Yükle'
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local instant preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);
    try {
      const uploadedUrl = await uploadImageToStorage(file, folder);
      if (uploadedUrl) {
        setPreview(uploadedUrl);
        onImageUploaded(uploadedUrl);
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setPreview(urlInput.trim());
      onImageUploaded(urlInput.trim());
      setShowUrlInput(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUploaded('');
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative group w-full h-44 rounded-xl overflow-hidden border border-slate-700 bg-slate-900/60 flex items-center justify-center">
          {/* eslint-disable-next-html-element */}
          <img
            src={preview}
            alt="Görsel Önizleme"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-rose-600/80 text-white rounded-lg hover:bg-rose-600 transition-colors"
              title="Görseli Kaldır"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center space-x-2 text-indigo-400 font-medium text-xs">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Yükleniyor...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {!showUrlInput ? (
            <div className="flex items-center space-x-2">
              <label className="flex-1 cursor-pointer flex items-center justify-center space-x-2 p-3 bg-slate-900/80 border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl hover:bg-slate-900 transition-all text-slate-300 text-xs font-medium">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Dosya Seç</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                title="Görsel URL Yapıştır"
              >
                <LinkIcon className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="url"
                placeholder="https://gorsel-linki.com/resim.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-500"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
