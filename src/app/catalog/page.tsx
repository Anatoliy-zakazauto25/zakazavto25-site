"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clientApi } from "@/lib/client-api";
import type { PublicVehicle } from "@/lib/public-vehicles";
import { VehicleCard } from "@/components/features/vehicle-card";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteTopbar } from "@/components/layout/site-topbar";
import { SiteFooter } from "@/components/layout/site-footer";

const TABS = [
  { key: "japan", label: "Япония" },
  { key: "korea", label: "Корея" },
  { key: "china", label: "Китай" },
];

export default function CatalogPage() {
  const [vehicles, setVehicles] = useState<PublicVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState("china");

  useEffect(() => {
    async function load() {
      const { data } = await clientApi<{ data: PublicVehicle[] }>("/api/vehicles?perPage=100");
      setVehicles(data?.data ?? []);
      setLoading(false);
    }
    void load();
  }, []);

  const filtered = useMemo(() => {
    const list = activeCountry === "all"
      ? vehicles
      : vehicles.filter((vehicle) => vehicle.country.toLowerCase() === TABS.find((tab) => tab.key === activeCountry)?.label.toLowerCase());
    return list.slice(0, 9);
  }, [vehicles, activeCountry]);

  return (
    <>
      <SiteTopbar />
      <SiteHeader />
      <main className="inner-page catalog-page">
        <section className="inner-hero">
          <h1>
            Выберите
            <br />
            <em>свой вариант.</em>
          </h1>
          <p>
            Примеры автомобилей, которые команда ЗаказАвто25 проверяет, выкупает и
            доставляет в Россию.
          </p>
        </section>
        <section className="catalog-content">
          <div className="catalog-toolbar">
            <span>{filtered.length} автомобилей</span>
            <div>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={activeCountry === tab.key ? "filter-active" : ""}
                  onClick={() => setActiveCountry(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="vehicle-grid catalog-grid">
            {loading ? (
              <p className="catalog-empty">Загружаем автомобили...</p>
            ) : filtered.length === 0 ? (
              <p className="catalog-empty">Автомобилей не найдено.</p>
            ) : (
              filtered.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
            )}
          </div>
          <div className="catalog-bottom-cta">
            <Link className="button button-red" href="/request">
              Узнать о другом авто
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
