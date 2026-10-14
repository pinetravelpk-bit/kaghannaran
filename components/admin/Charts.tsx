"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const PALETTE = ["#12302C", "#F2A33A", "#8E1B1B", "#1F4E8C", "#7FB59A", "#C9A227", "#6B675C", "#B5C9DE"];
const tooltip = { contentStyle: { borderRadius: 12, border: "1px solid #D7DCD5", fontFamily: "Geist", fontSize: 13 }, cursor: { fill: "rgba(18,48,44,0.06)" } };

export function SubmissionsChart({ data }: { data: { week: string; submitted: number; approved: number }[] }) {
  return (
    <div className="h-72" role="img" aria-label="Submissions and approvals per week">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F2A33A" stopOpacity={0.45} /><stop offset="100%" stopColor="#F2A33A" stopOpacity={0} /></linearGradient>
            <linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#12302C" stopOpacity={0.35} /><stop offset="100%" stopColor="#12302C" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#E6EAE5" />
          <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip {...tooltip} />
          <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#F2A33A" strokeWidth={2.5} fill="url(#gSub)" animationDuration={1200} />
          <Area type="monotone" dataKey="approved" name="Approved" stroke="#12302C" strokeWidth={2.5} fill="url(#gApp)" animationDuration={1400} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TypeDonut({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-44 w-44" role="img" aria-label="Listings by type">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="none" animationDuration={1000}>
              {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip {...tooltip} />
          </PieChart>
        </ResponsiveContainer>
        <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-3xl font-extrabold">{total}</span><span className="text-xs text-muted">listings</span></span>
      </div>
      <ul className="grid w-full gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />{d.name}</span><span className="font-mono">{d.value}</span></li>
        ))}
      </ul>
    </div>
  );
}

export function StopBars({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-64" role="img" aria-label="Listings per stop">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 0, left: -24, bottom: 30 }}>
          <CartesianGrid vertical={false} stroke="#E6EAE5" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} angle={-35} textAnchor="end" interval={0} height={50} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip {...tooltip} />
          <Bar dataKey="value" name="Listings" fill="#12302C" radius={[6, 6, 0, 0]} animationDuration={1000} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
