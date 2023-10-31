const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dex", function () {
  let Dex, DummyToken, TokenA, TokenB, dex;

  beforeEach(async function () {
    [owner, addr1, addr2, ..._] = await ethers.getSigners();
    //console.log(owner.address, addr1.address, addr2.address);

    // contract factories
    DummyToken = await ethers.getContractFactory("DummyToken");
    Dai = await ethers.getContractFactory("Dai");
    Dex = await ethers.getContractFactory("Dex");

    TokenA = await DummyToken.deploy("Token A", "TKA");
    TokenB = await DummyToken.deploy("Token B", "TKB");
    dai = await Dai.deploy();
    dai.faucet(owner, ethers.parseEther("100"));
    //console.log(await TokenA.getAddress());

    dex = await Dex.deploy();

    await TokenA.approve(dex.target, ethers.parseEther("1000000"));
    await TokenB.approve(dex.target, ethers.parseEther("1000000"));
  });

  describe("Token Management", function () {
    it("should allow admin to add a new token", async function () {
      const bytes = ethers.encodeBytes32String("TKA");
      // console.log("bytes", bytes);
      await dex.addToken(ethers.encodeBytes32String("TKA"), TokenA.target);
      const token = await dex.tokens(ethers.encodeBytes32String("TKA"));
      // console.log(token); =>
      // Result(2) [
      //   '0x544b410000000000000000000000000000000000000000000000000000000000',
      //   '0x5FbDB2315678afecb367f032d93F642f64180aa3'
      // ]
      expect(token.tokenAddress).to.equal(TokenA.target);
    });

    it("should not allow non-admin to add a new token", async function () {
      await expect(
        dex
          .connect(addr1)
          .addToken(ethers.encodeBytes32String("TKA"), TokenA.target)
      ).to.be.revertedWith("only admin");
    });
  });

  describe("Deposits", function () {
    beforeEach(async function () {
      await dex.addToken(ethers.encodeBytes32String("TKA"), TokenA.target);
      await TokenA.mint(owner, ethers.parseEther("100"));
    });

    it("should allow users to deposit tokens", async function () {
      await dex.deposit(
        ethers.parseEther("100"),
        ethers.encodeBytes32String("TKA")
      );
      const balance = await dex.traderBalances(
        owner.address,
        ethers.encodeBytes32String("TKA")
      );
      expect(balance).to.equal(ethers.parseEther("100"));
    });

    it("should not allow users to deposit tokens not added", async function () {
      await expect(
        dex.deposit(ethers.parseEther("100"), ethers.encodeBytes32String("TKB"))
      ).to.be.revertedWith("this token does not exist");
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      await dex.addToken(ethers.encodeBytes32String("TKA"), TokenA.target);
      await TokenA.mint(owner, ethers.parseEther("100"));
      await dex.deposit(
        ethers.parseEther("100"),
        ethers.encodeBytes32String("TKA")
      );
    });

    it("should allow users to withdraw tokens", async function () {
      await dex.withdraw(
        ethers.parseEther("50"),
        ethers.encodeBytes32String("TKA")
      );
      const balance = await dex.traderBalances(
        owner.address,
        ethers.encodeBytes32String("TKA")
      );
      expect(balance).to.equal(ethers.parseEther("50"));
    });

    it("should not allow users to withdraw more tokens than they have", async function () {
      await expect(
        dex.withdraw(
          ethers.parseEther("200"),
          ethers.encodeBytes32String("TKA")
        )
      ).to.be.revertedWith("balance too low");
    });
  });

  describe("Limit Orders", function () {
    beforeEach(async function () {
      await dex.addToken(ethers.encodeBytes32String("TKA"), TokenA.target);
      await TokenA.mint(owner, ethers.parseEther("100"));
      await dex.deposit(
        ethers.parseEther("100"),
        ethers.encodeBytes32String("TKA")
      );
    });
    //sell orders
    it("should allow users to create a sell limit order", async function () {
      await dex.createLimitOrder(
        ethers.encodeBytes32String("TKA"),
        ethers.parseEther("50"),
        200,
        1
      );
      const orders = await dex.getOrders(ethers.encodeBytes32String("TKA"), 1);
      expect(orders.length).to.equal(1);
    });

    it("should not allow users to create a sell limit order with amount more than they have", async function () {
      await expect(
        dex.createLimitOrder(
          ethers.encodeBytes32String("TKA"),
          ethers.parseEther("200"),
          200,
          1
        )
      ).to.be.revertedWith("token balance too low");
    });

    //Buy orders

    it("should allow users to create a buy limit order", async function () {
      // Add DAI to the dex (assuming you've already defined DAIToken somewhere)
      await dex.addToken(ethers.encodeBytes32String("DAI"), dai.target);
      // Mint 10,000 DAI for the owner
      await dai.faucet(owner, ethers.parseEther("10000"));
      // Approve the DEX to move 10,000 DAI on behalf of the owner
      await dai.approve(dex.target, ethers.parseEther("10000"));
      // Deposit 10,000 DAI into the dex for the user
      await dex.deposit(
        ethers.parseEther("10000"),
        ethers.encodeBytes32String("DAI")
      );

      await dex.createLimitOrder(
        ethers.encodeBytes32String("TKA"),
        ethers.parseEther("50"),
        200,
        0
      );
      const orders = await dex.getOrders(ethers.encodeBytes32String("TKA"), 0);
      expect(orders.length).to.equal(1);
    });

    it("should not allow users to create a buy limit order with amount more than they have", async function () {
      await expect(
        dex.createLimitOrder(
          ethers.encodeBytes32String("TKA"),
          ethers.parseEther("200"),
          200,
          0
        )
      ).to.be.revertedWith("dai balance too low");
    });
  });

  describe("Market Orders", function () {
    beforeEach(async function () {
      await dex.addToken(ethers.encodeBytes32String("TKA"), TokenA.target);
      await TokenA.mint(owner, ethers.parseEther("100"));
      await TokenA.connect(owner).approve(dex.target, ethers.parseEther("100"));
      await dex.deposit(
        ethers.parseEther("100"),
        ethers.encodeBytes32String("TKA")
      );
    });

    it("should allow users to create a sell market order", async function () {
      const initialTKABalance = await dex.traderBalances(
        owner.address,
        ethers.encodeBytes32String("TKA")
      );
      await dex.createMarketOrder(
        ethers.encodeBytes32String("TKA"),
        ethers.parseEther("50"),
        1
      );
      const finalTKABalance = await dex.traderBalances(
        owner.address,
        ethers.encodeBytes32String("TKA")
      );
      expect(finalTKABalance).to.equal(
        initialTKABalance - (ethers.parseEther("50"))
      );
    });

    it("should not allow users to create a sell market order with amount more than they have", async function () {
      await expect(
        dex.createMarketOrder(
          ethers.encodeBytes32String("TKA"),
          ethers.parseEther("200"),
          1
        )
      ).to.be.revertedWith("token balance too low");
    });

    it("should allow users to create a buy market order", async function () {
      const initialDAIBalance = await dex.traderBalances(
        owner.address,
        ethers.encodeBytes32String("DAI")
      ); // Assuming you have a getBalance method
      await dex.createMarketOrder(
        ethers.encodeBytes32String("TKA"),
        ethers.parseEther("50"),
        0
      ); // Assuming 0 is BUY
      const finalDAIBalance = await dex.getBalance(
        ethers.encodeBytes32String("DAI")
      );
      // You should have less DAI after buying TKA. You might want to further assert that it's reduced by an expected amount, depending on your implementation.
      expect(finalDAIBalance).to.be.lt(initialDAIBalance);
    });

    it("should not allow users to create a buy market order if DAI balance is too low", async function () {
      // Assuming the user doesn't have enough DAI to buy TKA
      await expect(
        dex.createMarketOrder(
          ethers.encodeBytes32String("TKA"),
          ethers.parseEther("200"),
          0
        )
      ).to.be.revertedWith("dai balance too low");
    });
  });
  // describe("Market Order Execution", function () {
  //   beforeEach(async function () {
  //     await dex.addToken(ethers.encodeBytes32String("TKA"), TokenA.target);

  //     // Mint and deposit tokens for owner
  //     await TokenA.mint(owner, ethers.parseEther("100"));
  //     await TokenA.connect(owner).approve(dex.target, ethers.parseEther("100"));
  //     await dex.deposit(
  //       ethers.parseEther("100"),
  //       ethers.encodeBytes32String("TKA")
  //     );

  //     // Mint and deposit DAI for another account (e.g., addr1)
  //     // Assuming you've defined account1 somewhere
  //     await dai.faucet(addr1, ethers.parseEther("1000"));
  //     await dai.connect(addr1).approve(dex.target, ethers.parseEther("1000"));
  //     await dex
  //       .connect(addr1)
  //       .deposit(ethers.parseEther("1000"), ethers.encodeBytes32String("DAI"));

  //     // Create a sell limit order for the owner
  //     await dex.createLimitOrder(
  //       ethers.encodeBytes32String("TKA"),
  //       ethers.parseEther("50"),
  //       10,
  //       1
  //     ); // price: 10 DAI per TKA
  //   });

  //   it("should execute buy market order correctly", async function () {
  //     const initialDAIBalance = await dex
  //       .connect(addr1)
  //       .getBalance(ethers.encodeBytes32String("DAI"));
  //     const initialTKABalance = await dex
  //       .connect(addr1)
  //       .getBalance(ethers.encodeBytes32String("TKA"));

  //     // Buy 25 TKA at market price
  //     await dex
  //       .connect(addr1)
  //       .createMarketOrder(
  //         ethers.encodeBytes32String("TKA"),
  //         ethers.parseEther("25"),
  //         0
  //       ); // Assuming 0 is BUY

  //     const finalDAIBalance = await dex
  //       .connect(addr1)
  //       .getBalance(ethers.encodeBytes32String("DAI"));
  //     const finalTKABalance = await dex
  //       .connect(addr1)
  //       .getBalance(ethers.encodeBytes32String("TKA"));

  //     expect(finalDAIBalance).to.equal(
  //       initialDAIBalance.sub(ethers.parseEther("250"))
  //     ); // 25 TKA * 10 DAI
  //     expect(finalTKABalance).to.equal(
  //       initialTKABalance.add(ethers.parseEther("25"))
  //     );
  //   });

  //   it("should execute sell market order correctly", async function () {
  //     // Let the addr1 first get some TKA tokens
  //     await TokenA.mint(addr1, ethers.parseEther("50"));
  //     await TokenA.connect(addr1).approve(dex.target, ethers.parseEther("50"));
  //     await dex
  //       .connect(addr1)
  //       .deposit(ethers.parseEther("50"), ethers.encodeBytes32String("TKA"));

  //     const initialDAIBalance = await dex
  //       .connect(addr1)
  //       .getBalance(ethers.encodeBytes32String("DAI"));
  //     const initialTKABalance = await dex
  //       .connect(addr1)
  //       .getBalance(ethers.encodeBytes32String("TKA"));

  //     // Sell 25 TKA at market price
  //     await dex
  //       .connect(addr1)
  //       .createMarketOrder(
  //         ethers.encodeBytes32String("TKA"),
  //         ethers.parseEther("25"),
  //         1
  //       ); // Assuming 1 is SELL

  //     const finalDAIBalance = await dex
  //       .connect(addr1)
  //       .getBalance(ethers.encodeBytes32String("DAI"));
  //     const finalTKABalance = await dex
  //       .connect(addr1)
  //       .getBalance(ethers.encodeBytes32String("TKA"));

  //     expect(finalDAIBalance).to.equal(
  //       initialDAIBalance.add(ethers.parseEther("250"))
  //     ); // 25 TKA * 10 DAI
  //     expect(finalTKABalance).to.equal(
  //       initialTKABalance.sub(ethers.parseEther("25"))
  //     );
  //   });
  // });
});
