import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Box } from '@mui/material';

interface NoSqlQueryEditorProps {
  query: string;
  setQuery: (q: string) => void;
  executeQuery: (e: React.FormEvent) => void;
  queryLoading: boolean;
  queryError: string | null;
  themeMode?: 'light' | 'dark';
}

const NoSqlQueryEditor: React.FC<NoSqlQueryEditorProps> = ({
  query,
  setQuery,
  executeQuery,
  queryLoading,
  queryError,
  themeMode = 'light',
}) => {
  return (
    <Box component="form" onSubmit={executeQuery} sx={{ width: '100%', background: themeMode === 'dark' ? '#23272f' : '#fff', color: themeMode === 'dark' ? '#e0e0e0' : '#222', borderRadius: 2 }}>
      <Box sx={{ width: '100%', height: 220, mb: 2 }}>
        <MonacoEditor
          width="100%"
          height="100%"
          defaultLanguage="sql"
          language="sql"
          value={query}
          onChange={v => setQuery(v || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            fontFamily: 'monospace',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          theme={themeMode === 'dark' ? 'vs-dark' : 'light'}
        />
      </Box>
    </Box>
  );
};

export default NoSqlQueryEditor;

