/* ============================================================================
   Special's Restro & Cafe — data layer
   ----------------------------------------------------------------------------
   Everything the site renders comes from this file. Edit here, not in the HTML.

   NOTE ON PLACEHOLDERS (search for "PLACEHOLDER"):
   phone / whatsapp / instagram numbers are dummies.
   Testimonials are sample copy — replace with real, permissioned reviews.
   The star breakdown is an illustrative split of the real 1,737 total.
   ========================================================================== */
window.SRC = window.SRC || {};

/* ---------------------------------------------------------------- business */
SRC.BUSINESS = {
  name: "Special's Restro & Cafe",
  tagline: 'North Indian kitchen · Slow-brew cafe',
  claim: 'Tandoor smoke, single-origin coffee and Jamnagar warmth — under one roof.',
  cuisine: 'North Indian restaurant',
  rating: 4.6,
  reviews: 1737,
  priceRange: '₹200–600',
  priceNote: 'per person · reported by 465 people',
  address: {
    line1: 'Airport Rd, near Padam Party Plot',
    line2: 'Jamnagar, Gujarat 361006',
    plusCode: 'F226+HV Jamnagar, Gujarat'
  },
  phone: '+91 90000 00000',            // PLACEHOLDER
  whatsapp: '+91 90000 00000',         // PLACEHOLDER
  email: 'hello@specialsrestrocafe.in', // PLACEHOLDER
  instagram: '@specials.jamnagar',      // PLACEHOLDER
  /* 9:00 am → 12:30 am (next day), every day. openMin/closeMin are minutes
     from midnight; closeMin > 1440 means it spills past midnight. */
  hours: { openMin: 9 * 60, closeMin: 24 * 60 + 30, label: '9:00 am – 12:30 am', days: 'Every day' },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Special's+Restro+%26+Cafe,+Airport+Rd,+Jamnagar,+Gujarat+361006",
  plusCodeUrl: 'https://www.google.com/maps/search/?api=1&query=F226%2BHV+Jamnagar',
  mapsEmbed: "https://maps.google.com/maps?q=Special's+Restro+%26+Cafe+Airport+Road+Jamnagar+Gujarat&z=15&output=embed",
  /* Illustrative distribution that averages ≈4.6 over the real 1,737 reviews */
  starSplit: { 5: 1290, 4: 305, 3: 80, 2: 32, 1: 30 },
  delivery: {
    radiusKm: 7,
    etaMin: 32,
    packaging: 20,
    fee: 39,
    freeAbove: 499,
    minOrder: 149,
    gstRate: 0.05,
    areas: ['Airport Road', 'Park Colony', 'Summair Club Road', 'Patel Colony', 'Indira Marg',
            'Bedi Bandar Road', 'Gulabnagar', 'Ranjit Sagar Road', 'Digjam Circle', 'Pancheshwar Tower']
  }
};

/* ---------------------------------------------------------------- services */
SRC.SERVICES = [
  { id: 'dine-in', icon: '🍽️', title: 'Dine-in', line: 'Courtyard, cabin & rooftop seating for 90 guests.',
    back: 'Live tandoor counter, board games, and a barista who remembers your order.' },
  { id: 'reserve', icon: '📔', title: 'Reserve a table', line: 'Hold a table in under 30 seconds.',
    back: 'Instant confirmation for 1–20 guests. Birthday & anniversary setups on request.' },
  { id: 'order-online', icon: '🛍️', title: 'Order online', line: 'Full 68-item menu, packed hot.',
    back: 'Tamper-evident seals, gravy in leak-proof jars, breads wrapped in butter paper.' },
  { id: 'drive-through', icon: '🚗', title: 'Drive-through', line: 'Coffee window on Airport Road.',
    back: 'Average 4-minute hand-off. Pull up, scan, roll out — no parking hunt.' },
  { id: 'no-contact', icon: '📦', title: 'No-contact delivery', line: 'Doorstep drop, zero touchpoints.',
    back: 'Live rider tracking, temperature-checked bags, digital bill on your phone.' }
];

/* ---------------------------------------------------- menu categories (13) */
SRC.CATEGORIES = [
  { id: 'hot-coffee',  label: 'Hot Coffee',            icon: '☕', blurb: 'Chikmagalur single-origin, pulled on a 3-group lever.' },
  { id: 'cold-coffee', label: 'Cold Coffee & Frappe',  icon: '🧊', blurb: '18-hour cold brew, blended thick and slow.' },
  { id: 'shakes',      label: 'Shakes & Smoothies',    icon: '🥤', blurb: 'Real fruit, no syrups, hand-scooped ice cream.' },
  { id: 'tea',         label: 'Tea & Refreshers',      icon: '🫖', blurb: 'Kulhad chai, kahwa and cooling mocktails.' },
  { id: 'breakfast',   label: 'All-Day Breakfast',     icon: '🍳', blurb: 'Served 9 am to midnight, because mornings vary.' },
  { id: 'sandwich',    label: 'Sandwiches & Toasties', icon: '🥪', blurb: 'Sourdough and milk bread, pressed to order.' },
  { id: 'burger',      label: 'Burgers & Wraps',       icon: '🍔', blurb: 'Brioche buns baked in-house every morning.' },
  { id: 'pizza',       label: 'Wood-Fired Pizza',      icon: '🍕', blurb: '48-hour cold-fermented dough, 400°C stone.' },
  { id: 'continental', label: 'Pasta & Continental',   icon: '🍝', blurb: 'Bronze-cut pasta, sauces built from scratch.' },
  { id: 'starters',    label: 'Tandoori & Starters',   icon: '🔥', blurb: 'Charcoal tandoor, 24-hour hung-curd marinades.' },
  { id: 'mains',       label: 'North Indian Mains',    icon: '🍲', blurb: 'Copper handi gravies, finished with white butter.' },
  { id: 'breads',      label: 'Breads & Rice',         icon: '🫓', blurb: 'Stretched, slapped and blistered to order.' },
  { id: 'desserts',    label: 'Desserts & Bakes',      icon: '🍰', blurb: 'Baked in the cafe, plated warm.' }
];

