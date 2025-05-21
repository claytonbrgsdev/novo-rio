#!/usr/bin/env python3

import os
import re
import sys

def fix_async_db_url_in_tests(directory):
    """
    Corrige a configuração de DATABASE_URL assíncrono nos arquivos de teste.
    Garante que um driver assíncrono correto seja usado para PostgreSQL.
    """
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r') as f:
                        content = f.read()
                    
                    # Verifica se o arquivo tem código para criar ASYNC_DATABASE_URL
                    if 'ASYNC_DATABASE_URL' in content and 'create_async_engine' in content:
                        print(f"Verificando {file_path}")
                        
                        # Correção 1: Substitui a forma de obter ASYNC_DATABASE_URL para lidar corretamente com PostgreSQL
                        pattern1 = r"ASYNC_DATABASE_URL\s*=\s*os\.getenv\(['\"]DATABASE_URL['\"],\s*['\"]sqlite\+aiosqlite:\/\/\/\.\/.+?['\"](?:\)\.replace\(['\"]sqlite:\/\/\/['\"],\s*['\"]sqlite\+aiosqlite:\/\/\/['\"]\)|\))"
                        
                        replacement1 = """ASYNC_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
# Garante que o driver correto seja usado para cada tipo de database
if ASYNC_DATABASE_URL.startswith('sqlite:///'):
    ASYNC_DATABASE_URL = ASYNC_DATABASE_URL.replace('sqlite:///', 'sqlite+aiosqlite:///')
elif ASYNC_DATABASE_URL.startswith('postgresql:'):
    ASYNC_DATABASE_URL = ASYNC_DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')"""
                        
                        modified_content = re.sub(pattern1, replacement1, content)
                        
                        # Correção 2: Não use connect_args com PostgreSQL
                        pattern2 = r"async_engine\s*=\s*create_async_engine\(ASYNC_DATABASE_URL,\s*connect_args=\{[^}]+\}\)"
                        
                        replacement2 = """# Cria async_engine com configurações apropriadas para o banco de dados
if ASYNC_DATABASE_URL.startswith('sqlite'):
    async_engine = create_async_engine(ASYNC_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    async_engine = create_async_engine(ASYNC_DATABASE_URL)"""
                        
                        modified_content = re.sub(pattern2, replacement2, modified_content)
                        
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
        directory = "tests"
    
    fix_async_db_url_in_tests(os.path.join("backend", directory))
    print("Correção concluída!")
