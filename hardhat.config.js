require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    polygonTestnet: {
      url: process.env.POLY_SCAN_TEST_NET_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHER_SCAN_API_KEY,
  },
};
