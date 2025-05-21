#!/usr/bin/env bash
set -e

API_URL=${API_URL:-http://localhost:8084}

echo "1) Plantando..."
PLANT_ID=$(curl -s -X POST "$API_URL/action/plant" \
  -H "Content-Type: application/json" \
  -d '{"player_id":1,"species_key":"Cajanus_cajan","position":{"x":0,"y":0}}' \
  | jq -r '.id')
echo "→ planting_id = $PLANT_ID"

echo "2) Disparando tick..."
curl -s -X POST "$API_URL/admin/run-tick" || true

echo "3) Colhendo..."
STATUS=$(curl -s -X POST "$API_URL/action/harvest" \
  -H "Content-Type: application/json" \
  -d "{\"planting_id\":$PLANT_ID}" \
  | jq -r '.current_state')
echo "→ estado apos harvest: $STATUS"

if [ "$STATUS" != "COLHIDA" ]; then
  echo "Smoke test falhou!"
  exit 1
fi

echo "Smoke test concluído com sucesso!"
