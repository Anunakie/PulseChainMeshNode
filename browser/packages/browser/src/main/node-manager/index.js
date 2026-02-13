// PulseMesh Browser - Node Control Panel Manager
// Manages the PulseMesh node binary (start/stop/monitor/configure)

import { ipcMain } from 'electron';

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const log = require('electron-log');

// Node state
let store;
let nodeProcess = null;
let nodeStatus = 'stopped'; // 'stopped' | 'starting' | 'running' | 'error'
let nodeLogs = [];
const MAX_LOG_LINES = 500;

const STORE_KEY_NODE_CONFIG = 'node-config';

// Default node configuration
const DEFAULT_CONFIG = {
    neighborhoodMode: 'standard',
    blockchainServiceUrl: 'https://rpc.pulsechain.com',
    earningWallet: '',
    gasPrice: '1',
    dataDirectory: '',
    dnsServers: '1.1.1.1,1.0.0.1',
    logLevel: 'info',
    chainId: 369,
};

function getStore() {
    if (!store) {
        store = new Store();
    }
    return store;
}

/**
 * Get node configuration
 * @returns {object}
 */
function getNodeConfig() {
    const s = getStore();
    const config = s.get(STORE_KEY_NODE_CONFIG);
    if (config && typeof config === 'object') {
        return { ...DEFAULT_CONFIG, ...config };
    }
    return { ...DEFAULT_CONFIG };
}

/**
 * Save node configuration
 * @param {object} config
 * @returns {object}
 */
function saveNodeConfig(config) {
    const s = getStore();
    const current = getNodeConfig();
    const updated = { ...current, ...config };
    s.set(STORE_KEY_NODE_CONFIG, updated);
    log.info('NODE-MANAGER: Config saved');
    return updated;
}

/**
 * Add a log entry
 * @param {string} message
 * @param {string} level - 'info' | 'error' | 'warn'
 */
function addLog(message, level = 'info') {
    const entry = {
        timestamp: new Date().toISOString(),
        message: message.toString().trim(),
        level,
    };
    nodeLogs.push(entry);
    if (nodeLogs.length > MAX_LOG_LINES) {
        nodeLogs = nodeLogs.slice(-MAX_LOG_LINES);
    }
}

/**
 * Find the PulseMesh node binary
 * @returns {string|null}
 */
function findNodeBinary() {
    // Search common locations
    const possiblePaths = [
        path.join(process.env.HOME || '/root', 'PulseChainMeshNode', 'node', 'target', 'release', 'pulsemesh_node'),
        path.join(process.env.HOME || '/root', 'PulseChainMeshNode', 'node', 'target', 'release', 'MASQNode'),
        path.join(process.env.HOME || '/root', 'PulseChainMeshNode', 'target', 'release', 'pulsemesh_node'),
        path.join(process.env.HOME || '/root', 'PulseChainMeshNode', 'target', 'release', 'MASQNode'),
        '/usr/local/bin/pulsemesh_node',
        '/usr/bin/pulsemesh_node',
    ];

    for (const p of possiblePaths) {
        try {
            if (fs.existsSync(p)) {
                return p;
            }
        } catch (e) {
            // skip
        }
    }
    return null;
}

/**
 * Start the PulseMesh node
 * @returns {object} - { status, message }
 */
