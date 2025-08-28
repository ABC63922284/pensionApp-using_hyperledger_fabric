import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Topbar from "./components/Topbar";
import Shell from "./components/Shell";
import PB from "./pages/PB";
import MoF from "./pages/MoF";
import Bank from "./pages/Bank";
import Employer from "./pages/Employer";
import Pensioner from "./pages/Pensioner";
import Events from "./pages/Events";
import Settings from "./pages/Settings";
import Home from "./pages/Home";

export default function App(){
  return (
    <div className="min-h-screen">
      <Topbar/>
      <Shell>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/pb" element={<PB/>}/>
          <Route path="/mof" element={<MoF/>}/>
          <Route path="/bank" element={<Bank/>}/>
          <Route path="/employer" element={<Employer/>}/>
          <Route path="/pensioner" element={<Pensioner/>}/>
          <Route path="/events" element={<Events/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="*" element={<div>Not Found. <Link to="/" className="text-brand-600">Go home</Link></div>}/>
        </Routes>
      </Shell>
    </div>
  );
}
