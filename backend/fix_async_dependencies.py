#!/usr/bin/env python3

import os
import re
import sys

def fix_async_db_calls(directory):
    """Percorre todos os arquivos .py no diretório e corrige as chamadas de dependências incorretas."""
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r') as f:
                        content = f.read()
                    
                    # Verifica se há chamadas incorretas: Depends(get_async_db())
                    if 'get_async_db()' in content and 'Depends' in content:
                        # Substituição: Depends(get_async_db()) -> Depends(get_async_db)
                        modified_content = content.replace('Depends(get_async_db())', 'Depends(get_async_db)')
                        
                        if modified_content != content:
                            print(f"Corrigindo {file_path}")
                            with open(file_path, 'w') as f:
                                f.write(modified_content)
                except Exception as e:
                    print(f"Erro ao processar {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        directory = sys.argv[1]
    else:
        directory = "src/api_async"
    
    fix_async_db_calls(directory)
    print("Correção concluída!")
