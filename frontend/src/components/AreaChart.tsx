import { ResponsiveContainer, AreaChart as RA, Area, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export default function AreaChart({data}:{data:any[]}) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RA data={data} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b9aff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b9aff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x"/><YAxis/>
          <Tooltip />
          <Area type="monotone" dataKey="y" stroke="#3b9aff" fill="url(#fill)" />
        </RA>
      </ResponsiveContainer>
    </div>
  );
}
