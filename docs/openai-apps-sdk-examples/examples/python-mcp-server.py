"""
Example MCP Server Implementation (Python + FastAPI)
Based on openai/openai-apps-sdk-examples

This example demonstrates:
- Setting up an MCP server with FastMCP
- Registering tools with widget support
- Handling tool invocations
- Serving widget resources
- FastAPI integration
"""

import os
import json
from typing import Any, Dict, List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("ERROR: mcp package not installed correctly")
    print("Install with: pip install mcp[fastapi]")
    print("NOT the 'modelcontextprotocol' package on PyPI!")
    exit(1)

# ============================================================================
# Configuration
# ============================================================================

PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "127.0.0.1")
WIDGET_BASE_URL = os.getenv("WIDGET_BASE_URL", "http://localhost:4444/assets")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# ============================================================================
# Widget Definition
# ============================================================================

class Widget:
    """Widget definition with metadata for MCP tools"""

    def __init__(
        self,
        id: str,
        title: str,
        description: str,
        template_uri: str,
        html: str,
        response_text: str,
        approval_hint: str = "",
        in_progress_hint: str = "",
        success_hint: str = ""
    ):
        self.id = id
        self.title = title
        self.description = description
        self.template_uri = template_uri
        self.html = html
        self.response_text = response_text
        self.invocation_states = {
            "approvalHint": approval_hint,
            "inProgressHint": in_progress_hint,
            "successHint": success_hint
        }

    def to_tool_dict(self) -> Dict[str, Any]:
        """Convert widget to MCP tool definition"""
        return {
            "name": self.id,
            "description": self.description,
            "inputSchema": {
                "type": "object",
                "properties": {
                    "data": {
                        "type": "object",
                        "description": "Widget data payload"
                    }
                },
                "required": ["data"]
            },
            "annotations": {
                "openai/outputTemplate": {
                    "templateUri": self.template_uri
                },
                "openai/invocationStates": self.invocation_states
            }
        }

    def to_resource_dict(self) -> Dict[str, Any]:
        """Convert widget to MCP resource definition"""
        return {
            "uri": self.template_uri,
            "mimeType": "text/html+skybridge",
            "name": self.title,
            "description": self.description
        }

# ============================================================================
# Helper Functions
# ============================================================================

def load_widget_html(filename: str) -> str:
    """Load widget HTML from assets directory"""
    try:
        asset_path = Path(__file__).parent.parent / "assets" / filename
        if asset_path.exists():
            return asset_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"Warning: Could not load widget HTML: {filename}", e)

    # Fallback: return minimal HTML template
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{filename}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    // Widget implementation would be loaded here
    document.getElementById('root').innerHTML = '<div class="p-4">Widget: {filename}</div>';
  </script>
