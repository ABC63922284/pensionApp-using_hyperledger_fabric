import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { motion } from "framer-motion";

type Row = { nid:string; name:string; status:string; accruedFundPaisa:number };

export default function PB(){
  const [nid, setNid] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState({ name:"", dob:"", deptId:"", joinDate:"" });
  const [busy, setBusy] = useState(false);

  const add = async ()=>{
    setBusy(true);
    try {
      await api.post("/pensioner", { nid, ...form });
      alert("Registered!");
      setRows([{ nid, name:form.name, status:"ACTIVE", accruedFundPaisa:0 }, ...rows]);
    } finally { setBusy(false); }
  };

  const fetchOne = async ()=>{
    if(!nid) return;
    const r = await api.get(`/pensioner/${nid}`);
    const p = r.data.pensioner;
    setRows([{ nid: p.NID || p.nid, name: p.name, status: p.status, accruedFundPaisa: p.accruedFundPaisa }, ...rows]);
  };

  return (
    <div className="space-y-6">
      <motion.h1 initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="text-2xl font-semibold">Pension Board</motion.h1>

      <Card>
        <div className="grid md:grid-cols-5 gap-3">
          <input className="border rounded-xl px-3 py-2" placeholder="NID" value={nid} onChange={e=>setNid(e.target.value)}/>
          <input className="border rounded-xl px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input className="border rounded-xl px-3 py-2" placeholder="DOB YYYY-MM-DD" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})}/>
          <input className="border rounded-xl px-3 py-2" placeholder="Dept ID" value={form.deptId} onChange={e=>setForm({...form,deptId:e.target.value})}/>
          <input className="border rounded-xl px-3 py-2" placeholder="Join YYYY-MM-DD" value={form.joinDate} onChange={e=>setForm({...form,joinDate:e.target.value})}/>
        </div>
        <div className="mt-3 flex gap-2">
          <button disabled={busy} onClick={add} className="px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50">Register Pensioner</button>
          <button onClick={fetchOne} className="px-4 py-2 rounded-xl border hover:bg-brand-50">Fetch</button>
        </div>
      </Card>

      <Card>
        <div className="font-medium mb-2">Recent entries</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">NID</th><th>Name</th><th>Status</th><th>Accrued (৳)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={i} className="border-t">
                  <td className="py-2">{r.nid}</td>
                  <td>{r.name}</td>
                  <td><span className="px-2 py-1 rounded-full bg-green-100 text-green-700">{r.status}</span></td>
                  <td>{(r.accruedFundPaisa/100).toLocaleString()}</td>
                </tr>
              ))}
              {!rows.length && <tr><td className="py-3 text-slate-400" colSpan={4}>No data</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
