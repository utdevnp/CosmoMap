"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Tooltip,
  Fab,
  Chip
} from '@mui/material';
import List from '@mui/material/List';
import NoSqlResultsList from './components/nosql/NoSqlResultsList';
import ListItemButton from '@mui/material/ListItemButton';
import CytoscapeComponent from 'react-cytoscapejs';
import Popover from '@mui/material/Popover';
import Drawer from '@mui/material/Drawer';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import StorageIcon from '@mui/icons-material/Storage';
import MonacoEditor from '@monaco-editor/react';
import type { editor as MonacoEditorType, Position as MonacoPosition } from 'monaco-editor';
import QueryBox from './components/QueryBox';
import QueryResult from './components/QueryResult';
import SchemaBox from './components/SchemaBox';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GraphViewer from './components/GraphViewer';
import dynamic from 'next/dynamic';
import MenuIcon from '@mui/icons-material/Menu';
import { getConnections, saveConnection, deleteConnection, updateConnection, Connection, ConnectionType } from '../utils/connectionStorage';
import { v4 as uuidv4 } from 'uuid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Console from './components/Console';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionForm from './components/ConnectionForm';
import AppDrawer from './components/shared/AppDrawer';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NodeDataTab from './components/NodeDataTab';
import QueryResultTab from './components/QueryResultTab';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import CodeIcon from '@mui/icons-material/Code';
import SchemaIcon from '@mui/icons-material/Schema';
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

const DEFAULT_SERVER_URL = 'ws://localhost:8182/gremlin';

const colorPalette = [
  '#1976d2', // blue
  '#43a047', // green
  '#fbc02d', // yellow
  '#e64a19', // orange
  '#8e24aa', // purple
  '#00838f', // teal
  '#c62828', // red
  '#6d4c41', // brown
  '#3949ab', // indigo
  '#00acc1', // cyan
];

