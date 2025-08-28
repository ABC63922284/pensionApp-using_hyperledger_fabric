import { useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";

export default function MoF(){
  const [cfg,setCfg]=useState({name:"policy-2025",interestRateBP:600,vestingYears:10,minServiceYears:20,dearnessReliefPct:5,lifeCertFrequencyMonths:12});
  const [loaded,setLoaded]=useState<any>(null);

  const save=async()=>{
    await api.post("/config", cfg);
    alert("Policy saved");
  };
  const load=async()=>{
    const r=await api.get(`/config/${cfg.name}`);
    setLoaded(r.data.config);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ministry of Finance</h1>
      <Card>
        <div className="grid md:grid-cols-3 gap-3">
          {Object.keys(cfg).map((k)=>(
            <label key={k} className="text-sm text-slate-600">
              <div className="mb-1">{k}</div>
              <input className="border rounded-xl px-3 py-2 w-full" value={(cfg as any)[k]} onChange={e=>setCfg({...cfg,[k]: isNaN(Number(e.target.value))?e.target.value:Number(e.target.value)})}/>
            </label>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} className="px-4 py-2 rounded-xl bg-brand-600 text-white">Save Policy</button>
          <button onClick={load} className="px-4 py-2 rounded-xl border">Load</button>
        </div>
      </Card>

      {loaded && (
        <Card>
          <div className="font-medium mb-2">Loaded config</div>
          <pre className="text-xs bg-slate-50 rounded-xl p-3 border overflow-auto">{JSON.stringify(loaded,null,2)}</pre>
        </Card>
      )}
    </div>
  );
}