async function startNode() {
    if (nodeProcess && nodeStatus === 'running') {
        return { status: 'running', message: 'Node is already running' };
    }

    const binaryPath = findNodeBinary();
    if (!binaryPath) {
        nodeStatus = 'error';
        addLog('Node binary not found. Please ensure PulseMesh node is built.', 'error');
        return {
            status: 'error',
            message: 'Node binary not found. Build the node first.',
        };
    }

    const config = getNodeConfig();
    nodeStatus = 'starting';
    addLog('Starting PulseMesh node...', 'info');
    addLog('Binary: ' + binaryPath, 'info');

    // Build command arguments
    const args = [
        '--neighborhood-mode', config.neighborhoodMode,
        '--blockchain-service-url', config.blockchainServiceUrl,
        '--chain', 'mainnet',
        '--log-level', config.logLevel,
    ];

    if (config.earningWallet) {
        args.push('--earning-wallet', config.earningWallet);
    }

    if (config.dnsServers) {
        args.push('--dns-servers', config.dnsServers);
    }

    if (config.gasPrice) {
        args.push('--gas-price', config.gasPrice);
    }

    addLog('Args: ' + args.join(' '), 'info');

    try {
        nodeProcess = spawn(binaryPath, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            detached: false,
        });

        nodeProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n').filter((l) => l.trim());
            lines.forEach((line) => addLog(line, 'info'));
        });

        nodeProcess.stderr.on('data', (data) => {
            const lines = data.toString().split('\n').filter((l) => l.trim());
            lines.forEach((line) => addLog(line, 'error'));
        });

        nodeProcess.on('error', (err) => {
            nodeStatus = 'error';
            addLog('Node process error: ' + err.message, 'error');
            log.error('NODE-MANAGER: Process error ->', err.message);
        });

        nodeProcess.on('exit', (code, signal) => {
            nodeStatus = 'stopped';
            addLog(
                'Node process exited with code ' + code + (signal ? ' signal ' + signal : ''),
                code === 0 ? 'info' : 'error'
            );
            nodeProcess = null;
            log.info('NODE-MANAGER: Process exited, code=' + code);
        });

        // Give it a moment to start
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (nodeProcess && !nodeProcess.killed) {
            nodeStatus = 'running';
            addLog('Node started successfully (PID: ' + nodeProcess.pid + ')', 'info');
            log.info('NODE-MANAGER: Node started, PID=' + nodeProcess.pid);
        }

        return { status: nodeStatus, message: 'Node started', pid: nodeProcess?.pid };
    } catch (err) {
        nodeStatus = 'error';
        addLog('Failed to start node: ' + err.message, 'error');
        log.error('NODE-MANAGER: Failed to start ->', err.message);
        return { status: 'error', message: err.message };
    }
}

/**
 * Stop the PulseMesh node
 * @returns {object} - { status, message }
 */
async function stopNode() {
    if (!nodeProcess) {
        nodeStatus = 'stopped';
        return { status: 'stopped', message: 'Node is not running' };
    }

    addLog('Stopping PulseMesh node...', 'info');

    try {
        nodeProcess.kill('SIGTERM');

        // Wait for graceful shutdown (up to 5 seconds)
        await new Promise((resolve) => {
            const timeout = setTimeout(() => {
                if (nodeProcess && !nodeProcess.killed) {
                    nodeProcess.kill('SIGKILL');
                    addLog('Node force-killed (SIGKILL)', 'warn');
                }
                resolve();
            }, 5000);

            if (nodeProcess) {
                nodeProcess.on('exit', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            } else {
                clearTimeout(timeout);
                resolve();
            }
        });

        nodeProcess = null;
        nodeStatus = 'stopped';
        addLog('Node stopped', 'info');
        log.info('NODE-MANAGER: Node stopped');

        return { status: 'stopped', message: 'Node stopped' };
    } catch (err) {
        addLog('Error stopping node: ' + err.message, 'error');
        log.error('NODE-MANAGER: Error stopping ->', err.message);
        return { status: 'error', message: err.message };
    }
}

/**
 * Get node status
 * @returns {object}
 */
function getNodeStatus() {
    return {
        status: nodeStatus,
        pid: nodeProcess?.pid || null,
        uptime: nodeProcess ? process.uptime() : 0,
        binaryFound: !!findNodeBinary(),
    };
}

/**
 * Get node logs
 * @param {number} limit - Max number of log lines to return
 * @returns {Array}
 */
function getNodeLogs(limit = 100) {
    const count = Math.min(limit, nodeLogs.length);
    return nodeLogs.slice(-count);
}

/**
 * Clear node logs
 */
function clearNodeLogs() {
    nodeLogs = [];
    return { cleared: true };
}

/**
 * Initialize IPC handlers for node management
 */
export function initNodeManagerHandlers() {
    ipcMain.handle('node:start', async (event) => {
        return await startNode();
    });

    ipcMain.handle('node:stop', async (event) => {
        return await stopNode();
    });

    ipcMain.handle('node:get-status', async (event) => {
        return getNodeStatus();
    });

    ipcMain.handle('node:get-logs', async (event, { limit } = {}) => {
        return getNodeLogs(limit || 100);
    });

    ipcMain.handle('node:clear-logs', async (event) => {
        return clearNodeLogs();
    });

    ipcMain.handle('node:get-config', async (event) => {
        return getNodeConfig();
    });

    ipcMain.handle('node:save-config', async (event, config) => {
        return saveNodeConfig(config);
    });

    log.info('NODE-MANAGER: IPC handlers registered');
}

export { startNode, stopNode, getNodeStatus, getNodeLogs, getNodeConfig };
