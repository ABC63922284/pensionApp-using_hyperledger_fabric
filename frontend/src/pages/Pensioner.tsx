import { useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";

export default function Pensioner(){
  const [nid,setNid]=useState("");
  const [claim, setClaim]=useState({ claimId:"", type:"RETIREMENT", docsHash:"" });
  const [range,setRange]=useState({ from:"202401", to:"202412" });
  const [contrib, setContrib] = useState<any[]>([]);

  const file=async()=>{
    await api.post("/claim",{ nid, ...claim });
    alert("Claim submitted");
  };
  const list=async()=>{
    const r = await api.get(`/contribution/${nid}`, { params: range });
    setContrib(r.data.contributions || []);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Pensioner</h1>

      <Card>
        <div className="grid md:grid-cols-4 gap-3">
          <input className="border rounded-xl px-3 py-2" placeholder="Your NID" value={nid} onChange={e=>setNid(e.target.value)}/>
          <input className="border rounded-xl px-3 py-2" placeholder="Claim ID" value={claim.claimId} onChange={e=>setClaim({...claim,claimId:e.target.value})}/>
          <select className="border rounded-xl px-3 py-2" value={claim.type} onChange={e=>setClaim({...claim,type:e.target.value})}>
            <option value="RETIREMENT">RETIREMENT</option>
            <option value="NOMINEE">NOMINEE</option>
            <option value="ARREAR">ARREAR</option>
          </select>
          <input className="border rounded-xl px-3 py-2" placeholder="Docs IPFS hash" value={claim.docsHash} onChange={e=>setClaim({...claim,docsHash:e.target.value})}/>
        </div>
        <div className="mt-3">
          <button onClick={file} className="px-4 py-2 rounded-xl bg-brand-600 text-white">File Claim</button>
        </div>
      </Card>

      <Card>
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <label className="text-sm text-slate-600">
            <div className="mb-1">From (YYYYMM)</div>
            <input className="border rounded-xl px-3 py-2 w-full" value={range.from} onChange={e=>setRange({...range,from:e.target.value})}/>
          </label>
          <label className="text-sm text-slate-600">
            <div className="mb-1">To (YYYYMM)</div>
            <input className="border rounded-xl px-3 py-2 w-full" value={range.to} onChange={e=>setRange({...range,to:e.target.value})}/>
          </label>
          <button onClick={list} className="px-4 py-2 rounded-xl bg-brand-600 text-white">View Contributions</button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left text-slate-500"><th className="py-2">Month</th><th>Emp</th><th>Er</th></tr></thead>
            <tbody>
              {contrib.map((c,i)=>(
                <tr key={i} className="border-t">
                  <td className="py-2">{c.month || c.Month}</td>
                  <td>{((c.empShare || c.EmpShare)/100).toLocaleString()}</td>
                  <td>{((c.erShare || c.ErShare)/100).toLocaleString()}</td>
                </tr>
              ))}
              {!contrib.length && <tr><td className="py-2 text-slate-400" colSpan={3}>No data</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
