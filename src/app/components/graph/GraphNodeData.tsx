import React from 'react';
import NodeDataTab from '../../components/NodeDataTab';

interface GraphNodeDataProps {
  selectedNodeData: any;
  nodeDataLoading: boolean;
  themeMode?: 'light' | 'dark';
}

const GraphNodeData: React.FC<GraphNodeDataProps> = ({ selectedNodeData, nodeDataLoading, themeMode = 'light' }) => {
  return (
    <NodeDataTab
      selectedNodeData={selectedNodeData}
      nodeDataLoading={nodeDataLoading}
      themeMode={themeMode}
      connectionType={'local-graph'}
    />
  );
};

export default GraphNodeData;

