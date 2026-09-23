export type SocialPlatform = "youtube" | "telegram" | "vk" | "whatsapp" | "max";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  followers: string;
}

export interface Founder {
  name: string;
  title: string;
  photo: string;
  description?: string;
}

export interface WorkStep {
  number: string;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string | string[];
}

export interface Manager {
  name: string;
  phone: string;
  messengerUrl: string;
}

export interface ManagerCategory {
  emoji: string;
  title: string;
  managers: Manager[];
}

export type ReviewPlatform = "2gis" | "yandex" | "vlru" | "google" | "avito";

export interface ExternalReview {
  platform: ReviewPlatform;
  url: string;
  label: string;
}

export interface OfficeHours {
  weekdays: string;
  saturday?: string;
  pickupHours: string;
}

export interface NewsItem {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  content: string[];
  date: string;
  image: string;
}
