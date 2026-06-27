'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!imageUrl) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">🔍</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              TinEye Reverse
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Reverse image search - find where images appear online</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl mb-8">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center mb-4 transition-all ${
              dragActive ? 'border-blue-400 bg-blue-900/20' : 'border-slate-600'
            }`}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImageUrl(URL.createObjectURL(file));
              }}
            />
            <p className="text-gray-400 mb-4">Drag & drop an image or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              📁 Choose File
            </button>
          </div>

          <div className="flex gap-4">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste image URL..."
              className="flex-1 px-6 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={!imageUrl || loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-400">Found {result.total_matches} matches</h2>
              <span className="text-sm text-gray-400">Search took {result.search_time_ms}ms</span>
            </div>

            <div className="space-y-4">
              {result.matches?.map((match: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
                  <div className="w-20 h-20 bg-slate-600 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🖼️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{match.page_title}</p>
                    <p className="text-sm text-gray-400">{match.source_name}</p>
                    <p className="text-xs text-gray-500">{match.image_size}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      match.similarity > 90 ? 'text-green-400' :
                      match.similarity > 70 ? 'text-yellow-400' : 'text-orange-400'
                    }`}>
                      {match.similarity}%
                    </p>
                    <p className="text-xs text-gray-400">Similarity</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result && (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 text-center">
              <div className="text-3xl mb-2">🌐</div>
              <h3 className="font-semibold">Web Scale</h3>
              <p className="text-gray-400 text-sm">Billions of images indexed</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold">Instant Results</h3>
              <p className="text-gray-400 text-sm">Fast visual search</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold">Accurate Matching</h3>
              <p className="text-gray-400 text-sm">Computer vision AI</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
