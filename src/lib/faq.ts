export interface FAQItem {
  id: number;
  category: 'fan' | 'organizer' | 'volunteer' | 'security' | 'emergency' | 'sustainability';
  question: string;
  answer: string;
  tags: string[];
}

export const FAQ_DATABASE: FAQItem[] = [
  // === FAN ASSISTANT (1 to 9) ===
  {
    id: 1,
    category: 'fan',
    question: "Where is the nearest concession stand with vegetarian or vegan food?",
    answer: "Organic vegan wraps, vegetarian tacos, and plant-based burgers are available at Section 112 (Zone A / East Stand) and Section 224 (Zone D / West Stand). All items are served in 100% certified compostable, carbon-offset packaging.",
    tags: ["food", "vegan", "vegetarian", "concessions", "eating"]
  },
  {
    id: 2,
    category: 'fan',
    question: "Where can I find a water refill station?",
    answer: "Potable chilled water refill stations are located at Sections 105, 120, 208, and 232, directly adjacent to the main eco-sorting and recycling hubs. Fans are encouraged to bring empty, reusable plastic bottles.",
    tags: ["water", "drink", "refill", "hydration", "bottle"]
  },
  {
    id: 3,
    category: 'fan',
    question: "How do I navigate from Gate 1 to Section 212?",
    answer: "Enter through Gate 1 (Zone A), take the main escalator on your left to Level 2, turn left onto the main circular concourse, and walk past Section 208. Section 212 will be on your left. This entire route is fully step-free.",
    tags: ["navigation", "directions", "gate 1", "section 212", "wheelchair"]
  },
  {
    id: 4,
    category: 'fan',
    question: "Where is the lost and found recovery point?",
    answer: "The primary Lost and Found recovery point is located on the main concourse at Station 4 (near Gate 4 in Zone B). If you have lost an item, you can also log details via our 'Report Event' form for instant tracking by safety volunteers.",
    tags: ["lost", "found", "wallet", "phone", "keys", "station 4"]
  },
  {
    id: 5,
    category: 'fan',
    question: "Are strollers permitted inside the stadium seats?",
    answer: "For spectator safety, baby strollers are not allowed within the seating bowl. They must be checked in at our complimentary stroller storage areas located at Gate 2 (Zone A) or Gate 6 (Zone C) where tag IDs will be provided.",
    tags: ["strollers", "baby", "children", "storage", "gate 2", "gate 6"]
  },
  {
    id: 6,
    category: 'fan',
    question: "Where is the official FIFA 2026 merchandise megastore located?",
    answer: "The flagship FIFA World Cup 2026 Megastore is in the South Plaza just past Gate 5. Smaller merchandise booths are situated at Sections 110 (Zone A), 134 (Zone B), and 215 (Zone C) for faster checkouts.",
    tags: ["merchandise", "megastore", "shop", "jersey", "t-shirt", "gate 5"]
  },
  {
    id: 7,
    category: 'fan',
    question: "How early before kickoff do stadium gates open?",
    answer: "Stadium gates open exactly 3 hours prior to kickoff. We strongly recommend arriving at least 2 hours early to clear security screening and avoid peak line bottlenecks at Gates 3 and 7.",
    tags: ["gates", "time", "kickoff", "hours", "entry", "arrival"]
  },
  {
    id: 8,
    category: 'fan',
    question: "Where are the designated family-friendly restrooms?",
    answer: "All-gender family-friendly restrooms, fully equipped with diaper changing tables and toddler-height amenities, are situated on the main concourse at Sections 104, 118, 203, and 227.",
    tags: ["restroom", "toilet", "family", "diaper", "baby", "washroom"]
  },
  {
    id: 9,
    category: 'fan',
    question: "Can I bring my own external power bank for my mobile device?",
    answer: "Yes! Personal external power banks smaller than 10cm x 10cm x 3cm are permitted, subject to visual safety inspection during security gate screening. High-capacity laptop chargers are prohibited.",
    tags: ["power bank", "charger", "battery", "phone", "electronics"]
  },

  // === ORGANIZER INTEL (10 to 17) ===
  {
    id: 10,
    category: 'organizer',
    question: "Generate an executive stadium intelligence report.",
    answer: "STADIUM SUMMARY: Operating at optimal margins. Turnstile scanning rates are 99.4% successful. VIP suites are at 84% capacity. Current crowd flows are stable across Gates 1, 2, 5, and 6, with gate redirection rules fully active for Gate 3 line diversion. Generator backup and stadium power networks are 100% active.",
    tags: ["report", "executive", "intelligence", "summary", "diagnostics"]
  },
  {
    id: 11,
    category: 'organizer',
    question: "Summarize active incidents and staff deployment recommendations.",
    answer: "ACTIVE INCIDENTS: Minor crowd bottle-neck at Gate 3; medical dispatch cart deployed in Section 104; recycling station overflow reported in Section 218. RECOMMENDATION: Deploy 3 volunteer guides to Gate 3 for crowd diversion; allocate 1 green coordinator to Section 218; ensure first-aid carts remain on high-alert standby.",
    tags: ["incidents", "staff", "recommendation", "deployment", "coordination"]
  },
  {
    id: 12,
    category: 'organizer',
    question: "Analyze Gate 3 bottleneck and suggest dispatches.",
    answer: "GATE 3 PERFORMANCE: Turnstile scanning threshold at 95% capacity. Secondary bottleneck forming at ticketing validators. SUGGESTED ACTION: Dispatch 4 on-site supervisors with hand-held backup scanners. Update LED video screens at Perimeter Cordon Bravo to direct fans to Gate 2 (120m South) or Gate 4 (150m North).",
    tags: ["gate 3", "bottleneck", "scanners", "turnstiles", "dispatch", "crowd"]
  },
  {
    id: 13,
    category: 'organizer',
    question: "What is the current scanner throughput status?",
    answer: "RFID turnstile scanners are processing an average of 850 tickets per minute. Gate 1 and Gate 5 exhibit the highest efficiency at 920/min. Gate 3 shows minor entry lags which are being mitigated via hand-held secondary validators.",
    tags: ["scanners", "throughput", "tickets", "rfid", "turnstiles"]
  },
  {
    id: 14,
    category: 'organizer',
    question: "What is the live VIP lounge occupancy level?",
    answer: "Main level 3 presidential suites and VIP dining halls are at 84% active occupancy. Waitstaff and security resources are at full strength (100% allocation). Climate control zones are set at a steady 21.5°C (70.7°F).",
    tags: ["vip", "lounge", "occupancy", "suites", "catering"]
  },
  {
    id: 15,
    category: 'organizer',
    question: "Compare current concession revenue to target baseline.",
    answer: "Concession sales are performing at 12.4% above initial tournament forecast. Compostable food items, soft drinks in reusable green cups, and local food truck options are driving revenue. Zone D (West Stand) concessions show peak transaction speed.",
    tags: ["concession", "revenue", "sales", "finance", "forecast"]
  },
  {
    id: 16,
    category: 'organizer',
    question: "Is there any backup power generator test scheduled?",
    answer: "No active tests during matchday. All secondary and auxiliary backup generators completed self-diagnostics at 08:00 AM. Power systems are 100% secure, with automatic switchover triggers tested and fully functional in <1.2 seconds.",
    tags: ["power", "generator", "electricity", "backup", "test", "systems"]
  },
  {
    id: 17,
    category: 'organizer',
    question: "What is the current average matchday digital ticket scan success rate?",
    answer: "Matchday ticket scanner success is 99.4%. Manual overrides represent 0.6% of scans, primarily caused by low phone screen brightness or scratched physical screen protectors. Hand-held backups are fully deployed to assist.",
    tags: ["tickets", "scanning", "success rate", "digital ticket", "override"]
  },

  // === VOLUNTEER PROTOCOL (18 to 25) ===
  {
    id: 18,
    category: 'volunteer',
    question: "What is the safety protocol if a parent reports a lost child?",
    answer: "LOST CHILD PROTOCOL: 1. Immediately secure local section gate exits and notify supervisor. 2. Record detailed description (name, age, clothing, hair). 3. Notify Safety Director via emergency Radio Channel 2. 4. Comfort the parent. 5. DO NOT broadcast the child's name over the public address speakers.",
    tags: ["lost child", "parent", "protocol", "security", "child"]
  },
  {
    id: 19,
    category: 'volunteer',
    question: "Translate: 'Please keep your digital ticket ready' into Spanish and French.",
    answer: "TRANSLATIONS:\n• Spanish: 'Por favor, tenga su boleto digital listo.'\n• French: 'Veuillez préparer votre billet numérique, s'il vous plaît.'\n• German: 'Bitte halten Sie Ihr digitales Ticket bereit.'",
    tags: ["translation", "language", "spanish", "french", "german", "ticket"]
  },
  {
    id: 20,
    category: 'volunteer',
    question: "What is the first aid procedure for sudden heat exhaustion?",
    answer: "HEAT EXHAUSTION PROTOCOL:\n1. Move the fan to a cool, shaded area or air-conditioned First Aid tent (located at Section 102 / 204).\n2. Loosen restrictive clothing.\n3. Provide small sips of cool water.\n4. Apply cool damp cloths to head/neck.\n5. Log dispatch via 'Report Event' form for medical supervisor cart support.",
    tags: ["first aid", "heat", "exhaustion", "medical", "treatment", "shaded"]
  },
  {
    id: 21,
    category: 'volunteer',
    question: "How should I handle a ticket duplication dispute at seat level?",
    answer: "1. Politely inspect both digital tickets to verify matching date, opponent, and section/row codes.\n2. Ensure both screens are live (not screenshots).\n3. If duplication is verified, apologize for the issue and escort both parties to the Guest Services Desk at Section 115 for rapid seat re-allocation.",
    tags: ["duplicate", "dispute", "seats", "disagreement", "guest services"]
  },
  {
    id: 22,
    category: 'volunteer',
    question: "What are the key phrases for guiding fans to nearest exit in Japanese?",
    answer: "USEFUL JAPANESE EXIT PHRASES:\n• '出口はこちらです' (Deguchi wa kochira desu) — 'This way to the exit, please.'\n• '立ち止まらないでください' (Tachidomaranaide kudasai) — 'Please do not stop here, keep moving.'",
    tags: ["japanese", "phrases", "exit", "translation", "crowd"]
  },
  {
    id: 23,
    category: 'volunteer',
    question: "Where should I direct a lost volunteer looking for their check-in hub?",
    answer: "The Volunteer Headquarters and Check-In Hub is situated in Room B-12 on the lower basement level. Instruct them to take Elevator 3 (directly behind Section 101 / Gate 1 area) to Basement Level B.",
    tags: ["volunteer hub", "lost volunteer", "check-in", "hq", "elevator 3"]
  },
  {
    id: 24,
    category: 'volunteer',
    question: "What is the protocol for handling an aggressive fan at concessions?",
    answer: "1. Step back and maintain a distance of at least 2 meters.\n2. Use a calm, low tone of voice. Do not argue or make physical contact.\n3. Signal your local supervisor immediately.\n4. If fan behavior escalates or poses risk, use radio to alert Security Command on Channel 4. 5. Document details afterward.",
    tags: ["aggressive", "drunk", "concessions", "dispute", "security", "calm"]
  },
  {
    id: 25,
    category: 'volunteer',
    question: "What is the procedure for a disabled fan requesting sensory room access?",
    answer: "The Sensory Room is a calm, soundproof environment located at Section 120. Escort the fan and up to two family members to Section 120. Offer them complimentary noise-canceling headphones available at the adjacent Guest Services cabinet.",
    tags: ["sensory room", "autism", "disabled", "soundproof", "noise-canceling", "escort"]
  },

  // === SECURITY COMMAND (26 to 33) ===
  {
    id: 26,
    category: 'security',
    question: "Establish Gate 3 queue diversion route to Gate 4.",
    answer: "GATE 3 DIVERSION BLUEPRINT:\n1. Deploy structural steel barriers at Perimeter Cordon Delta to halve the entry lane flow.\n2. Post 4 volunteer guides with megaphones at the outer cordon. 3. Redirect incoming fans North-East along the paved plaza path for 150 meters to Gate 4, which is currently operating at only 30% scanner utilization.",
    tags: ["diversion", "gate 3", "gate 4", "barriers", "cordon", "crowd"]
  },
  {
    id: 27,
    category: 'security',
    question: "Draft a security dispatch alert for bottleneck crowd control.",
    answer: "[SECURITY ALERT - EVENT COMM] High crowd density detected at Gate 3. Secondary barricades are now active. Crowd redirection procedures initiated. Dispatching 5 additional high-visibility safety officers to Perimeter Cordon Bravo to manage fan alignment. Estimated queue dissipation: 12 minutes.",
    tags: ["alert", "dispatch", "crowd", "bottleneck", "officers", "stewards"]
  },
  {
    id: 28,
    category: 'security',
    question: "Suggest evacuation bypass pathways for Zone B.",
    answer: "ZONE B EVACUATION BYPASS PLAN: In the event of standard evacuation, direct Zone B (North Stand) spectators to bypass the central plaza choke point entirely. Route crowd outwards through Gate 3 and Gate 4 auxiliary swing-open gates, funneling directly onto the North Bus Terminal Expressway.",
    tags: ["evacuation", "bypass", "zone b", "north stand", "egress", "gates"]
  },
  {
    id: 29,
    category: 'security',
    question: "What is the protocol for a stadium drone sighting?",
    answer: "DRONE DETECTED PROTOCOL: 1. Immediately log drone's coordinates, color, and heading. 2. Notify Security Commander via Radio Channel 1. 3. Do not attempt to disable or shoot down. 4. Deploy Drone Counter-Measure Team to localize the operator (typically situated in Parking Lot B or adjacent parklands).",
    tags: ["drone", "sighting", "threat", "airspace", "security team"]
  },
  {
    id: 30,
    category: 'security',
    question: "What are the primary stadium evacuation egress points?",
    answer: "Primary emergency egress is achieved through Gates 1 to 8, which feature dual-hinged emergency exit panels that swing open outwards to double the exit width. These lead directly to open pedestrian zones clear of vehicular traffic.",
    tags: ["egress", "evacuation", "exits", "gates", "emergency"]
  },
  {
    id: 31,
    category: 'security',
    question: "How do we coordinate crowd dispersal after final whistle?",
    answer: "DISPERSAL PROTOCOL: 1. Open all auxiliary egress swing gates. 2. Trigger automated PA dispersal announcements. 3. Station volunteers with glowing light-sticks at major plaza junctions. 4. Coordinate with transit dispatch to increase subway train frequency.",
    tags: ["dispersal", "final whistle", "egress", "transit", "coordination"]
  },
  {
    id: 32,
    category: 'security',
    question: "What is the protocol for bag search non-compliance?",
    answer: "BAG SEARCH PROTOCOL: Politely inform the ticket-holder that entry is contingent upon screening. If refused, deny access. Direct them to the external bag lockers at Section 100 Plaza. If the fan becomes combative, call for local tactical backup immediately.",
    tags: ["bag search", "refusal", "compliance", "security gate", "lockers"]
  },
  {
    id: 33,
    category: 'security',
    question: "How should unattended bags be treated under security protocols?",
    answer: "UNATTENDED BAG: 1. Do not touch, move, or open the item. 2. Establish a physical 10-meter cordon. 3. Interrogate nearby fans regarding ownership. 4. Contact Security Command with coordinates and bag description. 5. Stand by for explosive detection canine sweep.",
    tags: ["unattended bag", "suspicious", "canine", "cordon", "reporting"]
  },

  // === EMERGENCY RESPONDER (34 to 42) ===
  {
    id: 34,
    category: 'emergency',
    question: "Provide medical triage response protocol for heatstroke.",
    answer: "HEATSTROKE EMERGENCY PROTOCOL:\n1. DISPATCH a medical golf cart immediately to transport the patient to the Section 102 Clinic.\n2. Move the patient out of the sun.\n3. Rapidly cool the body: Apply ice packs or ice water to the groin, armpits, and neck.\n4. Administer high-flow oxygen if available.\n5. Keep airway clear; do not leave unattended.",
    tags: ["heatstroke", "medical", "emergency", "paramedics", "cooling", "ice packs"]
  },
  {
    id: 35,
    category: 'emergency',
    question: "What is the fastest cart pathway to Section 104 for paramedic crew?",
    answer: "RECOMMENDED ROUTE: Access Section 104 via the inner subterranean service ring road. Enter the seating bowl through Tunnel 4-B. This pathway is 100% step-free, completely clear of fan bottleneck lines, and directly accommodates standard medical golf carts.",
    tags: ["pathway", "cart", "route", "section 104", "medical cart", "tunnel 4-b"]
  },
  {
    id: 36,
    category: 'emergency',
    question: "Provide dispatch directions for a volunteer responding to a cardiac emergency.",
    answer: "CARDIAC RESPONSE DISPATCH:\n1. Instruct the nearest volunteer to retrieve the AED located at the Guest Services Counter (Section 101 or 115).\n2. Begin chest compressions (CPR) immediately. 3. Alert Stadium EMS Command on emergency Channel 9. 4. Clear a 3-meter physical circle around the patient for paramedics.",
    tags: ["cardiac", "cpr", "aed", "compressions", "paramedics", "heart attack"]
  },
  {
    id: 37,
    category: 'emergency',
    question: "Where are the active Automated External Defibrillators (AEDs) located?",
    answer: "AEDs are mounted inside labeled, temperature-controlled cabinets at all Concierge and Guest Services stands: Sections 101, 115, 128, 204, 218, and 230, as well as the 4 permanent first-aid clinics.",
    tags: ["aed", "defibrillator", "heart", "emergency kits", "guest services"]
  },
  {
    id: 38,
    category: 'emergency',
    question: "What is the triage response for a suspected spinal injury?",
    answer: "SPINAL PROTOCOL: 1. Do NOT move the victim unless they are in immediate danger of fire/collapse. 2. Manually stabilize the head and neck to prevent movement. 3. Confirm advanced paramedic team is in transit with a backboard. 4. Keep patient calm and warm.",
    tags: ["spinal", "neck", "injury", "trauma", "stabilize", "backboard"]
  },
  {
    id: 39,
    category: 'emergency',
    question: "How many active ambulances are stationed on site today?",
    answer: "We have 4 Advanced Life Support (ALS) ambulances stationed on-site: 2 at the Northeast Ambulance Gate and 2 at the Southwest Gate. 3 additional high-mobility medical golf carts operate inside the service concourse.",
    tags: ["ambulance", "stationed", "als", "medical vehicles", "paramedics"]
  },
  {
    id: 40,
    category: 'emergency',
    question: "What is the medical response procedure for severe asthma?",
    answer: "ASTHMA PROCEDURE: 1. Seat the patient upright and loosen tight clothing. 2. Assist them in using their personal quick-relief inhaler. 3. If unavailable, provide supplemental oxygen. 4. If peak flow does not improve after 5 minutes, coordinate immediate golf cart evacuation to the nearest clinic.",
    tags: ["asthma", "breathing", "inhaler", "oxygen", "respiratory"]
  },
  {
    id: 41,
    category: 'emergency',
    question: "Where is the emergency helipad evacuation point?",
    answer: "The designated medical evacuation helicopter landing zone (LZ) is situated in Parking Lot C, specifically in the secure northwest cordon. Flight coordinates are pre-registered with local trauma center dispatch.",
    tags: ["helipad", "helicopter", "evacuation", "trauma center", "landing zone"]
  },
  {
    id: 42,
    category: 'emergency',
    question: "What is the protocol for treating minor cuts or abrasions?",
    answer: "MINOR TRIA_GE: Cleanse wound with sterile saline or antiseptic wipes. Apply antibiotic ointment and dress with a sterile bandage. For minor events, advise fans they can self-administer basic care kits at any Guest Services Booth.",
    tags: ["cuts", "bandages", "scratches", "first aid", "abrasions"]
  },

  // === ECO COORDINATOR (43 to 50) ===
  {
    id: 43,
    category: 'sustainability',
    question: "How do we optimize recycling dispatches for Section 218 bin overflow?",
    answer: "SECTION 218 ECO CORRECTION: Dispatch 1 sustainability runner with green composting and blue sorting bags to Section 218. Adjust bin placement ratio at this terminal: 2 recycling bins to 1 landfill bin, as fans here are consuming high volumes of compostable food wrappers.",
    tags: ["recycling", "bin", "section 218", "overflow", "composting", "dispatches"]
  },
  {
    id: 44,
    category: 'sustainability',
    question: "Suggest 3 actionable methods to increase our World Cup sustainability score.",
    answer: "METHODS TO INCREASE ECO SCORE:\n1. Launch the 'Green Cup Return' cash-back refund incentive ($1 back per cup).\n2. Deploy volunteer guides to help fans at sorting stations.\n3. Implement real-time, gamified Section Sorting Leaderboards on the main display scoreboard.",
    tags: ["sustainability score", "green cup", "gamification", "sorting", "volunteers"]
  },
  {
    id: 45,
    category: 'sustainability',
    question: "How much carbon offset has been achieved with the Green Cup initiative?",
    answer: "The Green Cup initiative has successfully avoided 12,450 kg of CO2 equivalent emissions today alone. This represents a 95.2% reuse and return rate of cups across all concession kiosks.",
    tags: ["carbon offset", "co2 emissions", "green cup", "reusable", "statistics"]
  },
  {
    id: 46,
    category: 'sustainability',
    question: "Where are the organic waste composting drop-offs?",
    answer: "Composting sorting bins, painted green, are situated adjacent to every dining table, refreshment bench, and food truck area across the East and West plazas. All food vendor containers are 100% compostable.",
    tags: ["composting", "organic", "green bin", "food waste", "biodegradable"]
  },
  {
    id: 47,
    category: 'sustainability',
    question: "What is the water conservation level in stadium restrooms today?",
    answer: "Restroom sensor taps and waterless flushing urinals have reduced matchday water usage by 32% compared to historical baselines. This represents 145,000 liters of water saved so far today.",
    tags: ["water", "restrooms", "conservation", "sensor", "liters"]
  },
  {
    id: 48,
    category: 'sustainability',
    question: "How does the stadium solar canopy contribute to current grid load?",
    answer: "The stadium's custom photovoltaic solar canopy is currently generating 240 kW of clean electricity, feeding 100% of the energy requirements for all scoreboard displays, perimeter stadium LED lighting, and concession fryers.",
    tags: ["solar", "canopy", "electricity", "clean energy", "photovoltaic", "grid"]
  },
  {
    id: 49,
    category: 'sustainability',
    question: "What is our stadium's single-use plastic policy?",
    answer: "Single-use plastic straws, cups, and carrier bags are 100% prohibited. Concession vendors must use certified starch-based utensils and compostable cups, or face environmental compliance penalties.",
    tags: ["plastics", "single-use", "prohibited", "compliance", "utensils"]
  },
  {
    id: 50,
    category: 'sustainability',
    question: "How can fans offset their travel emissions to this match?",
    answer: "Fans can scan the green QR code printed on the rear of every seat to load the FIFA carbon calculator. They can input their flight or driving route to pledge offset funds supporting wind farm initiatives.",
    tags: ["travel emissions", "offset", "qr code", "carbon calculator", "wind farm"]
  }
];