/* ------------------------------------------------------------- 68 dishes --
   diet: 'veg' | 'egg'   (this kitchen is vegetarian + egg; see README to add
   a non-veg block)      spice: 0–3        art: drives the generated artwork
--------------------------------------------------------------------------- */
SRC.MENU = [
  /* ── Hot Coffee (7) ─────────────────────────────────────────────────── */
  { id: 'hc-01', name: 'Signature Jamnagar Espresso', cat: 'hot-coffee', price: 110, diet: 'veg', spice: 0, kcal: 12, rating: 4.7, votes: 268,
    desc: 'Double shot of Chikmagalur beans, thick crema, citrus finish.', tags: ['chefs'],
    art: { kind: 'cupTop', tone: 'mocha', surface: 'slate', foam: 'crema', cup: 0.72 } },
  { id: 'hc-02', name: 'Classic Cappuccino', cat: 'hot-coffee', price: 150, diet: 'veg', spice: 0, kcal: 140, rating: 4.6, votes: 412,
    desc: 'Equal thirds espresso, steamed milk, velvet foam. Cocoa dusted.', tags: ['bestseller'],
    art: { kind: 'cupTop', tone: 'caramel', surface: 'wood', foam: 'heart' } },
  { id: 'hc-03', name: 'Caffè Latte', cat: 'hot-coffee', price: 160, diet: 'veg', spice: 0, kcal: 190, rating: 4.5, votes: 301,
    desc: 'Silky microfoam poured into a rosetta over a long shot.', tags: [],
    art: { kind: 'cupTop', tone: 'cream', surface: 'marble', foam: 'rosetta' } },
  { id: 'hc-04', name: 'Kesar Badam Latte', cat: 'hot-coffee', price: 195, diet: 'veg', spice: 0, kcal: 240, rating: 4.8, votes: 356,
    desc: 'Kashmiri saffron, roasted almond milk, a whisper of cardamom.', tags: ['bestseller', 'chefs'],
    art: { kind: 'cupTop', tone: 'saffron', surface: 'dark', foam: 'rosetta' } },
  { id: 'hc-05', name: 'Belgian Hot Chocolate', cat: 'hot-coffee', price: 210, diet: 'veg', spice: 0, kcal: 320, rating: 4.7, votes: 219,
    desc: '58% Callebaut melted into whole milk, sea-salt fleck on top.', tags: [],
    art: { kind: 'cupSide', tone: 'chocolate', surface: 'wood', steam: true } },
  { id: 'hc-06', name: 'South Filter Kaapi', cat: 'hot-coffee', price: 120, diet: 'veg', spice: 0, kcal: 130, rating: 4.6, votes: 187,
    desc: 'Decoction dripped overnight, pulled tall in a steel tumbler.', tags: [],
    art: { kind: 'cupSide', tone: 'mocha', surface: 'slate', steam: true } },
  { id: 'hc-07', name: 'Hazelnut Mocha', cat: 'hot-coffee', price: 205, diet: 'veg', spice: 0, kcal: 290, rating: 4.5, votes: 164,
    desc: 'Dark chocolate, hazelnut praline, espresso, torched marshmallow.', tags: ['new'],
    art: { kind: 'cupTop', tone: 'chocolate', surface: 'dark', foam: 'swirl' } },

  /* ── Cold Coffee & Frappe (6) ───────────────────────────────────────── */
  { id: 'cc-01', name: 'Old-School Cold Coffee', cat: 'cold-coffee', price: 170, diet: 'veg', spice: 0, kcal: 260, rating: 4.7, votes: 498,
    desc: 'The one from 2009 — blended thick, frothy collar, no cream.', tags: ['bestseller'],
    art: { kind: 'tallGlass', tone: 'caramel', surface: 'dark', layers: 2, whip: false, straw: true, ice: 0 } },
  { id: 'cc-02', name: 'Iced Americano', cat: 'cold-coffee', price: 140, diet: 'veg', spice: 0, kcal: 15, rating: 4.4, votes: 152,
    desc: 'Two shots over a full glass of clear ice and orange zest.', tags: [],
    art: { kind: 'tallGlass', tone: 'mocha', surface: 'slate', layers: 1, whip: false, straw: false, ice: 4 } },
  { id: 'cc-03', name: 'Salted Caramel Frappe', cat: 'cold-coffee', price: 220, diet: 'veg', spice: 0, kcal: 380, rating: 4.8, votes: 407,
    desc: 'House caramel, crushed ice, cream cap, flaky salt crown.', tags: ['bestseller'],
    art: { kind: 'tallGlass', tone: 'caramel', surface: 'marble', layers: 3, whip: true, straw: true, ice: 2, drizzle: true } },
  { id: 'cc-04', name: 'Hazelnut Cold Brew', cat: 'cold-coffee', price: 210, diet: 'veg', spice: 0, kcal: 120, rating: 4.6, votes: 233,
    desc: '18-hour steep, hazelnut cream float, zero bitterness.', tags: ['chefs'],
    art: { kind: 'tallGlass', tone: 'mocha', surface: 'dark', layers: 2, whip: false, straw: true, ice: 3 } },
  { id: 'cc-05', name: 'Death by Chocolate Frappe', cat: 'cold-coffee', price: 250, diet: 'veg', spice: 0, kcal: 520, rating: 4.7, votes: 361,
    desc: 'Triple chocolate, brownie chunks, fudge-lined glass.', tags: ['bestseller'],
    art: { kind: 'tallGlass', tone: 'chocolate', surface: 'dark', layers: 3, whip: true, straw: true, drizzle: true } },
  { id: 'cc-06', name: 'Biscoff Cookie Frappe', cat: 'cold-coffee', price: 260, diet: 'veg', spice: 0, kcal: 470, rating: 4.9, votes: 288,
    desc: 'Speculoos spread blended in, cookie crumb rim, cream swirl.', tags: ['new', 'chefs'],
    art: { kind: 'tallGlass', tone: 'caramel', surface: 'wood', layers: 3, whip: true, straw: true, crumb: true } },

  /* ── Shakes & Smoothies (5) ─────────────────────────────────────────── */
  { id: 'sh-01', name: 'Alphonso Mango Shake', cat: 'shakes', price: 190, diet: 'veg', spice: 0, kcal: 300, rating: 4.8, votes: 344,
    desc: 'Seasonal Alphonso pulp, chilled milk, saffron thread.', tags: ['bestseller'],
    art: { kind: 'tallGlass', tone: 'mango', surface: 'marble', layers: 2, whip: true, straw: true } },
  { id: 'sh-02', name: 'Sitafal Cream Shake', cat: 'shakes', price: 210, diet: 'veg', spice: 0, kcal: 340, rating: 4.7, votes: 176,
    desc: 'Custard apple scooped by hand, cream, crushed pistachio.', tags: ['chefs'],
    art: { kind: 'tallGlass', tone: 'cream', surface: 'wood', layers: 2, whip: true, straw: true } },
  { id: 'sh-03', name: 'Oreo Thickshake', cat: 'shakes', price: 200, diet: 'veg', spice: 0, kcal: 430, rating: 4.6, votes: 392,
    desc: 'Spoon-standing thick, cookie chunks through and through.', tags: ['bestseller'],
    art: { kind: 'tallGlass', tone: 'charcoal', surface: 'dark', layers: 2, whip: true, straw: true, crumb: true } },
  { id: 'sh-04', name: 'Strawberry Cheesecake Shake', cat: 'shakes', price: 230, diet: 'veg', spice: 0, kcal: 460, rating: 4.7, votes: 205,
    desc: 'Real cheesecake blended in, berry compote ribbon, biscuit base.', tags: ['new'],
    art: { kind: 'tallGlass', tone: 'berry', surface: 'marble', layers: 3, whip: true, straw: true, drizzle: true } },
  { id: 'sh-05', name: 'Mixed Berry Smoothie', cat: 'shakes', price: 210, diet: 'veg', spice: 0, kcal: 210, rating: 4.5, votes: 141,
    desc: 'Blueberry, strawberry, banana and hung curd. No added sugar.', tags: ['light'],
    art: { kind: 'tallGlass', tone: 'berry', surface: 'marble', layers: 3, whip: false, straw: true, jar: true } },

  /* ── Tea & Refreshers (5) ───────────────────────────────────────────── */
  { id: 'te-01', name: 'Kulhad Masala Chai', cat: 'tea', price: 90, diet: 'veg', spice: 1, kcal: 110, rating: 4.8, votes: 521,
    desc: 'Ginger, clove, green cardamom — boiled down in a clay kulhad.', tags: ['bestseller'],
    art: { kind: 'kulhad', tone: 'chai', surface: 'wood', steam: true } },
  { id: 'te-02', name: 'Tandoori Chai', cat: 'tea', price: 130, diet: 'veg', spice: 1, kcal: 140, rating: 4.7, votes: 289,
    desc: 'Poured over a red-hot kulhad for a smoky, caramelised edge.', tags: ['chefs'],
    art: { kind: 'kulhad', tone: 'chai', surface: 'slate', steam: true, smoke: true } },
  { id: 'te-03', name: 'Kashmiri Kahwa', cat: 'tea', price: 140, diet: 'veg', spice: 0, kcal: 60, rating: 4.5, votes: 118,
    desc: 'Green tea, saffron, cinnamon and slivered almonds. Served clear.', tags: ['light'],
    art: { kind: 'kulhad', tone: 'saffron', surface: 'dark', steam: true, glass: true } },
  { id: 'te-04', name: 'Mint & Lime Virgin Mojito', cat: 'tea', price: 160, diet: 'veg', spice: 0, kcal: 130, rating: 4.6, votes: 264,
    desc: 'Muddled mint, lime wheels, crushed ice, soda snap.', tags: ['bestseller', 'light'],
    art: { kind: 'tallGlass', tone: 'mint', surface: 'marble', layers: 1, whip: false, straw: true, ice: 5, mint: true } },
  { id: 'te-05', name: 'Kesar Pista Lassi', cat: 'tea', price: 170, diet: 'veg', spice: 0, kcal: 280, rating: 4.7, votes: 231,
    desc: 'Thick set curd churned with saffron, pistachio and rose.', tags: [],
    art: { kind: 'tallGlass', tone: 'saffron', surface: 'wood', layers: 2, whip: true, straw: false, jar: true } },

  /* ── All-Day Breakfast (5) ──────────────────────────────────────────── */
  { id: 'bf-01', name: 'Belgian Waffle, Maple & Berries', cat: 'breakfast', price: 250, diet: 'egg', spice: 0, kcal: 420, rating: 4.7, votes: 298,
    desc: 'Crisp-edged waffle, warm maple, blueberries, vanilla cream.', tags: ['bestseller'],
    art: { kind: 'breakfastPlate', tone: 'caramel', surface: 'marble', style: 'waffle' } },
  { id: 'bf-02', name: 'Masala Cheese Omelette', cat: 'breakfast', price: 190, diet: 'egg', spice: 2, kcal: 360, rating: 4.6, votes: 213,
    desc: 'Three eggs, onion, chilli, coriander, molten cheddar core.', tags: [],
    art: { kind: 'breakfastPlate', tone: 'mango', surface: 'wood', style: 'omelette' } },
  { id: 'bf-03', name: 'Akuri on Sourdough', cat: 'breakfast', price: 230, diet: 'egg', spice: 2, kcal: 400, rating: 4.7, votes: 156,
    desc: 'Parsi-style soft scramble, buttered sourdough, crisp sev.', tags: ['chefs'],
    art: { kind: 'breakfastPlate', tone: 'saffron', surface: 'slate', style: 'scramble' } },
  { id: 'bf-04', name: 'Buttermilk Pancake Stack', cat: 'breakfast', price: 240, diet: 'egg', spice: 0, kcal: 480, rating: 4.6, votes: 227,
    desc: 'Four fluffy discs, salted butter puck, maple flood.', tags: [],
    art: { kind: 'breakfastPlate', tone: 'caramel', surface: 'marble', style: 'pancake' } },
  { id: 'bf-05', name: 'Kathiyawadi Poha Bowl', cat: 'breakfast', price: 150, diet: 'veg', spice: 1, kcal: 290, rating: 4.5, votes: 173,
    desc: 'Steamed poha, curry leaf tadka, sev, lemon and fried chilli.', tags: ['light'],
    art: { kind: 'breakfastPlate', tone: 'saffron', surface: 'wood', style: 'bowl' } },

  /* ── Sandwiches & Toasties (4) ──────────────────────────────────────── */
  { id: 'sw-01', name: 'Bombay Masala Grilled Sandwich', cat: 'sandwich', price: 180, diet: 'veg', spice: 2, kcal: 380, rating: 4.7, votes: 366,
    desc: 'Potato masala, beetroot, cucumber, green chutney, butter-pressed.', tags: ['bestseller'],
    art: { kind: 'stack', tone: 'spinach', surface: 'wood', style: 'sandwich' } },
  { id: 'sw-02', name: 'Paneer Tikka Toastie', cat: 'sandwich', price: 230, diet: 'veg', spice: 2, kcal: 450, rating: 4.6, votes: 241,
    desc: 'Tandoori paneer, capsicum, mint mayo on grilled sourdough.', tags: [],
    art: { kind: 'stack', tone: 'tandoori', surface: 'slate', style: 'sandwich' } },
  { id: 'sw-03', name: 'Corn & Cheese Jalapeño Grill', cat: 'sandwich', price: 210, diet: 'veg', spice: 2, kcal: 420, rating: 4.5, votes: 189,
    desc: 'Sweet corn, three cheeses, pickled jalapeño, oregano butter.', tags: [],
    art: { kind: 'stack', tone: 'mango', surface: 'marble', style: 'sandwich' } },
  { id: 'sw-04', name: 'Peri-Peri Veg Club', cat: 'sandwich', price: 250, diet: 'veg', spice: 3, kcal: 510, rating: 4.6, votes: 152,
    desc: 'Triple-decker, peri mayo, crisp veg, cheese slab, wafer stack.', tags: ['spicy'],
    art: { kind: 'stack', tone: 'tomato', surface: 'wood', style: 'club' } },

  /* ── Burgers & Wraps (4) ────────────────────────────────────────────── */
  { id: 'bg-01', name: 'Crispy Aloo Tikki Burger', cat: 'burger', price: 160, diet: 'veg', spice: 1, kcal: 430, rating: 4.6, votes: 318,
    desc: 'Spiced potato tikki, tangy slaw, house burger sauce, brioche.', tags: ['bestseller'],
    art: { kind: 'stack', tone: 'caramel', surface: 'wood', style: 'burger' } },
  { id: 'bg-02', name: 'Tandoori Paneer Burger', cat: 'burger', price: 230, diet: 'veg', spice: 2, kcal: 520, rating: 4.7, votes: 244,
    desc: 'Charred paneer slab, mint mayo, onion rings, cheddar drape.', tags: ['chefs'],
    art: { kind: 'stack', tone: 'tandoori', surface: 'slate', style: 'burger' } },
  { id: 'bg-03', name: 'Makhani Paneer Wrap', cat: 'burger', price: 220, diet: 'veg', spice: 2, kcal: 470, rating: 4.6, votes: 197,
    desc: 'Butter-masala paneer rolled in a laccha paratha with slaw.', tags: [],
    art: { kind: 'stack', tone: 'tomato', surface: 'wood', style: 'wrap' } },
  { id: 'bg-04', name: 'Falafel & Hummus Wrap', cat: 'burger', price: 240, diet: 'veg', spice: 1, kcal: 440, rating: 4.5, votes: 128,
    desc: 'Crushed chickpea fritters, tahini hummus, pickles, sumac onion.', tags: ['new', 'light'],
    art: { kind: 'stack', tone: 'spinach', surface: 'marble', style: 'wrap' } },

  /* ── Wood-Fired Pizza (5) ───────────────────────────────────────────── */
  { id: 'pz-01', name: 'Margherita Bufala', cat: 'pizza', price: 280, diet: 'veg', spice: 0, kcal: 620, rating: 4.7, votes: 402,
    desc: 'San Marzano sauce, buffalo mozzarella, torn basil, olive oil.', tags: ['bestseller'],
    art: { kind: 'pizzaTop', tone: 'tomato', surface: 'wood', toppings: ['basil', 'cheese'] } },
  { id: 'pz-02', name: 'Tandoori Paneer Tikka Pizza', cat: 'pizza', price: 360, diet: 'veg', spice: 2, kcal: 760, rating: 4.8, votes: 351,
    desc: 'Tikka paneer, red onion, capsicum, mint drizzle, chaat masala.', tags: ['bestseller', 'chefs'],
    art: { kind: 'pizzaTop', tone: 'tandoori', surface: 'slate', toppings: ['paneer', 'onion', 'pepper'] } },
  { id: 'pz-03', name: 'Farmhouse Garden Pizza', cat: 'pizza', price: 340, diet: 'veg', spice: 1, kcal: 690, rating: 4.5, votes: 276,
    desc: 'Mushroom, sweet corn, olives, peppers, tomato, oregano.', tags: [],
    art: { kind: 'pizzaTop', tone: 'spinach', surface: 'marble', toppings: ['mushroom', 'olive', 'corn', 'pepper'] } },
  { id: 'pz-04', name: 'Makhani Paneer & Corn Pizza', cat: 'pizza', price: 380, diet: 'veg', spice: 1, kcal: 780, rating: 4.6, votes: 188,
    desc: 'Butter-masala base instead of marinara, paneer, corn, cream swirl.', tags: ['new'],
    art: { kind: 'pizzaTop', tone: 'curry', surface: 'wood', toppings: ['paneer', 'corn'] } },
  { id: 'pz-05', name: 'Peri-Peri Cheese Burst', cat: 'pizza', price: 420, diet: 'veg', spice: 3, kcal: 890, rating: 4.7, votes: 233,
    desc: 'Molten cheese-filled crust, peri sauce, jalapeño, chilli flakes.', tags: ['spicy', 'chefs'],
    art: { kind: 'pizzaTop', tone: 'chilli', surface: 'dark', toppings: ['jalapeno', 'cheese', 'chilli'] } },

  /* ── Pasta & Continental (4) ────────────────────────────────────────── */
  { id: 'co-01', name: 'Alfredo Penne, Herb Mushroom', cat: 'continental', price: 320, diet: 'veg', spice: 0, kcal: 640, rating: 4.6, votes: 264,
    desc: 'Parmesan cream, thyme mushrooms, cracked pepper, garlic crumb.', tags: ['bestseller'],
    art: { kind: 'pastaBowl', tone: 'cream', surface: 'marble', sauce: 'white' } },
  { id: 'co-02', name: 'Arrabbiata Spaghetti', cat: 'continental', price: 300, diet: 'veg', spice: 3, kcal: 560, rating: 4.5, votes: 198,
    desc: 'Slow tomato sugo, dried chilli, basil, aged parmesan shards.', tags: ['spicy'],
    art: { kind: 'pastaBowl', tone: 'tomato', surface: 'wood', sauce: 'red' } },
  { id: 'co-03', name: 'Baked Four-Cheese Pasta', cat: 'continental', price: 340, diet: 'veg', spice: 1, kcal: 780, rating: 4.7, votes: 221,
    desc: 'Pink sauce, mozzarella lid baked until blistered and bubbling.', tags: ['chefs'],
    art: { kind: 'pastaBowl', tone: 'caramel', surface: 'slate', sauce: 'pink', baked: true } },
  { id: 'co-04', name: 'Mexican Rice Sizzler', cat: 'continental', price: 360, diet: 'veg', spice: 2, kcal: 720, rating: 4.6, votes: 176,
    desc: 'Cheesy rice, refried beans, grilled veg, cast-iron and steam.', tags: [],
    art: { kind: 'skewerSlate', tone: 'tomato', surface: 'slate', style: 'sizzler', sizzle: true } },

  /* ── Tandoori & Starters (5) ────────────────────────────────────────── */
  { id: 'st-01', name: 'Achari Paneer Tikka', cat: 'starters', price: 340, diet: 'veg', spice: 2, kcal: 480, rating: 4.8, votes: 389,
    desc: 'Pickle-spiced hung curd marinade, charred edges, mint chutney.', tags: ['bestseller', 'chefs'],
    art: { kind: 'skewerSlate', tone: 'tandoori', surface: 'slate', sizzle: true } },
  { id: 'st-02', name: 'Malai Broccoli & Baby Corn', cat: 'starters', price: 330, diet: 'veg', spice: 1, kcal: 360, rating: 4.6, votes: 214,
    desc: 'Cheddar-cream marinade, cardamom, gentle char, lemon dust.', tags: [],
    art: { kind: 'skewerSlate', tone: 'cream', surface: 'wood', style: 'malai' } },
  { id: 'st-03', name: 'Hara Bhara Kebab', cat: 'starters', price: 280, diet: 'veg', spice: 1, kcal: 340, rating: 4.5, votes: 167,
    desc: 'Spinach, green peas and paneer patties, crisp outside, soft in.', tags: ['light'],
    art: { kind: 'cone', tone: 'spinach', surface: 'wood', style: 'kebab' } },
  { id: 'st-04', name: 'Cheese Chilli Garlic Fries', cat: 'starters', price: 190, diet: 'veg', spice: 2, kcal: 520, rating: 4.7, votes: 431,
    desc: 'Skin-on fries, molten cheese, chilli-garlic oil, spring onion.', tags: ['bestseller'],
    art: { kind: 'cone', tone: 'caramel', surface: 'slate', style: 'fries' } },
  { id: 'st-05', name: 'Loaded Nachos Grande', cat: 'starters', price: 260, diet: 'veg', spice: 2, kcal: 580, rating: 4.6, votes: 302,
    desc: 'Corn chips, rajma salsa, cheese sauce, jalapeño, sour cream.', tags: [],
    art: { kind: 'cone', tone: 'tomato', surface: 'wood', style: 'nachos' } },

  /* ── North Indian Mains (7) ─────────────────────────────────────────── */
  { id: 'mn-01', name: 'Paneer Butter Masala', cat: 'mains', price: 340, diet: 'veg', spice: 1, kcal: 560, rating: 4.8, votes: 574,
    desc: 'Tomato-cashew gravy, white butter finish, honey-soft paneer.', tags: ['bestseller', 'chefs'],
    art: { kind: 'curryBowl', tone: 'tomato', surface: 'wood', chunks: 'cubes', cream: true } },
  { id: 'mn-02', name: 'Dal Makhani', cat: 'mains', price: 290, diet: 'veg', spice: 1, kcal: 470, rating: 4.8, votes: 498,
    desc: 'Urad dal simmered twelve hours on low coal, cream swirl.', tags: ['bestseller'],
    art: { kind: 'curryBowl', tone: 'chocolate', surface: 'slate', chunks: 'none', cream: true } },
  { id: 'mn-03', name: 'Shahi Kaju Curry', cat: 'mains', price: 360, diet: 'veg', spice: 1, kcal: 610, rating: 4.6, votes: 202,
    desc: 'Roasted cashews in a mild white korma with rose and mace.', tags: [],
    art: { kind: 'curryBowl', tone: 'cream', surface: 'marble', chunks: 'nuts', cream: true } },
  { id: 'mn-04', name: 'Palak Paneer', cat: 'mains', price: 320, diet: 'veg', spice: 1, kcal: 430, rating: 4.6, votes: 287,
    desc: 'Blanched spinach purée, ginger, garlic tempering, cubed paneer.', tags: ['light'],
    art: { kind: 'curryBowl', tone: 'spinach', surface: 'wood', chunks: 'cubes', cream: true } },
  { id: 'mn-05', name: 'Kadhai Paneer', cat: 'mains', price: 340, diet: 'veg', spice: 2, kcal: 500, rating: 4.7, votes: 263,
    desc: 'Hand-pounded kadhai masala, peppers, onion petals, semi-dry.', tags: [],
    art: { kind: 'curryBowl', tone: 'chilli', surface: 'slate', chunks: 'peppers' } },
  { id: 'mn-06', name: 'Malai Kofta', cat: 'mains', price: 350, diet: 'veg', spice: 0, kcal: 590, rating: 4.5, votes: 158,
    desc: 'Paneer-and-khoya dumplings in a saffron cream gravy.', tags: [],
    art: { kind: 'curryBowl', tone: 'saffron', surface: 'marble', chunks: 'balls', cream: true } },
  { id: 'mn-07', name: 'Kathiyawadi Sev Tameta', cat: 'mains', price: 250, diet: 'veg', spice: 2, kcal: 380, rating: 4.7, votes: 246,
    desc: 'Rustic tomato masala finished with a mountain of crisp sev.', tags: ['chefs'],
    art: { kind: 'curryBowl', tone: 'chilli', surface: 'wood', chunks: 'sev' } },

  /* ── Breads & Rice (6) ──────────────────────────────────────────────── */
  { id: 'br-01', name: 'Butter Naan', cat: 'breads', price: 60, diet: 'veg', spice: 0, kcal: 260, rating: 4.7, votes: 611,
    desc: 'Slapped on the tandoor wall, brushed with Amul butter.', tags: ['bestseller'],
    art: { kind: 'breadBasket', tone: 'caramel', surface: 'wood', style: 'naan' } },
  { id: 'br-02', name: 'Garlic Cheese Naan', cat: 'breads', price: 120, diet: 'veg', spice: 0, kcal: 420, rating: 4.8, votes: 447,
    desc: 'Mozzarella stuffed, garlic-coriander butter, pull-apart soft.', tags: ['bestseller'],
    art: { kind: 'breadBasket', tone: 'cream', surface: 'slate', style: 'naan', cheese: true } },
  { id: 'br-03', name: 'Laccha Paratha', cat: 'breads', price: 80, diet: 'veg', spice: 0, kcal: 300, rating: 4.6, votes: 238,
    desc: 'Hand-rolled into a hundred flaky layers, ghee finished.', tags: [],
    art: { kind: 'breadBasket', tone: 'caramel', surface: 'wood', style: 'paratha' } },
  { id: 'br-04', name: 'Tandoori Roti (Butter)', cat: 'breads', price: 45, diet: 'veg', spice: 0, kcal: 180, rating: 4.5, votes: 302,
    desc: 'Whole wheat, blistered dark, light brush of butter.', tags: ['light'],
    art: { kind: 'breadBasket', tone: 'chocolate', surface: 'slate', style: 'roti' } },
  { id: 'br-05', name: 'Hyderabadi Veg Dum Biryani', cat: 'breads', price: 320, diet: 'veg', spice: 2, kcal: 640, rating: 4.7, votes: 388,
    desc: 'Sealed handi, long-grain rice, saffron milk, burhani raita.', tags: ['bestseller', 'chefs'],
    art: { kind: 'riceMound', tone: 'saffron', surface: 'wood', style: 'biryani' } },
  { id: 'br-06', name: 'Jeera Rice', cat: 'breads', price: 170, diet: 'veg', spice: 0, kcal: 340, rating: 4.4, votes: 176,
    desc: 'Basmati tossed with ghee-bloomed cumin and fried onion.', tags: [],
    art: { kind: 'riceMound', tone: 'cream', surface: 'marble', style: 'jeera' } },

  /* ── Desserts & Bakes (5) ───────────────────────────────────────────── */
  { id: 'ds-01', name: 'Molten Chocolate Lava Cake', cat: 'desserts', price: 220, diet: 'egg', spice: 0, kcal: 480, rating: 4.9, votes: 512,
    desc: 'Cracked open at the table, dark centre floods the plate.', tags: ['bestseller', 'chefs'],
    art: { kind: 'dessertPlate', tone: 'chocolate', surface: 'dark', style: 'lava' } },
  { id: 'ds-02', name: 'Tiramisu Jar', cat: 'desserts', price: 240, diet: 'egg', spice: 0, kcal: 410, rating: 4.7, votes: 268,
    desc: 'Espresso-soaked savoiardi, mascarpone clouds, cocoa veil.', tags: [],
    art: { kind: 'dessertPlate', tone: 'mocha', surface: 'slate', style: 'jar' } },
  { id: 'ds-03', name: 'New York Baked Cheesecake', cat: 'desserts', price: 260, diet: 'egg', spice: 0, kcal: 520, rating: 4.6, votes: 224,
    desc: 'Dense, tangy, biscuit base, blueberry compote spoon.', tags: [],
    art: { kind: 'dessertPlate', tone: 'berry', surface: 'marble', style: 'slice' } },
  { id: 'ds-04', name: 'Gulab Jamun with Rabdi', cat: 'desserts', price: 180, diet: 'veg', spice: 0, kcal: 440, rating: 4.7, votes: 341,
    desc: 'Warm khoya dumplings drowning in saffron-thickened milk.', tags: ['bestseller'],
    art: { kind: 'sundae', tone: 'saffron', surface: 'wood', style: 'jamun' } },
  { id: 'ds-05', name: 'Sizzling Brownie & Ice Cream', cat: 'desserts', price: 280, diet: 'egg', spice: 0, kcal: 690, rating: 4.8, votes: 456,
    desc: 'Walnut brownie on iron, vanilla scoop, hot fudge poured over.', tags: ['bestseller', 'chefs'],
    art: { kind: 'sundae', tone: 'chocolate', surface: 'slate', style: 'sizzler', sizzle: true } }
];

