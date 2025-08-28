import { useEffect, useState } from "react";
import { API_BASE } from "../lib/config";

export default function EventStream(){
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(()=>{
    const sse = new EventSource(`${API_BASE}/events/stream`, { withCredentials:false });
    const push = (e:MessageEvent, tag:string)=>setLogs(prev=>[`[${new Date().toLocaleTimeString()}] ${tag}: ${e.data}`, ...prev].slice(0,200));
    sse.addEventListener("hello",(e)=>push(e,"hello"));
    sse.addEventListener("block",(e)=>push(e,"block"));
    sse.addEventListener("block-txs",(e)=>push(e,"block-txs"));
    sse.addEventListener("cc-event",(e)=>push(e,"cc-event"));
    return ()=>sse.close();
  },[]);
  return (
    <div className="bg-black text-green-200 rounded-xxl p-4 font-mono text-sm h-[60vh] overflow-auto border">
      {logs.map((l,i)=>(<div key={i}>{l}</div>))}
    </div>
  );
}
