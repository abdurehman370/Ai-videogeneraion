"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";

/**
 * AvatarSelector: Paginated grid of avatars; click to select; highlights active avatar.
 */
export default function AvatarSelector({
  avatars,
  selectedId,
  onSelect,
  loading = false,
}: {
  avatars: { avatar_id: string; avatar_name: string; preview_image_url: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const avatarsPerPage = 12; // 3x4 grid on desktop, responsive on mobile

  const paginatedAvatars = useMemo(() => {
    const startIndex = (currentPage - 1) * avatarsPerPage;
    const endIndex = startIndex + avatarsPerPage;
    return avatars.slice(startIndex, endIndex);
  }, [avatars, currentPage, avatarsPerPage]);

  const totalPages = Math.ceil(avatars.length / avatarsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <label className="text-lg font-semibold">Choose an Avatar</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">
            {avatars.length} avatars
          </span>
          {totalPages > 1 && (
            <span className="text-sm text-neutral-400">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-neutral-500">Loading avatars...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {paginatedAvatars.map((a) => {
              const active = a.avatar_id === selectedId;
              return (
                <motion.button
                  key={a.avatar_id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(a.avatar_id)}
                  className={`relative rounded-xl border p-3 text-left transition-all duration-200 ${
                    active
                      ? "border-brand ring-2 ring-brand/30 bg-brand/5"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="h-16 w-16 rounded-full overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-800 flex-shrink-0">
                      <img 
                        src={a.preview_image_url} 
                        alt={a.avatar_name} 
                        width={64} 
                        height={64} 
                        className="h-16 w-16 object-cover" 
                        onError={(e) => {
                          console.warn("Avatar image failed to load, using fallback:", a.avatar_name);
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMTJDMTQuMjA5MSAxMiAxNiAxMC4yMDkxIDE2IDhDMTYgNS43OTA5IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwOSA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOWNhM2FmIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5Ljc5MDg2IDE0IDggMTUuNzkwOSA4IDE4VjIwSDE2VjE4QzE2IDE1Ljc5MDkgMTQuMjA5MSAxNCAxMiAxNFoiIGZpbGw9IiM5Y2EzYWYiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                        }}
                      />
                    </div>
                    <div className="text-center w-full px-1">
                      <div className="text-sm font-medium truncate w-full" title={a.avatar_name}>
                        {a.avatar_name}
                      </div>
                      <div className="text-xs text-neutral-500 truncate w-full">
                        #{a.avatar_id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                  {active && (
                    <motion.div
                      layoutId="selected-indicator"
                      className="absolute inset-0 rounded-xl ring-2 ring-brand pointer-events-none"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                ← Previous
              </motion.button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-brand text-white"
                          : "border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Next →
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
