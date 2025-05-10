# backend/src/schemas/tool_use.py

from pydantic import BaseModel
from typing import Optional

class ToolUse(BaseModel):
    """
    Schema para requisições de ações que envolvem ferramentas.
    Combina o nome da ação, o ID do terreno e a chave da ferramenta.
    """
    action_name: str
    terrain_id: int
    tool_key: Optional[str] = None