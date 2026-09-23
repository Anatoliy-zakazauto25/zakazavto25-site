import Image from "next/image";

export function MazdaPhotoBanner() {
  return (
    <section className="mazda-photo-banner" aria-label="Mazda CX-5 в движении">
      <div className="mazda-photo-track">
        <Image src="/mazda-cx5-photo.png" alt="Mazda CX-5 на ночной дороге" width={1774} height={886} className="mazda-photo" priority />
      </div>
    </section>
  );
}