/* ------------------------------------------------------------------ add-ons
   Keyed by category. Applied per cart line so two of the same dish with
   different add-ons stay separate lines.                                    */
SRC.ADDONS = {
  'hot-coffee':  [{ id: 'shot', label: 'Extra espresso shot', price: 40 }, { id: 'oat', label: 'Oat milk swap', price: 40 }, { id: 'syrup', label: 'Hazelnut syrup', price: 30 }],
  'cold-coffee': [{ id: 'shot', label: 'Extra espresso shot', price: 40 }, { id: 'scoop', label: 'Ice cream scoop', price: 50 }, { id: 'nosugar', label: 'No sugar', price: 0 }],
  'shakes':      [{ id: 'scoop', label: 'Ice cream scoop', price: 50 }, { id: 'nuts', label: 'Roasted nut topping', price: 35 }, { id: 'nosugar', label: 'No added sugar', price: 0 }],
  'tea':         [{ id: 'ginger', label: 'Extra ginger', price: 10 }, { id: 'kulhad', label: 'Serve in kulhad', price: 15 }, { id: 'nosugar', label: 'No sugar', price: 0 }],
  'breakfast':   [{ id: 'cheese', label: 'Extra cheese', price: 40 }, { id: 'toast', label: 'Add 2 toasts', price: 45 }, { id: 'butterless', label: 'No butter', price: 0 }],
  'sandwich':    [{ id: 'cheese', label: 'Extra cheese', price: 40 }, { id: 'fries', label: 'Side of fries', price: 90 }, { id: 'grill', label: 'Extra crisp grill', price: 0 }],
  'burger':      [{ id: 'cheese', label: 'Cheese slice', price: 35 }, { id: 'patty', label: 'Double patty', price: 80 }, { id: 'fries', label: 'Side of fries', price: 90 }],
  'pizza':       [{ id: 'cheese', label: 'Extra cheese', price: 60 }, { id: 'jalapeno', label: 'Jalapeño & olives', price: 40 }, { id: 'thin', label: 'Thin crust', price: 0 }],
  'continental': [{ id: 'cheese', label: 'Cheese bake top', price: 50 }, { id: 'garlic', label: 'Garlic bread side', price: 80 }, { id: 'mild', label: 'Make it mild', price: 0 }],
  'starters':    [{ id: 'chutney', label: 'Extra mint chutney', price: 20 }, { id: 'cheese', label: 'Cheese drizzle', price: 40 }, { id: 'jain', label: 'Jain (no onion/garlic)', price: 0 }],
  'mains':       [{ id: 'butter', label: 'Extra white butter', price: 25 }, { id: 'gravy', label: 'Extra gravy', price: 60 }, { id: 'jain', label: 'Jain (no onion/garlic)', price: 0 }],
  'breads':      [{ id: 'butter', label: 'Extra butter brush', price: 15 }, { id: 'raita', label: 'Boondi raita', price: 70 }, { id: 'ghee', label: 'Ghee finish', price: 20 }],
  'desserts':    [{ id: 'scoop', label: 'Extra ice cream scoop', price: 50 }, { id: 'fudge', label: 'Hot fudge', price: 40 }, { id: 'candle', label: 'Birthday candle', price: 0 }]
};

