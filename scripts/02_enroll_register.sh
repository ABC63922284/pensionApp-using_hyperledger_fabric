#!/bin/bash
echo "Enrolling CA Admins..."
fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 --caname ca-pensionboard -M crypto-config/pensionboard/msp
