# CosmoXp

CosmoXp is a modern, interactive interface for exploring, querying, and analyzing Azure Cosmos DB — supporting both **Gremlin graph databases** and **NoSQL (Core SQL API)**.  
Connect, visualize, query, and understand your Cosmos DB data (graph or document) — all in one place.

---

## Story Behind Creating CosmoXp

While working with Azure Cosmos DB — especially its Gremlin graph API — I searched for a robust, user-friendly viewer.  
I found some tools, but none met my expectations: some were paid, some incomplete, and others had confusing interfaces. I also realized I often needed to work with Cosmos DB's NoSQL API alongside Gremlin data, but no single tool handled both well.

Frustrated by the lack of a unified, intuitive solution, I decided to build my own.

**CosmoXp** was born to fill this gap — now empowering my team to explore and analyze both graph and NoSQL data efficiently, right from our own system.

---

## Quick Start

### Using Docker (Recommended)

```bash
# Build and run with Docker
docker build -t cosmoxp .
docker run -p 3000:3000 cosmoxp

# Or use the pre-built image
docker run -p 3000:3000 ghcr.io/utdevnp/cosmoxp:latest
```

### Local Development

```bash
# Install dependencies
npm install
# or
yarn install

# Run development server
npm run dev
# or
yarn dev

# Build for production
npm run build
npm start
```

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
- **Layouts**: Switch between CoSE and Vertical Tree layouts; animated transitions.
- **View Controls**: Reset view; optional compact UI with collapsible editor to maximize graph space.

### NoSQL (Core SQL API) Features
- **Connect to Cosmos DB NoSQL**: Provide endpoint, key, and database details to connect instantly.
- **Direct Query Execution**: Run SQL-like queries directly against your Cosmos DB NoSQL collections.
- **Results Viewer**: See results in raw JSON form with formatted output for easy reading.
- **Schema Discovery**: View collection metadata such as partition keys and indexing policies.
- **Collection Listing**: List all collections in the connected database.
- **History**: Separate history for Gremlin and NoSQL queries.

### General Features
- **Tabbed Results**: Switch between different data views easily.
- **User-Friendly Interface**: Built with a clean, modern UI for a smooth experience.
- **Keyboard Shortcuts**: Press Ctrl/Cmd + Enter to run the current query; Ctrl/Cmd + H to open history.
- **Settings Drawer**: Manage connections (Add/Edit/Delete), toggle node tooltips, and control safety.
- **Write Protection (Safe Mode)**: Prevents destructive operations by default.
  - Graph: blocks `drop`, `addV/ addE`, `property`, `remove*`, `set*`, `merge*`.
  - NoSQL: only allows `SELECT` queries in safe mode.
  - Explicit confirmation required to disable; locked for Prod connections.
- **Prod / Non Prod Connections**: Mark connections as Prod (default) or Non Prod; Prod enforces stricter safety.

## Settings

- **Connections**: Create, edit, or delete Gremlin and NoSQL connections. Values are encrypted in localStorage.
- **Safe Mode (Write Protection)**: Default ON. Blocks dangerous queries; shows message "Write protection is enable. See settings".
- **Tooltips**: Toggle node tooltips while exploring graphs.

## Controls

- Run query: Ctrl/Cmd + Enter
- Open history: Ctrl/Cmd + H
- Reset view: "Reset View" button above the graph

## Docker

### Multi-Platform Support

CosmoXp Docker images support multiple platforms:
- **Linux**: AMD64, ARM64
- **macOS**: AMD64, ARM64 (Apple Silicon)

### Building Locally

```bash
# Build for current platform
docker build -t cosmoxp .

# Build for specific platform
docker build --platform linux/amd64 -t cosmoxp:linux-amd64 .
docker build --platform linux/arm64 -t cosmoxp:linux-arm64 .
docker build --platform darwin/amd64 -t cosmoxp:macos-amd64 .
docker build --platform darwin/arm64 -t cosmoxp:macos-arm64 .

# Build for all platforms
docker buildx build --platform linux/amd64,linux/arm64,darwin/amd64,darwin/arm64 -t cosmoxp:multi .
```

### Running with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  cosmoxp:
    image: cosmoxp:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## License

MIT License. See `LICENSE` for details.

## Support

If you find CosmoXp helpful, consider buying me a coffee ☕.


