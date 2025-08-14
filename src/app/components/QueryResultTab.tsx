import React from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import QueryResult from './QueryResult';

interface QueryResultTabProps {
  queryResult: any;
  queryLoading: boolean;
  themeMode?: 'light' | 'dark';
  connectionType?: 'local-graph' | 'cosmos-graph' | 'cosmos-nosql';
}

const QueryResultTab: React.FC<QueryResultTabProps> = ({ 
  queryResult, 
  queryLoading, 
  themeMode = 'light',
  connectionType 
}) => {
  if (queryLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={120}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!queryResult) {
    const message = connectionType === 'cosmos-nosql' 
      ? 'No query results to display. Execute a NoSQL query to see results.'
      : 'No query results to display. Execute a Gremlin query to see results.';
    return <Alert severity="info">{message}</Alert>;
  }
  
  return <QueryResult queryResult={queryResult} themeMode={themeMode} />;
};

export default QueryResultTab; 