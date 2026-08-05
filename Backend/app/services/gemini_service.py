"""
Deprecated module: Re-exports persona generation service.
Use app.services.persona_generation_service instead.
"""

from app.services.persona_generation_service import generate_personas

__all__ = ["generate_personas"]
