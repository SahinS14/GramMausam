"""Vercel entry point for the GramMausam FastAPI service.

The application itself remains in ``backend.main`` so local Uvicorn, Render,
and Vercel all execute the same verified ML inference code.
"""

from backend.main import app
