export const BRAND = {
  name: "Valery Nails",
  tagline: "Estudio de manicura",
  logo: "assets/logo-mark.svg",
  description: "Agenda de citas de Valery Nails: manicure semipermanente, acrílico y diseños a mano.",
};

export const STORAGE_KEY = "valery-nails-appointments-v1";
export const LEGACY_STORAGE_KEYS = ["valentina-nails-appointments-v1"];
export const SETTINGS_KEY = "valery-nails-settings-v1";

export const MAX_IMAGES_PER_APPOINTMENT = 5;
export const MAX_IMAGE_BYTES = 360_000;
export const MAX_STORAGE_CHARS = 3_500_000;
export const MAX_LOGO_BYTES = 120_000;
export const LOGO_SIZES = [240, 180, 128];

export const SERVICES = [
  "Manicure semipermanente",
  "Uñas acrílicas esculpidas",
  "Diseño artístico a mano",
  "Manicure tradicional",
  "Retiro + spa de manos",
  "Uñas gel",
  "Pedicure spa",
];

export const CUSTOM_SERVICE = "__custom__";

export const DEFAULT_SETTINGS = {
  businessName: BRAND.name,
  logo: null,
  view: "upcoming",
};