/* ------------------------------------------------------------------ coupons */
SRC.COUPONS = {
  WELCOME10:  { type: 'pct',  value: 10, cap: 75,  min: 249, label: '10% off your first order (max ₹75)' },
  SPECIALS50: { type: 'flat', value: 50,           min: 399, label: 'Flat ₹50 off above ₹399' },
  FREESHIP:   { type: 'ship', value: 0,            min: 299, label: 'Free delivery above ₹299' },
  CAFE20:     { type: 'pct',  value: 20, cap: 150, min: 699, label: '20% off big orders (max ₹150)' }
};

/* ---------------------------------------------------------- delivery slots */
SRC.SLOTS = [
  { id: 'asap',  label: 'Standard',   note: 'in ~32 min', extra: 0 },
  { id: 'rush',  label: 'Priority',   note: 'in ~20 min', extra: 49 },
  { id: 'later', label: 'Schedule',   note: 'pick a time', extra: 0 }
];

SRC.TRACK_STEPS = [
  { id: 'placed',   title: 'Order placed',      note: 'We have your order and payment.' },
  { id: 'accepted', title: 'Kitchen accepted',  note: 'Chef Rathod has the ticket.' },
  { id: 'cooking',  title: 'On the tandoor',    note: 'Breads going in last so they arrive warm.' },
  { id: 'packed',   title: 'Sealed & packed',   note: 'Gravy jarred, tamper seal on.' },
  { id: 'rider',    title: 'Out for delivery',  note: 'Rider heading down Airport Road.' },
  { id: 'done',     title: 'Delivered',         note: 'No-contact drop complete. Enjoy!' }
];

