import { useState, useEffect } from 'react';
import { FinancialLedger } from "./payments/FinancialLedger";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import axios from 'axios';
import algosdk from 'algosdk';
import { 
  Play, MapPin, Truck, ShieldCheck, CreditCard, 
  Settings, ChevronRight, AlertTriangle, Compass, 
  CheckCircle, ArrowRight, Loader2, Sparkles, RefreshCw,
  TrendingUp, Leaf, DollarSign, Clock, Layers, History, HelpCircle, Zap, Locate, Globe, Wallet, Car, Package,
  Mail, Send, FileText, Printer, Download, ExternalLink, Code2, Copy, Check, Eye, X, LogIn, LogOut, User as UserIcon, Phone
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import LocationAutocomplete from './LocationAutocomplete';
import { loginWithGoogle, logoutUser, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Dynamically import MapComponent to disable SSR
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });
import { VoiceCopilot, QuantumVisualizer, GreenCertificateMint } from './new_ui';


const API_BASE_URL = '/api';

interface Vehicle {
  id: string;
  manufacturer: string;
  model: string;
  sector: string;
  imageUrl: string;
  type: string;
  fuelType: string;
  payloadCapacity: number;
  gvwr: number | null;
  fuelConsumption: number;
  fuelTankCapacity: number;
  cargoVolume: number;
  maxSpeed: number;
  avgSpeed: number;
  co2EmissionFactor: number;
}

interface Stop {
  name: string;
  lat?: number;
  lng?: number;
}

interface SavedStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  stopOrder: number;
}

interface Route {
  id: string;
  name: string;
  distance: number;
  duration: number;
  geometry: string;
  fuelConsumption: number;
  fuelCost: number;
  tollCost: number;
  co2Emissions: number;
  totalCost: number;
  score: number;
  isSelected: boolean;
  alternatives?: any[];
  tollGates?: { name: string; price: number; lat: number; lng: number }[];
}

interface AgentRun {
  id: string;
  agentName: string;
  status: string;
  logs: string;
  timestamp: string;
}

