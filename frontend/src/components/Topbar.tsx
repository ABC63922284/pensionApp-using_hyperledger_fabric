import { useEffect, useState } from "react";
import { setIdentity } from "../lib/api";
import { Banknote, Landmark, ShieldCheck, UserCog, Users } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  { id: "pb-admin", label: "Pension Board", icon: ShieldCheck },
  { id: "mof-admin", label: "MoF", icon: Landmark },
  { id: "bank-op", label: "Bank", icon: Banknote },
  { id: "employer-x", label: "Employer", icon: Users },
  { id: "pensioner-1", label: "Pensioner", icon: UserCog },
];

export default function Topbar(){
  const [id, setId] = useState(localStorage.getItem("x-user-id") || roles[0].id);

  useEffect(() => {
    setIdentity(id);
    localStorage.setItem("x-user-id", id);
  }, [id]);

  return (
    <div className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <Link to="/" className="font-semibold text-brand-700 text-lg">Pension Fabric</Link>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={id}
            onChange={e=>setId(e.target.value)}
            className="rounded-xxl border px-3 py-2 bg-white shadow-soft"
            title="Select identity (sends x-user-id to backend)">
            {roles.map(r=>(
              <option key={r.id} value={r.id}>{r.label} — {r.id}</option>
            ))}
          </select>
          <Link to="/events" className="text-sm px-3 py-2 rounded-full border hover:bg-brand-50">Live Events</Link>
          <Link to="/settings" className="text-sm px-3 py-2 rounded-full border hover:bg-brand-50">Settings</Link>
        </div>
      </div>
    </div>
  );
}
