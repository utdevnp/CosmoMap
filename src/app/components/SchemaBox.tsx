import React from 'react';
import { Typography, Grid, Card, CardContent, Divider, Box } from '@mui/material';

interface SchemaBoxProps {
  schema: { 
    vertexLabels?: string[]; 
    edgeLabels?: string[]; 
    collections?: any[];
    database?: string;
  } | null;
}

const SchemaBox: React.FC<SchemaBoxProps> = ({ schema }) => {
  if (!schema) {
    return (
      <Typography color="text.secondary">No schema loaded. Connect to server and fetch schema.</Typography>
    );
  }

  // Check if this is a NoSQL schema
  if (schema.collections) {
    return (
      <>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Metadata</Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0 }}>
        {schema.database && (
          <li>
            <Typography variant="body2">
              <strong>Database:</strong> {schema.database}
            </Typography>
          </li>
        )}
        {schema.collections.map((collection, index) => (
          <li key={collection.id || index}>
            <Box component="ul" sx={{ pl: 2, mb: 1 }}>
              {collection.id && (
                <li>
                  <Typography variant="body2"><strong>Collection:</strong> {collection.id}</Typography>
                </li>
              )}
              {collection.partitionKey && (
                <li>
                  <Typography variant="body2"><strong>Partition Key:</strong> {collection.partitionKey}</Typography>
                </li>
              )}
              {collection.indexingPolicy && (
                <li>
                  <Typography variant="body2"><strong>Indexing:</strong> {collection.indexingPolicy}</Typography>
                </li>
              )}
              {typeof collection.ttl !== 'undefined' && collection.ttl !== null && (
                <li>
                  <Typography variant="body2"><strong>TTL:</strong> {String(collection.ttl)}</Typography>
                </li>
              )}
              {Array.isArray(collection.uniqueKeys) && collection.uniqueKeys.length > 0 && (
                <li>
                  <Typography variant="body2"><strong>Unique Keys:</strong> {collection.uniqueKeys.join(', ')}</Typography>
                </li>
              )}
              {collection.throughput && (collection.throughput.rus || collection.throughput.autoscaleMaxRus) && (
                <li>
                  <Typography variant="body2">
                    <strong>Throughput:</strong>
                    {collection.throughput.rus ? ` ${collection.throughput.rus} RU/s` : ''}
                    {collection.throughput.autoscaleMaxRus ? ` (autoscale max ${collection.throughput.autoscaleMaxRus} RU/s)` : ''}
                  </Typography>
                </li>
              )}
            </Box>
          </li>
        ))}
        </Box>
      </>
    );
  }

  // Graph database schema
  return (
    <div>
     
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1">Vertex Labels</Typography>
              <Divider sx={{ my: 1 }} />
              <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                {schema.vertexLabels?.map(label => (
                  <li key={label}><Typography>{label}</Typography></li>
                )) || <Typography color="text.secondary">No vertex labels found</Typography>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1">Edge Labels</Typography>
              <Divider sx={{ my: 1 }} />
              <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                {schema.edgeLabels?.map(label => (
                  <li key={label}><Typography>{label}</Typography></li>
                )) || <Typography color="text.secondary">No edge labels found</Typography>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
       
      </Grid>
    </div>
  );
};

export default SchemaBox; 