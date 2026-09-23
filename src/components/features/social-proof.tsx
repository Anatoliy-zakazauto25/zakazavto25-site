import Image from "next/image";
import type { SocialLink } from "@/types/components";

const labels: Record<SocialLink["platform"], string> = {
  youtube: "YouTube",
  telegram: "Telegram",
  vk: "VK",
  whatsapp: "WhatsApp",
  max: "Max",
};

const images: Partial<Record<SocialLink["platform"], string>> = {
  telegram: "/Telegram.png",
  whatsapp: "/Whatsap.png",
  vk: "/Vk.png",
  max: "/max (1).png",
};

export function SocialProof({ links }: { links: SocialLink[] }) {
  return (
    <div className="social-proof" aria-label="Социальные сети">
      <span className="social-proof-label">Мы на связи</span>
      <div className="social-proof-list">
        {links.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className={`social-link social-link-${link.platform}`}
            aria-label={`${labels[link.platform]} ${link.followers}`}
          >
            {images[link.platform] ? (
              <Image
                className="social-link-image"
                src={images[link.platform] as string}
                alt=""
                width={180}
                height={60}
              />
            ) : (
              <span className="social-link-text">
                <b>{labels[link.platform]}</b>
                <small>{link.followers}</small>
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
