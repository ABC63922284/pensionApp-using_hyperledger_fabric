import { ReactNode } from "react";

export function Card({children,className=""}:{children:ReactNode;className?:string;}){
  return <div className={`bg-white rounded-xxl shadow-soft border p-4 ${className}`}>{children}</div>;
}
