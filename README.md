# PulseChainMeshNode

**A decentralized mesh networking node for the PulseChain ecosystem**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![PulseChain](https://img.shields.io/badge/Network-PulseChain-purple.svg)](https://pulsechain.com)

## Overview

PulseChainMeshNode is a privacy-focused, decentralized mesh networking solution built for the PulseChain network. It enables users to route internet traffic through a distributed network of nodes, providing enhanced privacy and censorship resistance.

This project is a fork of the [MASQ Network](https://github.com/MASQ-Project/Node) adapted specifically for the PulseChain ecosystem.

## Features

- **Decentralized Mesh Networking**: Route traffic through multiple nodes for enhanced privacy
- **PulseChain Integration**: Native support for PulseChain mainnet (Chain ID: 369)
- **Token-Free Testing Mode**: Currently operates without token requirements for testing and development
- **Cross-Platform**: Supports Linux, macOS, and Windows
- **Open Source**: Licensed under GPLv3

## Current Status

⚠️ **Development/Testing Phase**

This project is currently in active development. Token functionality has been disabled to allow for testing and development without economic barriers. Future releases may integrate PulseChain-native tokens for network incentivization.

### What Works
- PulseChain mainnet blockchain configuration
- Basic mesh networking functionality
- Node discovery and routing

### In Progress
- Token integration for PulseChain
- Smart contract deployment
- Production hardening

## Quick Start

### Prerequisites

- Rust 1.60 or compatible version
- Linux, macOS, or Windows
- Internet connection

### Building from Source

```bash
# Clone the repository
git clone https://github.com/YourUsername/PulseChainMeshNode.git
cd PulseChainMeshNode

# Build the project
cd node
cargo build --release

# Run the node
./target/release/pulsemesh_node --help
```

### Configuration

The node can be configured via command-line arguments or configuration files. See the [documentation](docs/index.html) for detailed setup instructions.

## Architecture

```
PulseChainMeshNode/
├── pulsemesh_lib/     # Core library with blockchain and networking primitives
├── pulsemesh/         # CLI interface
├── node/              # Main node binary (pulsemesh_node)
├── automap/           # Automatic port mapping
├── dns_utility/       # DNS utilities
├── ip_country/        # IP geolocation
└── docs/              # Documentation and website
```

## PulseChain Network Details

| Parameter | Value |
|-----------|-------|
| Network | PulseChain Mainnet |
| Chain ID | 369 |
| Contract | TBD (Currently disabled) |
| Token | TBD (Currently disabled) |

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

## Credits

This project is based on the excellent work of the [MASQ Project](https://github.com/MASQ-Project/Node). We are grateful for their open-source contribution to decentralized networking.

### Original MASQ Team
- Dan Wiebe and the MASQ contributors

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

```
PulseChainMeshNode - Decentralized mesh networking for PulseChain
Copyright (C) 2024 PulseChainMeshNode Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

## Disclaimer

This software is provided "as is" without warranty of any kind. Use at your own risk. This project is not affiliated with or endorsed by PulseChain or the original MASQ Project.

## Links

- [Documentation](docs/index.html)
- [PulseChain](https://pulsechain.com)
- [Original MASQ Project](https://github.com/MASQ-Project/Node)
