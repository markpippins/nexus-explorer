import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  ExternalLink,
  BookmarkPlus,
  RefreshCw,
  Globe,
  Tag,
  Check,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { FileItem, FolderSearchResponse, ThemeMode } from '../types';

interface SearchPaneProps {
  activeFolder: FileItem | null;
  folderPath: string;
  filesInFolder: FileItem[];
  theme: ThemeMode;
  onAddBookmarkToFileExplorer: (title: string, url: string, description?: string) => void;
  onClosePane?: () => void;
}

export const SearchPane: React.FC<SearchPaneProps> = ({
  activeFolder,
  folderPath,
  filesInFolder,
  theme,
  onAddBookmarkToFileExplorer,
  onClosePane,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchData, setSearchData] = useState<FolderSearchResponse | null>(null);
  const [customQuery, setCustomQuery] = useState<string>('');
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const folderName = activeFolder ? activeFolder.name : 'Root Workspace';

  // Fetch search grounding whenever folder changes
  useEffect(() => {
    fetchFolderSearch(folderName, folderPath, filesInFolder);
  }, [activeFolder?.id]);

  const fetchFolderSearch = async (
    name: string,
    path: string,
    files: FileItem[],
    overrideQuery?: string
  ) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/folder-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderName: name,
          folderPath: path,
          files: files.map((f) => ({ name: f.name, type: f.fileType, tags: f.tags })),
          customQuery: overrideQuery || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Search grounding failed with HTTP status ${res.status}`);
      }

      const data: FolderSearchResponse = await res.json();
      setSearchData(data);
    } catch (err: any) {
      console.error('Failed to fetch folder search grounding:', err);
      setErrorMsg('Failed to pull web grounding. Showing offline fallback insights.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    fetchFolderSearch(folderName, folderPath, filesInFolder, customQuery);
  };

  const handleBookmarkSave = (title: string, url: string, description?: string) => {
    onAddBookmarkToFileExplorer(title, url, description);
    setSavedUrls((prev) => new Set(prev).add(url));
  };

  // Theme styling
  const paneBg =
    theme === 'light'
      ? 'bg-slate-50/90 border-slate-200 text-slate-800'
      : theme === 'steel'
      ? 'bg-[#0f172a] border-[#334155] text-[#cbd5e1]'
      : 'bg-zinc-900/95 border-zinc-800 text-zinc-100';

  const cardBg =
    theme === 'light'
      ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
      : theme === 'steel'
      ? 'bg-[#1e293b] border-[#334155] shadow-md hover:border-[#38bdf8]'
      : 'bg-zinc-950 border-zinc-800 shadow-md hover:border-zinc-700';

  const inputBg =
    theme === 'light'
      ? 'bg-slate-100 border-slate-200 text-slate-800'
      : theme === 'steel'
      ? 'bg-[#0f172a] border-[#334155] text-slate-100 focus:border-[#38bdf8]'
      : 'bg-zinc-950 border-zinc-800 text-zinc-100';

  return (
    <aside className={`w-80 lg:w-96 shrink-0 border-l flex flex-col h-full overflow-y-auto select-none p-4 space-y-4 ${paneBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-current opacity-80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
              <span>Google Search Grounding</span>
            </h3>
            <p className="text-[10px] opacity-60 truncate max-w-[190px]">
              Active: <span className="font-semibold">{folderName}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchFolderSearch(folderName, folderPath, filesInFolder, customQuery)}
          disabled={loading}
          className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          title="Refresh Search Grounding"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Custom Refinement Query Bar */}
      <form onSubmit={handleCustomSearchSubmit} className="relative">
        <input
          type="text"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          placeholder={`Refine web search for "${folderName}"...`}
          className={`w-full pl-3 pr-8 py-2 text-xs rounded-xl border outline-none transition-all ${inputBg}`}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cyan-500 hover:text-cyan-400"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </form>

      {loading ? (
        /* Loading Skeleton */
        <div className="space-y-3 py-6">
          <div className="flex items-center justify-center gap-2 text-xs text-cyan-500 font-medium animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Querying Google Search Grounding for "{folderName}"...</span>
          </div>
          <div className="h-24 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
          <div className="h-20 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
          <div className="h-20 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
        </div>
      ) : (
        <>
          {/* AI Search Summary Card */}
          {searchData?.summary && (
            <div className={`p-3.5 rounded-2xl border transition-all ${cardBg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Web Overview
                </span>
                <span className="text-[10px] opacity-50 font-mono">Gemini 3.6 Flash</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{searchData.summary}</p>
            </div>
          )}

          {/* Search Queries Executed */}
          {searchData?.searchQueries && searchData.searchQueries.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-1">
                Google Search Queries
              </span>
              <div className="flex flex-wrap gap-1">
                {searchData.searchQueries.map((q, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono truncate max-w-full"
                  >
                    🔍 {q}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Google Search Results */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">
                Live Web Results
              </span>
              <span className="text-[10px] opacity-50">
                {searchData?.results?.length || 0} found
              </span>
            </div>

            {searchData?.results && searchData.results.length > 0 ? (
              searchData.results.map((item, index) => {
                const isSaved = savedUrls.has(item.url);
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-2xl border transition-all space-y-2 group ${cardBg}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-xs hover:text-cyan-400 transition-colors line-clamp-2"
                      >
                        {item.title}
                      </a>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono shrink-0 opacity-70">
                        {item.source}
                      </span>
                    </div>

                    <p className="text-[11px] opacity-75 line-clamp-2 leading-snug">
                      {item.snippet}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-current/10 text-[10px]">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-cyan-500 hover:underline"
                      >
                        <span>Visit Site</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleBookmarkSave(item.title, item.url, item.snippet)}
                        disabled={isSaved}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-all ${
                          isSaved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-3 h-3" />
                            <span>Add to Folder</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs opacity-50 italic px-1">No web search results available.</p>
            )}
          </div>

          {/* Recommended Bookmarks */}
          {searchData?.recommendedBookmarks && searchData.recommendedBookmarks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-current/10">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-1">
                Suggested Resources to Save
              </span>
              {searchData.recommendedBookmarks.map((bm, i) => {
                const isSaved = savedUrls.has(bm.url);
                return (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${cardBg}`}
                  >
                    <div className="truncate">
                      <p className="font-semibold truncate">{bm.title}</p>
                      <p className="text-[10px] opacity-60 truncate">{bm.description}</p>
                    </div>
                    <button
                      onClick={() => handleBookmarkSave(bm.title, bm.url, bm.description)}
                      disabled={isSaved}
                      className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                        isSaved ? 'text-emerald-400' : 'text-cyan-400 hover:bg-cyan-500/10'
                      }`}
                      title="Import Bookmark into Folder"
                    >
                      {isSaved ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Topic Tags */}
          {searchData?.topicTags && searchData.topicTags.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-current/10">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-1">
                Folder Topic Badges
              </span>
              <div className="flex flex-wrap gap-1">
                {searchData.topicTags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 opacity-80"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
};
