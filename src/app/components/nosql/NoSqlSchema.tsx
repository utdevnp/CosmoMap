import React from 'react';
import SchemaBox from '../../components/SchemaBox';

interface NoSqlSchemaProps {
  schema: {
    vertexLabels?: string[];
    edgeLabels?: string[];
    collections?: any[];
    database?: string;
  } | null;
}

const NoSqlSchema: React.FC<NoSqlSchemaProps> = ({ schema }) => {
  return <SchemaBox schema={schema} />;
};

export default NoSqlSchema;

