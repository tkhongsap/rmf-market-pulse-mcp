"""
Pizzaz MCP Server (Python/FastMCP)

Example MCP server implementation using FastMCP with FastAPI integration.
Exposes pizza-themed widgets as tools for ChatGPT integration.

Based on: https://github.com/openai/openai-apps-sdk-examples
License: MIT
"""

import os
from dataclasses import dataclass
from typing import Any, Dict, List

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

# ============================================================================
# Configuration
# ============================================================================

WIDGET_BASE_URL = os.getenv("WIDGET_BASE_URL", "http://localhost:4444")
SERVER_HOST = os.getenv("SERVER_HOST", "127.0.0.1")
SERVER_PORT = int(os.getenv("SERVER_PORT", "8000"))

# ============================================================================
# Widget Data Structure
# ============================================================================


@dataclass
class PizzazWidget:
    """Represents a pizza-themed widget with metadata"""

    id: str
    title: str
    template_uri: str
    invoking: str
    invoked: str
    html: str
    response_text: str


# ============================================================================
# Widget Definitions
# ============================================================================

WIDGETS: List[PizzazWidget] = [
    PizzazWidget(
        id="pizza-map",
        title="Pizza Map",
        template_uri=f"{WIDGET_BASE_URL}/pizzaz.html",
        invoking="Finding pizzerias near you...",
        invoked="Here are pizzerias in your area",
        html="<div>Pizza Map Widget HTML would be loaded here</div>",
        response_text="Found nearby pizzerias on the map",
    ),
    PizzazWidget(
        id="pizza-carousel",
        title="Pizza Carousel",
        template_uri=f"{WIDGET_BASE_URL}/pizzaz-carousel.html",
        invoking="Loading pizza carousel...",
        invoked="Here's your pizza carousel",
        html="<div>Pizza Carousel Widget HTML would be loaded here</div>",
        response_text="Pizza carousel is ready to browse",
    ),
    PizzazWidget(
        id="pizza-albums",
        title="Pizza Albums",
        template_uri=f"{WIDGET_BASE_URL}/pizzaz-albums.html",
        invoking="Organizing pizza albums...",
        invoked="Here are your pizza albums",
        html="<div>Pizza Albums Widget HTML would be loaded here</div>",
        response_text="Pizza albums organized and displayed",
    ),
    PizzazWidget(
        id="pizza-list",
        title="Pizza List",
        template_uri=f"{WIDGET_BASE_URL}/pizzaz-list.html",
        invoking="Creating pizza list...",
        invoked="Here's your pizza list",
        html="<div>Pizza List Widget HTML would be loaded here</div>",
        response_text="Pizza list created successfully",
    ),
    PizzazWidget(
        id="pizza-shop",
        title="Pizza Shop",
        template_uri=f"{WIDGET_BASE_URL}/pizzaz-shop.html",
        invoking="Opening pizza shop...",
        invoked="Welcome to the pizza shop",
        html="<div>Pizza Shop Widget HTML would be loaded here</div>",
        response_text="Pizza shop is now open for orders",
    ),
]

# Create widget lookup dictionary
WIDGET_MAP = {widget.id: widget for widget in WIDGETS}

# ============================================================================
# Input Schemas
# ============================================================================


class PizzaToppingInput(BaseModel):
    """Input schema for pizza topping parameter"""

    pizzaTopping: str = Field(..., description="The pizza topping you want")


# ============================================================================
# MCP Server Setup
# ============================================================================

# Initialize FastMCP server
mcp = FastMCP("Pizzaz Demo")


# ============================================================================
# Tool Handlers
# ============================================================================


def create_tool_response(widget: PizzazWidget, topping: str) -> Dict[str, Any]:
    """
    Create a standardized tool response with widget metadata.

    Args:
        widget: The widget to render
        topping: The selected pizza topping

    Returns:
        MCP tool response with content and metadata
    """
    return {
        "content": [
            {"type": "text", "text": widget.response_text},
            {
                "type": "text",
                "text": f'{{"topping": "{topping}", "widget": "{widget.id}"}}',
            },
        ],
        "_meta": {
            "openai/outputTemplate": widget.template_uri,
            "openai/resultCanProduceWidget": True,
        },
    }


@mcp.tool()
def pizza_map(input: PizzaToppingInput) -> Dict[str, Any]:
    """Show a map of nearby pizzerias with your selected topping"""
    widget = WIDGET_MAP["pizza-map"]
    return create_tool_response(widget, input.pizzaTopping)


