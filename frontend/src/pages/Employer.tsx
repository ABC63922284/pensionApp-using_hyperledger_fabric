import { useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";

export default function Employer(){
  const [nid,setNid]=useState("");
  const [month,setMonth]=useState("");
  const [emp,setEmp]=useState<number>(0);
  const [er,setEr]=useState<number>(0);

  const submit=async()=>{
    await api.post("/contribution",{ nid, month, empSharePaisa:Math.round(emp*100), erSharePaisa:Math.round(er*100) });
    alert("Contribution added");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Employer</h1>
      <Card>
        <div className="grid md:grid-cols-5 gap-3">
          <input className="border rounded-xl px-3 py-2" placeholder="NID" value={nid} onChange={e=>setNid(e.target.value)}/>
          <input className="border rounded-xl px-3 py-2" placeholder="YYYYMM" value={month} onChange={e=>setMonth(e.target.value)}/>
          <input className="border rounded-xl px-3 py-2" type="number" placeholder="Employee ৳" value={emp} onChange={e=>setEmp(Number(e.target.value))}/>
          <input className="border rounded-xl px-3 py-2" type="number" placeholder="Employer ৳" value={er} onChange={e=>setEr(Number(e.target.value))}/>
          <button onClick={submit} className="px-4 py-2 rounded-xl bg-brand-600 text-white">Submit</button>
        </div>
      </Card>
    </div>
  );
}
