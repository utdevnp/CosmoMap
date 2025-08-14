import React from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import QueryResult from './QueryResult';

interface NodeDataTabProps {
  selectedNodeData: any;
  nodeDataLoading: boolean;
  themeMode?: 'light' | 'dark';
  connectionType?: 'local-graph' | 'cosmos-graph' | 'cosmos-nosql';
}

const NodeDataTab: React.FC<NodeDataTabProps> = ({ 
  selectedNodeData, 
  nodeDataLoading, 
  themeMode = 'light',
  connectionType 
}) => {
  if (nodeDataLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={120}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!selectedNodeData) {
    const message = connectionType === 'cosmos-nosql' 
      ? 'No document selected. Execute a query to view document data.'
      : 'No node selected. Click a node in the graph to view its data.';
    return <Alert severity="info">{message}</Alert>;
  }
  
  if (Array.isArray(selectedNodeData?.result?._items) && selectedNodeData.result._items.length > 0) {
    return <QueryResult queryResult={selectedNodeData.result._items[0]} themeMode={themeMode} />;
  }
  
  return <QueryResult queryResult={selectedNodeData} themeMode={themeMode} />;
};

export default NodeDataTab; 