</body>
</html>
    """.strip()

# ============================================================================
# Widget Registry
# ============================================================================

widgets: List[Widget] = [
    Widget(
        id="rmf-fund-detail",
        title="RMF Fund Detail",
        description="Display detailed information about an RMF fund",
        template_uri=f"{WIDGET_BASE_URL}/rmf-fund-detail.html",
        html=load_widget_html("rmf-fund-detail.html"),
        response_text="Here are the fund details",
        approval_hint="About to show RMF fund details",
        in_progress_hint="Loading fund information...",
        success_hint="Fund details displayed successfully"
    ),
    Widget(
        id="rmf-fund-comparison",
        title="RMF Fund Comparison",
        description="Compare multiple RMF funds side-by-side",
        template_uri=f"{WIDGET_BASE_URL}/rmf-fund-comparison.html",
        html=load_widget_html("rmf-fund-comparison.html"),
        response_text="Here is the fund comparison",
        approval_hint="About to compare RMF funds",
        in_progress_hint="Loading comparison data...",
        success_hint="Comparison displayed successfully"
    ),
    Widget(
        id="rmf-performance-chart",
        title="RMF Performance Chart",
        description="Display fund performance over time",
        template_uri=f"{WIDGET_BASE_URL}/rmf-performance-chart.html",
        html=load_widget_html("rmf-performance-chart.html"),
        response_text="Here is the performance chart",
        approval_hint="About to show performance chart",
        in_progress_hint="Loading chart data...",
        success_hint="Chart displayed successfully"
    )
]

# Create widget lookup
widget_by_id = {w.id: w for w in widgets}

# ============================================================================
# Pydantic Models
# ============================================================================

class WidgetInput(BaseModel):
    """Input model for widget tools"""
    data: Dict[str, Any] = Field(..., description="Widget data payload")

    class Config:
        # Allow alias for camelCase fields
        populate_by_name = True

# ============================================================================
# FastMCP Server Setup
# ============================================================================

mcp = FastMCP("rmf-market-pulse-mcp")

# -------------------------------------------------------------------------
# Dynamic Tool Registration
# -------------------------------------------------------------------------

def create_tool_handler(widget: Widget):
    """Create a tool handler function for a widget"""
    async def handler(input: WidgetInput) -> Dict[str, Any]:
        """Handle tool invocation for this widget"""
        print(f"Tool called: {widget.id}", input.data)

        # In a real implementation, you would:
        # 1. Fetch data from your database/API
        # 2. Process the data according to the widget's needs
        # 3. Return structured content with the widget metadata

        return {
            "content": [
                {
                    "type": "text",
                    "text": widget.response_text
                }
            ],
            # Pass through the data to the widget
            "structuredContent": input.data,
            # Widget metadata for ChatGPT
            "_meta": {
                "openai/outputTemplate": {
                    "templateUri": widget.template_uri
                },
                "openai/invocationStates": widget.invocation_states
            }
        }

    # Set function metadata
    handler.__name__ = widget.id
    handler.__doc__ = widget.description

    return handler

# Register all widgets as tools
for widget in widgets:
    tool_func = create_tool_handler(widget)
    mcp.tool()(tool_func)

# -------------------------------------------------------------------------
# Resource Handlers
# -------------------------------------------------------------------------

@mcp.list_resources()
async def list_resources() -> List[Dict[str, Any]]:
    """List all available widget resources"""
    return [w.to_resource_dict() for w in widgets]

@mcp.read_resource()
async def read_resource(uri: str) -> str:
    """Read widget HTML content"""
    for widget in widgets:
        if widget.template_uri == uri:
            return widget.html

    raise HTTPException(status_code=404, detail=f"Resource not found: {uri}")

# ============================================================================
# FastAPI Application Setup
# ============================================================================

app = FastAPI(
    title="RMF Market Pulse MCP Server",
    description="MCP server with OpenAI Apps SDK widget support",
    version="1.0.0"
)

# -------------------------------------------------------------------------
# CORS Middleware
# -------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------------

@app.get("/")
async def root():
    """Server information"""
    return {
        "name": "RMF Market Pulse MCP Server",
        "version": "1.0.0",
        "mcp_endpoint": "/mcp",
        "health_endpoint": "/health",
        "widgets": len(widgets)
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "timestamp": __import__("datetime").datetime.now().isoformat(),
        "widgets": len(widgets)
    }

# -------------------------------------------------------------------------
# Mount MCP Server
# -------------------------------------------------------------------------

# Mount FastMCP app at /mcp
app.mount("/mcp", mcp.get_asgi_app())

# ============================================================================
# Server Entry Point
# ============================================================================

if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════════╗
║  RMF Market Pulse MCP Server                                   ║
╠════════════════════════════════════════════════════════════════╣
║  Status: Starting...                                           ║
║  Port: {PORT}                                                  ║
║  MCP Endpoint: http://{HOST}:{PORT}/mcp                        ║
║  Health Check: http://{HOST}:{PORT}/health                     ║
║  Widget Base URL: {WIDGET_BASE_URL}                            ║
║  Widgets: {widgets_count}                                      ║
╚════════════════════════════════════════════════════════════════╝
    """.format(
        PORT=PORT,
        HOST=HOST,
        WIDGET_BASE_URL=WIDGET_BASE_URL,
        widgets_count=len(widgets)
    ))

    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_level="info"
    )
