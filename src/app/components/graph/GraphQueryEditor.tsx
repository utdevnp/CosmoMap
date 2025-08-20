import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import type { editor as MonacoEditorType, Position as MonacoPosition } from 'monaco-editor';
import { Box } from '@mui/material';

interface GraphQueryEditorProps {
  query: string;
  setQuery: (q: string) => void;
  executeQuery: (e: React.FormEvent) => void;
  queryLoading: boolean;
  queryError: string | null;
  themeMode?: 'light' | 'dark';
}

const GraphQueryEditor: React.FC<GraphQueryEditorProps> = ({
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
          defaultLanguage="gremlin"
          language="gremlin"
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
          onMount={(editor, monaco) => {
            if (!monaco.languages.getLanguages().some((l: { id: string }) => l.id === 'gremlin')) {
              monaco.languages.register({ id: 'gremlin' });
            }
            monaco.languages.setMonarchTokensProvider('gremlin', {
              tokenizer: {
                root: [
                  [/(g|V|E|addV|addE|property|has|hasLabel|hasId|hasKey|hasValue|out|in|both|outE|inE|bothE|outV|inV|bothV|values|valueMap|elementMap|id|label|count|limit|order|by|range|dedup|group|groupCount|project|select|unfold|fold|coalesce|union|where|not|and|or|is|within|without|repeat|times|emit|until|path|simplePath|cyclicPath|as|store|sum|max|min|mean|next|toList|drop|hasPartitionKey|partitionKey)\b/, 'keyword'],
                  [/\[|\]|\{|\}|\(|\)/, '@brackets'],
                  [/[_A-Za-z][_\w]*/, 'identifier'],
                  [/\d+/, 'number'],
                  [/".*?"/, 'string'],
                  [/'[^']*'/, 'string'],
                  [/\/\/.*$/, 'comment'],
                ],
              },
            });
          }}
        />
      </Box>
    </Box>
  );
};

export default GraphQueryEditor;

