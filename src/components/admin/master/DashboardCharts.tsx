import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

interface RegistrationTrendProps {
  data: { date: string; count: number }[];
  loading?: boolean;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#9333EA',
  '#3B82F6',
  '#10B981',
];

export const RegistrationTrendChart: React.FC<RegistrationTrendProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">User Registration Trend</h3>
        <div className="h-64 bg-muted/20 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">User Registration Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => format(parseISO(value), 'MMM d')}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))',
            }}
            labelFormatter={(value) => format(parseISO(value as string), 'MMMM d, yyyy')}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            fill="url(#colorRegistrations)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface DepartmentDistributionProps {
  data: { name: string; value: number; color?: string }[];
  loading?: boolean;
  onSliceClick?: (department: string) => void;
}

export const DepartmentDistributionChart: React.FC<DepartmentDistributionProps> = ({
  data,
  loading,
  onSliceClick,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Department Distribution</h3>
        <div className="h-64 bg-muted/20 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Department Distribution</h3>
      <div className="flex items-center gap-6">
        <div className="relative">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                onClick={(_, index) => onSliceClick?.(data[index].name)}
                cursor="pointer"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-2">
          {data.slice(0, 8).map((item, index) => (
            <div
              key={item.name}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80"
              onClick={() => onSliceClick?.(item.name)}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground truncate">{item.name}</span>
              <span className="text-xs font-medium text-foreground ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface CountryDistributionProps {
  data: { name: string; count: number; code?: string }[];
  loading?: boolean;
}

export const CountryDistributionChart: React.FC<CountryDistributionProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Geographic Distribution</h3>
        <div className="h-64 bg-muted/20 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Geographic Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 80 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))',
            }}
          />
          <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface RoleDistributionProps {
  data: { name: string; value: number; color: string }[];
}

export const RoleDistributionMini: React.FC<RoleDistributionProps> = ({ data }) => {
  return (
    <div className="flex items-center gap-4 mt-2">
      <div className="w-16 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={15}
              outerRadius={28}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="text-foreground ml-auto font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
