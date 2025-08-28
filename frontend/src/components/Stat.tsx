import { ReactNode } from "react";

export default function Stat({title,value,icon}:{title:string;value:string|number;icon?:ReactNode;}){
  return (
    <div className="bg-white rounded-xxl shadow-soft border p-4 flex items-center gap-4">
      {icon}
      <div>
        <div className="text-sm text-slate-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </div>
  );
}