/* -------------------------------------------------------------- experience */
SRC.JOURNEY = [
  { n: '01', title: 'Beans, not powder', body: 'Green beans arrive from Chikmagalur estates and rest for 10 days before we roast in 6 kg batches.' },
  { n: '02', title: 'Roast on Tuesdays', body: 'A medium-dark profile pulled 40 seconds before second crack — sweet, low-acid, built for milk.' },
  { n: '03', title: 'Dough at midnight', body: '48-hour cold ferment for pizza, overnight sponge for brioche. Both are folded by hand.' },
  { n: '04', title: 'Charcoal by four', body: 'The tandoor is lit at 4 pm and never drops below 380°C until the last order.' },
  { n: '05', title: 'Plated, then out', body: 'Dine-in leaves the pass in under 90 seconds. Delivery gets jarred gravies and buttered paper.' }
];

SRC.GALLERY = [
  { caption: 'The lever machine at golden hour', art: { kind: 'cupTop', tone: 'caramel', surface: 'dark', foam: 'rosetta' } },
  { caption: 'Tandoor open, 4:07 pm',            art: { kind: 'skewerSlate', tone: 'tandoori', surface: 'slate', sizzle: true } },
  { caption: 'Stone oven, 400 degrees',          art: { kind: 'pizzaTop', tone: 'tomato', surface: 'wood', toppings: ['basil', 'cheese'] } },
  { caption: 'Copper handi, twelve hours in',    art: { kind: 'curryBowl', tone: 'chocolate', surface: 'slate', cream: true, chunks: 'none' } },
  { caption: 'Kulhad chai on the courtyard wall', art: { kind: 'kulhad', tone: 'chai', surface: 'wood', steam: true } },
  { caption: 'Frappe bar, 6 pm rush',            art: { kind: 'tallGlass', tone: 'caramel', surface: 'marble', layers: 3, whip: true, straw: true, drizzle: true } },
  { caption: 'Naan basket leaving the pass',     art: { kind: 'breadBasket', tone: 'caramel', surface: 'wood', style: 'naan' } },
  { caption: 'Lava cake, cracked open',          art: { kind: 'dessertPlate', tone: 'chocolate', surface: 'dark', style: 'lava' } }
];

