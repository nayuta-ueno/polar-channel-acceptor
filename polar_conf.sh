#!/bin/bash

POLAR_CONF=$HOME/.polar/networks/networks.json
FILE_ACCEPTOR=./config.json
ID=0

if [ ! -f $POLAR_CONF ]; then
    echo "networks.json not found: $POLAR_CONF"
    exit 1
fi

if [ $# -eq 0 ]; then
    # network IDs
    list=`cat $POLAR_CONF | jq '.networks[] | {"id": .id, name: .name}'`
    echo "networks:"
    echo $list
    exit 1
fi

ID=$1
LNALL=`cat $POLAR_CONF | jq -r '.networks[] | select(.id=='$ID') | .nodes.lightning'`

if [ $# -eq 1 ]; then
    # name
    list=`echo $LNALL | jq '.[].name'`
    echo $list
    exit 1
fi

NAME=$2
lnd=`echo $LNALL | jq -r '.[] | select(.name == "'$NAME'")'`
macaroon_path=`echo $lnd | jq -r '.paths.adminMacaroon'`
tls_path=`echo $lnd | jq -r '.paths.tlsCert'`
grpc=`echo $lnd | jq -r '.ports.grpc'`

cat << EOS > $FILE_ACCEPTOR
{
    "CERT_PATH": "$tls_path",
    "MACAROON_PATH": "$macaroon_path",
    "GRPCPORT": $grpc
}
EOS
