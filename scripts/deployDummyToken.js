const { ethers } = require("hardhat");

async function main() {
  const DummyToken = await ethers.getContractFactory("DummyToken");
  console.log("Deploying DummyToken...");
  const dummyToken = await DummyToken.deploy();
  await dummyToken.deployed();
  console.log("DummyToken deployed to:", dummyToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
