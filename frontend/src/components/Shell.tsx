import { ReactNode } from "react";

export default function Shell({children}:{children:ReactNode}) {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="py-6">{children}</div>
    </div>
  );
}
