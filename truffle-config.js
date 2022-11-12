require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    compilers: {
      solc: {
        // version: '0.5.9',
      },
    },
    quorum: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          `https://nd-609-481-097.p2pify.com/${process.env.ENDPOINT_KEY}`
        )
      },
      network_id: "*",
      gasPrice: 0,
      gas: 4500000,
      type: "quorum"
    },
  },
};
