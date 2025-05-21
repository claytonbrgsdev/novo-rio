#!/bin/bash

# Script para gerar o cliente TypeScript a partir do esquema OpenAPI

# Diretório raiz do projeto
ROOT_DIR=$(pwd)
BACKEND_DIR="$ROOT_DIR/backend"
CLIENT_DIR="$ROOT_DIR/frontend/src/api"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Por favor, instale o Docker e tente novamente."
    exit 1
fi

# Criar diretório de saída se não existir
mkdir -p "$CLIENT_DIR"

# Baixar o esquema OpenAPI
echo "Baixando esquema OpenAPI..."
curl -s http://localhost:8000/openapi.json -o "$BACKEND_DIR/openapi.json"

# Verificar se o arquivo foi baixado com sucesso
if [ ! -f "$BACKEND_DIR/openapi.json" ]; then
    echo "Erro ao baixar o esquema OpenAPI. Certifique-se de que o servidor está em execução."
    exit 1
fi

echo "Gerando cliente TypeScript..."

# Usar o Docker para executar o OpenAPI Generator
docker run --rm \
    -v "${BACKEND_DIR}/openapi.json:/openapi.json" \
    -v "${CLIENT_DIR}:/client" \
    openapitools/openapi-generator-cli generate \
    -i /openapi.json \
    -g typescript-axios \
    -o /client/generated \
    --additional-properties=supportsES6=true,typescriptThreePlus=true,withInterfaces=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=api,npmName=@novo-rio/api-client,npmVersion=1.0.0

# Verificar se a geração foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "Cliente TypeScript gerado com sucesso em $CLIENT_DIR/generated"
    
    # Instalar dependências do cliente gerado
    echo "Instalando dependências do cliente..."
    cd "$CLIENT_DIR/generated"
    npm install
    
    # Criar um arquivo index.ts para exportar tudo
    echo "Gerando arquivo de exportação..."
    echo 'export * from "./api";' > index.ts
    echo 'export * from "./models";' >> index.ts
    
    echo "Cliente TypeScript configurado com sucesso!"
else
    echo "Erro ao gerar o cliente TypeScript."
    exit 1
fi
