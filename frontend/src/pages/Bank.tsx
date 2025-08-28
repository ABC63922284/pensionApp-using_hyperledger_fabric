import { useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";

export default function Bank(){
  const [nid,setNid]=useState("");
  const [month,setMonth]=useState("");
  const [amount,setAmount]=useState<number>(0);
  const [ack,setAck]=useState({bankUTR:"", status:"ACKED"});

  const create=async()=>{
    await api.post("/disbursement",{ nid, month, amountPaisa: Math.round(amount*100) });
    alert("Disbursement recorded");
  };
  const doAck=async()=>{
    await api.post(`/disbursement/${nid}/${month}/ack`, ack);
    alert("Acknowledged");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Bank</h1>
      <Card>
        <div className="grid md:grid-cols-4 gap-3">
          <input className="border rounded-xl px-3 py-2" placeholder="NID" value={nid} onChange={e=>setNid(e.target.value)}/>
          <input className="border rounded-xl px-3 py-2" placeholder="YYYYMM" value={month} onChange={e=>setMonth(e.target.value)}/>
          <input className="border rounded-xl px-3 py-2" type="number" placeholder="Amount ৳" value={amount} onChange={e=>setAmount(Number(e.target.value))}/>
          <button onClick={create} className="px-4 py-2 rounded-xl bg-brand-600 text-white">Record</button>
        </div>
      </Card>

      <Card>
        <div className="grid md:grid-cols-3 gap-3">
          <input className="border rounded-xl px-3 py-2" placeholder="UTR" value={ack.bankUTR} onChange={e=>setAck({...ack,bankUTR:e.target.value})}/>
          <select className="border rounded-xl px-3 py-2" value={ack.status} onChange={e=>setAck({...ack,status:e.target.value})}>
            <option value="SENT">SENT</option>
            <option value="ACKED">ACKED</option>
            <option value="FAILED">FAILED</option>
          </select>
          <button onClick={doAck} className="px-4 py-2 rounded-xl bg-brand-600 text-white">Update Status</button>
        </div>
      </Card>
    </div>
  );
}