@mcp.tool()
def pizza_carousel(input: PizzaToppingInput) -> Dict[str, Any]:
    """Browse pizzas in a carousel view with your selected topping"""
    widget = WIDGET_MAP["pizza-carousel"]
    return create_tool_response(widget, input.pizzaTopping)


@mcp.tool()
def pizza_albums(input: PizzaToppingInput) -> Dict[str, Any]:
    """View organized pizza albums with your selected topping"""
    widget = WIDGET_MAP["pizza-albums"]
    return create_tool_response(widget, input.pizzaTopping)


@mcp.tool()
def pizza_list(input: PizzaToppingInput) -> Dict[str, Any]:
    """Get a list of pizzas with your selected topping"""
    widget = WIDGET_MAP["pizza-list"]
    return create_tool_response(widget, input.pizzaTopping)


@mcp.tool()
def pizza_shop(input: PizzaToppingInput) -> Dict[str, Any]:
    """Visit the pizza shop to order pizza with your selected topping"""
    widget = WIDGET_MAP["pizza-shop"]
    return create_tool_response(widget, input.pizzaTopping)


# ============================================================================
# Resource Handlers (Widget HTML Delivery)
# ============================================================================


@mcp.resource("widget://pizza-map")
def get_pizza_map_html() -> str:
    """HTML template for pizza map widget"""
    return WIDGET_MAP["pizza-map"].html


@mcp.resource("widget://pizza-carousel")
def get_pizza_carousel_html() -> str:
    """HTML template for pizza carousel widget"""
    return WIDGET_MAP["pizza-carousel"].html


@mcp.resource("widget://pizza-albums")
def get_pizza_albums_html() -> str:
    """HTML template for pizza albums widget"""
    return WIDGET_MAP["pizza-albums"].html


@mcp.resource("widget://pizza-list")
def get_pizza_list_html() -> str:
    """HTML template for pizza list widget"""
    return WIDGET_MAP["pizza-list"].html


@mcp.resource("widget://pizza-shop")
def get_pizza_shop_html() -> str:
    """HTML template for pizza shop widget"""
    return WIDGET_MAP["pizza-shop"].html


# ============================================================================
# FastAPI Application Setup
# ============================================================================


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application with MCP integration.

    Returns:
        Configured FastAPI application
    """
    # Get the ASGI app from FastMCP
    app = mcp.get_asgi_app()

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Restrict in production!
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add custom routes if needed
    @app.get("/")
    async def root():
        return {
            "name": "Pizzaz MCP Server",
            "version": "1.0.0",
            "widgets": [w.id for w in WIDGETS],
            "widget_base_url": WIDGET_BASE_URL,
        }

    @app.get("/health")
    async def health():
        return {"status": "healthy"}

    return app


# ============================================================================
# Server Startup
# ============================================================================


def main():
    """Start the MCP server with uvicorn"""
    app = create_app()

    print(f"\n{'=' * 60}")
    print(f"Pizzaz MCP Server Starting")
    print(f"{'=' * 60}")
    print(f"Server: http://{SERVER_HOST}:{SERVER_PORT}")
    print(f"MCP Endpoint: http://{SERVER_HOST}:{SERVER_PORT}/mcp")
    print(f"Widget Base URL: {WIDGET_BASE_URL}")
    print(f"\nRegistered Tools:")
    for widget in WIDGETS:
        print(f"  - {widget.id}: {widget.title}")
    print(f"{'=' * 60}\n")

    uvicorn.run(
        app,
        host=SERVER_HOST,
        port=SERVER_PORT,
        log_level="info",
    )


if __name__ == "__main__":
    main()


# ============================================================================
# Usage Examples
# ============================================================================

"""
1. Install dependencies:
   pip install fastapi mcp[fastapi] uvicorn

2. Run the server:
   python pizzaz-server-python.py

3. Test with curl:
   curl http://localhost:8000/

4. Connect to ChatGPT:
   - Enable developer mode in ChatGPT settings
   - Add connector: http://localhost:8000/mcp
   - Or use ngrok: ngrok http 8000

5. Invoke tools in ChatGPT:
   "Show me the pizza map with pepperoni"
   "Create a pizza carousel with mushrooms"

6. Environment variables:
   export WIDGET_BASE_URL=https://your-cdn.com
   export SERVER_HOST=0.0.0.0
   export SERVER_PORT=8000
"""
