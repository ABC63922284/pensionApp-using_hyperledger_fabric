import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../components/Card";
import Stat from "../components/Stat";
import AreaChart from "../components/AreaChart";

const chart = Array.from({length:12}).map((_,i)=>({ x:`2024-${String(i+1).padStart(2,"0")}`, y: (i*7+10)*1000 }));

export default function Home(){
  return (
    <div className="space-y-6">
      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.4}}>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Unified Portals</h1>
          <div className="text-sm text-slate-500">Pick your role below. Identity header auto-applies.</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat title="Active Pensioners" value="12,540"/>
        <Stat title="Monthly Payout (৳)" value="82.7M"/>
        <Stat title="Pending Claims" value="148"/>
        <Stat title="Avg. Processing (days)" value="3.2"/>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Payout trend</div>
        </div>
        <AreaChart data={chart}/>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {to:"/pb", title:"Pension Board", desc:"Register, contributions, scheduling, oversight"},
          {to:"/mof", title:"MoF", desc:"Policy, approvals, analytics"},
          {to:"/bank", title:"Bank", desc:"Disbursement & acknowledgements"},
          {to:"/employer", title:"Employer", desc:"Onboarding & monthly contributions"},
          {to:"/pensioner", title:"Pensioner", desc:"Self-service dashboard"},
        ].map((x)=>(
          <Card key={x.to} className="hover:shadow-lg transition-shadow">
            <div className="font-semibold text-slate-800">{x.title}</div>
            <div className="text-sm text-slate-500 mb-4">{x.desc}</div>
            <Link to={x.to} className="text-brand-600 inline-flex items-center gap-1">Open <ArrowRight size={16}/></Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
