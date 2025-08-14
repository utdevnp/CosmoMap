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
      <div>
        <Typography variant="h6" gutterBottom>
          NoSQL Database Schema
        </Typography>
        {schema.database && (
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Database: {schema.database}
          </Typography>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1">Collections</Typography>
                <Divider sx={{ my: 1 }} />
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  {schema.collections.map((collection, index) => (
                    <li key={collection.id || index}>
                      <Typography variant="body2">
                        <strong>{collection.id}</strong>
                        {collection.partitionKey && ` - Partition Key: ${collection.partitionKey}`}
                        {collection.documentCount && ` - Documents: ${collection.documentCount}`}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }

  // Graph database schema
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Graph Database Schema
      </Typography>
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