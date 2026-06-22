/**
 * FNS Local Router & Resolver Demo
 * * This script demonstrates the core cryptographic bypass mechanism of the 
 * Fluid Naming System (FNS). It bypasses ICANN DNS by stripping the dot of structural 
 * authority, locally hashing the entire string via Keccak-256, and reading the resolving
 * wallet/data directly from the live BOM FNS Registry contract on Ethereum Sepolia.
 * * Live Contract Address: 0x3808B649C18646C6Da86Be37c8c32991b743416C
 */

const { ethers } = require("ethers");

// 1. Define the live Sepolia contract parameters
const CONTRACT_ADDRESS = "0x3808B649C18646C6Da86Be37c8c32991b743416C";
const CONTRACT_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "targetString", "type": "string" }
        ],
        "name": "resolveFNS",
        "outputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "string", "name": "spatialURI", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

/**
 * Executes the localized Keccak-256 bypass and queries the Sepolia testnet ledger.
 * @param {string} rawInputDomain The input string entered into the FNS omnibox (e.g., "bom.ae")
 */
async function resolveFnsTarget(rawInputDomain) {
    // Standardize input (lower case, remove leading/trailing whitespace)
    const cleanString = rawInputDomain.trim().toLowerCase();

    // The Mathematical Bypass: Hash the entire raw string natively.
    // The dot ceases to act as a directory tree divider; it's simply treated as text.
    const fnsHash = ethers.keccak256(ethers.toUtf8Bytes(cleanString));

    console.log(`\n--------------------------------------------------`);
    console.log(`[FNS Omnibox Input]: "${cleanString}"`);
    console.log(`[Keccak-256 Hash]  : ${fnsHash}`);
    console.log(`--------------------------------------------------`);

    // Use a public Sepolia RPC endpoint to query the network without requiring local keys
    const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_sepolia");
    const fnsContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    console.log(`Querying FNS Live Registry at ${CONTRACT_ADDRESS}...`);

    try {
        const [ownerAddress, spatialURI] = await fnsContract.resolveFNS(cleanString);

        if (ownerAddress === ethers.ZeroAddress) {
            console.log(`\n[Status]: 🚨 UNCLAIMED`);
            console.log(`This FNS target hash is open. No enterprise has anchored a Mirror Chain to it yet.`);
        } else {
            console.log(`\n[Status]: ✅ ACTIVE RESOLUTION`);
            console.log(`[Owner Wallet] : ${ownerAddress}`);
            console.log(`[Mirror Chain] : ${spatialURI || "No Spatial URI anchored yet (Standard 2D Mode active)"}`);
        }
    } catch (error) {
        console.error(`\n[Error]: Unable to query the blockchain.`, error.message);
    }
    console.log(`--------------------------------------------------\n`);
}

// Quick Execution Test
const target = process.argv[2] || "bom.ae";
resolveFnsTarget(target);