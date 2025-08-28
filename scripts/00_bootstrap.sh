#!/bin/bash
echo "Cleaning old artifacts..."
docker compose -f docker/docker compose.yaml down -v
rm -rf crypto-config config/*.block config/*.tx
