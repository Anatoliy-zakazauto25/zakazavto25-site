import Image from "next/image";
import type { Founder } from "@/types/components";

export function FounderCard({ founder }: { founder: Founder }) {
  return (
    <article className="founder-card">
      <div className="founder-photo">
        <Image src={founder.photo} alt={founder.name} fill sizes="(max-width: 900px) 100vw, 280px" />
      </div>
      <p className="eyebrow">ЛИЧНЫЙ КОНТРОЛЬ</p>
      <h3>{founder.name}</h3>
      <span>{founder.title}</span>
      {founder.description && <p>{founder.description}</p>}
    </article>
  );
}
