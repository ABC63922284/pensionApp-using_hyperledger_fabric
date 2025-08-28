import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";

export default function Settings(){
  const [pong,setPong]=useState("");
  const ping=async()=>{
    const r=await api.get("/health/ping");
    setPong(r.data.pong || r.data.pong);
  };
  useEffect(()=>{ ping(); },[]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <div className="flex items-center gap-3">
          <button onClick={ping} className="px-4 py-2 rounded-xl bg-brand-600 text-white">Ping chaincode</button>
          <div className="text-sm text-slate-600">Response: <span className="font-mono">{pong}</span></div>
        </div>
      </Card>
      <Card>
        <div className="text-sm text-slate-600">
          <div>API Base: <span className="font-mono">{import.meta.env.VITE_API_BASE || "http://localhost:8080"}</span></div>
          <div>Identity: <span className="font-mono">{localStorage.getItem("x-user-id")}</span></div>
        </div>
      </Card>
    </div>
  );
}
