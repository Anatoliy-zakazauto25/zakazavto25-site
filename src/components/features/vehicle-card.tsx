import Link from "next/link";
import Image from "next/image";
import type { MockVehicle } from "@/lib/mock-data";

export function VehicleCard({ vehicle }: { vehicle: MockVehicle }) {
  return (
    <article className="vehicle-card">
      <Link href={`/catalog/${vehicle.id}`} className="vehicle-image">
        <Image src={vehicle.image} alt={vehicle.name} fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw" />
        <span>{vehicle.tag}</span>
       
      </Link>
      <div className="vehicle-card-content">
        <div className="vehicle-title">
          <div>
            <h3>{vehicle.name}</h3>
            <p>
              {vehicle.country} · {vehicle.year}
            </p>
          </div>
          <b>{vehicle.price}</b>
        </div>
        <div className="vehicle-specs">
          <span>{vehicle.mileage}</span>
          <span>{vehicle.engine}</span>
          <span>{vehicle.drive}</span>
        </div>
        <div className="vehicle-status">
          <span className="status-dot" />
          {vehicle.status}
          <Link href={`/catalog/${vehicle.id}`}>Подробнее →</Link>
        </div>
      </div>
    </article>
  );
}
