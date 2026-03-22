/** Police stations by division — sourced from TTPS public listing. */
export type TtpsStation = {
  name: string;
  address: string;
  phones: string;
};

export type TtpsDivision = {
  name: string;
  summary: string;
  stations: TtpsStation[];
};

export const TTPS_STATIONS_SOURCE =
  "https://ttps.gov.tt/contact/stations/" as const;

export const ttpsDivisions: TtpsDivision[] = [
  {
    name: "Port of Spain Division",
    summary: "7 stations & posts",
    stations: [
      {
        name: "Divisional Headquarters",
        address: "Riverside Plaza, Port of Spain",
        phones: "624-6220, 625-5513",
      },
      {
        name: "Belmont",
        address: "Belmont Circular Road, Belmont",
        phones: "621-2514, 621-2515",
      },
      {
        name: "Besson Street",
        address: "#4 Picadilly Street, Port of Spain",
        phones: "623-1395, 627-0719",
      },
      {
        name: "Central Police Station",
        address: "St. Vincent Street, Port of Spain",
        phones: "625-1261",
      },
      {
        name: "St. Clair",
        address: "Serpentine Road, St. Clair",
        phones: "622-4565",
      },
      {
        name: "Woodbrook",
        address: "Baden Powell Street, Woodbrook",
        phones: "628-9171, 628-7163",
      },
      {
        name: "St. Barbs Police Post",
        address: "Upper St. Barbs Road, Laventille",
        phones: "623-0929, 623-0492",
      },
    ],
  },
  {
    name: "Western Division",
    summary: "6 stations",
    stations: [
      {
        name: "Divisional Headquarters",
        address: "Cor. Lazare Street and Western Main Road, St. James",
        phones: "622-2779",
      },
      {
        name: "Carenage",
        address: "School Street, Carenage",
        phones: "637-3123",
      },
      {
        name: "Four Roads",
        address: "Diego Martin Main Road, Four Roads, Diego Martin",
        phones: "637-3860",
      },
      {
        name: "Maraval",
        address: "Saddle Road, Maraval",
        phones: "629-2001, 629-1449",
      },
      {
        name: "St. James",
        address: "Cor. Lazare Street and Western Main Road, St. James",
        phones: "622-3695, 628-0817",
      },
      {
        name: "West End",
        address:
          "Cor. Diego Martin Main Road and Wendy Fitzwilliam Boulevard, Diego Martin",
        phones: "637-4226, 637-6002",
      },
    ],
  },
  {
    name: "Central Division",
    summary: "10 stations & posts",
    stations: [
      {
        name: "Divisional Headquarters",
        address: "Railway Road, Chaguanas",
        phones: "612-2470 Ext. 30058",
      },
      {
        name: "Couva",
        address: "Southern Main Road, Couva",
        phones: "636-2333",
      },
      {
        name: "Chaguanas",
        address: "Railway Road, Chaguanas",
        phones: "665-5271",
      },
      {
        name: "Caroni",
        address: "Southern Main Road, Caroni",
        phones: "662-4291",
      },
      {
        name: "Cunupia",
        address: "113.5km Southern Main Road, Cunupia",
        phones: "665-3080",
      },
      {
        name: "Brasso",
        address: "Corner Marshall Street & Mammoral Road, Flanagin Town",
        phones: "636-2735",
      },
      {
        name: "Freeport",
        address: "LP #142 Mission Road, Freeport",
        phones: "673-0026",
      },
      {
        name: "Gran Couva",
        address: "Corner Corosal Street and Main Road, Gran Couva",
        phones: "679-9735",
      },
      {
        name: "Las Lomas",
        address: "Las Lomas No.1, Chin Chin Road, Cunupia",
        phones: "669-9866",
      },
      {
        name: "Longdenville Police Post",
        address: "Longdenville Main Road, Longdenville",
        phones: "665-4539, 671-6658",
      },
    ],
  },
  {
    name: "Southern Division",
    summary: "13 stations & posts",
    stations: [
      {
        name: "Divisional Headquarters",
        address: "#3 Court Street, Off Irving Street, San Fernando",
        phones: "652-2858",
      },
      {
        name: "Barrackpore",
        address: "Papourie Road, Barrackpore",
        phones: "654-0609, 654-0610",
      },
      {
        name: "Gasparillo",
        address: "Bonne Aventure Road, Gasparillo",
        phones: "650-2193",
      },
      {
        name: "Marabella",
        address: "Southern Main Road, Marabella",
        phones: "652-6777",
      },
      {
        name: "Mon Repos",
        address: "Naparima Mayaro Road, Mon Repos",
        phones: "657-9769",
      },
      {
        name: "Moruga",
        address: "Grand Chemin, Moruga",
        phones: "656-7030",
      },
      {
        name: "Princes Town",
        address: "Naparima Mayaro Road, Princes Town",
        phones: "655-2231",
      },
      {
        name: "San Fernando",
        address: "Harris Promenade South, San Fernando",
        phones: "652-1771, 652-9367",
      },
      {
        name: "South Highway Patrol",
        address: "Lallbeharry Trace Junction, Debe",
        phones: "647-2124",
      },
      {
        name: "Ste. Madeleine",
        address: "#120 Manahambre Road, Ste. Madeleine",
        phones: "653-1023",
      },
      {
        name: "St. Margaret's",
        address: "Southern Main Road, Claxton Bay",
        phones: "659-2530",
      },
      {
        name: "St. Mary's Police Post",
        address: "Moruga Road, St Marys",
        phones: "656-6606",
      },
      {
        name: "Tableland",
        address: "Naparima Mayaro Road, Tableland",
        phones: "656-3430",
      },
    ],
  },
  {
    name: "South Western Division",
    summary: "13 stations & posts",
    stations: [
      {
        name: "Divisional Headquarters",
        address: "Siparia Erin Road, Siparia",
        phones: "649-2353",
      },
      {
        name: "Cap-De-Ville Police Post",
        address: "#346 Southern Main Road, Cap-De-Ville, Point Fortin",
        phones: "651-1475",
      },
      {
        name: "Cedros",
        address: "Cedros Security Complex, Bonasse Village, Cedros",
        phones: "690-1196",
      },
      {
        name: "Debe Police Post",
        address: "Cor. Lallbeharry Trace and S.S. Erin Rd, Debe",
        phones: "647-2124",
      },
      {
        name: "Erin",
        address: "Erin Beach Road, Erin",
        phones: "649-8888",
      },
      {
        name: "Fyzabad",
        address: "Corner Butler Avenue and Guapo Main Road, Fyzabad",
        phones: "677-7777",
      },
      {
        name: "Guapo",
        address: "Southern Main Road, KTO Stretch, Guapo",
        phones: "648-2403",
      },
      {
        name: "La Brea",
        address: "LP 42 New Jersey, La Brea",
        phones: "648-7444",
      },
      {
        name: "Oropouche",
        address: "Old Southern Main Road, St. Mary's Village, South Oropouche",
        phones: "677-2346",
      },
      {
        name: "Penal",
        address: "S.S Erin Road, Penal Junction, Penal",
        phones: "647-8888",
      },
      {
        name: "Point Fortin",
        address: "Guapo Cap-De-Ville Main Road, Point Fortin",
        phones: "648-2426",
      },
      {
        name: "Santa Flora",
        address: "S.S Erin, Santa Flora",
        phones: "649-5555",
      },
      {
        name: "Siparia",
        address: "Siparia Erin Road, Siparia",
        phones: "649-2333",
      },
    ],
  },
  {
    name: "North Division",
    summary: "8 stations & posts",
    stations: [
      {
        name: "Divisional Headquarters",
        address: "Broadway, Arima (north of the Dial)",
        phones: "667-3563",
      },
      {
        name: "Arima",
        address: "Broadway, Arima",
        phones: "667-3563, 667-2910",
      },
      {
        name: "Cumuto",
        address: "LP 105 Cumuto Main Road, Cumuto",
        phones: "643-9000, 643-9439",
      },
      {
        name: "La Horquetta",
        address: "De Freitas Boulevard, Maloney Gardens, Arima",
        phones: "643-3857, 643-1031",
      },
      {
        name: "Malabar Police Post",
        address: "#10 Banyan Boulevard, Malabar",
        phones: "643-2358, 643-2514",
      },
      {
        name: "Maloney",
        address: "Flamingo Boulevard, Maloney",
        phones: "646-6504, 642-2054",
      },
      {
        name: "Pinto Police Post",
        address: "#3 Pinto Road, Arima",
        phones: "667-5217, 667-4818",
      },
      {
        name: "San Raphael",
        address: "San Raphael Junction, Tumpuna Road, Arima",
        phones: "643-8373, 643-8000",
      },
    ],
  },
  {
    name: "North Central Division",
    summary: "6 stations",
    stations: [
      {
        name: "Divisional Headquarters",
        address: "#1 Valsayn Trace, St Joseph",
        phones: "662-4038",
      },
      {
        name: "Arouca",
        address: "Five Rivers Junction, Arouca",
        phones: "640-6138, 640-2540",
      },
      {
        name: "Maracas St. Joseph",
        address: "LP #51 El Chorro Road, Maracas/St. Joseph",
        phones: "663-1264, 696-0327",
      },
      {
        name: "Piarco",
        address: "Golden Grove Road, Piarco",
        phones: "664-1020, 669-0101",
      },
      {
        name: "St. Joseph",
        address: "#1 Valsayn Trace, St Joseph",
        phones: "662-4038",
      },
      {
        name: "Tunapuna",
        address: "Cor. Eastern Main Road and Pasea Road, Tunapuna",
        phones: "645-7573, 662-1600",
      },
    ],
  },
  {
    name: "Eastern Division",
    summary: "10 stations & posts",
    stations: [
      {
        name: "Divisional Headquarters",
        address: "Cor. Toco and Eastern Main Road, Sangre Grande",
        phones: "668-2505",
      },
      {
        name: "Biche",
        address: "15¼mm Cuanapo Southern Main Road, Biche",
        phones: "668-9044, 668-9164",
      },
      {
        name: "Manzanilla",
        address: "North Manzanilla Road, Manzanilla",
        phones: "668-2062, 668-7975",
      },
      {
        name: "Matelot",
        address: "46mm Andrew Street, Matelot",
        phones: "670-8220",
      },
      {
        name: "Matura",
        address: "10½mm Toco Main Road, Matura",
        phones: "668-4511, 668-4582",
      },
      {
        name: "Mayaro",
        address: "Naparima Mayaro Road, Mayaro",
        phones: "630-4333, 630-3432",
      },
      {
        name: "Rio Claro",
        address: "Cor. Guayaguayare Road and High Street, Rio Claro",
        phones: "644-2332",
      },
      {
        name: "Sangre Grande",
        address: "Cor. Toco and Eastern Main Road, Sangre Grande",
        phones: "668-2444, 668-5274",
      },
      {
        name: "Toco",
        address: "29mm Paria Main Road, Toco",
        phones: "670-8256",
      },
      {
        name: "Valencia Police Post",
        address: "Eastern Main Road, Valencia",
        phones: "667-9030, 667-8001",
      },
    ],
  },
  {
    name: "North Eastern Division",
    summary: "8 stations & posts",
    stations: [
      {
        name: "Divisional Headquarters",
        address: "Cor. Lady Young Avenue and Busby Street, Morvant",
        phones: "612-2470 Ext. 75819",
      },
      {
        name: "Blanchisseuse",
        address: "Paria Main Road, Blanchisseuse",
        phones: "669-3868",
      },
      {
        name: "Barataria",
        address: "3rd Avenue, Barataria",
        phones: "674-4723",
      },
      {
        name: "Morvant",
        address: "Cor. Busby Street and Lady Young Avenue, Morvant",
        phones: "627-2981",
      },
      {
        name: "Maracas Bay",
        address: "Grand Fond Rd, Maracas Bay Village",
        phones: "669-4136",
      },
      {
        name: "Santa Cruz",
        address: "Saddle Road, Santa Cruz",
        phones: "676-8888",
      },
      {
        name: "San Juan",
        address: "Cemetery Road, San Juan",
        phones: "674-0100, 638-3416",
      },
      {
        name: "San Juan Sub-Station",
        address: "Eastern Main Road, San Juan",
        phones: "675-3338",
      },
    ],
  },
  {
    name: "Tobago Division",
    summary: "7 stations",
    stations: [
      {
        name: "Divisional Headquarters",
        address: "Young Street, Scarborough, Tobago",
        phones: "639-2511",
      },
      {
        name: "Charlotteville",
        address: "New Street, Charlotteville",
        phones: "660-4388",
      },
      {
        name: "Crown Point",
        address: "Milford Road, Crown Point (next to the Airport)",
        phones: "639-0020, 639-0042",
      },
      {
        name: "Moriah",
        address: "35mm Northside Road, Moriah",
        phones: "660-0029, 660-0100",
      },
      {
        name: "Roxborough",
        address: "Corner Union Street and Windward Road, Roxborough",
        phones: "660-4333",
      },
      {
        name: "Scarborough",
        address: "Young Street, Scarborough",
        phones: "639-1200, 639-1056",
      },
      {
        name: "Shirvan Road",
        address: "Shirvan Road, Mt. Pleasant",
        phones: "639-8888",
      },
    ],
  },
];
