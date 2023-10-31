const { ethers } = require("hardhat");

async function main() {
  const Dex = await ethers.getContractFactory("Dex");
  console.log("Deploying Dex...");
  const dex = await Dex.deploy();
  await dex.deployed();
  console.log("Dex deployed to:", dex.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
