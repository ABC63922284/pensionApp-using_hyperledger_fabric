#!/bin/bash
echo "Tearing down network..."
docker compose -f docker/docker compose.yaml down -v
docker compose -f ca/docker compose.ca.yaml down -v
rm -rf crypto-config config/*.block config/*.tx
