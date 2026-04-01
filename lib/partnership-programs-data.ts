export type PartnershipContact = {
  /** e.g. "Open now" — omit to hide the status badge */
  status?: string;
  address: string;
  /** Optional map link (e.g. Bing Maps) */
  addressMapUrl?: string;
  phone: string;
  email: string;
  /** Facebook page URL */
  facebookUrl?: string;
  /** WhatsApp number as shown (e.g. +1 868-620-5600); opens wa.me with digits only */
  whatsapp?: string;
  websiteUrl?: string;
  instagramUrl?: string;
};

export type PartnershipProgram = {
  key: number;
  slug: string;
  title: string;
  body: string;
  /** Optional second paragraph after `body` */
  bodySecondary?: string;
  contact?: PartnershipContact;
  /** Tailwind grid placement classes (sm+), same layout as partnership index */
  placement: string;
  /** Image carousel: /Partners/{folder}/1..count.JPG */
  partnerGallery?: { folder: string; count: number };
};

export const PARTNERSHIP_PROGRAMS: PartnershipProgram[] = [
  {
    key: 1,
    slug: "hardware-and-beyond",
    title: "Hardware and Beyond",
    body:
      "Hardware and Beyond is a TTPSSWA partnership program. Further details and contact information will be published here as they become available.",
    placement: "sm:col-start-1 sm:row-start-1",
  },
  {
    key: 2,
    slug: "antar-auto-repairs-and-parts",
    title: "Antar auto Repairs And Parts",
    body:
      "Antar Auto Repairs and Parts has partnered with the Association to bring members an exclusive benefit: 10% to 20% off on parts and services.",
    bodySecondary:
      "This collaboration is designed to make vehicle maintenance more affordable while ensuring members receive quality service and genuine parts. It's a practical way to add value to your membership and keep your car running smoothly without stretching your budget.",
    contact: {
      address:
        "442 Lendore Village, Montrose, Chaguanas, Trinidad and Tobago",
      addressMapUrl:
        "https://www.bing.com/maps?q=442+Lendore+Village+Montrose+Chaguanas+Trinidad+and+Tobago",
      phone: "+1 868-340-0496",
      whatsapp: "+1 868-340-0496",
      email: "antarautorepairs@gmail.com",
      websiteUrl: "https://www.antarauto.com/",
      instagramUrl: "https://www.instagram.com/antarautorepairs/",
    },
    placement: "sm:col-start-1 sm:row-start-2",
    partnerGallery: { folder: "Antar", count: 5 },
  },
  {
    key: 3,
    slug: "dream-builder-colour-studio-ltd",
    title: "Dream Builder Colour Studio Ltd",
    body:
      "Members of the association can now enjoy special discounts between 5% and 20% on Dream Builder Colour Studio Ltd's full range of products and services.",
    bodySecondary:
      "From premium colour consultations and design solutions to high-quality materials and finishes, this partnership ensures you get professional expertise at a reduced cost. It's a great opportunity to elevate your projects while saving more as part of your membership benefits.",
    contact: {
      address:
        "#33 John Shaw Ave Eastern Main Road Arima, Arima, Trinidad and Tobago",
      phone: "+1 868-778-3039",
      email: "dreambuilderstudio@gmail.com",
      facebookUrl: "https://www.facebook.com/dreambuilderstudio/",
      whatsapp: "+1 868-620-5600",
    },
    placement: "sm:col-start-2 sm:row-span-2 sm:row-start-1",
    partnerGallery: { folder: "Dream Builders", count: 6 },
  },
];

export function getPartnershipProgram(
  slug: string,
): PartnershipProgram | undefined {
  return PARTNERSHIP_PROGRAMS.find((p) => p.slug === slug);
}
