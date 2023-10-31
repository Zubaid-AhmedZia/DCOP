const { ethers, upgrades } = require("hardhat");

async function main() {
  const Dex = await ethers.getContractFactory("Dex");
  console.log("Deploying DexUpgradeable...");

  const dexUpgradeable = await upgrades.deployProxy(Dex, {
    initializer: "initialize",
  });
  await dexUpgradeable.deployed();
  console.log("Dex deployed to:", dexUpgradeable.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
