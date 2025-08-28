#!/bin/bash
echo "Starting orderer and peers..."
docker compose -f docker/docker compose.yaml up -d
