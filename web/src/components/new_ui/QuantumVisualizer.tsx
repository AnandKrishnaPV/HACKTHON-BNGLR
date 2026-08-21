import React, { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { Sparkles, BrainCircuit } from 'lucide-react';

interface QuantumVisualizerProps {
  quboMatrix: number[][];
  iterations: number;
  finalObjective: number;
}

export default function QuantumVisualizer({ quboMatrix, iterations, finalObjective }: QuantumVisualizerProps) {
  // Convert 2D matrix into scatter plot data points
  const data = useMemo(() => {
    if (!quboMatrix || !Array.isArray(quboMatrix)) return [];
    
    const points: any[] = [];
    for (let i = 0; i < quboMatrix.length; i++) {
      for (let j = 0; j < quboMatrix[i].length; j++) {
        // Only show significant weights to avoid clutter
        if (Math.abs(quboMatrix[i][j]) > 0.01) {
          points.push({
            x: i,
            y: j,
            z: Math.abs(quboMatrix[i][j]) * 100, // Size
            value: quboMatrix[i][j], // Color indicator
          });
        }
      }
    }
    return points;
  }, [quboMatrix]);

  if (!quboMatrix || quboMatrix.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#00ffcc 1px, transparent 1px), linear-gradient(90deg, #00ffcc 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-[#00ffcc]" />
            <h3 className="text-white font-bold text-lg">Quantum Energy Landscape</h3>
          </div>
          <div className="flex space-x-4 text-xs font-mono">
            <div className="bg-slate-800 px-3 py-1 rounded text-slate-300">
              <span className="text-slate-500 mr-2">ITERATIONS</span>
              <span className="text-[#00ffcc]">{iterations}</span>
            </div>
            <div className="bg-slate-800 px-3 py-1 rounded text-slate-300">
              <span className="text-slate-500 mr-2">MIN ENERGY</span>
              <span className="text-purple-400">{finalObjective.toFixed(4)}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="x" hide />
              <YAxis type="number" dataKey="y" hide />
              <ZAxis type="number" dataKey="z" range={[20, 400]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-black/90 border border-slate-700 text-white text-xs p-2 rounded">
                        <div>Qubit {data.x} x Qubit {data.y}</div>
                        <div className="font-mono text-[#00ffcc] mt-1">Weight: {data.value.toFixed(4)}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={data} fill="#8884d8">
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value < 0 ? '#00ffcc' : '#ff0055'} 
                    opacity={0.7}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#00ffcc]"></div>
            <span>Attractive (Negative Energy)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#ff0055]"></div>
            <span>Repulsive (Positive Energy)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
