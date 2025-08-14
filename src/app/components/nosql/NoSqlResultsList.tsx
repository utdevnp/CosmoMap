import React from 'react';
import { Box, List, ListItemButton, Typography } from '@mui/material';

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

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{
        bgcolor: themeMode === 'dark' ? '#23272f' : '#fff',
        border: '1px solid',
        borderColor: themeMode === 'dark' ? '#2f333b' : '#e0e0e0',
        borderRadius: 1,
        boxShadow: 'none',
      }}>
        <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <List dense sx={{ p: 0 }}>
            {sortedDocs.map((doc, idx) => {
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
                        {idx + 1}.
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
    </Box>
  );
};

export default NoSqlResultsList;

