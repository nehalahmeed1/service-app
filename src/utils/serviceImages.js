const IMAGE_BY_KEYWORD = [
  {
    keywords: ["cctv", "camera"],
    url: "https://source.unsplash.com/1600x900/?technician,cctv,installation,home-service",
  },
  {
    keywords: ["lan", "network cable", "cabling", "ethernet"],
    url: "https://source.unsplash.com/1600x900/?technician,network,cabling,ethernet,service",
  },
  {
    keywords: ["router", "wifi", "wi-fi", "internet setup"],
    url: "https://source.unsplash.com/1600x900/?technician,wifi,router,internet,setup",
  },
  {
    keywords: ["bathroom cleaning"],
    url: "https://source.unsplash.com/1600x900/?bathroom,cleaning,home-service,professional",
  },
  {
    keywords: ["kitchen cleaning"],
    url: "https://source.unsplash.com/1600x900/?kitchen,cleaning,home-service,professional",
  },
  {
    keywords: ["full home cleaning", "home cleaning", "deep cleaning", "cleaning"],
    url: "https://source.unsplash.com/1600x900/?housekeeping,deep-cleaning,home-service,professional",
  },
  {
    keywords: ["campus pest management", "pest management", "pest", "termite", "disinfection", "fumigation"],
    url: "",
  },
  {
    keywords: ["fan installation", "ceiling fan", "fan repair", "fan service", "fan fitting"],
    url: "",
  },
  {
    keywords: [
      "carpentry and fixtures",
      "carpentry",
      "fixtures",
      "fixture",
      "woodwork",
      "cabinet",
      "furniture",
    ],
    url: "",
  },
  {
    keywords: ["electric", "wiring", "switch", "electrical"],
    url: "https://source.unsplash.com/1600x900/?electrician,wiring,electrical,home-service",
  },
  {
    keywords: ["ac", "air condition", "hvac"],
    url: "https://source.unsplash.com/1600x900/?ac-service,hvac,technician,home-service",
  },
  {
    keywords: ["plumb", "leak", "tap", "sink"],
    url: "https://source.unsplash.com/1600x900/?plumber,plumbing,repair,home-service",
  },
  {
    keywords: ["gas stove", "stove", "cooktop"],
    url: "https://source.unsplash.com/1600x900/?gas-stove,appliance,repair,technician",
  },
  {
    keywords: ["lock", "door"],
    url: "https://source.unsplash.com/1600x900/?locksmith,door,lock,home-service",
  },
  {
    keywords: ["tv repair", "television"],
    url: "https://source.unsplash.com/1600x900/?tv-repair,electronics,technician,service",
  },
  {
    keywords: ["painting", "paint"],
    url: "https://source.unsplash.com/1600x900/?house-painting,painter,home-service",
  },
  {
    keywords: ["home massage", "massage therapy", "massage"],
    url: "https://source.unsplash.com/1600x900/?massage,home-service,wellness,therapist",
  },
  {
    keywords: ["men grooming", "men's grooming", "beard", "barber", "men salon"],
    url: "https://source.unsplash.com/1600x900/?barber,men-grooming,salon,service",
  },
  {
    keywords: ["women salon", "women's salon", "bridal", "makeup", "beauty parlour", "beauty parlor"],
    url: "https://source.unsplash.com/1600x900/?women-salon,beauty,makeup,service",
  },
  {
    keywords: ["beauty and wellness", "beauty", "wellness", "salon", "grooming", "skincare", "facial"],
    url: "https://source.unsplash.com/1600x900/?beauty,wellness,facial,spa,service",
  },
];

const DEFAULT_BY_LEVEL = {
  ENTERPRISE:
    "https://source.unsplash.com/1600x900/?enterprise,facility,operations",
  SMALL_TEAM:
    "https://source.unsplash.com/1600x900/?team,service,work",
  INDIVIDUAL:
    "https://source.unsplash.com/1600x900/?home,service,professional",
};

