const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const config = require('./config.json');

const CERT_PATH = config.CERT_PATH;
const MACAROON_PATH = config.MACAROON_PATH;
const GRPCPORT=config.GRPCPORT;

if (!fs.existsSync(CERT_PATH)) {
  console.log(`file not found: CERT_PATH=${CERT_PATH}`);
  return;
}
if (!fs.existsSync(MACAROON_PATH)) {
  console.log(`file not found: MACAROON_PATH=${MACAROON_PATH}`);
  return;
}

console.log(`PORT: ${GRPCPORT}`);

const GRPC_HOST = `localhost:${GRPCPORT}`;
const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
const packageDefinition = protoLoader.loadSync('lightning.proto', loaderOptions);
const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
const tlsCert = fs.readFileSync(CERT_PATH);
const sslCreds = grpc.credentials.createSsl(tlsCert);
const macaroon = fs.readFileSync(MACAROON_PATH).toString('hex');
const macaroonCreds = grpc.credentials.createFromMetadataGenerator(function(args, callback) {
  let metadata = new grpc.Metadata();
  metadata.add('macaroon', macaroon);
  callback(null, metadata);
});
const creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
const client = new lnrpc.Lightning(GRPC_HOST, creds);
let call = client.channelAcceptor({});
call.on('data', function(response) {
  // CUSTOMIZE HERE
  // https://lightning.engineering/api-docs/api/lnd/lightning/channel-acceptor
  console.log(response);

  let request = {
    accept: true,
    // pending_chan_id: <bytes>,
    error: '',
    upfront_shutdown: '',
    // csv_delay: <uint32>,
    reserve_sat: 354,
    // in_flight_max_msat: <uint64>,
    max_htlc_count: 483,
    min_htlc_in: 1,
    min_accept_depth: 0,
    zero_conf: true,
  };
  request.pending_chan_id = response.pending_chan_id;
  request.csv_delay = response.csv_delay;
  request.in_flight_max_msat = response.in_flight_max_msat;
  call.write(request);
});
call.on('status', function(status) {
  // The current status of the stream.
});
call.on('end', function() {
  // The server has closed the stream.
});
// call.write(request);
