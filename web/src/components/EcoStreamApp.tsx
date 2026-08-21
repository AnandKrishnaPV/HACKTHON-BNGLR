import React, { useState } from 'react';
import { EcoStreamLayout, AICommandCenter, FleetAndCargo, SmartRouter, X402Payment } from './new_ui';

export default function EcoStreamApp() {
  const [activeTab, setActiveTab] = useState<'command' | 'router' | 'fleet' | 'eco'>('command');
  const [showPayment, setShowPayment] = useState(false);

  const renderContent = () => {
    if (showPayment) {
      return <X402Payment onConfirm={() => setShowPayment(false)} />;
    }

    switch (activeTab) {
      case 'command':
        return <AICommandCenter />;
      case 'router':
        return <SmartRouter />;
      case 'fleet':
      case 'eco':
        return <FleetAndCargo />;
      default:
        return <AICommandCenter />;
    }
  };

  return (
    <EcoStreamLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      
      {/* Dev helper to trigger payment modal */}
      {!showPayment && (
        <button 
          onClick={() => setShowPayment(true)}
          className="fixed bottom-24 right-4 bg-action-blue text-white px-4 py-2 rounded-full shadow-lg z-50 hover:scale-105 transition-transform"
        >
          Test X402 Payment
        </button>
      )}
    </EcoStreamLayout>
  );
}
