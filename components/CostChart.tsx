import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CostBreakdown } from '../types';

interface CostChartProps {
  breakdown: CostBreakdown;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6']; // Orange, Blue, Green, Violet

export const CostChart: React.FC<CostChartProps> = ({ breakdown }) => {
  const data = [
    { name: 'Ingredientes', value: breakdown.totalIngredients },
    { name: 'Gás/Energia', value: breakdown.totalGas + breakdown.totalUtilities },
    { name: 'Mão de Obra', value: breakdown.totalLabor },
  ];

  // Filter out zero values to avoid ugly empty charts
  const activeData = data.filter(d => d.value > 0);

  if (activeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-stone-700/30 rounded-lg border border-dashed border-stone-600 text-stone-400 text-sm">
        Adicione dados para visualizar
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `R$ ${value.toFixed(2)}`}
            cursor={{ fill: 'transparent' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              backgroundColor: '#fff',
              color: '#1c1917' 
            }}
            itemStyle={{ color: '#44403c' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ color: '#d6d3d1', fontSize: '0.875rem' }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};