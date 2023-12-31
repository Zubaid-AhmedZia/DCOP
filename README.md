<h1>Decentralized Conditional Order Protocol</h1>

An Ethereum-based decentralized exchange where users can trade ERC20 tokens.

<h2>Features</h2>

Token Management: Easily add any ERC20 tokens to the DEX for trading.

Limit Orders: Users can create sell or buy limit orders.

Market Orders: Users can create sell or buy market orders.

DAI Token: DAI, a stablecoin pegged to the US dollar, is used as the base currency for trades.

## 🔧 Setting Up & Running Tests

### Prerequisites:

- [Node.js](https://nodejs.org/)
- [Hardhat](https://hardhat.org/)
- [Ethers.js](https://docs.ethers.io/v5/)

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd <repository-directory>

   ```

2. **Install Dependencies**:

   ```bash
   npm install

   ```

3. **Compile the contracts**:

   ```bash
   npx hardhat compile

   ```

4. **Run the tests**:
   ```bash
   npx hardhat test
   ```

❗ Common Errors:

"this token does not exist": Ensure the token is added via addToken function and referenced correctly.

"dai balance too low": Ensure you have enough DAI for buy limit orders.

"token balance too low": Ensure you have enough of the token you're trying to sell for sell limit orders.

### Oracle:

Chainlink Oracle is used to fetch price of pairs. Currently it is used only to fetch the price in smart contract (Dex.sol). These prices can be displyed to users for real time prices of assets on the exchange.

### Upgradeable Smart Contract:

DexUpgradeable.sol is integrated with upgradeable funcitonality using openzeppelin upgradeable contracts. This allows to update smart contract in future.

Contract can be paused at any time by admin incase something goes wrong or there is an update to be made.

### Scripts:

Etherjs scripts for deploying smart contracts.

**Run the scripts**:

```bash
npx hardhat run scripts/<'filename'> --network <'networkname'>
```

---

There is a file named Potential Extensions that contains suggestions or future implementations that can be done to make this protocol scalable and more robust.

🤝 Contributing:

Fork the repository, create your feature branch, commit your changes, and raise a pull request to main.
