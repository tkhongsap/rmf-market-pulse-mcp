# OpenAI Apps SDK Examples - Documentation Index

> Complete documentation for integrating OpenAI Apps SDK widgets with MCP servers

**Source**: [openai/openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples)
**Created**: 2025-01-13
**Version**: 1.0.0

---

## 📚 Documentation Files

### Core Documentation

1. **[README.md](./README.md)** - Main documentation
   - **What it covers**: Complete deployment guide with architecture, setup, and production deployment
   - **Who it's for**: Developers implementing OpenAI Apps SDK
   - **Time to read**: 20-30 minutes
   - **Sections**:
     - Overview and architecture
     - Prerequisites and system requirements
     - Quick start guide
     - Deployment options (local, cloud, self-hosted)
     - Widget development
     - MCP server implementation
     - Testing and debugging
     - Production considerations

2. **[SUMMARY.md](./SUMMARY.md)** - Executive summary
   - **What it covers**: High-level overview, protocol flow, technology stack
   - **Who it's for**: Decision makers, project managers, quick reference
   - **Time to read**: 10-15 minutes
   - **Sections**:
     - Executive summary
     - Repository contents
     - Technology stack
     - Protocol flow examples
     - Performance benchmarks
     - Migration path

3. **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 10 minutes
   - **What it covers**: Fastest path to running widgets locally
   - **Who it's for**: Developers wanting hands-on experience
   - **Time to complete**: 10-15 minutes
   - **Sections**:
     - Step-by-step setup
     - Build and serve commands
     - ngrok configuration
     - Troubleshooting
     - Next steps

4. **[INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)** - RMF MCP integration
   - **What it covers**: How to add widgets to our RMF Market Pulse MCP server
   - **Who it's for**: Developers working on RMF MCP server
   - **Time to implement**: 10-15 hours
   - **Sections**:
     - Current vs target architecture
     - Step-by-step implementation
     - Widget types for RMF data
     - Migration checklist
     - Performance and security

---

## 💻 Example Code

### Server Implementations

5. **[examples/node-mcp-server.ts](./examples/node-mcp-server.ts)**
   - Complete Node.js/TypeScript MCP server
   - Express + SSE transport
   - Widget registration and serving
   - Session management
   - Production-ready with error handling

6. **[examples/python-mcp-server.py](./examples/python-mcp-server.py)**
   - Complete Python/FastAPI MCP server
   - FastMCP framework
   - Widget registration
   - CORS configuration
   - Uvicorn deployment

### Widget Examples

7. **[examples/example-widget-react.tsx](./examples/example-widget-react.tsx)**
   - React widget for RMF fund detail display
   - TypeScript with type definitions
   - Tailwind CSS styling
   - Component structure
   - Data handling

### Configuration Files

8. **[examples/package.json](./examples/package.json)**
   - NPM dependencies for widgets and MCP server
   - Build scripts configuration
   - Development and production setup

9. **[examples/requirements.txt](./examples/requirements.txt)**
   - Python dependencies for MCP server
   - FastMCP and FastAPI
   - Important installation notes

10. **[examples/vite.config.ts](./examples/vite.config.ts)**
    - Vite build configuration
    - Widget bundling setup
    - Development server config
    - Rollup options

11. **[examples/build-all.ts](./examples/build-all.ts)**
    - Build script for all widgets
    - Manifest generation
    - Automated bundling process

---

## 🎯 Quick Navigation

### I want to...

**...understand what OpenAI Apps SDK is**
→ Read [SUMMARY.md](./SUMMARY.md) (15 min)

**...see a working example quickly**
→ Follow [QUICKSTART.md](./QUICKSTART.md) (10 min)

**...implement it in production**
→ Read [README.md](./README.md) full guide (30 min)

**...add widgets to RMF MCP server**
→ Follow [INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md) (10-15 hours)

**...see example code**
→ Browse [examples/](./examples/) directory

