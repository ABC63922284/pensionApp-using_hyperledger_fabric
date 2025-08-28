#!/bin/bash
set -e

ORG=$1
CA_NAME=ca-${ORG}
CA_PORT=$2
DOMAIN=${ORG}.gov.bd
PWD_DIR=${PWD}

if [ -z "$ORG" ] || [ -z "$CA_PORT" ]; then
  echo "Usage: ./enroll-org.sh <orgName> <caPort>"
  exit 1
fi

echo "🔹 Enrolling admin for $ORG ..."
export FABRIC_CA_CLIENT_HOME=${PWD_DIR}/crypto-config/${ORG}/admin

fabric-ca-client enroll -u https://admin:adminpw@localhost:${CA_PORT} \
  --caname ${CA_NAME} \
  --tls.certfiles ${PWD_DIR}/ca/orgs/${ORG}/ca-cert.pem

echo "🔹 Registering peer0 for $ORG ..."
fabric-ca-client register --id.name peer0.${ORG} \
  --id.secret peer0pw \
  --id.type peer \
  --caname ${CA_NAME} \
  --tls.certfiles ${PWD_DIR}/ca/orgs/${ORG}/ca-cert.pem

echo "🔹 Enrolling peer0 MSP ..."
fabric-ca-client enroll -u https://peer0.${ORG}:peer0pw@localhost:${CA_PORT} \
  --caname ${CA_NAME} \
  --tls.certfiles ${PWD_DIR}/ca/orgs/${ORG}/ca-cert.pem \
  -M ${PWD_DIR}/crypto-config/${ORG}/peers/peer0.${ORG}/msp

cp ${PWD_DIR}/ca/orgs/${ORG}/config.yaml \
   ${PWD_DIR}/crypto-config/${ORG}/peers/peer0.${ORG}/msp/config.yaml

echo "🔹 Enrolling peer0 TLS ..."
fabric-ca-client enroll -u https://peer0.${ORG}:peer0pw@localhost:${CA_PORT} \
  --caname ${CA_NAME} \
  --enrollment.profile tls \
  --csr.hosts peer0.${DOMAIN} \
  --csr.hosts localhost \
  --tls.certfiles ${PWD_DIR}/ca/orgs/${ORG}/ca-cert.pem \
  -M ${PWD_DIR}/crypto-config/${ORG}/peers/peer0.${ORG}/tls

cp ${PWD_DIR}/crypto-config/${ORG}/peers/peer0.${ORG}/tls/tlscacerts/* \
   ${PWD_DIR}/crypto-config/${ORG}/peers/peer0.${ORG}/tls/ca.crt
cp ${PWD_DIR}/crypto-config/${ORG}/peers/peer0.${ORG}/tls/signcerts/* \
   ${PWD_DIR}/crypto-config/${ORG}/peers/peer0.${ORG}/tls/server.crt
cp ${PWD_DIR}/crypto-config/${ORG}/peers/peer0.${ORG}/tls/keystore/* \
   ${PWD_DIR}/crypto-config/${ORG}/peers/peer0.${ORG}/tls/server.key

echo "✅ $ORG peer0 MSP + TLS enrollment complete!"