/* Sample copy — PLACEHOLDER. Swap for real, permissioned guest reviews. */
SRC.REVIEWS = [
  { name: 'Rutvi P.',   when: '2 weeks ago', stars: 5, text: 'The kesar badam latte is a genuinely original drink and the paneer butter masala tastes like someone’s grandmother is still checking it. Drive-through window saved us on a late flight night.' },
  { name: 'Aakash M.',  when: '1 month ago', stars: 5, text: 'Came for coffee, stayed three hours. Dal makhani is the real deal — smoky, unhurried. Staff kept the table even when it got busy.' },
  { name: 'Zeel S.',    when: '1 month ago', stars: 4, text: 'Wood-fired margherita has a proper leopard-spotted crust, rare in Jamnagar. Weekend wait can hit 20 minutes, so reserve.' },
  { name: 'Harsh V.',   when: '2 months ago', stars: 5, text: 'Ordered for eleven people. Everything arrived hot, gravies sealed in jars, breads still soft. Delivery guy called before ringing the bell.' },
  { name: 'Nidhi J.',   when: '3 months ago', stars: 5, text: 'Sizzling brownie is theatre. Kids loved it. Prices are fair for the portion size.' },
  { name: 'Pratik D.',  when: '3 months ago', stars: 4, text: 'Achari paneer tikka is the standout. Would like a couple more Jain options on the pizza side.' }
];

SRC.FAQ = [
  { q: 'How late is the kitchen open?', a: 'Every day, 9:00 am to 12:30 am. Last kitchen order goes in at 12:00 am; the coffee window keeps pouring until the shutter drops.' },
  { q: 'How far do you deliver?', a: 'Roughly 7 km around Airport Road — Park Colony, Patel Colony, Summair Club Road, Indira Marg, Bedi Bandar Road and Digjam Circle included. Free above ₹499.' },
  { q: 'Is the kitchen vegetarian?', a: 'Yes. The kitchen is pure vegetarian; a few bakes and breakfast plates contain egg and carry an amber dot. Jain preparations are available on most mains and starters.' },
  { q: 'Can I reserve for a large group?', a: 'Tables up to 20 can be booked from this page. For 20+ or a full-courtyard buyout, call us and we will block the slot manually.' },
  { q: 'How does the drive-through work?', a: 'Order at the Airport Road window or place it here and pick “Drive-through pickup”. Average hand-off is four minutes.' }
];
