# CosmoMap

CosmoMap is a modern, interactive interface for exploring, querying, and analyzing data in Azure Cosmos DB — supporting both **Gremlin graph databases** and **NoSQL (Core SQL API)**.  
With CosmoMap, you and your team can connect, visualize, query, and understand your Cosmos DB data — whether it's graph-based or document-based — all in one place.

---

## Story Behind Creating CosmoMap

While working with Azure Cosmos DB — especially its Gremlin graph API — I searched for a robust, user-friendly viewer.  
I found some tools, but none met my expectations: some were paid, some incomplete, and others had confusing interfaces. I also realized I often needed to work with Cosmos DB's NoSQL API alongside Gremlin data, but no single tool handled both well.

Frustrated by the lack of a unified, intuitive solution, I decided to build my own.

**CosmoMap** was born to fill this gap — now empowering my team to explore and analyze both graph and NoSQL data efficiently, right from our own system.

---

## Features

### Graph (Gremlin API) Features
- **Connect to Gremlin Servers**: Easily connect to any Gremlin-compatible graph database, including Azure Cosmos DB Gremlin API.
- **Visual Query Editor**: Write and run Gremlin queries with a modern editor and see results instantly.
- **Graph Visualization**: Interactive, dynamic visualization of graph data — explore nodes and edges visually.
- **Schema Exploration**: View and manage vertex and edge labels directly from the UI.
- **Element Inspector**: Click on any node or edge to view its full JSON data in a dedicated details panel.
- **Query History**: Quickly access and rerun previous queries.
- **Export Options**: Export your graph as PNG or JSON.

### NoSQL (Core SQL API) Features
- **Connect to Cosmos DB NoSQL**: Provide endpoint, key, and database details to connect instantly.
- **Direct Query Execution**: Run SQL-like queries directly against your Cosmos DB NoSQL collections.
- **Results Viewer**: See results in raw JSON form with formatted output for easy reading.
- **Schema Discovery**: View collection metadata such as partition keys and indexing policies.
- **Collection Listing**: List all collections in the connected database.

### General Features
- **Tabbed Results**: Switch between different data views easily.
- **User-Friendly Interface**: Built with a clean, modern UI for a smooth experience.

