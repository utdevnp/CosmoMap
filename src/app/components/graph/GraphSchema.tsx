import React from 'react';
import SchemaBox from '../../components/SchemaBox';

interface GraphSchemaProps {
  schema: {
    vertexLabels?: string[];
    edgeLabels?: string[];
    collections?: any[];
    database?: string;
  } | null;
}

const GraphSchema: React.FC<GraphSchemaProps> = ({ schema }) => {
  return <SchemaBox schema={schema} />;
};

export default GraphSchema;

