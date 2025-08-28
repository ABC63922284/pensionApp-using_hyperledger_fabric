#!/bin/bash
echo "Starting CA containers..."
docker compose -f ca/docker compose.ca.yaml up -d
