import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { CosmosClient } from '@azure/cosmos';

export async function POST(req: NextRequest) {
  try {
    const { url, accessKey, dbName, collectionName, query } = await req.json();

    if (!url || !accessKey || !dbName || !collectionName || !query) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: url, accessKey, dbName, collectionName, query'
      });
    }

    const client = new CosmosClient({ endpoint: url, key: accessKey });
    const container = client.database(dbName).container(collectionName);

    // Run the query exactly as given
    const { resources } = await container.items.query(query).fetchAll();

    return NextResponse.json({
      success: true,
      result: resources
    });

  } catch (error) {
    console.error('[Cosmos DB Query Error]', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    });
  }
}
