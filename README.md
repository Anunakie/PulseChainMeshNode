# ⬡ PulseChainMeshNode

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![PulseChain](https://img.shields.io/badge/Chain-PulseChain-purple.svg)](https://pulsechain.com)
[![Status](https://img.shields.io/badge/Status-Token--Free%20Testing-green.svg)]()

**Decentralized mesh networking for the PulseChain ecosystem.**

PulseChainMeshNode is a community-adapted fork of [MASQ Network](https://github.com/MASQ-Project/Node) focused on PulseChain compatibility, core mesh privacy, and open token-less testing — with token features planned for later phases.

🌐 **Website:** [https://anunakie.github.io/PulseChainMeshNode/](https://anunakie.github.io/PulseChainMeshNode/)

---

## 🚀 Features

### 💳 PulseChain Web3 Wallets Built-In
Ready-to-use Web3 wallets supporting PulseChain (Chain ID: 369) and compatible chains right from launch — making decentralized finance and interactions seamless without extra setup.

### 📱 Organized Spaces for dApps
Use Spaces to neatly organize your decentralized apps in a dock-style interface. Switch between focused workspaces effortlessly to reduce clutter and boost productivity.

### 🛡️ Supreme Ad & Tracker Blocking by Default
All privacy protections enabled out-of-the-box: block cross-site trackers, cookies, and intrusive ads with no hidden toggles required for true default privacy.

### 🗑️ Automatic History Self-Destruction
Browsing history is limited by default and auto-deletes older entries. Customize how many items to keep before they permanently vanish for enhanced anonymity.

### 🌐 Decentralized dApp Access & Store Integration
Connect through the PulseChainMeshNode mesh to browse and discover dApps on an uncensored, global network — with future plans for a built-in decentralized app library.

### 🔐 Powerful Decentralized Mesh VPN (dMeshVPN)
Route your traffic privately through multiple hops across the global PulseChainMeshNode network for strong anonymity, censorship resistance, and access to the true, unrestricted internet.

### 💬 Wallet-to-Wallet Decentralized Chat
Communicate directly peer-to-peer using Ethereum-compatible wallets via integrations like DM3 — no centralized platforms like traditional messengers needed.

### 🔍 Privacy-Focused Decentralized Search
Integrated search powered by decentralized engines that prioritizes user privacy — no tracking or profiling of your queries.

### 📁 Decentralized File Sharing & Storage via IPFS
Upload and share files securely using IPFS integration — content is distributed across nodes for censorship resistance, redundancy, and better privacy.

### 💰 Future Bandwidth Sharing & Rewards (Coming Soon)
Once token integration is added, share your unused bandwidth with the network to earn rewards — supplement privacy usage while supporting the decentralized mesh.

---

## ✅ Privacy by Default

| Feature | Status |
|---------|--------|
| Ads blocked by default | ✅ |
| Cross-site trackers blocked | ✅ |
| Cookies blocked by default | ✅ |
| Multi-hop dMesh routing | ✅ |
| Country/region hopping | ✅ |
| Auto history destruction | ✅ |
| Decentralized search | ✅ |
| IPFS storage integration | ✅ |
| Wallet-based chat | ✅ |
| PulseChain Web3 native | ✅ |
| Privacy-first configuration | ✅ |
| Open source & auditable | ✅ |

---

## ⚡ Quick Start

### Prerequisites
- Rust 1.63 or higher
- Git

### Build from Source

```bash
# Clone the repository
git clone https://github.com/Anunakie/PulseChainMeshNode.git
cd PulseChainMeshNode

# Build the project
cd node
cargo build --release

# Run the node
./target/release/pulsemesh_node --help

# Start with PulseChain mainnet
./target/release/pulsemesh_node --chain pulse-mainnet
```

---

## 🗺️ Roadmap

### ✅ Phase 1: Fork & Rebrand
- Fork MASQ Network codebase
- Rebrand to PulseChainMeshNode
- Add PulseChain support (Chain ID: 369)
- Update RPC endpoints

### 🔄 Phase 2: Token-Free Testing (Current)
- Disable token requirements for open testing
- Build community and gather feedback
- Improve documentation and setup guides

### 📋 Phase 3: Smart Contracts
- Deploy PulseChain-native smart contracts
- Implement network incentivization
- Add governance mechanisms

### 🚀 Phase 4: Production Launch
- Full production release
- Token integration
- Bandwidth rewards system
- Mainnet deployment

---

## 🔧 Technical Details

- **Chain:** PulseChain Mainnet (Chain ID: 369)
- **RPC:** https://rpc.pulsechain.com
- **Language:** Rust
- **License:** GPL-3.0

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m "Add some AmazingFeature"`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [MASQ Network](https://github.com/MASQ-Project/Node) - Original codebase
- [PulseChain](https://pulsechain.com) - Blockchain platform
- All contributors and community members

---

<p align="center">
  <strong>⬡ PulseChainMeshNode</strong><br>
  <em>Privacy-first mesh networking for PulseChain</em>
</p>

---

## 🌐 PulseMesh Browser

PulseMesh Browser is a privacy-focused web browser built on Electron with Chrome extension support. It integrates seamlessly with the PulseMesh network for decentralized, censorship-resistant browsing.

### Features
- **Chrome Extension Support** - Use your favorite privacy extensions
- **Built-in Mesh Integration** - Connect to the PulseMesh network
- **Privacy by Default** - Ad blocking and tracker protection
- **PulseChain Web3** - Native wallet integration

### Building the Browser

```bash
cd browser
yarn install
yarn build
yarn start
```

### Creating Windows Installer

```bash
cd browser/packages/browser
yarn make --platform win32
```

The installer will be created in `browser/packages/browser/out/make/`
