import Link from "next/link";

export function CountryPageLink({ country, label }: { country: string; label: string }) {
  return <Link href={`/catalog?country=${country}`}>{label}</Link>;
}
