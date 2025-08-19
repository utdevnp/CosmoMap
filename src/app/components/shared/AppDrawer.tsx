import React from 'react';
import Drawer from '@mui/material/Drawer';
import { Box, Typography, Button, FormControlLabel, Switch, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConnectionForm from '../ConnectionForm';
import type { Connection } from '../../../utils/connectionStorage';

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  themeMode: 'light' | 'dark';
  connections: Connection[];
  onEditConnection: (conn: Connection) => void;
  onDeleteConnection: (id: string) => void;

  // Add connection state/handlers
  addMode: boolean;
  setAddMode: (val: boolean) => void;
  newConn: any;
  setNewConn: (conn: any) => void;
  onSaveNewConnection: () => void;

  // Edit connection state/handlers
  editConnId: string | null;
  editConn: any;
  setEditConn: (conn: any) => void;
  onSaveEditConnection: () => void;
  onCancelEdit: () => void;

  // Settings
  showNodeTooltips: boolean;
  setShowNodeTooltips: (val: boolean) => void;
  safeMode: boolean;
  setSafeMode: (val: boolean) => void;
  selectedIsProd?: boolean;
}

const AppDrawer: React.FC<AppDrawerProps> = ({
  open,
  onClose,
  themeMode,
  connections,
  onEditConnection,
  onDeleteConnection,
  addMode,
  setAddMode,
  newConn,
  setNewConn,
  onSaveNewConnection,
  editConnId,
  editConn,
  setEditConn,
  onSaveEditConnection,
  onCancelEdit,
  showNodeTooltips,
  setShowNodeTooltips,
  safeMode,
  setSafeMode,
  selectedIsProd = true,
}) => {
  const [confirmDisableOpen, setConfirmDisableOpen] = React.useState(false);
  const handleSafeModeToggle = (checked: boolean) => {
    if (checked) {
      setSafeMode(true);
    } else {
      setConfirmDisableOpen(true);
    }
  };
  const confirmDisable = () => {
    setSafeMode(false);
    setConfirmDisableOpen(false);
  };
  const cancelDisable = () => {
    setConfirmDisableOpen(false);
  };
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: themeMode === 'dark' ? '#23272f' : '#fff',
          color: themeMode === 'dark' ? '#e0e0e0' : '#222',
        },
      }}
    >
      <Box sx={{ width: 340, p: 3 ,  mt: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: themeMode === 'dark' ? '#e0e0e0' : '#222' }}>Connections</Typography>
        {/* Connection list */}
        <Box sx={{ mt: 2 }}>
          {connections.length === 0 ? (
            <Typography color="text.secondary">No connections saved.</Typography>
          ) : (
            connections.map((conn) => (
              <Box
                key={conn.id}
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  background: themeMode === 'dark' ? '#181a20' : '#f5f5f5',
                  color: themeMode === 'dark' ? '#e0e0e0' : '#222',
                  fontFamily: 'monospace',
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                  '&:hover': { background: themeMode === 'dark' ? '#23272f' : '#ececec' },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Typography
                      fontWeight={600}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                      {conn.name}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {conn.type}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  <Button size="small" variant="outlined" color="primary" onClick={() => onEditConnection(conn)} aria-label="Edit connection" sx={{ minWidth: 0, p: 0.5 }}>
                    <EditIcon fontSize="small" sx={{ fontSize: 16 }} />
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => onDeleteConnection(conn.id)} aria-label="Delete connection" sx={{ minWidth: 0, p: 0.5 }}>
                    <DeleteIcon fontSize="small" sx={{ fontSize: 16 }} />
                  </Button>
                </Box>
              </Box>
            ))
          )}
        </Box>
        {addMode ? (
          <ConnectionForm
            mode="add"
            conn={newConn}
            setConn={setNewConn}
            onSave={onSaveNewConnection}
            onCancel={() => setAddMode(false)}
          />
        ) : editConnId ? (
          <Box sx={{ width: '100%', maxWidth: '100%' }}>
            <ConnectionForm
              mode="edit"
              conn={editConn}
              setConn={setEditConn}
              onSave={onSaveEditConnection}
              onCancel={onCancelEdit}
            />
          </Box>
        ) : (
          <Button variant="contained" color="primary" fullWidth onClick={() => setAddMode(true)}>
            + Add Connection
          </Button>
        )}
        {/* Settings section */}
        <Box sx={{ mt: 4, borderTop: '1px solid #eee', pt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Settings</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showNodeTooltips}
                onChange={e => setShowNodeTooltips(e.target.checked)}
                color="primary"
              />
            }
            label="Show Node Tooltips"
          />
          <FormControlLabel
            control={
              <Switch
                checked={safeMode}
                onChange={e => handleSafeModeToggle(e.target.checked)}
                color="primary"
              />
            }
            label="Safe Mode"
          />
        </Box>
      </Box>
      {/* Confirm disabling Safe Mode */}
      <Dialog open={confirmDisableOpen} onClose={cancelDisable} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" /> {selectedIsProd ? 'Safe Mode Locked for Prod' : 'Disable Safe Mode?'}
        </DialogTitle>
        <DialogContent>
          {selectedIsProd ? (
            <>
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                This connection is marked as Prod. Safe Mode cannot be disabled for Prod connections.
              </Typography>
              <Typography variant="body2">
                To make non-destructive changes, use a Non Prod connection instead.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                Disabling Safe Mode removes write protections. This can lead to irreversible changes or deletions.
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>What could happen:</Typography>
              <ul style={{ marginTop: 0, marginBottom: 12, paddingLeft: 18 }}>
                <li>
                  <Typography variant="body2">Graph: mutation queries (drop, addV/addE, property/remove/set/merge) will be allowed and may modify or delete data.</Typography>
                </li>
                <li>
                  <Typography variant="body2">NoSQL: non-SELECT queries may create, update, or delete documents; may also incur higher RU costs.</Typography>
                </li>
              </ul>
              <Typography variant="body2">Proceed only if you understand the risks and have appropriate backups or are in a safe environment.</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDisable} variant="outlined">Close</Button>
          {!selectedIsProd && (
            <Button onClick={confirmDisable} color="error" variant="contained">Disable Safe Mode</Button>
          )}
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default AppDrawer;


