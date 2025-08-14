import React from 'react';
import NodeDataTab from '../../components/NodeDataTab';

interface NoSqlDocumentDataProps {
  selectedNodeData: any;
  nodeDataLoading: boolean;
  themeMode?: 'light' | 'dark';
}

const NoSqlDocumentData: React.FC<NoSqlDocumentDataProps> = ({ selectedNodeData, nodeDataLoading, themeMode = 'light' }) => {
  return (
    <NodeDataTab
      selectedNodeData={selectedNodeData}
      nodeDataLoading={nodeDataLoading}
      themeMode={themeMode}
      connectionType={'cosmos-nosql'}
    />
  );
};

export default NoSqlDocumentData;

