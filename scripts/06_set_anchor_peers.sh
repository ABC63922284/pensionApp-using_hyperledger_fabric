#!/bin/bash
echo "Updating anchor peers..."
peer channel update -o localhost:7050 -c pension-main -f ./config/anchors-pensionboard.tx
