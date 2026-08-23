<div align="center">

<img src="assets/logo.jpg" alt="Q-SWARM Logo" width="130" style="border-radius: 24px; box-shadow: 0 10px 30px rgba(0, 229, 163, 0.25); margin-bottom: 16px;" />

# ⚡ Q-SWARM

### Autonomous Agentic Logistics & Quantum Route Optimization with Algorand x402 Micro-Settlements

[![Algorand TestNet](https://img.shields.io/badge/Algorand-TestNet-00E5A3?style=for-the-badge&logo=algorand&logoColor=black)](https://algorand.com)
[![x402 Protocol](https://img.shields.io/badge/Standard-x402%20Payment%20Required-4F46E5?style=for-the-badge&logo=ethereum&logoColor=white)](https://facilitator.goplausible.com)
[![Qiskit Quantum](https://img.shields.io/badge/Quantum-Qiskit%20QAOA-6929C4?style=for-the-badge&logo=ibm&logoColor=white)](https://qiskit.org)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python 3.11](https://img.shields.io/badge/Language-Python%203.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Pera Wallet](https://img.shields.io/badge/Wallet-Pera%20Wallet-FFEE55?style=for-the-badge&logo=walletconnect&logoColor=black)](https://perawallet.app)

<p align="center">
  <b>An autonomous multi-agent platform combining Qiskit Quantum Approximate Optimization (QAOA) with Algorand x402 HTTP micro-payments for next-generation B2B logistics and fleet dispatch.</b>
</p>

---

</div>

## 📌 Problem Statement

* 🧩 **NP-Hard Routing Complexity:** Capacitated Vehicle Routing Problems (CVRP) suffer from exponential combinatorial search spaces as waypoints, delivery deadlines, cargo weight limits, and toll routes scale.
* ⚖️ **Multi-Objective Tradeoffs:** Fleet managers must simultaneously balance operating cost, transit time, carbon emissions ($CO_2$), fuel consumption, and toll gate expenses.
* 💳 **Web2 Payment Friction:** Autonomous AI agents and machine-to-machine micro-services cannot use traditional credit cards or subscription paywalls to pay for specialized compute resources (such as quantum solvers) in real time.

---

## 🚀 The Q-SWARM Solution

**Q-SWARM** solves enterprise fleet dispatch by bridging **Quantum Computing**, **Autonomous AI Agents**, and **Web3 Blockchain Micro-Settlements**:

1. 🤖 **Multi-Agent Orchestration Swarm:** A coordinated pipeline of 7 specialized autonomous agents that handle shipment intake, real road candidate generation, vehicle capacity validation, cryptographic payment settlement, quantum solving, and cryptographic verification.
2. ⚛️ **Qiskit QAOA Quantum Optimization:** Formulates routing candidates into a Quadratic Unconstrained Binary Optimization (**QUBO**) Ising Hamiltonian, finding the minimum-energy route profile using Quantum Approximate Optimization Algorithm simulation.
3. ⚡ **x402 Protocol on Algorand:** Implements the **HTTP 402 Payment Required** standard. The quantum compute resource is protected by an autonomous paywall settled for **0.2 ALGO** on Algorand TestNet via **Pera Wallet** and verified by the **GoPlausible Facilitator**.
4. 🗺️ **Interactive Swarm Map & Toll Clearance:** Real-time Leaflet GIS mapping featuring dynamic multi-path previews, glowing optimal route rendering, autonomous truck animation, and simulated automated RFID toll clearance.
5. 🌱 **Verifiable ESG Green Certificates (ASA):** Automatically calculates carbon savings ($kg\ CO_2$) against standard routes and mints an on-chain **Algorand Standard Asset (ASA)** NFT certificate for ESG sustainability reporting.
6. 📄 **Automated Tax Invoice & Step-by-Step Route Report:** Dispatches an official, itemized Tax Invoice with cryptographic transaction proof, waypoints, toll clearances, and vehicle specs directly to email via Google SMTP.
7. 🎙️ **AI Voice Copilot:** Hands-free speech-recognition assistant allowing operators to navigate steps and adjust solver weights using voice commands.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js / React)"]
        UI["👤 User / Fleet Operator"]
        Voice["🎙️ AI Voice Copilot"]
        Pera["🟡 Pera Wallet (Algorand)"]
        Map["🗺️ Interactive Swarm Map"]
    end

    subgraph AgentPipeline["Autonomous Agent Swarm (Node.js / Express / Prisma)"]
        LA["📦 1. Logistics Agent"]
        RA["🗺️ 2. Route Agent (OpenRouteService)"]
        VA["🚚 3. Vehicle Agent (Capacity & Specs)"]
        PA["💳 4. Payment Agent (x402 Interceptor)"]
        QA["⚛️ 5. Quantum Agent (QUBO Formulation)"]
        VrfA["🛡️ 6. Verification Agent"]
        EA["📧 7. Email Agent (Tax Invoice Dispatch)"]
    end

    subgraph QuantumCore["Quantum Solver (Python / Qiskit)"]
        QUBO["🔢 QUBO Ising Matrix"]
        QAOA["⚛️ QAOA Quantum Statevector Circuit"]
    end

    subgraph Blockchain["Algorand TestNet & x402 Protocol"]
        Facilitator["⚡ GoPlausible x402 Facilitator"]
        Algod["🔗 Algod TestNet Node"]
        Treasury["💼 Q-Swarm Treasury Account"]
        ASA["🌱 Green Certificate Carbon ASA"]
    end

    UI -->|1. Submit Shipment & Weights| LA
    LA --> RA
    RA --> VA
    VA -->|Intercept with HTTP 402| PA
    PA -->|Challenge 402 Payment Required| Client
    Client -->|Sign 0.2 ALGO Tx| Pera
    Pera --> Algod
    Algod --> Treasury
    Client -->|Retry with X-402-Payment-Token| PA
    PA -->|Verify Tx Proof| Facilitator
    Facilitator -->|Verified| QA
    QA -->|Formulate Matrix| QUBO
    QUBO --> QAOA
    QAOA -->|Optimal Route Vector| VrfA
    VrfA -->|Selected Winner| Map
    VrfA -->|Mint Carbon NFT| ASA
    VrfA -->|Generate Invoice & Dispatch| EA
```

---

## 🤖 The Multi-Agent Swarm

| Agent | Icon | Responsibility |
|---|:---:|---|
| **Logistics Agent** | 📦 | Geocodes origin, destination, intermediate delivery waypoints, and cargo constraints (weight, volume, hazardous/fragile flags). |
| **Route Agent** | 🗺️ | Interacts with OpenRouteService GIS API to generate real multi-path road candidates and toll gate coordinates. |
| **Vehicle Agent** | 🚚 | Evaluates fleet models (Heavy Duty Trailer, Intermediate Commercial, Light Truck, Mini Truck), enforcing strict payload and volumetric safety limits. |
| **Payment Agent (x402)** | 💳 | Enforces the HTTP 402 paywall protocol, requiring cryptographic transaction proofs on the Algorand blockchain before granting access to the quantum solver. |
| **Quantum Optimization Agent** | ⚛️ | Constructs the QUBO penalty matrix balancing Cost, Duration, Fuel, $CO_2$, and Tolls, executing QAOA quantum statevector circuits. |
| **Verification Agent** | 🛡️ | Verifies quantum results against vehicle constraints and issues cryptographic route certificates. |
| **Email Agent** | 📧 | Generates formal, itemized Tax Invoices with step-by-step routing itineraries and dispatches receipts via SMTP. |

---

## ⚡ Algorand x402 Protocol Flow

Q-SWARM implements the **x402 standard** for autonomous machine-to-machine monetization:

```
[Client]                               [Q-SWARM API]                            [Algorand Network]
   │                                          │                                         │
   ├────── POST /api/optimize-route ─────────>│                                         │
   │                                          │                                         │
   │<───── HTTP 402 Payment Required ─────────┤ (Challenge: 0.2 ALGO via x402)          │
   │       [Headers: Receiver, Facilitator]   │                                         │
   │                                          │                                         │
   ├────── Sign & Broadcast Transaction ───────────────────────────────────────────────>│
   │       (0.2 ALGO to Q-Swarm Treasury)     │                                         │
   │                                          │                                         │
   │<───── Tx Hash Confirmed ───────────────────────────────────────────────────────────┤
   │                                          │                                         │
   ├────── POST /api/optimize-route ─────────>│                                         │
   │       [Header: X-402-Payment-Token: Tx]  │                                         │
   │                                          ├──── Verify Tx with Facilitator / Node ─>│
   │                                          │<─── Payment Confirmed ──────────────────┤
   │                                          │                                         │
   │                                          ├──── Run Qiskit QAOA Quantum Solver ────┐│
   │                                          │<─── Minimum Energy State Found ────────┘│
   │                                          │                                         │
   │<───── 200 OK (Optimized Route + Proof) ──┤                                         │
```

---

## ⚛️ Quantum Optimization (QAOA & QUBO)

The route selection is formulated as an Ising Hamiltonian minimizing the total cost function:

$$\min \mathcal{H} = \sum_{i=1}^{N} \left( w_{\text{cost}} \tilde{C}_i + w_{\text{time}} \tilde{T}_i + w_{\text{fuel}} \tilde{F}_i + w_{\text{co2}} \tilde{E}_i + w_{\text{toll}} \tilde{L}_i \right) x_i + \lambda \left( \sum_{i=1}^{N} x_i - 1 \right)^2$$

Where:
* $x_i \in \{0, 1\}$ is the binary decision variable for selecting route alternative $i$.
* $\tilde{C}_i, \tilde{T}_i, \tilde{F}_i, \tilde{E}_i, \tilde{L}_i$ are normalized metrics for Cost, Duration, Fuel, $CO_2$ emissions, and Toll charges.
* $\lambda$ is the penalty parameter enforcing the constraint that exactly **one** optimal route is chosen ($\sum x_i = 1$).
* The problem is solved via **Qiskit QAOA** parameter optimization simulating parameterized quantum ansatz statevectors $|\psi(\gamma, \beta)\rangle$.

---

## 🛠️ Technology Stack

| Layer | Technologies & Frameworks |
|---|---|
| **Frontend & UI** | ![Next.js](https://img.shields.io/badge/Next.js%2016-000?logo=next.js) ![React](https://img.shields.io/badge/React%2019-20232A?logo=react) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwind-css) ![Leaflet](https://img.shields.io/badge/Leaflet-199900?logo=leaflet) ![Lucide](https://img.shields.io/badge/Lucide%20Icons-F56565) |
| **Backend & APIs** | ![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js) ![Express](https://img.shields.io/badge/Express-000000?logo=express) ![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?logo=prisma) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql) ![Nodemailer](https://img.shields.io/badge/Nodemailer-0F172A?logo=gmail) |
| **Quantum Core** | ![Python](https://img.shields.io/badge/Python%203.11-3776AB?logo=python) ![Qiskit](https://img.shields.io/badge/Qiskit-6929C4?logo=ibm) ![NumPy](https://img.shields.io/badge/NumPy-013243?logo=numpy) ![NetworkX](https://img.shields.io/badge/NetworkX-orange) |
| **Blockchain & Web3** | ![Algorand](https://img.shields.io/badge/Algorand%20TestNet-000000?logo=algorand) ![Pera Wallet](https://img.shields.io/badge/Pera%20Wallet-FFEE55?logo=walletconnect) ![x402 Standard](https://img.shields.io/badge/x402%20Protocol-4F46E5) ![Algosdk](https://img.shields.io/badge/Algosdk%20v2-00E5A3) |

---

## 📦 Installation & Quickstart

### 1. Clone Repository
```bash
git clone https://github.com/AnandKrishnaPV/QSWARM.git
cd QSWARM
```

---

### 2. Configure Environment Variables

#### `api/.env`:
```env
PORT=8081
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# Algorand TestNet
ALGORAND_NODE_URL="https://testnet-api.algonode.cloud"
ALGORAND_INDEXER_URL="https://testnet-idx.algonode.cloud"
ALGORAND_NETWORK="testnet"
RECEIVER_ADDRESS="5C4UKY2NYXCOC5VFGFTLBANBYDETRNSVOYTBTJDSMY4INMS6EVN6KXQNF4"

# x402 Facilitator
X402_FACILITATOR_URL="https://facilitator.goplausible.com"
X402_PRICE="0.2"
X402_PAYMENT_ASSET="ALGO"

# Routing API (OpenRouteService)
ROUTING_API_KEY="your_openrouteservice_api_key"

# SMTP Email Dispatch (Google SMTP)
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_gmail_app_password"
EMAIL_FROM="Q-Swarm Logistics <your_email@gmail.com>"
```

#### `web/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:8081/api"
NEXT_PUBLIC_ALGORAND_NETWORK="testnet"
```

---

### 3. Run Backend API
```bash
cd api
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

---

### 4. Run Quantum Service
```bash
cd optimization
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

---

### 5. Run Web Frontend
```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Hackathon Workflow Walkthrough

1. 🗺️ **Step 1: Route Setup** — Enter Origin (*Electronic City, Bangalore*), Destination (*Whitefield, Bangalore*), and add any intermediate waypoints (*Koramangala*, *Indiranagar*).
2. 📦 **Step 2: Cargo Specifications** — Enter cargo weight ($kg$), volume ($m^3$), packages count, and toggle Multi-Vehicle Fleet Swarm (Q-CVRP).
3. 🚚 **Step 3: Vehicle Allocation** — Choose a Logistics Sector (*Light Delivery*), select manufacturer (*Mahindra*), and allocate a real carrier (*Furio 14*). The system verifies payload capacity constraints.
4. ⚙️ **Step 4: Optimization Priorities** — Select an objective preset (*Balanced*, *Eco-Friendly*, *Cheapest*, *Fastest*) or customize weight sliders.
5. 💳 **Step 5: x402 Algorand Settlement** — Connect Pera Wallet and execute the autonomous micro-payment of **0.2 ALGO**. (Includes an instant demo bypass fallback for presentations).
6. 🏆 **Step 6: Optimal Dashboard** — View the winning route, interactive truck animation, upcoming toll plazas, carbon savings, on-chain proof on Lora Explorer, mint ESG Green Certificates, and dispatch formal Tax Invoices directly to your email.

---

## 📜 License

This project is open-source software licensed under the **MIT License**.

---

<div align="center">
  <sub>Built with ❤️ for the Algorand x402 Hackathon 2026. Powered by Algorand Blockchain & Qiskit Quantum Computing.</sub>
</div>