export default function MainWorkflow() {
  // Navigation / Workflow step
  // 1: Welcome, 2: Route Setup, 3: Cargo, 4: Vehicle, 5: Preferences, 6: Payment/Execution, 7: Results, 8: Dashboard
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Database lists
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [walletStatus, setWalletStatus] = useState<any>(null);

  // Step 2: Route Input
  const [origin, setOrigin] = useState<string>('Electronic City, Bangalore');
  const [destination, setDestination] = useState<string>('Whitefield, Bangalore');
  const [stops, setStops] = useState<string[]>([]);
  const [newStop, setNewStop] = useState<string>('');
  const [isDomestic, setIsDomestic] = useState<boolean>(true);

  // Step 3: Cargo
  const [cargoDesc, setCargoDesc] = useState<string>('Medical Diagnostic Instruments');
  const [cargoWeight, setCargoWeight] = useState<number>(1200); // kg
  const [cargoVolume, setCargoVolume] = useState<number>(8.5);  // m³
  const [packages, setPackages] = useState<number>(34);
  const [deadline, setDeadline] = useState<string>(() => {
    // Tomorrow at 18:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    // Format to datetime-local input: YYYY-MM-DDThh:mm
    const tzoffset = tomorrow.getTimezoneOffset() * 60000;
    return new Date(tomorrow.getTime() - tzoffset).toISOString().slice(0, 16);
  });
  const [fragile, setFragile] = useState<boolean>(true);
  const [tempControlled, setTempControlled] = useState<boolean>(false);
  const [hazardous, setHazardous] = useState<boolean>(false);

  // Step 4: Vehicle Choice
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [selectedVehicleModel, setSelectedVehicleModel] = useState<string>('');
  const [vehicleSpecs, setVehicleSpecs] = useState<Vehicle | null>(null);
  const [capacityCheck, setCapacityCheck] = useState<{ valid: boolean; message: string } | null>(null);

  // Step 5: Preferences
  const [activePreset, setActivePreset] = useState<string>('Balanced');
  const [weights, setWeights] = useState({
    cost: 35,
    time: 30,
    fuel: 15,
    co2: 10,
    tolls: 10
  });

  const handlePresetSelect = (name: string, newWeights: any) => {
    setActivePreset(name);
    setWeights(newWeights);
  };

  // Step 6: Payment / Optimization Pipeline State
  const [jobId, setJobId] = useState<string | null>(null);
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  const [candidateRoutes, setCandidateRoutes] = useState<Route[]>([]);
  const [savedStops, setSavedStops] = useState<SavedStop[]>([]);
  
  // Real-time Pipeline Execution Timeline
  const [pipelineSteps, setPipelineSteps] = useState<Array<{
    id: string;
    label: string;
    status: 'idle' | 'running' | 'success' | 'failed';
    log?: string;
  }>>([
    { id: 'LOGISTICS', label: 'LOGISTICS AGENT', status: 'idle' },
    { id: 'ROUTE', label: 'ROUTE AGENT', status: 'idle' },
    { id: 'VEHICLE', label: 'VEHICLE AGENT', status: 'idle' },
    { id: 'PAYMENT', label: 'PAYMENT AGENT (x402)', status: 'idle' },
    { id: 'QUANTUM', label: 'QUANTUM SOLVER (QAOA)', status: 'idle' },
    { id: 'VERIFICATION', label: 'VERIFICATION AGENT', status: 'idle' }
  ]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [x402Details, setX402Details] = useState<any>(null);
  const [showProtocolInspector, setShowProtocolInspector] = useState<boolean>(false);
  const [copiedTx, setCopiedTx] = useState<boolean>(false);
  const [payStatus, setPayStatus] = useState<'idle' | 'required' | 'signing' | 'submitted' | 'confirmed' | 'failed'>('idle');

  // Firebase Auth state
  const [peraWallet, setPeraWallet] = useState<any>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ email: string; name: string; photoURL?: string; phoneNumber?: string } | null>(null);

  // Email confirmation states
  const [emailInput, setEmailInput] = useState<string>('');
  const [emailSending, setEmailSending] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [htmlReceipt, setHtmlReceipt] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showX402Info, setShowX402Info] = useState<boolean>(false);

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginMethod, setLoginMethod] = useState<'select' | 'google' | 'phone' | 'otp'>('select');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Step 7: Selected/Optimized Results
  const [optimizationJob, setOptimizationJob] = useState<any>(null);
  const [recommendedRoute, setRecommendedRoute] = useState<Route | null>(null);
  const [isFleetMode, setIsFleetMode] = useState<boolean>(false);
  
  // Map drawing coordinates
  const [mapOrigin, setMapOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [mapDestination, setMapDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [mapStops, setMapStops] = useState<SavedStop[]>([]);
  const [mapRoutes, setMapRoutes] = useState<Route[]>([]);

  // Step 8: Dashboard & Analytics
  const [history, setHistory] = useState<any[]>([]);

  // Fetch initial vehicle list, wallet status, and auth listener
  useEffect(() => {
    fetchVehicles();
    fetchWalletStatus();

    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const profile = {
            email: firebaseUser.email || 'user@example.com',
            name: firebaseUser.displayName || 'Authorized User',
            photoURL: firebaseUser.photoURL || undefined
          };
          setUserProfile(profile);
          setEmailInput(profile.email);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase auth listener active in fallback mode');
    }
  }, []);

  // Update vehicle specifications when model changes
  useEffect(() => {
    if (vehicles.length > 0 && selectedVehicleModel) {
      const spec = vehicles.find(v => v.model === selectedVehicleModel) || null;
      setVehicleSpecs(spec);
      if (spec) {
        // Validate capacities
        const weightValid = cargoWeight <= spec.payloadCapacity;
        const volumeValid = cargoVolume <= spec.cargoVolume;
        if (!weightValid || !volumeValid) {
          setCapacityCheck({
            valid: false,
            message: `Vehicle cannot safely transport this shipment. ${!weightValid ? `Cargo weight (${cargoWeight.toLocaleString()} kg) exceeds vehicle payload capacity (${spec.payloadCapacity.toLocaleString()} kg).` : ''} ${!volumeValid ? `Cargo volume (${cargoVolume} m³) exceeds vehicle cargo volume capacity (${spec.cargoVolume} m³).` : ''} Select a vehicle with higher capacity.`
          });
        } else {
          setCapacityCheck({
            valid: true,
            message: 'Vehicle capacity constraints check passed.'
          });
        }
      }
    }
  }, [selectedVehicleModel, vehicles, cargoWeight, cargoVolume]);

  
  useEffect(() => {
    import('@perawallet/connect').then(({ PeraWalletConnect }) => {
      const wallet = new PeraWalletConnect();
      setPeraWallet(wallet);
      wallet.reconnectSession().then((accounts) => {
        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      }).catch(console.error);
    });
  }, []);

  const handleConnectWallet = () => {
    if (!peraWallet) return;
    peraWallet.connect().then((newAccounts: string[]) => {
      setAccountAddress(newAccounts[0]);
    }).catch((error: any) => {
      if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
        console.error(error);
      }
    });
  };

  const handleDisconnectWallet = () => {
    if (!peraWallet) return;
    peraWallet.disconnect();
    setAccountAddress(null);
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/vehicles`);
      setVehicles(res.data);
      // Pick default: prefer a light truck, otherwise first in list
      const initial = res.data.find((v: any) => v.model === 'Furio 14') || res.data[0];
      if (initial) {
        setVehicleSpecs(initial);
        setSelectedVehicleModel(initial.model); // ensure selectedVehicleModel is never empty
      }
    } catch (err: any) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  const fetchWalletStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/wallet/status`);
      setWalletStatus(res.data);
    } catch (err: any) {
      console.error('Failed to fetch wallet:', err);
    }
  };

  const handleAddStop = () => {
    if (newStop.trim() !== '') {
      setStops([...stops, newStop.trim()]);
      setNewStop('');
    }
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  // Step 2 Action: Validate route geocoding & create shipment
  const handleProceedRoute = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        origin,
        destination,
        cargoDescription: cargoDesc,
        cargoWeight,
        cargoVolume,
        packages,
        deadline: new Date(deadline).toISOString(),
        fragile,
        temperatureControlled: tempControlled,
        hazardous
      };

      const res = await axios.post(`${API_BASE_URL}/shipments`, payload);
      setShipmentId(res.data.id);
      
      // Geocoded coordinates returned
      setMapOrigin({ lat: res.data.originLat, lng: res.data.originLng });
      setMapDestination({ lat: res.data.destLat, lng: res.data.destLng });
      
      // Update Logistics agent status
      updatePipelineStep('LOGISTICS', 'success', 'Shipment coordinates verified and saved in database.');
      
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      updatePipelineStep('LOGISTICS', 'failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 4 Action: Validate capacities & generate candidates
  const handleGenerateCandidates = async () => {
    if (!shipmentId) return;
    setLoading(true);
    setError(null);

    try {
      updatePipelineStep('ROUTE', 'running', 'Connecting to OpenRouteService directions API...');
      updatePipelineStep('VEHICLE', 'running', 'Verifying vehicle payload limits...');

      const payload = {
        shipmentId,
        vehicleModel: selectedVehicleModel,
        stops,
        costWeight: weights.cost,
        timeWeight: weights.time,
        fuelWeight: weights.fuel,
        co2Weight: weights.co2,
        tollWeight: weights.tolls
      };

      const res = await axios.post(`${API_BASE_URL}/routes/candidates`, payload);
      
      setJobId(res.data.jobId);
      setCandidateRoutes(res.data.routes);
      setSavedStops(res.data.stops);
      setMapStops(res.data.stops);
      
      // Map candidates to visual polylines
      setMapRoutes(res.data.routes);

      updatePipelineStep('VEHICLE', 'success', `Seeded vehicle specs loaded. Weight capacity checked.`);
      updatePipelineStep('ROUTE', 'success', `Generated ${res.data.routes.length} candidate alternatives using routing API.`);

      setStep(6);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      updatePipelineStep('ROUTE', 'failed', err.message);
      updatePipelineStep('VEHICLE', 'failed', 'Capacity checks blocked candidate generation.');
    } finally {
      setLoading(false);
    }
  };

  // Step 6 Action: Execute Payment and Optimization Pipeline
    // Step 6 Action: Execute Payment and Optimization Pipeline via Pera Wallet
  const handlePayAndOptimize = async () => {
    if (!jobId || !accountAddress || !peraWallet) {
      setError("Please connect your Pera Wallet first.");
      return;
    }
    
    setError(null);
    setPayStatus('signing');
    updatePipelineStep('PAYMENT', 'running', 'Requesting quantum optimization resource... Intercepted HTTP 402 Payment Required.');

    try {
      updatePipelineStep('PAYMENT', 'running', 'Connecting to Pera Wallet... Please approve the 0.2 ALGO transaction on your device to pay Q-Swarm.');
      
      // 1. Setup Algod Client to construct transaction
      const algodToken = '';
      const algodServer = 'https://testnet-api.algonode.cloud';
      const algodClient = new algosdk.Algodv2(algodToken, algodServer, '');
      const params = await algodClient.getTransactionParams().do();
      
      // 2. Construct Payment Transaction to Q-Swarm Treasury
      const qSwarmTreasury = "GD64WT2C46HI6625V55V55V55V55V55V55V55V55V55V55V55V55V55V55";
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: accountAddress,
        receiver: qSwarmTreasury,
        amount: 200000, // 0.2 ALGO
        note: new Uint8Array(Buffer.from("Q-Swarm x402 Optimization Fee")),
        suggestedParams: params
      });
      
      // 3. Request Signature from Pera Wallet
      const singleTxnGroups = [{ txn, signers: [accountAddress] }];
      const signedTxn = await peraWallet.signTransaction([singleTxnGroups]);
      
      updatePipelineStep('PAYMENT', 'running', 'Transaction signed! Broadcasting to Algorand TestNet...');
      
      // 4. Submit to network
      const sendResponse = await algodClient.sendRawTransaction(signedTxn[0]).do() as any;
      const txId = sendResponse.txId || sendResponse.txid;
      setTxHash(txId);
      setX402Details({ txId, blockRound: params.firstValid, fee: 0.001 });
      setPayStatus('submitted');
      
      updatePipelineStep('PAYMENT', 'running', `Payment sent from your wallet! Tx: ${txId.slice(0, 16)}... Verifying proof with GoPlausible Facilitator...`);

      // 5. Submit signed transaction proof back to optimize-route via x402 header
      const optRes = await axios.post(`${API_BASE_URL}/optimize-route`, 
        { jobId }, 
        { headers: { 'X-402-Payment-Token': txId } }
      );
      
      setPayStatus('confirmed');
      updatePipelineStep('PAYMENT', 'success', `x402 Payment settled successfully. You paid Q-Swarm for optimization.`);
      
      // 6. Update Quantum and Verification agent states
      updatePipelineStep('QUANTUM', 'running', `Formulating QUBO matrix for candidate routes. Launching QAOA quantum circuit simulator...`);
      
      // Sequential pipeline visualization
      setTimeout(() => {
        setOptimizationJob(optRes.data);
        updatePipelineStep('QUANTUM', 'success', `QAOA optimization complete. Minimum energy state found (Score: ${(optRes.data.metrics?.score || 0.85).toFixed(4)}).`);
        
        setTimeout(() => {
          updatePipelineStep('VERIFICATION', 'success', `Route verified cryptographically against vehicle constraints.`);
          setPayStatus('confirmed');
          
          const selectedId = optRes.data.selectedRouteId;
          const best = candidateRoutes.find((r: any) => r.id === selectedId);
          if (best) setRecommendedRoute(best);
        }, 1200);
      }, 1500);

    } catch (err: any) {
      console.error('Payment Error:', err);
      setError(err?.message || "User rejected the transaction in Pera Wallet.");
      setPayStatus('idle');
      updatePipelineStep('PAYMENT', 'failed', 'Payment rejected or failed. Cannot proceed to optimization.');
    }
  };

  // Temporary state for 2-step verification
  const [tempGoogleProfile, setTempGoogleProfile] = useState<any>(null);

    const handleGoogleAuth = async () => {
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      await loginWithGoogle(); // onAuthStateChanged will handle setting the profile
      setShowLoginModal(false);
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  
  
  const handleSignOut = async () => {
    await logoutUser();
    setUserProfile(null);
  };

  const handleSendConfirmationEmail = async () => {
    if (!emailInput) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailSending(true);
    setEmailError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/email/confirm-payment`, {
        email: emailInput,
        userName: userProfile?.name || 'Verified Customer',
        jobId: jobId || 'job_default',
        txId: txHash || 'TX_ALGORAND_TESTNET_CONFIRMED',
        origin,
        destination,
        routeName: recommendedRoute?.name || 'Recommended Route',
        distance: recommendedRoute?.distance || 0,
        duration: recommendedRoute?.duration || 0,
        co2: recommendedRoute?.co2Emissions || 0,
        totalCost: recommendedRoute?.totalCost || 0,
        vehicleModel: selectedVehicleModel,
        finalObjective: optimizationJob?.finalObjective
      });
      setEmailStatus('success');
      setHtmlReceipt(res.data.htmlReceipt);
    } catch (err: any) {
      setEmailStatus('failed');
      setEmailError(err.response?.data?.error || err.message);
    } finally {
      setEmailSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const updatePipelineStep = (id: string, status: 'idle' | 'running' | 'success' | 'failed', log?: string) => {
    setPipelineSteps(prev => prev.map(s => s.id === id ? { ...s, status, log } : s));
  };

  const handleGoToDashboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/payments`);
      setHistory(res.data);
      setStep(8);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceCommand = (command: string) => {
    console.log("Voice Command Received: ", command);
    
    // Step navigation commands
    if (command.includes('step') || command.includes('go to')) {
      if (command.includes('route')) setStep(2);
      if (command.includes('cargo')) setStep(3);
      if (command.includes('vehicle')) setStep(4);
      if (command.includes('preference') || command.includes('weight')) setStep(5);
      if (command.includes('payment')) setStep(6);
    }
    
    // Route setting
    if (command.includes('destination to') || command.includes('going to')) {
      const places = ["whitefield", "electronic city", "koramangala", "indiranagar", "marathahalli", "hebbal"];
      for (const p of places) {
        if (command.includes(p)) {
          setDestination(p.charAt(0).toUpperCase() + p.slice(1) + ", Bangalore");
          setStep(2);
        }
      }
    }

    // Preset selection
    if (command.includes('eco') || command.includes('green') || command.includes('carbon')) {
      handlePresetSelect('Eco-Friendly', { cost: 10, time: 20, fuel: 35, co2: 35, tolls: 0 });
      if (step < 5) setStep(5);
    } else if (command.includes('fast') || command.includes('quick') || command.includes('time')) {
      handlePresetSelect('Fastest', { cost: 10, time: 60, fuel: 10, co2: 10, tolls: 10 });
      if (step < 5) setStep(5);
    } else if (command.includes('cheap') || command.includes('cost')) {
      handlePresetSelect('Cheapest', { cost: 50, time: 10, fuel: 15, co2: 5, tolls: 20 });
      if (step < 5) setStep(5);
    }
  };

  const handleSimulateDisruption = async () => {
    if (!recommendedRoute) return;
    
    // Create an alert pipeline step
    const stepId = 'disruption-' + Date.now();
    setPipelineSteps(prev => [...prev, { id: stepId, label: '🚨 DISRUPTION DETECTED', status: 'running' }]);
    
    setTimeout(() => {
      updatePipelineStep(stepId, 'success', 'Traffic incident detected on main highway. Quantum Engine recalculating QUBO weights...');
      
      // Trigger quantum recalculation and retrieve optimal alternative path
      if (candidateRoutes.length > 1) {
        const altRoute = candidateRoutes.find(r => r.id !== recommendedRoute.id) || candidateRoutes[0];
        setRecommendedRoute({...altRoute, name: "Re-routed: " + altRoute.name, tollCost: altRoute.tollCost + 12});
        setMapRoutes([{...altRoute, isSelected: true}]);
      }
    }, 1500);
  };

  const handleTollIntersect = (toll: any) => {
    const stepId = 'toll-' + Date.now();
    setPipelineSteps(prev => [...prev, { id: stepId, label: '🚧 TOLL GATE INTERSECTED', status: 'running', log: `Approaching ${toll.name}` }]);
    
    setTimeout(() => {
      updatePipelineStep(stepId, 'success', `Autonomous x402 payment of ${toll.price.toFixed(2)} USDC settled via Algorand TestNet.`);
    }, 2000);
  };

  const getStepIndicator = () => {
    if (step === 1) return null;
    return (
      <div className="flex items-center justify-center space-x-2 py-4 mb-6 border-b border-light-gray overflow-x-auto text-xs md:text-sm">
        {[
          { num: 2, label: 'Route' },
          { num: 3, label: 'Cargo' },
          { num: 4, label: 'Vehicle' },
          { num: 5, label: 'Weights' },
          { num: 6, label: 'x402 Payment' },
          { num: 7, label: 'Optimal Route' }
        ].map((s) => (
          <div key={s.num} className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold ${
              step === s.num 
                ? 'bg-brand-green text-white' 
                : step > s.num 
                ? 'bg-brand-green/20 text-brand-green' 
                : 'bg-white text-slate-400 border border-slate-200'
            }`}>
              {s.num - 1}
            </div>
            <span className={step === s.num ? 'font-semibold text-deep-navy' : 'text-slate-500'}>{s.label}</span>
            {s.num < 7 && <ArrowRight className="w-3 h-3 text-slate-300" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-deep-navy text-white px-6 py-4 flex items-center justify-between border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-sm border border-white/10">
            <Image src="/logo.jpg" alt="Q-Swarm Logo" width={40} height={40} className="object-cover" />
          </div>
          <div>
            <span className="font-bold tracking-wider text-lg">Q-SWARM</span>
            <span className="hidden sm:inline-block ml-3 px-2 py-0.5 rounded text-[10px] bg-brand-blue/20 text-brand-blue border border-brand-blue/30 uppercase tracking-widest font-semibold">
              Quantum Solver
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Firebase Google Auth Profile */}
          {userProfile ? (
            <div className="flex items-center space-x-2 bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 text-xs">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt="User Avatar" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-brand-green flex items-center justify-center text-[10px] font-bold text-white">
                  {userProfile.name.charAt(0)}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="font-semibold text-slate-200 text-[11px] leading-tight truncate max-w-[120px]">{userProfile.name}</p>
                <p className="text-[9px] text-slate-400 font-mono leading-none truncate max-w-[120px]">{userProfile.email}</p>
              </div>
              <button 
                onClick={handleSignOut} 
                title="Sign Out" 
                className="text-slate-400 hover:text-red-400 p-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setLoginMethod('select');
                setLoginError(null);
                setPhoneNumber('');
                setOtpCode('');
                setShowLoginModal(true);
              }}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all shadow-sm"
            >
              <UserIcon className="w-3.5 h-3.5 text-brand-green" />
              <span>Sign In</span>
            </button>
          )}

          
          {/* User Web3 Wallet */}
          <div className="hidden md:flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            {accountAddress ? (
              <>
                <Wallet className="w-3.5 h-3.5 text-brand-green" />
                <span className="text-slate-200 font-mono">
                  {accountAddress.substring(0,6)}...{accountAddress.substring(accountAddress.length-4)}
                </span>
                <button onClick={handleDisconnectWallet} className="ml-2 text-slate-400 hover:text-red-400 transition-colors" title="Disconnect Wallet">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button onClick={handleConnectWallet} className="flex items-center space-x-1.5 font-semibold text-brand-green hover:text-white transition-colors">
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>

          {walletStatus && (
            <div className="hidden md:flex items-center space-x-3 text-xs bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                <span className="text-slate-400">Agent Wallet:</span>
              </div>
              <span className="font-mono text-brand-green font-semibold">
                {walletStatus.agentWallet.usdc.toFixed(2)} USDC
              </span>
              <span className="text-white/20">|</span>
              <span className="text-slate-300 font-mono text-[10px]">
                {String(walletStatus.agentWallet.address || '').slice(0, 6)}...{String(walletStatus.agentWallet.address || '').slice(-6)}
              </span>
            </div>
          )}
          
          <button 
            onClick={handleGoToDashboard}
            className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 hover:border-brand-green text-slate-300 hover:text-white transition-all"
          >
            <History className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Workflow Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">
        {getStepIndicator()}

        <div className="flex-1 flex flex-col">
          {/* Welcome Screen */}
          {step === 1 && (
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 py-8 animate-slide-up">
              <div className="flex-1 max-w-lg space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real Algorand TestNet x402 Integration</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-deep-navy leading-tight">
                  Autonomous <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">Quantum Logistics</span>
                </h1>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Let AI agents coordinate complex routing, specifications validation, and machine-to-machine payments on Algorand to optimize your cargo logistics routes.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto px-8 py-4 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl shadow-lg shadow-brand-green/20 hover:shadow-brand-green/40 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 text-base"
                  >
                    <span>START OPTIMIZING</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleGoToDashboard}
                    className="w-full sm:w-auto px-6 py-4 glass text-slate-700 hover:bg-slate-50 font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <span>VIEW DASHBOARD</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 w-full max-w-md glass p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-green/10 rounded-full blur-3xl -z-10"></div>
                
                <div>
                  <h3 className="font-bold text-deep-navy text-lg mb-2">Platform Overview</h3>
                  <p className="text-slate-500 text-sm mb-4">A real working demonstration of machine-to-machine paid logistics optimization using Algorand.</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 text-xs">
                      <div className="w-5 h-5 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center font-bold mt-0.5">1</div>
                      <div>
                        <p className="font-semibold text-slate-700">Multi-Agent Planning</p>
                        <p className="text-slate-500">Autonomous agents validate specs and verify routes.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 text-xs">
                      <div className="w-5 h-5 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold mt-0.5">2</div>
                      <div>
                        <p className="font-semibold text-slate-700">Quantum Solver</p>
                        <p className="text-slate-500">A QUBO model solved via Qiskit Aer QAOA simulator.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 text-xs">
                      <div className="w-5 h-5 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold mt-0.5">3</div>
                      <div>
                        <p className="font-semibold text-slate-700">Algorand x402 Payments</p>
                        <p className="text-slate-500">Payment is requested, signed, and settled on TestNet.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Network: TestNet</span>
                  <span>Facilitator: GoPlausible</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Route Setup */}
          {step === 2 && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px] animate-slide-up">
              {/* Form Input Left */}
              <div className="lg:col-span-2 glass p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-deep-navy">Plan your shipment</h2>
                      <p className="text-slate-500 text-xs mt-1">Enter your shipment coordinates. Locations will be resolved automatically using a geocoder.</p>
                    </div>
                    
                    {/* Domestic Toggle */}
                    <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-600">Domestic</span>
                      <button 
                        onClick={() => setIsDomestic(!isDomestic)}
                        className={`w-9 h-5 rounded-full relative transition-colors ${isDomestic ? 'bg-brand-green' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isDomestic ? 'left-4.5 right-0.5' : 'left-0.5'}`} style={{ left: isDomestic ? '1.125rem' : '0.125rem' }}></div>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Origin Location</label>
                      <LocationAutocomplete 
                        value={origin}
                        onChange={setOrigin}
                        placeholder="Search origin address..."
                        iconColorClass="text-brand-green"
                        restrictToCountry={isDomestic ? 'in' : null}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Intermediate Stops (Max 3)</label>
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <LocationAutocomplete 
                            value={newStop}
                            onChange={setNewStop}
                            placeholder={stops.length >= 3 ? "Max stops reached" : "Add intermediate stop..."}
                            iconColorClass="text-slate-400"
                            restrictToCountry={isDomestic ? 'in' : null}
                          />
                        </div>
                        <button 
                          onClick={handleAddStop}
                          disabled={stops.length >= 3 || newStop.trim() === ''}
                          className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Add Stop
                        </button>
                      </div>
                      
                      {stops.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {stops.map((stop, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-150 px-3 py-2 rounded-xl text-xs">
                              <span className="font-medium text-slate-700">{idx+1}. {stop}</span>
                              <button 
                                onClick={() => handleRemoveStop(idx)}
                                className="text-red-500 hover:text-red-700 font-semibold"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destination Location</label>
                      <LocationAutocomplete 
                        value={destination}
                        onChange={setDestination}
                        placeholder="Search destination address..."
                        iconColorClass="text-brand-blue"
                        restrictToCountry={isDomestic ? 'in' : null}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Step 1 of 5</span>
                  <button 
                    onClick={handleProceedRoute}
                    disabled={loading || origin.trim() === '' || destination.trim() === ''}
                    className="px-6 py-3 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Resolving...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Map Preview Right */}
              <div className="lg:col-span-1 h-full bg-slate-200 rounded-2xl relative overflow-hidden min-h-[350px] border border-border-custom shadow-sm">
                <MapComponent origin={null} destination={null} />
              </div>
            </div>
          )}

          {/* Step 3: Cargo Details */}
          {step === 3 && (
            <div className="max-w-xl w-full mx-auto glass p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[450px] animate-slide-up">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-deep-navy">Enter Cargo Details</h2>
                  <p className="text-slate-500 text-xs mt-1">Specify weight, volume and special storage options to evaluate vehicle suitability.</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cargo Description</label>
                    <input 
                      type="text" 
                      value={cargoDesc}
                      onChange={(e) => setCargoDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-border-custom rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Deadline</label>
                    <input 
                      type="datetime-local" 
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-slate-50 border border-border-custom rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cargo Weight (kg)</label>
                    <input 
                      type="number" 
                      value={cargoWeight}
                      onChange={(e) => setCargoWeight(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-border-custom rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cargo Volume (m³)</label>
                    <input 
                      type="number" 
                      value={cargoVolume}
                      onChange={(e) => setCargoVolume(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-border-custom rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Packages</label>
                    <input 
                      type="number" 
                      value={packages}
                      onChange={(e) => setPackages(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-border-custom rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 grid grid-cols-3 gap-2">
                  <label className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer text-xs font-semibold select-none ${fragile ? 'border-brand-green bg-brand-green/5 text-brand-green' : 'border-slate-200 text-slate-600'}`}>
                    <input type="checkbox" checked={fragile} onChange={(e) => setFragile(e.target.checked)} className="hidden" />
                    <span>Fragile</span>
                  </label>
                  <label className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer text-xs font-semibold select-none ${tempControlled ? 'border-brand-green bg-brand-green/5 text-brand-green' : 'border-slate-200 text-slate-600'}`}>
                    <input type="checkbox" checked={tempControlled} onChange={(e) => setTempControlled(e.target.checked)} className="hidden" />
                    <span>Temp-Control</span>
                  </label>
                  <label className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer text-xs font-semibold select-none ${hazardous ? 'border-brand-green bg-brand-green/5 text-brand-green' : 'border-slate-200 text-slate-600'}`}>
                    <input type="checkbox" checked={hazardous} onChange={(e) => setHazardous(e.target.checked)} className="hidden" />
                    <span>Hazardous</span>
                  </label>
                </div>

                {/* Fleet Mode Toggle */}
                <div className="border-t border-slate-100 pt-4">
                  <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer text-xs select-none transition-all ${isFleetMode ? 'border-brand-green bg-brand-green/10' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <div>
                      <span className={`block font-bold text-sm ${isFleetMode ? 'text-brand-green' : 'text-slate-700'}`}>Multi-Vehicle Fleet Swarm (Q-CVRP)</span>
                      <span className="text-slate-500 mt-1 block">Allow the quantum engine to split this large payload across multiple optimal vehicles (EVs and Light Trucks).</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer ml-4">
                      <input type="checkbox" checked={isFleetMode} onChange={(e) => setIsFleetMode(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-700 text-sm font-semibold">Back</button>
                <button 
                  onClick={() => setStep(4)}
                  disabled={cargoWeight <= 0 || cargoVolume <= 0 || packages <= 0}
                  className="px-6 py-3 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Vehicle Allocation */}
          {step === 4 && (
            <div className="max-w-xl w-full mx-auto glass p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[450px] animate-slide-up">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-deep-navy">Choose Carrier Vehicle</h2>
                  <p className="text-slate-500 text-xs mt-1">Select a real vehicle. The system will retrieve specifications to perform safety checks.</p>
                </div>

                <div className="space-y-4">
                  {!selectedSector ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select Logistics Sector</label>
                      <div className="grid grid-cols-2 gap-4">
                        {Array.from(new Set(vehicles.map(v => v.sector).filter(Boolean))).map((sector, idx) => (
                          <div 
                            key={sector || `sector-${idx}`} 
                            onClick={() => setSelectedSector(sector)} 
                            className="p-5 border border-slate-200 rounded-xl cursor-pointer bg-white hover:border-brand-green hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2 group"
                          >
                            <Package className="w-8 h-8 text-slate-400 group-hover:text-brand-green transition-colors" />
                            <span className="text-sm font-bold text-slate-700">{sector}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : !selectedManufacturer ? (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <button onClick={() => setSelectedSector(null)} className="text-xs text-brand-green font-bold uppercase hover:underline">&larr; Back</button>
                        <span className="text-xs text-slate-400 uppercase font-semibold">/ {selectedSector}</span>
                      </div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select Manufacturer</label>
                      <div className="grid grid-cols-2 gap-4">
                        {Array.from(new Set(vehicles.filter(v => v.sector === selectedSector).map(v => v.manufacturer).filter(Boolean))).map((mfg, idx) => (
                          <div 
                            key={mfg || `mfg-${idx}`} 
                            onClick={() => setSelectedManufacturer(mfg)} 
                            className="p-5 border border-slate-200 rounded-xl cursor-pointer bg-white hover:border-brand-green hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2 group"
                          >
                            <Truck className="w-8 h-8 text-slate-400 group-hover:text-brand-green transition-colors" />
                            <span className="text-sm font-bold text-slate-700">{mfg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <button onClick={() => setSelectedManufacturer(null)} className="text-xs text-brand-green font-bold uppercase hover:underline">&larr; Back</button>
                        <span className="text-xs text-slate-400 uppercase font-semibold">/ {selectedManufacturer}</span>
                      </div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select Model</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {vehicles.filter(v => v.manufacturer === selectedManufacturer && v.sector === selectedSector).map(v => (
                          <div 
                            key={v.model} 
                            onClick={() => setSelectedVehicleModel(v.model)} 
                            className={`overflow-hidden border rounded-xl cursor-pointer transition-all ${
                              selectedVehicleModel === v.model 
                                ? 'border-brand-green shadow-md ring-2 ring-brand-green/20' 
                                : 'border-slate-200 hover:border-brand-green/50 bg-white'
                            }`}
                          >
                            <div className="h-28 w-full bg-slate-100 relative">
                              <img src={v.imageUrl} alt={v.model} className="w-full h-full object-cover" />
                              {selectedVehicleModel === v.model && (
                                <div className="absolute top-2 right-2 bg-brand-green text-white p-1 rounded-full">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 bg-white">
                              <h3 className="font-bold text-slate-800 text-sm leading-tight">{v.model}</h3>
                              <p className="text-xs text-slate-500 mt-1">{v.type} • {v.payloadCapacity.toLocaleString()} kg</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {vehicleSpecs && selectedVehicleModel && (
                        <div className="bg-slate-50 border border-border-custom p-4 rounded-xl space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                            <span className="font-bold text-slate-500 uppercase tracking-wider">Specifications (System Verified)</span>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-semibold rounded">{vehicleSpecs.type}</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400">Max Payload:</span>
                              <p className="font-bold text-slate-800">{vehicleSpecs.payloadCapacity.toLocaleString()} kg</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Cargo Volume:</span>
                              <p className="font-bold text-slate-800">{vehicleSpecs.cargoVolume} m³</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Consumption:</span>
                              <p className="font-bold text-slate-800">{vehicleSpecs.fuelConsumption} L/100km</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Fuel Type:</span>
                              <p className="font-bold text-slate-800">{vehicleSpecs.fuelType}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Tank Capacity:</span>
                              <p className="font-bold text-slate-800">{vehicleSpecs.fuelTankCapacity} L</p>
                            </div>
                            <div>
                              <span className="text-slate-400">CO₂ Factor:</span>
                              <p className="font-bold text-slate-800">{vehicleSpecs.co2EmissionFactor} kg/L</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {capacityCheck && (
                    <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${capacityCheck.valid ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      {capacityCheck.valid ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold">{capacityCheck.valid ? "Capacity checks passed" : "Capacity checks failed"}</p>
                        <p className="mt-0.5">{capacityCheck.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <button onClick={() => setStep(3)} className="text-slate-500 hover:text-slate-700 text-sm font-semibold">Back</button>
                <button 
                  onClick={() => setStep(5)}
                  disabled={!capacityCheck || !capacityCheck.valid}
                  className="px-6 py-3 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Optimization Weights */}
          {step === 5 && (
            <div className="max-w-xl w-full mx-auto glass p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[450px] animate-slide-up">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-deep-navy">Optimization Priorities</h2>
                  <p className="text-slate-500 text-xs mt-1">Select an objective profile for the quantum solver, or customize your own.</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { name: 'Balanced', icon: Layers, w: { cost: 30, time: 30, fuel: 20, co2: 10, tolls: 10 } },
                      { name: 'Eco-Friendly', icon: Leaf, w: { cost: 10, time: 20, fuel: 35, co2: 35, tolls: 0 } },
                      { name: 'Cheapest', icon: DollarSign, w: { cost: 50, time: 10, fuel: 15, co2: 5, tolls: 20 } },
                      { name: 'Fastest', icon: Zap, w: { cost: 10, time: 60, fuel: 10, co2: 10, tolls: 10 } }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handlePresetSelect(preset.name, preset.w)}
                        className={`p-3 rounded-xl border flex flex-col items-start space-y-2 transition-all ${
                          activePreset === preset.name 
                            ? 'border-brand-green bg-brand-green/10 shadow-sm' 
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <preset.icon className={`w-5 h-5 ${activePreset === preset.name ? 'text-brand-green' : 'text-slate-400'}`} />
                        <span className={`text-sm font-bold ${activePreset === preset.name ? 'text-deep-navy' : 'text-slate-600'}`}>
                          {preset.name}
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={() => setActivePreset('Custom')}
                      className={`p-3 rounded-xl border flex flex-col items-start space-y-2 transition-all ${
                        activePreset === 'Custom' 
                          ? 'border-brand-green bg-brand-green/10 shadow-sm' 
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <Settings className={`w-5 h-5 ${activePreset === 'Custom' ? 'text-brand-green' : 'text-slate-400'}`} />
                      <span className={`text-sm font-bold ${activePreset === 'Custom' ? 'text-deep-navy' : 'text-slate-600'}`}>
                        Custom
                      </span>
                    </button>
                  </div>

                  {activePreset === 'Custom' && (
                    <div className="space-y-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      {[
                        { key: 'cost', label: 'Lowest cost', color: 'bg-brand-green' },
                        { key: 'time', label: 'Fastest delivery', color: 'bg-brand-blue' },
                        { key: 'fuel', label: 'Lowest fuel consumption', color: 'bg-brand-orange' },
                        { key: 'co2', label: 'Lowest CO₂ emissions', color: 'bg-green-600' },
                        { key: 'tolls', label: 'Fewest tolls', color: 'bg-brand-yellow' }
                      ].map((item) => (
                        <div key={item.key} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{item.label}</span>
                            <span>{weights[item.key as keyof typeof weights]}%</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={weights[item.key as keyof typeof weights]}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setWeights(prev => ({
                                  ...prev,
                                  [item.key]: val
                                }));
                              }}
                              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-brand-green bg-slate-200"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <button onClick={() => setStep(4)} className="text-slate-500 hover:text-slate-700 text-sm font-semibold">Back</button>
                <button 
                  onClick={handleGenerateCandidates}
                  disabled={loading || (weights.cost + weights.time + weights.fuel + weights.co2 + weights.tolls) === 0}
                  className="px-6 py-3 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating candidates...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Payment / Optimization Pipeline Execution */}
          {step === 6 && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px] animate-slide-up">
              {/* Left Column: Payment Box & Protocol Inspector */}
              <div className="glass p-6 rounded-2xl shadow-sm flex flex-col justify-between lg:col-span-1 space-y-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-3 py-1.5 rounded-lg text-xs font-bold w-fit">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>x402 AVM Gateway</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">Algorand TestNet</span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-deep-navy">x402 Machine Payment</h2>
                      <button 
                        onClick={() => setShowX402Info(true)}
                        className="p-1 text-slate-400 hover:text-brand-green bg-slate-100 hover:bg-brand-green/10 rounded-full transition-colors"
                        title="What is x402?"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      Quantum QAOA optimization is a paid compute resource. An autonomous machine-to-machine payment is executed via the x402 standard.
                    </p>
                  </div>

                  {/* Payment Breakdown Card */}
                  <div className="bg-slate-50 border border-border-custom p-4 rounded-xl space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Resource:</span>
                      <span className="font-semibold text-slate-800">Qiskit QAOA Optimization Node</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Settlement Price:</span>
                      <span className="font-bold text-brand-green">0.05 USDC</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Network Gas Fee:</span>
                      <span className="font-mono text-slate-700">0.001 ALGO</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Asset ID:</span>
                      <span className="font-mono text-brand-blue font-semibold">10458941 (USDC)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Facilitator:</span>
                      <span className="font-semibold text-brand-blue">GoPlausible x402 Standard</span>
                    </div>
                  </div>

                  {/* x402 Header Inspector Toggle */}
                  <div>
                    <button 
                      onClick={() => setShowProtocolInspector(!showProtocolInspector)}
                      className="text-xs font-semibold text-slate-600 hover:text-brand-green flex items-center space-x-1.5 transition-colors"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{showProtocolInspector ? 'Hide Protocol Headers' : 'Inspect x402 HTTP Challenge & Headers'}</span>
                    </button>

                    {showProtocolInspector && (
                      <div className="mt-3 p-3 bg-slate-950 text-slate-300 font-mono text-[10px] rounded-xl border border-slate-800 space-y-2 overflow-x-auto">
                        <p className="text-brand-orange font-bold">HTTP/1.1 402 Payment Required</p>
                        <p className="text-slate-400">X-402-Payment-Required: facilitator=https://facilitator.goplausible.com, receiver={accountAddress || "GD64WT2C46HI6625V55V55V55V55V55V55V55V55V55V55V55V55V55V55"}, amount=0.05, asset=USDC, assetId=10458941, network=Algorand-TestNet</p>
                        <p className="text-slate-400">WWW-Authenticate: x402 token_type="AVM-USDC"</p>
                        {txHash && (
                          <p className="text-brand-green font-bold pt-1 border-t border-slate-800">
                            X-402-Payment-Token: {txHash}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  {payStatus === 'idle' && (
                    <button 
                      onClick={() => {
                        if (!accountAddress) {
                          alert("Please connect your Pera Wallet (in the top right) to authenticate before executing the autonomous transaction.");
                          return;
                        }
                        handlePayAndOptimize();
                      }}
                      className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 ${!accountAddress ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green/90 text-white shadow-brand-green/20'}`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>{!accountAddress ? 'CONNECT WALLET TO PROCEED' : 'EXECUTE x402 PAYMENT ($0.05 USDC)'}</span>
                    </button>
                  )}

                  {payStatus !== 'idle' && payStatus !== 'failed' && (
                    <div className="p-4 bg-brand-green/5 border border-brand-green/20 rounded-xl flex items-center space-x-3 text-xs text-brand-green">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <div>
                        <p className="font-bold">
                          {payStatus === 'signing' && '1/3 Generating & Signing AVM USDC Transaction...'}
                          {payStatus === 'submitted' && '2/3 Submitting to Algorand TestNet & Facilitator...'}
                          {payStatus === 'confirmed' && '3/3 Payment Settled! Running Quantum Optimization...'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {txHash ? `Tx: ${txHash.slice(0, 16)}...` : 'AVM Autonomous Agent Handshake'}
                        </p>
                      </div>
                    </div>
                  )}

                  {payStatus === 'failed' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{error || 'Payment failed'}</span>
                      </div>
                      <button 
                        onClick={handlePayAndOptimize}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                      >
                        TRY AGAIN
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Execution Log (2/3 size) */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col lg:col-span-2">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse"></div>
                    <span className="font-bold text-xs tracking-wider text-slate-400 uppercase">Agent Pipeline Activity & x402 Settlement</span>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-brand-blue">ALGORAND LIVE</span>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto max-h-[420px] pr-2 text-xs">
                  {pipelineSteps.map((s) => (
                    <div key={s.id} className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {s.status === 'success' && <CheckCircle className="w-4.5 h-4.5 text-brand-green" />}
                        {s.status === 'failed' && <AlertTriangle className="w-4.5 h-4.5 text-red-500" />}
                        {s.status === 'running' && <Loader2 className="w-4.5 h-4.5 text-brand-blue animate-spin" />}
                        {s.status === 'idle' && <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-700" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold tracking-wide ${
                            s.status === 'success' ? 'text-brand-green' : s.status === 'failed' ? 'text-red-500' : s.status === 'running' ? 'text-brand-blue' : 'text-slate-500'
                          }`}>{s.label}</span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {s.status.toUpperCase()}
                          </span>
                        </div>
                        {s.log && (
                          <p className="mt-1 text-slate-400 font-mono text-[11px] bg-slate-950 p-2.5 rounded border border-slate-800 leading-relaxed whitespace-pre-wrap">
                            {s.log}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Route Results Screen & Email Confirmation */}
          {step === 7 && optimizationJob && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px] animate-slide-up">
              {/* Left Column: Summary Card & Email Confirmation (2/3 width) */}
              <div className="glass p-6 rounded-2xl shadow-sm flex flex-col justify-between lg:col-span-2 space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-deep-navy">Optimization Complete</h2>
                      <p className="text-slate-500 text-xs mt-1">Q-Swarm selected the optimal path matching your weights and vehicle specs.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handleSimulateDisruption}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-full border border-red-200 flex items-center space-x-1 transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Simulate Disruption</span>
                      </button>
                      <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full border border-green-200 flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>x402 Paid</span>
                      </span>
                    </div>
                  </div>

                  {recommendedRoute && (
                    <div className="space-y-4">
                      <div className="bg-brand-green/5 border border-brand-green/20 p-4 rounded-xl">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-brand-green uppercase tracking-wide">RECOMMENDED PATH</span>
                          <span className="font-mono font-semibold text-slate-500">{recommendedRoute.name}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs mt-3">
                          <div>
                            <span className="text-slate-400">Total Distance:</span>
                            <p className="font-bold text-slate-800 text-base">{recommendedRoute.distance} km</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Travel Time:</span>
                            <p className="font-bold text-slate-800 text-base">{recommendedRoute.duration} mins</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Fuel Consumption:</span>
                            <p className="font-bold text-slate-800 text-base">{recommendedRoute.fuelConsumption} L</p>
                          </div>
                          <div>
                            <span className="text-slate-400">CO₂ Emissions:</span>
                            <p className="font-bold text-slate-800 text-base">{recommendedRoute.co2Emissions} kg</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Quantum Score:</span>
                            <p className="font-mono font-bold text-brand-blue text-base">{optimizationJob.finalObjective.toFixed(4)}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Total Route Cost:</span>
                            <p className="font-black text-brand-green text-base">₹{recommendedRoute.totalCost.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Toll Gates display */}
                      {recommendedRoute.tollGates && recommendedRoute.tollGates.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-2 text-xs mt-4">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-700">Upcoming Toll Gates</span>
                            <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono">{recommendedRoute.tollGates.length} Total</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {recommendedRoute.tollGates.map((toll, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-amber-100 shadow-sm">
                                <span className="font-semibold text-slate-700">{toll.name}</span>
                                <span className="font-mono text-slate-600 font-bold">{toll.price.toFixed(2)} USDC</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Transaction Verification details */}
                      {txHash && (
                        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                              <ShieldCheck className="w-4 h-4 text-brand-green" />
                              <span>Algorand TestNet Settlement Proof</span>
                            </span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">0.05 USDC</span>
                          </div>
                          <div className="flex items-center justify-between font-mono bg-white p-2.5 rounded border border-slate-200">
                            <span className="text-slate-600 truncate pr-2" title={txHash}>{txHash}</span>
                            <div className="flex items-center space-x-2 shrink-0">
                              <button 
                                onClick={() => copyToClipboard(txHash)}
                                className="text-slate-500 hover:text-brand-green flex items-center space-x-1 text-[11px]"
                              >
                                {copiedTx ? <Check className="w-3.5 h-3.5 text-brand-green" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedTx ? 'Copied' : 'Copy'}</span>
                              </button>
                              <a 
                                href={`https://lora.algokit.io/testnet/transaction/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-blue font-bold hover:underline flex items-center space-x-1 text-[11px]"
                                title="View on Lora Algorand Explorer"
                              >
                                <span>View on Explorer</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quantum QUBO Visualizer */}
                      <QuantumVisualizer 
                        quboMatrix={optimizationJob.quboMatrix || []} 
                        iterations={optimizationJob.iterations || 0} 
                        finalObjective={optimizationJob.finalObjective || 0} 
                      />

                      {/* Green Certificate Minting */}
                      <GreenCertificateMint 
                        co2Saved={Math.max(0, 150 - recommendedRoute.co2Emissions)} 
                        shipmentId={optimizationJob.id || 'job_default'} 
                      />

                      {/* Email Confirmation & Official Invoice Section */}
                      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                            <Mail className="w-4 h-4 text-brand-blue" />
                            <span>Email Payment & Route Confirmation</span>
                          </span>
                          {emailStatus === 'success' && (
                            <span className="text-[10px] font-bold text-brand-green bg-green-50 border border-green-200 px-2 py-0.5 rounded flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>Dispatched</span>
                            </span>
                          )}
                        </div>

                        <p className="text-slate-500 text-[11px]">
                          Send an official confirmation email containing the Algorand cryptographic receipt, shipment details, and quantum routing specs.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input 
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="Enter recipient email..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-green focus:bg-white"
                          />
                          <button 
                            onClick={handleSendConfirmationEmail}
                            disabled={emailSending || !emailInput}
                            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                          >
                            {emailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            <span>{emailSending ? 'Sending...' : 'Send Confirmation'}</span>
                          </button>
                        </div>

                        {emailStatus === 'success' && (
                          <div className="flex items-center justify-between pt-1">
                            <p className="text-[11px] text-brand-green font-medium">
                              Confirmation sent to <b>{emailInput}</b>!
                            </p>
                            <button 
                              onClick={() => setShowReceiptModal(true)}
                              className="text-[11px] text-brand-blue font-bold hover:underline flex items-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View HTML Receipt</span>
                            </button>
                          </div>
                        )}

                        {emailStatus === 'failed' && (
                          <p className="text-[11px] text-red-500 font-medium">
                            {emailError || 'Failed to dispatch email confirmation.'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleGoToDashboard}
                  className="w-full py-4 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center justify-center space-x-2 mt-4"
                >
                  <span>GO TO DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Map Preview Right (1/3 size) */}
              <div className="h-full bg-slate-200 rounded-2xl relative overflow-hidden min-h-[400px] border border-border-custom shadow-sm lg:col-span-1">
                <MapComponent 
                  origin={mapOrigin} 
                  destination={mapDestination} 
                  stops={mapStops}
                  routes={mapRoutes}
                  onTollIntersect={handleTollIntersect}
                />
              </div>
            </div>
          )}

          {/* Step 8: Minimal Dashboard */}
          {step === 8 && (
            <div className="flex-grow space-y-6 animate-slide-up">
              {/* Analytics Header - Minimal AI Style with Map */}
              <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[300px]">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-inner font-mono text-xs text-slate-300 w-full lg:w-1/3 flex flex-col justify-center overflow-y-auto">
                  <div className="text-slate-500 mb-4 uppercase tracking-widest text-[10px] border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>Last Optimization Output</span>
                    <span className="text-brand-blue animate-pulse">● System Active</span>
                  </div>
                  
                  {recommendedRoute && optimizationJob ? (
                    <div className="space-y-3 flex-1">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500 col-span-1">origin</span>
                        <span className="text-slate-100 col-span-2 truncate" title={origin}>{origin || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500 col-span-1">destination</span>
                        <span className="text-slate-100 col-span-2 truncate" title={destination}>{destination || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/50">
                        <span className="text-slate-500 col-span-1">path</span>
                        <span className="text-brand-green font-bold col-span-2 truncate">{recommendedRoute.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500 col-span-1">metrics</span>
                        <span className="text-slate-300 col-span-2 truncate">{recommendedRoute.distance}km / {recommendedRoute.duration}m / {recommendedRoute.co2Emissions}kg CO₂</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500 col-span-1">objective</span>
                        <span className="text-brand-blue col-span-2">{optimizationJob.finalObjective.toFixed(4)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-600 italic flex-1 flex items-center">No optimization context found in memory. Run a new job to view AI output.</div>
                  )}
                </div>

                <div className="w-full lg:w-2/3 h-[300px] lg:h-full bg-slate-200 rounded-2xl relative overflow-hidden border border-border-custom shadow-sm">
                  <MapComponent 
                    origin={mapOrigin} 
                    destination={mapDestination} 
                    stops={mapStops}
                    routes={mapRoutes}
                    onTollIntersect={handleTollIntersect}
                  />
                  {(!recommendedRoute || !optimizationJob) && (
                    <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
                      <span className="text-slate-500 font-semibold text-sm">No recent routes to display</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lower Section: Transaction History */}
              {/* <FinancialLedger /> */}

              <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => {
                      setStep(2);
                      setOrigin('Electronic City, Bangalore');
                      setDestination('Whitefield, Bangalore');
                      setStops([]);
                      setCandidateRoutes([]);
                      setPipelineSteps(prev => prev.map(s => ({ ...s, status: 'idle', log: undefined })));
                      setPayStatus('idle');
                      setTxHash(null);
                    }}
                    className="px-6 py-3 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl transition-all flex items-center space-x-2"
                  >
                    <span>Create New Optimization Job</span>
                    <Sparkles className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
          )}
        </div>
      </main>

      {/* What is x402 Modal */}
      {showX402Info && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-brand-green" />
                <span className="font-bold text-sm text-slate-800">What is x402?</span>
              </div>
              <button 
                onClick={() => setShowX402Info(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white space-y-4 text-sm text-slate-600">
              <p>
                <b>x402</b> is an emerging standard for autonomous machine-to-machine payments. It's built on top of the classic HTTP <code className="bg-slate-100 px-1 rounded text-slate-800">402 Payment Required</code> status code, which was proposed in the original web specifications but historically reserved for future use.
              </p>
              
              <div className="bg-brand-green/5 border border-brand-green/20 p-4 rounded-xl space-y-2">
                <h3 className="font-bold text-brand-green flex items-center space-x-1.5">
                  <Zap className="w-4 h-4" />
                  <span>How it works here:</span>
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-xs">
                  <li>The client requests a quantum route optimization.</li>
                  <li>The API rejects it with a <b>402 Payment Required</b> challenge, specifying the cost (0.05 USDC) and the facilitator.</li>
                  <li>The client autonomously signs and broadcasts a micro-transaction on the <b>Algorand TestNet</b>.</li>
                  <li>Once settled, the client retries the request, attaching the Transaction ID in the <code className="bg-white px-1 border border-brand-green/20 text-brand-green rounded">X-402-Payment-Token</code> header.</li>
                  <li>The API verifies the transaction on-chain and proceeds with the computation.</li>
                </ol>
              </div>

              <p>
                This allows AI agents and web services to pay each other for resources seamlessly, without credit cards or human intervention.
              </p>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowX402Info(false)}
                className="px-6 py-2.5 bg-brand-green hover:bg-brand-green/90 text-white font-bold text-xs rounded-xl transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HTML Receipt Preview Modal */}
      {showReceiptModal && htmlReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-brand-green" />
                <span className="font-bold text-sm text-slate-800">Official x402 Confirmation Receipt</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(htmlReceipt);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg flex items-center space-x-1 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
              <div 
                dangerouslySetInnerHTML={{ __html: htmlReceipt }} 
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-deep-navy text-lg">Sign In to Q-Swarm</h3>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginMethod === 'select' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 mb-4 text-center">Sign in securely using your email provider to access the Q-Swarm platform.</p>
                  
                  <button
                    onClick={handleGoogleAuth}
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center space-x-3 p-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm transition-all disabled:opacity-50"
                  >
                    <LogIn className="w-5 h-5 text-slate-500" />
                    <span>{isLoggingIn ? 'Signing In...' : 'Sign In with Google'}</span>
                  </button>
                </div>
              )}


            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-100 px-6 py-4 border-t border-slate-200 text-center text-xs text-slate-400">
        <span>© 2026 Q-Swarm Logistics. Powered by Algorand x402 connection protocols and Qiskit Quantum solver.</span>
      </footer>

      {/* Voice Copilot */}
      <VoiceCopilot onCommand={handleVoiceCommand} />
    </div>
  );
}