const LEVEL_CONTEXT = {
  ENTERPRISE: ["commercial", "corporate", "office", "facility"],
  SMALL_TEAM: ["small-business", "workspace", "team"],
  INDIVIDUAL: ["home", "residential"],
};
const STYLE_CONTEXT = ["service-professional", "indoor", "technician"];

export function getServiceImageUrl({
  name = "",
  categoryName = "",
  businessLevel = "INDIVIDUAL",
}) {
  const text = `${name} ${categoryName}`.toLowerCase();
  const hasKeyword = (keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "i");
    return re.test(text);
  };
  const isFanService = ["fan installation", "ceiling fan", "fan repair", "fan service", "fan fitting"].some(
    (keyword) => hasKeyword(keyword)
  );
  if (isFanService) return getCeilingFanServiceSvg(businessLevel);
  const isCarpentryService = [
    "carpentry and fixtures",
    "carpentry",
    "fixtures",
    "fixture",
    "woodwork",
    "cabinet",
    "furniture",
  ].some((keyword) => hasKeyword(keyword));
  if (isCarpentryService) return getCarpentryServiceSvg(businessLevel);
  const isPestControlService = [
    "campus pest management",
    "pest management",
    "pest",
    "termite",
    "disinfection",
    "fumigation",
  ].some((keyword) => hasKeyword(keyword));
  if (isPestControlService) return getPestControlServiceSvg(businessLevel);
  const isBeautyWellnessService = [
    "beauty and wellness",
    "beauty",
    "wellness",
    "skincare",
    "facial",
    "makeup",
    "salon",
  ].some((keyword) => hasKeyword(keyword));
  if (isBeautyWellnessService) return getBeautyWellnessServiceImage(businessLevel);

  const matched = IMAGE_BY_KEYWORD.find((entry) =>
    entry.keywords.some((keyword) => hasKeyword(keyword))
  );
  if (matched?.url) return withBusinessLevelContext(matched.url, businessLevel);
  return DEFAULT_BY_LEVEL[businessLevel] || DEFAULT_BY_LEVEL.INDIVIDUAL;
}

function withBusinessLevelContext(url, businessLevel = "INDIVIDUAL") {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("source.unsplash.com/")) return url;

  const suffix = LEVEL_CONTEXT[businessLevel] || LEVEL_CONTEXT.INDIVIDUAL;
  const [base, queryPart = ""] = url.split("/?");
  const query = queryPart.split(",").map((part) => part.trim()).filter(Boolean);
  const merged = Array.from(new Set([...query, ...STYLE_CONTEXT, ...suffix]));
  return `${base}/?${merged.join(",")}`;
}

function getCeilingFanServiceSvg(businessLevel) {
  return withBusinessLevelContext(
    "https://source.unsplash.com/1600x900/?ceiling-fan,installation,electrician,home-service",
    businessLevel
  );
}

function getCarpentryServiceSvg(businessLevel) {
  return withBusinessLevelContext(
    "https://source.unsplash.com/1600x900/?carpenter,woodwork,installation,home-service",
    businessLevel
  );
}

function getPestControlServiceSvg(businessLevel) {
  return withBusinessLevelContext(
    "https://source.unsplash.com/1600x900/?pest-control,sprayer,technician,service",
    businessLevel
  );
}

function getBeautyWellnessServiceImage(businessLevel) {
  return withBusinessLevelContext(
    "https://source.unsplash.com/1600x900/?beauty,wellness,facial,spa,service",
    businessLevel
  );
}

export function getServiceFallbackSvg(label = "ServiceConnect") {
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'>" +
        "<defs><linearGradient id='bg' x1='0' x2='1' y1='0' y2='1'>" +
        "<stop stop-color='#1e293b' offset='0'/>" +
        "<stop stop-color='#0f766e' offset='1'/>" +
        "</linearGradient></defs>" +
        "<rect width='900' height='600' fill='url(#bg)'/>" +
        `<text x='50%' y='50%' fill='white' font-size='34' text-anchor='middle' font-family='Arial, sans-serif'>${label}</text>` +
      "</svg>"
    )
  );
}
