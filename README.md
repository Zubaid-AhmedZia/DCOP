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

❗ Common Errors:

"this token does not exist": Ensure the token is added via addToken function and referenced correctly.
"dai balance too low": Ensure you have enough DAI for buy limit orders.
"token balance too low": Ensure you have enough of the token you're trying to sell for sell limit orders.

🤝 Contributing
Fork the repository, create your feature branch, commit your changes, and raise a pull request to main.
   
   