**...understand the architecture**
→ Read "Architecture" section in [README.md](./README.md#architecture)

**...deploy to production**
→ Read "Deployment Options" in [README.md](./README.md#deployment-options)

**...troubleshoot issues**
→ See "Testing & Debugging" in [README.md](./README.md#testing--debugging)

---

## 📊 Documentation Overview

```
docs/openai-apps-sdk-examples/
├── INDEX.md                           # This file - documentation index
├── README.md                          # Main comprehensive guide
├── SUMMARY.md                         # Executive summary
├── QUICKSTART.md                      # 10-minute quickstart
├── INTEGRATION-GUIDE.md               # RMF MCP integration guide
└── examples/                          # Example code
    ├── node-mcp-server.ts            # Node.js MCP server
    ├── python-mcp-server.py          # Python MCP server
    ├── example-widget-react.tsx      # React widget example
    ├── package.json                  # NPM dependencies
    ├── requirements.txt              # Python dependencies
    ├── vite.config.ts                # Vite configuration
    └── build-all.ts                  # Build script
```

---

## 🔄 Recommended Reading Order

### For Developers (Full Implementation)

1. **[SUMMARY.md](./SUMMARY.md)** - Get the big picture (15 min)
2. **[QUICKSTART.md](./QUICKSTART.md)** - Run the examples (10 min)
3. **[README.md](./README.md)** - Deep dive into details (30 min)
4. **[examples/](./examples/)** - Study the code (1-2 hours)
5. **[INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)** - Implement for RMF (10-15 hours)

**Total Time**: ~12-18 hours (including implementation)

### For Decision Makers (Evaluation)

1. **[SUMMARY.md](./SUMMARY.md)** - Understand the technology (15 min)
2. **[README.md](./README.md)** - Review architecture and deployment (30 min)
3. **[INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)** - Evaluate effort and benefits (15 min)

**Total Time**: ~1 hour

### For Quick Start (Hands-On)

1. **[QUICKSTART.md](./QUICKSTART.md)** - Get running ASAP (10 min)
2. **[examples/](./examples/)** - See the code (30 min)
3. **[README.md](./README.md)** - Fill in the details as needed (reference)

**Total Time**: ~40 minutes

---

## 🎨 Widget Types for RMF Data

Based on our RMF Market Pulse MCP tools, recommended widgets:

| Widget | MCP Tool | Priority | Complexity |
|--------|----------|----------|------------|
| **Fund Detail Card** | `get_rmf_fund_detail` | High | Medium |
| **Fund Comparison Table** | `compare_rmf_funds` | High | Medium |
| **NAV History Chart** | `get_rmf_fund_nav_history` | High | High |
| **Performance Table** | `get_rmf_fund_performance` | Medium | Low |
| **Search Results Grid** | `search_rmf_funds` | Medium | Medium |
| **Fund List Table** | `get_rmf_funds` | Low | Low |

**Implementation Recommendation**: Start with Fund Detail Card (highest value, medium complexity)

---

## 🚀 Getting Started

### Option 1: Quick Demo (10 minutes)
```bash
# Clone examples repo
git clone https://github.com/openai/openai-apps-sdk-examples.git
cd openai-apps-sdk-examples

# Follow QUICKSTART.md
```

### Option 2: Study Examples (1 hour)
```bash
# Read the documentation
cat docs/openai-apps-sdk-examples/SUMMARY.md
cat docs/openai-apps-sdk-examples/README.md

# Review example code
ls docs/openai-apps-sdk-examples/examples/
```

### Option 3: Full Implementation (12-18 hours)
```bash
# Follow complete integration guide
cat docs/openai-apps-sdk-examples/INTEGRATION-GUIDE.md

# Implement step by step
# Phase 1: Setup (1-2 hours)
# Phase 2: Implementation (4-6 hours)
# Phase 3: Deployment (2-3 hours)
# Phase 4: Refinement (2-4 hours)
```

---

## 📝 Key Takeaways

1. **OpenAI Apps SDK** = Interactive widgets in ChatGPT
2. **MCP** = Protocol for connecting LLMs to tools
3. **Widget** = React/HTML component with data
4. **SSE** = Transport layer for MCP communication
5. **Production Ready** = Examples are production-ready with security and error handling

## 🔗 External Resources

- **Original Repository**: https://github.com/openai/openai-apps-sdk-examples
- **MCP Specification**: https://modelcontextprotocol.io
- **OpenAI Apps Docs**: https://platform.openai.com/docs/apps
- **MCP SDK (Node)**: https://github.com/modelcontextprotocol/sdk-typescript
- **MCP SDK (Python)**: https://github.com/modelcontextprotocol/python-sdk

---

## ✅ Next Steps

After reading the documentation:

1. [ ] Run the quickstart to see widgets in action
2. [ ] Review example code for implementation patterns
3. [ ] Decide on widget priorities for RMF MCP
4. [ ] Follow integration guide to add widgets
5. [ ] Deploy to production

---

**Questions?** Start with [SUMMARY.md](./SUMMARY.md) for an overview, or jump to [QUICKSTART.md](./QUICKSTART.md) for hands-on experience.

**Last Updated**: 2025-01-13
