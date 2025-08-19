import React from 'react';
import { Box, List, ListItemButton, Typography, FormControl, Select, MenuItem, InputLabel, Pagination } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface NoSqlResultsListProps {
  queryResult: any;
  selectedDocKey: string | null;
  setSelectedDocKey: (key: string | null) => void;
  setSelectedNodeData: (doc: any) => void;
  setTabIndex: (index: number) => void;
  themeMode: ThemeMode;
}

function formatRelativeTime(fromMs: number): string {
  const now = Date.now();
  let diff = Math.max(0, Math.floor((now - fromMs) / 1000));
  if (diff < 60) return diff <= 1 ? '1 sec ago' : `${diff} secs ago`;
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return minutes === 1 ? '1 min ago' : `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return days === 1 ? '1 day ago' : `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

function getDocumentTimestampMs(doc: any): number {
  if (!doc || typeof doc !== 'object') return 0;
  if (doc._ts != null && !Number.isNaN(Number(doc._ts))) {
    return Number(doc._ts) * 1000;
  }
  if (doc.createdAt) {
    const t = Date.parse(doc.createdAt);
    return Number.isNaN(t) ? 0 : t;
  }
  if (doc._lastModified) {
    const t = Date.parse(doc._lastModified);
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
}

const NoSqlResultsList: React.FC<NoSqlResultsListProps> = ({
  queryResult,
  selectedDocKey,
  setSelectedDocKey,
  setSelectedNodeData,
  setTabIndex,
  themeMode,
}) => {
  const docs: any[] = Array.isArray(queryResult)
    ? queryResult
    : Array.isArray(queryResult?.documents)
      ? queryResult.documents
      : [];

  const sortedDocs = docs.slice().sort((a, b) => getDocumentTimestampMs(b) - getDocumentTimestampMs(a));

  // Pagination state and derived values
  const [pageSize, setPageSize] = React.useState<number>(25);
  const [page, setPage] = React.useState<number>(1);

  React.useEffect(() => {
    setPage(1);
  }, [queryResult, pageSize]);

  // Clamp page size to a maximum of 50 in case of stale values
  React.useEffect(() => {
    if (pageSize > 50) setPageSize(50);
  }, [pageSize]);

  const totalDocs = sortedDocs.length;
  const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize));
  const startIndex = (page - 1) * pageSize;
  const currentDocs = sortedDocs.slice(startIndex, startIndex + pageSize);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header controls outside the list (right-aligned dropdown) */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" sx={{ color: themeMode === 'dark' ? '#b0b0b0' : '#666' }}>
          {totalDocs === 0 ? 'No documents' : `Showing ${startIndex + 1}–${Math.min(startIndex + pageSize, totalDocs)} of ${totalDocs}`}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="page-size-label">Items per page</InputLabel>
          <Select
            labelId="page-size-label"
            id="page-size-select"
            value={String(pageSize)}
            label="Items per page"
            onChange={(e) => {
              const next = Number(e.target.value);
              setPageSize(next);
              setPage(1);
            }}
            sx={{
              '& .MuiSelect-select': {
                py: 0.25,
                px: 1,
                fontSize: 12,
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  '& .MuiMenuItem-root': {
                    minHeight: 28,
                    py: 0.25,
                    fontSize: 12,
                  },
                },
              },
            }}
          >
            <MenuItem value={"10"}>10</MenuItem>
            <MenuItem value={"25"}>25</MenuItem>
            <MenuItem value={"50"}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{
        bgcolor: themeMode === 'dark' ? '#23272f' : '#fff',
        border: '1px solid',
        borderColor: themeMode === 'dark' ? '#2f333b' : '#e0e0e0',
        borderRadius: 1,
        boxShadow: 'none',
      }}>
        <Box sx={{ maxHeight: '100vh', overflow: 'auto' }}>
          <List dense sx={{ p: 0 }}>
            {currentDocs.map((doc, idx) => {
              const docKey = String(doc?.id ?? doc?._rid ?? idx);
              return (
                <ListItemButton
                  key={docKey}
                  selected={selectedDocKey === docKey}
                  onClick={() => {
                    setSelectedNodeData(doc);
                    setSelectedDocKey(docKey);
                    setTabIndex(2);
                  }}
                  sx={{
                    borderRadius: 0,
                    py: 0.75,
                    px: 1,
                    transition: 'background-color 120ms ease',
                    borderBottom: '1px solid',
                    borderBottomColor: themeMode === 'dark' ? '#2f333b' : '#e0e0e0',
                    '&:last-of-type': { borderBottom: 'none' },
                    '&.Mui-selected': {
                      bgcolor: '#66bb6a',
                      color: '#ffffff',
                      borderBottomColor: '#2e7d32',
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: '#5aae5f',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ minWidth: 18, textAlign: 'right', color: 'inherit', opacity: 0.9 }}>
                        {startIndex + idx + 1}.
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'inherit' }}
                      >
                        {doc?.id ?? '(no id)'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2, whiteSpace: 'nowrap' }}>
                      {(() => {
                        const ts = doc?._ts ? Number(doc._ts) * 1000 : (doc?.createdAt ? Date.parse(doc.createdAt) : NaN);
                        return isNaN(ts) ? '' : formatRelativeTime(ts);
                      })()}
                    </Typography>
                  </Box>
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Box>
      {/* Footer pagination outside the list (right-aligned) */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 1 }}>
          <Pagination
            color="primary"
            size="small"
            variant="outlined"
            count={totalPages}
            page={Math.min(page, totalPages)}
            onChange={(_, value) => setPage(value)}
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 0,
                minWidth: 28,
                height: 28,
                fontSize: 12,
              },
              '& .MuiPaginationItem-outlined': {
                borderColor: themeMode === 'dark' ? '#2f333b' : '#e0e0e0',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default NoSqlResultsList;