function formatRelativeTime(fromMs: number): string {
  const now = Date.now();
  let diff = Math.max(0, Math.floor((now - fromMs) / 1000)); // seconds
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
    return Number(doc._ts) * 1000; // Cosmos _ts is seconds
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

// Keys for localStorage
const GREMLIN_HISTORY_KEY = 'gremlin_query_history';
const NOSQL_HISTORY_KEY = 'nosql_query_history';

function sanitizeDataObject(data: Record<string, any>) {
  const clean: Record<string, any> = {};
  Object.entries(data).forEach(([k, v]) => {
    if (
      v !== undefined &&
      v !== null &&
      typeof v !== 'function' &&
      !(Array.isArray(v) && v.length === 0) &&
      !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
    ) {
      clean[k] = v;
    }
  });
  return clean;
}

export default function Home() {
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [schema, setSchema] = useState<{ 
    vertexLabels?: string[]; 
    edgeLabels?: string[]; 
    collections?: any[];
    database?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [labelType, setLabelType] = useState<'vertex' | 'edge'>('vertex');
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('g.V().limit(10)');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [cyRef, setCyRef] = useState<any>(null);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const [tooltipData, setTooltipData] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [layout, setLayout] = useState('cose');
  const [search, setSearch] = useState('');
  // Query history state (separate for graph and NoSQL)
  const [gremlinHistory, setGremlinHistory] = useState<string[]>([]);
  const [nosqlHistory, setNosqlHistory] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [addMode, setAddMode] = useState(false);
  const [newConn, setNewConn] = useState({
    name: '',
    type: 'local-graph' as ConnectionType,
    url: '',
    accessKey: '',
    dbName: '',
    graphName: '',
    collectionName: '',
    isProd: true,
  });
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  // Console log state
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<{
    id: string;
    time: string;
    type: 'query' | 'connection' | 'error' | 'info';
    message: string;
    endpoint?: string;
    query?: string;
    success?: boolean;
    details?: any;
  }[]>([]);

  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Safe Mode auto-enablement notification
  const [safeModeNotification, setSafeModeNotification] = useState<{
    show: boolean;
    message: string;
    connectionName: string;
  }>({ show: false, message: '', connectionName: '' });

  // Auto-scroll to top when console opens or logs change (newest at top)
  useEffect(() => {
    if (consoleOpen && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [consoleOpen, consoleLogs]);

  // Add a log entry (latest at the top)
  const logToConsole = (entry: Omit<typeof consoleLogs[0], 'id' | 'time'>) => {
    const now = new Date();
    setConsoleLogs(logs => [
      {
        id: now.getTime().toString(),
        time: now.toLocaleTimeString(),
        ...entry,
      },
      ...logs,
    ]);
  };

  // Load history from localStorage on mount
  useEffect(() => {
    const g = localStorage.getItem(GREMLIN_HISTORY_KEY);
    if (g) {
      try { setGremlinHistory(JSON.parse(g)); } catch {}
    }
    const n = localStorage.getItem(NOSQL_HISTORY_KEY);
    if (n) {
      try { setNosqlHistory(JSON.parse(n)); } catch {}
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(GREMLIN_HISTORY_KEY, JSON.stringify(gremlinHistory));
  }, [gremlinHistory]);
  useEffect(() => {
    localStorage.setItem(NOSQL_HISTORY_KEY, JSON.stringify(nosqlHistory));
  }, [nosqlHistory]);

  // Load connections initially
  useEffect(() => {
    setConnections(getConnections());
  }, []);
  // Optionally, reload when drawer opens (if you want to catch changes from other tabs/windows)
  useEffect(() => {
    if (drawerOpen) {
      setConnections(getConnections());
    }
  }, [drawerOpen]);

  // When connections change, default to first connection if none selected
  useEffect(() => {
    if (connections.length > 0 && !selectedConnectionId) {
      setSelectedConnectionId(connections[0].id);
    }
    if (connections.length === 0) {
      setSelectedConnectionId(null);
    }
  }, [connections]);

  // Get the selected connection object
  const selectedConnection = connections.find(c => c.id === selectedConnectionId) || null;

  // When selected connection changes, fetch schema and reset query state
  useEffect(() => {
    if (selectedConnection) {
      // Auto-enable Safe Mode for Prod connections if it's currently disabled
      if (selectedConnection.isProd !== false && !safeMode) {
        setSafeMode(true);
        logToConsole({
          type: 'info',
          message: `Safe Mode automatically enabled for Prod connection: ${selectedConnection.name}`,
          endpoint: selectedConnection.details?.url,
        });
        setSafeModeNotification({
          show: true,
          message: `Safe Mode enabled for ${selectedConnection.name}`,
          connectionName: selectedConnection.name,
        });
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setSafeModeNotification({ show: false, message: '', connectionName: '' });
        }, 5000);
      }
      
      setSchema(null);
      setQueryResult(null);
      setError(null);
      setQueryError(null);
      setLoading(true);
      setConnectionStatus('loading');
      // Log connection attempt
      logToConsole({
        type: 'connection',
        message: `Connecting to ${selectedConnection.name}`,
        endpoint: selectedConnection.details?.url,
        success: undefined,
      });
      fetchSchema();
      
      // Update query based on connection type
      if (selectedConnection.type === 'cosmos-nosql') {
        setQuery("SELECT * FROM c OFFSET 0 LIMIT 10");
      } else {
        setQuery('g.E().limit(10)');
      }
    }
  }, [selectedConnectionId]);

  const fetchSchema = async () => {
    if (!selectedConnection) return;
    setLoading(true);
    setError(null);
    const start = Date.now();
    try {
      let body: any;
      let endpoint: string;
      
      if (selectedConnection.type === 'cosmos-nosql') {
        endpoint = '/api/cosmos';
        body = { 
          type: selectedConnection.type, 
          operation: 'schema',
          ...selectedConnection.details 
        };
      } else {
        endpoint = '/api/gremlin';
        body = { type: selectedConnection.type, ...selectedConnection.details };
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const execTime = Date.now() - start;
      if (data.success) {
        setSchema(data.result);
        setConnectionStatus('ok');
        logToConsole({
          type: 'connection',
          message: `Connected to ${selectedConnection.name}`,
          endpoint: selectedConnection.details?.url,
          success: true,
          details: data.result,
          query: undefined,
        });
      } else {
        setError(data.error || 'Failed to fetch schema');
        setConnectionStatus('error');
        logToConsole({
          type: 'connection',
          message: `Connection failed: ${data.error || 'Unknown error'}`,
          endpoint: selectedConnection.details?.url,
          success: false,
          details: data.error,
          query: undefined,
        });
      }
      logToConsole({
        type: 'info',
        message: `Schema fetch execution time: ${execTime} ms`,
        endpoint: selectedConnection.details?.url,
        success: data.success,
        details: undefined,
        query: undefined,
      });
    } catch (err) {
      setError((err as Error).message);
      setConnectionStatus('error');
      logToConsole({
        type: 'error',
        message: `Connection error: ${(err as Error).message}`,
        endpoint: selectedConnection.details?.url,
        success: false,
        details: err,
        query: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const createLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnection || !newLabel) return;
    
    // Don't allow label creation for NoSQL connections
    if (selectedConnection.type === 'cosmos-nosql') {
      setError('Label creation is not supported for NoSQL connections. Use document operations instead.');
      return;
    }
    
    setCreating(true);
    setError(null);
    let labelQuery = '';
    if (labelType === 'vertex') {
      labelQuery = `graph.addVertex(label, '${newLabel}')`;
    } else {
      labelQuery = `v1 = graph.addVertex(); v2 = graph.addVertex(); v1.addEdge('${newLabel}', v2)`;
    }
    try {
      const endpoint = '/api/gremlin';
      const body = { type: selectedConnection.type, query: labelQuery, ...selectedConnection.details };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setNewLabel('');
        fetchSchema();
      } else {
        setError(data.error || 'Failed to create label');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const executeQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnection) return;
    // Safe mode enforcement
    if (safeMode) {
      const q = (query || '').trim().toLowerCase();
      if (selectedConnection.type === 'cosmos-nosql') {
        // Only allow SELECT queries in safe mode
        if (!q.startsWith('select')) {
          setQueryError('Write protection is enable. See settings');
          return;
        }
      } else {
        // Block destructive or update-like gremlin operations
        const blockedPatterns = [
          /\bdrop\b/,
          /\baddv\s*\(/,
          /\badde\s*\(/,
          /\bproperty\s*\(/,
          /\bremove\w*\b/,
          /\bset\w*\b/,
          /\bmerge\w*\b/,
        ];
        if (blockedPatterns.some((re) => re.test(q))) {
          setQueryError('Write protection is enable. See settings');
          return;
        }
      }
    }
    setQueryLoading(true);
    setQueryError(null);
    setQueryResult(null);
    const start = Date.now();
    // Do not save yet; only save after success below (and separate stores)
    try {
      let body: any;
      let endpoint: string;
      
      if (selectedConnection.type === 'cosmos-nosql') {
        endpoint = '/api/cosmos';
        body = { 
          type: selectedConnection.type, 
          operation: 'query',
          query,
          ...selectedConnection.details 
        };
      } else {
        endpoint = '/api/gremlin';
        body = { type: selectedConnection.type, query, ...selectedConnection.details };
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const execTime = Date.now() - start;
      if (data.success) {
        // Handle different result formats for different connection types
        if (selectedConnection.type === 'cosmos-nosql') {
          // For NoSQL, the result structure is different
          setQueryResult(data.result);
          // Save NoSQL history (on success only)
          setNosqlHistory(prev => {
            const trimmed = query.trim();
            if (!trimmed) return prev;
            if (prev[0] === trimmed) return prev;
            const next = [trimmed, ...prev.filter(q => q !== trimmed)].slice(0, 50);
            return next;
          });
        } else {
          // For graph databases, keep the existing structure
          setQueryResult(data.result);
          // Save Gremlin history (on success only)
          setGremlinHistory(prev => {
            const trimmed = query.trim();
            if (!trimmed) return prev;
            if (prev[0] === trimmed) return prev;
            const next = [trimmed, ...prev.filter(q => q !== trimmed)].slice(0, 50);
            return next;
          });
        }
        
        logToConsole({
          type: 'query',
          message: `Query executed successfully (${execTime} ms)`,
          endpoint: selectedConnection.details?.url,
          query,
          success: true,
          details: data.result,
        });
      } else {
        setQueryError(data.error || 'Query failed');
        logToConsole({
          type: 'query',
          message: `Query failed (${execTime} ms): ${data.error || 'Unknown error'}`,
          endpoint: selectedConnection.details?.url,
          query,
          success: false,
          details: data.error,
        });
      }
    } catch (err) {
      setQueryError((err as Error).message);
      logToConsole({
        type: 'error',
        message: `Query error: ${(err as Error).message}`,
        endpoint: selectedConnection.details?.url,
        query,
        success: false,
        details: err,
      });
    } finally {
      setQueryLoading(false);
    }
  };

  // Graph event handlers
  const handleCyInit = (cy: any) => {
    setCyRef(cy);
    cy.on('tap', 'node,edge', (evt: any) => {
      const ele = evt.target;
      setSelectedElement(ele.data());
      setDrawerOpen(true);
    });
    cy.on('mouseover', 'node,edge', (evt: any) => {
      const ele = evt.target;
      const pos = ele.renderedPosition();
      setTooltipData(ele.data());
      setTooltipAnchor({ mouseX: pos.x, mouseY: pos.y });
    });
    cy.on('mouseout', 'node,edge', () => {
      setTooltipAnchor(null);
      setTooltipData(null);
    });
  };

  const handleZoomIn = () => {
    if (cyRef) cyRef.zoom({ level: cyRef.zoom() * 1.2 });
  };
  const handleZoomOut = () => {
    if (cyRef) cyRef.zoom({ level: cyRef.zoom() * 0.8 });
  };
  const handleFit = () => {
    if (cyRef) cyRef.fit();
  };

  // Color mapping by label
  const labelColorMap = useMemo(() => {
    const labels = new Set<string>();
    if (queryResult && Array.isArray(queryResult)) {
      queryResult.forEach((item: any) => {
        if (item.label) labels.add(item.label);
      });
    }
    const arr = Array.from(labels);
    const map: Record<string, string> = {};
    arr.forEach((label, i) => {
      map[label] = colorPalette[i % colorPalette.length];
    });
    return map;
  }, [queryResult]);

  // Export handlers
  const handleExportPNG = () => {
    if (cyRef) {
      const png = cyRef.png({ full: true, scale: 2 });
      const link = document.createElement('a');
      link.href = png;
      link.download = 'graph.png';
      link.click();
    }
  };
  const handleExportJSON = () => {
    if (cyRef) {
      const json = cyRef.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'graph.json';
      link.click();
    }
  };

  const handleAddConnection = () => {
    const conn: Connection = {
      id: uuidv4(),
      name: newConn.name,
      type: newConn.type,
      isProd: newConn.isProd ?? true,
      details: (() => {
        switch (newConn.type) {
          case 'local-graph':
            return { url: newConn.url };
          case 'cosmos-graph':
            return { url: newConn.url, accessKey: newConn.accessKey, dbName: newConn.dbName, graphName: newConn.graphName };
          case 'cosmos-nosql':
            return { url: newConn.url, accessKey: newConn.accessKey, dbName: newConn.dbName, collectionName: newConn.collectionName };
          default:
            return { url: newConn.url };
        }
      })(),
    };
    saveConnection(conn);
    setConnections(getConnections());
    setAddMode(false);
    setNewConn({ name: '', type: 'local-graph', url: '', accessKey: '', dbName: '', graphName: '', collectionName: '', isProd: true });
  };

  const [editConnId, setEditConnId] = useState<string | null>(null);
  const [editConn, setEditConn] = useState<any>(null);

  const handleDeleteConnection = (id: string) => {
    deleteConnection(id);
    setConnections(getConnections());
    if (selectedConnectionId === id) setSelectedConnectionId(null);
  };
  const handleEditConnection = (conn: Connection) => {
    setEditConnId(conn.id);
    setEditConn({ ...conn, ...conn.details });
  };
  const handleSaveEditConnection = () => {
    if (!editConnId || !editConn) return;
    const updated: Connection = {
      id: editConnId,
      name: editConn.name,
      type: editConn.type,
      isProd: editConn.isProd ?? true,
      details: (() => {
        switch (editConn.type) {
          case 'local-graph':
            return { url: editConn.url };
          case 'cosmos-graph':
            return { url: editConn.url, accessKey: editConn.accessKey, dbName: editConn.dbName, graphName: editConn.graphName };
          case 'cosmos-nosql':
            return { url: editConn.url, accessKey: editConn.accessKey, dbName: editConn.dbName, collectionName: editConn.collectionName };
          default:
            return { url: editConn.url };
        }
      })(),
    };
    updateConnection(editConnId, updated);
    setConnections(getConnections());
    setEditConnId(null);
    setEditConn(null);
  };
  const handleCancelEdit = () => {
    setEditConnId(null);
    setEditConn(null);
  };

  // Add state for tooltip toggle
  const [showNodeTooltips, setShowNodeTooltips] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('showNodeTooltips');
      return stored === null ? true : stored === 'true';
    }
    return true;
  });
  // Persist toggle to localStorage
  useEffect(() => {
    localStorage.setItem('showNodeTooltips', String(showNodeTooltips));
  }, [showNodeTooltips]);

  // Simple in-memory cache for vertex details
  const vertexCache = useRef<{ [id: string]: any }>({});

  // Expanded state for NoSQL document accordions (keyed by document id/_rid/index)
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});
  // Selected document key for NoSQL list highlighting
  const [selectedDocKey, setSelectedDocKey] = useState<string | null>(null);

  // CHECKPOINT: Vertex detail fetch logic updated for Cosmos DB compatibility (ID handling and logging)
  const [nodeDataLoading, setNodeDataLoading] = useState(false);
  const fetchVertexDetails = async (id: string | number) => {
    console.log('Fetching vertex details for ID:', id);
    setTabIndex(2);

    // Check cache first
    if (vertexCache.current[id]) {
      setSelectedNodeData(vertexCache.current[id]);
      setNodeDataLoading(false);
      return;
    }

    setNodeDataLoading(true);
    if (!selectedConnectionId) return;
    const selectedConnection = connections.find(c => c.id === selectedConnectionId);
    if (!selectedConnection) return;
    try {
      const isNumericId = typeof id === 'number' || (!isNaN(Number(id)) && !/^0[0-9]+$/.test(id));
      const idPart = isNumericId ? id : `'${id}'`;
      const query = `g.V(${idPart}).valueMap(true)`;
      let endpoint: string;
      let body: any;
      
      if (selectedConnection.type === 'cosmos-nosql') {
        endpoint = '/api/cosmos';
        body = { 
          type: selectedConnection.type, 
          operation: 'query',
          query: `SELECT * FROM c WHERE c.id = '${id}'`,
          ...selectedConnection.details 
        };
      } else {
        endpoint = '/api/gremlin';
        body = { type: selectedConnection.type, query, ...selectedConnection.details };
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log('Cosmos DB vertex fetch response:', data);
      vertexCache.current[id] = data; // Store in cache
      setSelectedNodeData(data);
    } catch (err) {
      setSelectedNodeData({ error: (err as Error).message });
    } finally {
      setNodeDataLoading(false);
    }
  };

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light'); // Default to light mode
  // Safe Mode: default ON and persisted
  const [safeMode, setSafeMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('safeMode');
      if (v === 'true' || v === 'false') return v === 'true';
    }
    return true; // default ON
  });
  useEffect(() => {
    localStorage.setItem('safeMode', String(safeMode));
  }, [safeMode]);
  const theme = useMemo(() => themeMode === 'dark'
    ? createTheme({
        palette: {
          mode: 'dark',
          background: {
            default: '#181a20',
            paper: '#23272f',
          },
          primary: {
            main: '#90caf9',
          },
          secondary: {
            main: '#f48fb1',
          },
          text: {
            primary: '#e0e0e0',
            secondary: '#b0b0b0',
          },
        },
        typography: {
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
          fontSize: 15,
        },
      })
    : createTheme({
        palette: { mode: 'light' },
        typography: {
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
          fontSize: 15,
        },
      })
  , [themeMode]);

  useEffect(() => {
    document.body.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const [consoleActiveTab, setConsoleActiveTab] = useState<'console' | 'history-gremlin' | 'history-nosql'>('console');
  // UI collapse/expand for left pane (query + tabs)
  const [leftCollapsed, setLeftCollapsed] = useState<boolean>(false);

  // Ctrl/Cmd + H: open console history for current connection type
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setConsoleOpen(true);
        if (selectedConnection?.type === 'cosmos-nosql') {
          setConsoleActiveTab('history-nosql');
        } else {
          setConsoleActiveTab('history-gremlin');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-manage Safe Mode when switching connections
  const handleConnectionChange = (newConnectionId: string) => {
    const newConnection = connections.find(c => c.id === newConnectionId);
    const currentConnection = connections.find(c => c.id === selectedConnectionId);
    
    if (newConnection) {
      // If switching TO a Prod connection and Safe Mode is disabled, enable it
      if (newConnection.isProd !== false && !safeMode) {
        setSafeMode(true);
        // Add to console log
        logToConsole({
          type: 'info',
          message: `Safe Mode automatically enabled for Prod connection: ${newConnection.name}`,
          endpoint: newConnection.details?.url,
        });
        
        setSafeModeNotification({
          show: true,
          message: `Safe Mode enabled for ${newConnection.name}`,
          connectionName: newConnection.name,
        });
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setSafeModeNotification({ show: false, message: '', connectionName: '' });
        }, 5000);
      }
      // If switching FROM a Prod connection TO a Non-Prod connection, Safe Mode can stay as is
      // If switching BETWEEN Non-Prod connections, Safe Mode can stay as is
    }
    
    setSelectedConnectionId(newConnectionId);
  };

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary logToConsole={logToConsole}>
        <Box>
          <AppBar position="sticky" elevation={0} sx={{
            background: themeMode === 'dark' ? 'rgba(24,26,32,0.97)' : 'rgba(255,255,255,0.97)',
            color: themeMode === 'dark' ? '#e0e0e0' : '#222',
            boxShadow: 1,
            borderBottom: '1px solid #e0e0e0',
            zIndex: 1201
          }}>
            <Toolbar sx={{ flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', minHeight: 88, background: 'inherit', color: 'inherit' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 4 }}>
                {/* Burger menu */}
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setDrawerOpen(open => !open)}>
                  <MenuIcon sx={{ color: themeMode === 'dark' ? '#e0e0e0' : 'black' }} />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
                CosmoXp
                </Typography>
              </Box>
              {/* Theme switcher icon button before connection select */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  sx={{ ml: 1 }}
                  onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                  color="inherit"
                  aria-label="toggle theme"
                >
                  {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                {/* Connection select dropdown */}
                <Box sx={{ minWidth: 260, display: 'flex', alignItems: 'center', gap: 2 }}>
                  {connections.length === 0 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setDrawerOpen(true);
                        setAddMode(true);
                      }}
                      fullWidth
                    >
                      Add Connection
                    </Button>
                  ) : (
                    <FormControl fullWidth size="small">
                      <InputLabel id="connection-select-label">Connection</InputLabel>
                      <Select
                        labelId="connection-select-label"
                        value={selectedConnectionId || ''}
                        label="Connection"
                        onChange={e => handleConnectionChange(e.target.value)}
                        renderValue={(val) => {
                          const conn = connections.find(c => c.id === val);
                          if (!conn) return '';
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                              <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {conn.name}
                              </Typography>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={(conn.isProd !== false) ? 'Prod' : 'Non Prod'}
                                color={(conn.isProd !== false) ? 'error' : 'default'}
                                sx={{ height: 18, '& .MuiChip-label': { px: 0.75, fontSize: 10, lineHeight: '18px' } }}
                              />
                            </Box>
                          );
                        }}
                      >
                        <MenuItem value="">Select Connection</MenuItem>
                        {connections.map(conn => (
                          <MenuItem key={conn.id} value={conn.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, width: '100%' }}>
                              <Typography sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {conn.name}
                              </Typography>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={(conn.isProd !== false) ? 'Prod' : 'Non Prod'}
                                color={(conn.isProd !== false) ? 'error' : 'default'}
                                sx={{ height: 18, '& .MuiChip-label': { px: 0.75, fontSize: 10, lineHeight: '18px' } }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                {conn.type}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {connectionStatus === 'loading' && (
                    <CircularProgress size={20} sx={{ ml: 1 }} />
                  )}
                  {connectionStatus === 'ok' && (
                    <FiberManualRecordIcon sx={{ color: 'green', ml: 1, fontSize: 20, verticalAlign: 'middle' }} />
                  )}
                  {connectionStatus === 'error' && (
                    <FiberManualRecordIcon sx={{ color: 'red', ml: 1, fontSize: 20, verticalAlign: 'middle' }} />
                  )}
                </Box>
              </Box>
            </Toolbar>
          </AppBar>
          
          {/* Safe Mode Auto-Enablement Notification */}
          {safeModeNotification.show && (
            <Alert 
              severity="info" 
              sx={{ 
                position: 'sticky', 
                top: 88, 
                zIndex: 1200,
                mx: 2,
                mt: 2,
                mb: 0
              }}
              onClose={() => setSafeModeNotification({ show: false, message: '', connectionName: '' })}
            >
              <strong>Safe Mode Enabled:</strong> {safeModeNotification.message} 
              <br />
              <small>This ensures write protection for production connections.</small>
            </Alert>
          )}
          
          <AppDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            themeMode={themeMode}
            connections={connections}
            onEditConnection={handleEditConnection}
            onDeleteConnection={handleDeleteConnection}
            addMode={addMode}
            setAddMode={setAddMode}
            newConn={newConn}
            setNewConn={setNewConn}
            onSaveNewConnection={handleAddConnection}
            editConnId={editConnId}
            editConn={editConn}
            setEditConn={setEditConn}
            onSaveEditConnection={handleSaveEditConnection}
            onCancelEdit={handleCancelEdit}
            showNodeTooltips={showNodeTooltips}
            setShowNodeTooltips={(v: boolean) => setShowNodeTooltips(v)}
            safeMode={safeMode}
            setSafeMode={(v: boolean) => setSafeMode(v)}
            selectedIsProd={Boolean(selectedConnection?.isProd ?? true)}
          />
          <Box sx={{ p:4, height: 'calc(100vh - 88px)', background: themeMode === 'dark' ? '#181a20' : '#fafbfc', color: themeMode === 'dark' ? '#e0e0e0' : '#222' }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              <Grid item xs={leftCollapsed ? 0 : 6} md={leftCollapsed ? 0 : 6} sx={{ height: '100%', display: leftCollapsed ? 'none' : 'block' }}>

                {/* Query Editor below header controls */}
                <Paper elevation={3} sx={{ p: 3, mb: 4, position: 'relative', background: themeMode === 'dark' ? '#23272f' : '#fff', color: themeMode === 'dark' ? '#e0e0e0' : '#222' }}>
                  <Typography variant="h6" gutterBottom>
                    Query Editor
                  </Typography>
                  <Tooltip title={leftCollapsed ? 'Expand panels' : 'Collapse panels'}>
                    <IconButton size="small" onClick={() => setLeftCollapsed(v => !v)} sx={{ position: 'absolute', top: 8, right: 8 }}>
                      {leftCollapsed ? <UnfoldMoreIcon /> : <UnfoldLessIcon />}
                    </IconButton>
                  </Tooltip>
                  <Box sx={{ mb: 1, color: 'text.secondary', fontSize: 12 }}>
                    Press Ctrl/Cmd + H to open history
                  </Box>
                  {/* Inline history removed; use bottom Console tabs (Ctrl/Cmd+H) */}
                  <QueryBox
                    query={query}
                    setQuery={setQuery}
                    executeQuery={executeQuery}
                    queryLoading={queryLoading}
                    queryError={queryError}
                    schema={schema}
                    themeMode={themeMode}
                    connectionType={selectedConnection?.type}
                  />
                </Paper>
                {/* Panels below */}
                <Box display={{ xs: 'block', md: 'flex' }} gap={3}>
                  {/* Left Panel: Editor & Controls */}
                  <Box flex={1.3} minWidth={420}>
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                      {/* Tabs for Query Result, Schema, Node Data */}
                      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} aria-label="Result Tabs">
                        <Tab sx={{ display: selectedConnection?.type === 'cosmos-nosql' ? 'none' : 'inline-flex' }} label="Query Result" />
                        <Tab label={selectedConnection?.type === 'cosmos-nosql' ? 'Metadata' : 'Schema'} />
                        <Tab label={selectedConnection?.type === 'cosmos-nosql' ? 'Document Data' : 'Node Data'} />
                      </Tabs>
                      <Box sx={{ mt: 2 }}>
                        {selectedConnection?.type !== 'cosmos-nosql' && tabIndex === 0 && (
                          <QueryResultTab
                            queryResult={queryResult}
                            queryLoading={queryLoading}
                            themeMode={themeMode}
                            connectionType={selectedConnection?.type}
                          />
                        )}
                        {tabIndex === 1 && (
                          loading ? (
                            <Box display="flex" alignItems="center" justifyContent="center" minHeight={120}>
                              <CircularProgress />
                            </Box>
                          ) : (
                            <>
                              <SchemaBox schema={schema} />
                             
                            </>
                          )
                        )}
                        {tabIndex === 2 && (
                          <NodeDataTab
                            selectedNodeData={selectedNodeData}
                            nodeDataLoading={nodeDataLoading}
                            themeMode={themeMode}
                            connectionType={selectedConnection?.type}
                          />
                        )}
                      </Box>
                    </Paper>
                  </Box>
                </Box>

              </Grid>
              <Grid item xs={leftCollapsed ? 12 : 6} md={leftCollapsed ? 12 : 6} sx={{ height: '100%', position: 'relative' }}>

                <Box sx={{ height: '100%' }}>
                  {queryLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress /></Box>
                  ) : queryError ? (
                    <Alert severity="error">{queryError}</Alert>
                  ) : queryResult && (Array.isArray(queryResult) ? queryResult.length > 0 : typeof queryResult === 'object' && Object.keys(queryResult).length > 0) ? (
                    selectedConnection?.type === 'cosmos-nosql' ? (
                      <NoSqlResultsList
                        queryResult={queryResult}
                        selectedDocKey={selectedDocKey}
                        setSelectedDocKey={setSelectedDocKey}
                        setSelectedNodeData={setSelectedNodeData}
                        setTabIndex={setTabIndex}
                        themeMode={themeMode}
                      />
                    ) : (
                      <GraphViewer
                        data={queryResult}
                        loading={queryLoading}
                        error={queryError}
                        setSelectedNodeData={data => {
                          setSelectedNodeData(data);
                          setTabIndex(2);
                        }}
                        showNodeTooltips={showNodeTooltips}
                        onNodeClick={fetchVertexDetails}
                      />
                    )
                  ) : (
                    <Alert severity="info">No data to display.</Alert>
                  )}
                </Box>
                {leftCollapsed && (
                  <Box sx={{ position: 'absolute', top: 100, left: 12, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 10 }}>
                    <Tooltip title="Show Query/Schema Panels">
                      <Fab size="small" color="primary" onClick={() => setLeftCollapsed(false)}>
                        <CodeIcon sx={{ fontSize: 18 }} />
                      </Fab>
                    </Tooltip>
                    <Tooltip title="Show Schema Panel">
                      <Fab size="small" onClick={() => setLeftCollapsed(false)}>
                        <SchemaIcon sx={{ fontSize: 18 }} />
                      </Fab>
                    </Tooltip>
                  </Box>
                )}
              </Grid>
            </Grid>

          </Box>
          {/* Bottom Console Panel */}
          <Console
            logs={consoleLogs}
            expandedLogId={expandedLogId}
            setExpandedLogId={setExpandedLogId}
            open={consoleOpen}
            setOpen={setConsoleOpen}
            logContainerRef={logContainerRef as React.RefObject<HTMLDivElement>}
            themeMode={themeMode}
            gremlinHistory={gremlinHistory}
            nosqlHistory={nosqlHistory}
            onPickHistory={(q: string) => setQuery(q)}
            activeTab={consoleActiveTab}
            setActiveTab={setConsoleActiveTab}
          />
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

