import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { CosmosClient } from '@azure/cosmos';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, accessKey, dbName, collectionName, query, operation } = body;

    if (!url || !accessKey || !dbName || !collectionName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: url, accessKey, dbName, collectionName'
      });
    }

    const client = new CosmosClient({ endpoint: url, key: accessKey });
    const container = client.database(dbName).container(collectionName);

    // Schema/introspection request
    if (operation === 'schema' || !query) {
      const { resource: containerDef } = await container.read();
      const partitionKey = (containerDef as any)?.partitionKey;
      const pkPaths = Array.isArray(partitionKey?.paths) ? partitionKey.paths : partitionKey?.path ? [partitionKey.path] : [];
      const indexingPolicy = (containerDef as any)?.indexingPolicy;
      const defaultTtl = (containerDef as any)?.defaultTtl ?? null;
      const uniqueKeyPolicy = (containerDef as any)?.uniqueKeyPolicy;
      const uniqueKeys: string[] = Array.isArray(uniqueKeyPolicy?.uniqueKeys)
        ? uniqueKeyPolicy.uniqueKeys.flatMap((uk: any) => Array.isArray(uk.paths) ? uk.paths : [])
        : [];

      // Throughput (may be manual RU/s or autoscale)
      let throughput: { rus?: number; autoscaleMaxRus?: number } = {};
      try {
        const tp = await container.readThroughput();
        // tp.resource may include offerReplacePending, throughput, autoscaleSettings
        const res: any = tp?.resource ?? {};
        if (res.throughput) throughput.rus = Number(res.throughput);
        if (res.autoscaleSettings?.maxThroughput) throughput.autoscaleMaxRus = Number(res.autoscaleSettings.maxThroughput);
      } catch {
        // Some permissions or modes may not allow reading throughput; ignore silently
      }

      const result = {
        database: dbName,
        collections: [
          {
            id: collectionName,
            partitionKey: pkPaths.join(', '),
            indexingPolicy: indexingPolicy?.indexingMode || 'default',
            ttl: defaultTtl,
            uniqueKeys,
            throughput,
          },
        ],
      };
      return NextResponse.json({ success: true, result });
    }

    // Run a query
    const { resources } = await container.items.query(query).fetchAll();
    return NextResponse.json({ success: true, result: resources });

  } catch (error) {
    console.error('[Cosmos DB Query Error]', error);
    return NextResponse.json({ success: false, error: (error as Error).message });
  }
}
