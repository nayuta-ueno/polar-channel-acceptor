# Polar Channel Acceptor

## Usage

1. Start Polar, create networks.
1. Add below options "Edit Options" to LNDs and run.

```conf
  --protocol.option-scid-alias
  --protocol.zero-conf
```

1. `./polar_conf.sh` shows all network IDs.
1. `./polar_conf.sh <ID>` shows all Lightning node names.
1. `./polar_conf.sh <ID> <NAME>` creates `config.json` to access LND node.
1. `npm start` starts LND channel acceptor to the node.
