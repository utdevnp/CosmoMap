import React from 'react';
import { Box, Button, Typography, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { ConnectionType } from '../../utils/connectionStorage';

interface ConnectionFormProps {
  mode: 'add' | 'edit';
  conn: any;
  setConn: (conn: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ mode, conn, setConn, onSave, onCancel }) => {
  return (
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={e => { e.preventDefault(); onSave(); }}>
      <Typography variant="subtitle1">{mode === 'add' ? 'Add Connection' : 'Edit Connection'}</Typography>
      <TextField
        type="text"
        label="Name"
        value={conn.name}
        onChange={e => setConn({ ...conn, name: e.target.value })}
        fullWidth
        size="small"
        placeholder="Connection name"
        InputLabelProps={{ sx: { fontSize: 14, top: '-4px' } }}
        InputProps={{
          sx: {
            '& input': { padding: '6px 8px', height: 18, fontSize: 14 },
            '& input::placeholder': { fontSize: 14, opacity: 0.7 },
          },
        }}
        required
      />
      <FormControl fullWidth size="small">
        <InputLabel id="type-label">Type</InputLabel>
        <Select
          labelId="type-label"
          value={conn.type}
          label="Type"
          onChange={e => setConn({ ...conn, type: e.target.value as ConnectionType })}
          sx={{ height: 32, fontSize: 14, p: 0 }}
        >
          <MenuItem value="local-graph">Local Gremlin Server</MenuItem>
          <MenuItem value="cosmos-graph">Azure Cosmos DB Gremlin</MenuItem>
          <MenuItem value="cosmos-nosql">Azure Cosmos DB NoSQL (Document)</MenuItem>
        </Select>
        {conn.type === 'local-graph' && (
          <Typography variant="caption" color="text.secondary">
            Connect to a local Gremlin server (e.g., TinkerPop, JanusGraph)
          </Typography>
        )}
        {conn.type === 'cosmos-graph' && (
          <Typography variant="caption" color="text.secondary">
            Connect to Azure Cosmos DB using the Gremlin API for graph databases
          </Typography>
        )}
        {conn.type === 'cosmos-nosql' && (
          <Typography variant="caption" color="text.secondary">
            Connect to Azure Cosmos DB using the SQL (Core) API for document databases
          </Typography>
        )}
      </FormControl>
      
      {/* Dynamic fields based on connection type */}
      {conn.type === 'local-graph' ? (
        <TextField
          type="text"
          label="URL"
          value={conn.url}
          onChange={e => setConn({ ...conn, url: e.target.value })}
          fullWidth
          size="small"
          placeholder="ws://localhost:8182/gremlin"
          InputLabelProps={{ sx: { fontSize: 14, top: '-4px' } }}
          InputProps={{
            sx: {
              '& input': { padding: '6px 8px', height: 18, fontSize: 14 },
              '& input::placeholder': { fontSize: 14, opacity: 0.7 },
            },
          }}
          required
        />
      ) : conn.type === 'cosmos-graph' ? (
        <>
          <TextField
            type="text"
            label="URL"
            value={conn.url}
            onChange={e => setConn({ ...conn, url: e.target.value })}
            fullWidth
            size="small"
            placeholder="Cosmos DB Gremlin endpoint"
            InputLabelProps={{ sx: { fontSize: 14, top: '-4px' } }}
            InputProps={{
              sx: {
                '& input': { padding: '6px 8px', height: 18, fontSize: 14 },
                '& input::placeholder': { fontSize: 14, opacity: 0.7 },
              },
            }}
            required
          />
          <TextField
            type="text"
            label="Access Key"
            value={conn.accessKey}
            onChange={e => setConn({ ...conn, accessKey: e.target.value })}
            fullWidth
            size="small"
            placeholder="Primary or secondary key"
            InputLabelProps={{ sx: { fontSize: 14, top: '-4px' } }}
            InputProps={{
              sx: {
                '& input': { padding: '6px 8px', height: 18, fontSize: 14 },
                '& input::placeholder': { fontSize: 14, opacity: 0.7 },
              },
            }}
            required
          />
          <TextField
            type="text"
            label="Database Name"
            value={conn.dbName}
            onChange={e => setConn({ ...conn, dbName: e.target.value })}
            fullWidth
            size="small"
            placeholder="Database name"
            InputLabelProps={{ sx: { fontSize: 14, top: '-4px' } }}
            InputProps={{
              sx: {
                '& input': { padding: '6px 8px', height: 18, fontSize: 14 },
                '& input::placeholder': { fontSize: 14, opacity: 0.7 },
              },
            }}
            required
          />
          <TextField
            type="text"
            label="Graph Name"
            value={conn.graphName}
            onChange={e => setConn({ ...conn, graphName: e.target.value })}
            fullWidth
            size="small"
            placeholder="Graph name"
            InputLabelProps={{ sx: { fontSize: 14, top: '-4px' } }}
            InputProps={{
              sx: {
                '& input': { padding: '6px 8px', height: 18, fontSize: 14 },
                '& input::placeholder': { fontSize: 14, opacity: 0.7 },
              },
            }}
            required
          />
        </>
      ) : conn.type === 'cosmos-nosql' ? (
        <>
          <TextField
            type="text"
            label="URL"
            value={conn.url}
            onChange={e => setConn({ ...conn, url: e.target.value })}
            fullWidth
            size="small"
            placeholder="Cosmos DB SQL endpoint"
            InputLabelProps={{ sx: { fontSize: 14, top: '-4px' } }}
            InputProps={{
              sx: {
                '& input': { padding: '6px 8px', height: 18, fontSize: 14 },
                '& input::placeholder': { fontSize: 14, opacity: 0.7 },
              },
            }}
            required
          />
          <TextField
            type="text"
            label="Access Key"
            value={conn.accessKey}
            onChange={e => setConn({ ...conn, accessKey: e.target.value })}
            fullWidth
            size="small"
            placeholder="Primary or secondary key"
            InputLabelProps={{ sx: { fontSize: 14, top: '-4px' } }}
            InputProps={{
              sx: {
                '& input': { padding: '6px 8px', height: 18, fontSize: 14 },
                '& input::placeholder': { fontSize: 14, opacity: 0.7 },
              },
            }}
            required
          />
          <TextField
            type="text"
            label="Database Name"
            value={conn.dbName}
            onChange={e => setConn({ ...conn, dbName: e.target.value })}
            fullWidth
            size="small"
            placeholder="Database name"
            InputLabelProps={{ sx: { fontSize: 14, top: '-4px' } }}
            InputProps={{
              sx: {
                '& input': { padding: '6px 8px', height: 18, fontSize: 14 },
                '& input::placeholder': { fontSize: 14, opacity: 0.7 },
              },
            }}
            required
          />
          <TextField
            type="text"
            label="Collection Name"
            value={conn.collectionName}
            onChange={e => setConn({ ...conn, collectionName: e.target.value })}
            fullWidth
            size="small"
            placeholder="Collection/Container name"
            InputLabelProps={{ sx: { fontSize: 14, top: '-4px' } }}
            InputProps={{
              sx: {
                '& input': { padding: '6px 8px', height: 18, fontSize: 14 },
                '& input::placeholder': { fontSize: 14, opacity: 0.7 },
              },
            }}
            required
          />
        </>
      ) : null}
      {/* Environment flag: compact, default Prod; checked = Non Prod (inverts isProd) */}
      <FormControlLabel
        sx={{ mt: -0.5, alignSelf: 'flex-start', '& .MuiFormControlLabel-label': { fontSize: 12 } }}
        control={
          <Checkbox
            size="small"
            checked={!Boolean(conn.isProd ?? true)}
            onChange={e => setConn({ ...conn, isProd: !e.target.checked })}
          />
        }
        label="Non Prod"
      />
      
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button type="submit" variant="contained" color="primary" size="small" sx={{ minWidth: 0 }}>
          Save
        </Button>
        <Button type="button" variant="outlined" color="secondary" size="small" onClick={onCancel} sx={{ minWidth: 0 }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default ConnectionForm; 