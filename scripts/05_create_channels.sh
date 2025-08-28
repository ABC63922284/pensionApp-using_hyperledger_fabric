#!/bin/bash
echo "Creating main channel..."
peer channel create -o localhost:7050 -c pension-main -f ./config/pension-main.tx --outputBlock ./config/pension-main.block
