// =============================================================================
// LESSONS DATA — Vokabeln und Sätze
// =============================================================================

const CATEGORIES = [
  // ─── BEGRÜSSUNG & HÖFLICHKEIT ─────────────────────────────────────────
  {
    id: 'greetings',
    name: 'Begrüßung',
    emoji: '👋',
    color: '#5b8db8',
    words: [
      { id: 'hallo',     german: 'Hallo',      emoji: '👋' },
      { id: 'tschuess',  german: 'Tschüss',    emoji: '🙋' },
      { id: 'ja',        german: 'Ja',          emoji: '👍' },
      { id: 'nein',      german: 'Nein',        emoji: '👎' },
      { id: 'danke',     german: 'Danke',       emoji: '🙏' },
      { id: 'bitte',     german: 'Bitte',       emoji: '🤲' },
    ],
    sentences: [
      { id: 'guten_morgen',    german: 'Guten Morgen',         emojis: ['☀️', '👋'] },
      { id: 'guten_tag',       german: 'Guten Tag',            emojis: ['🌤️', '👋'] },
      { id: 'gute_nacht',      german: 'Gute Nacht',           emojis: ['🌙', '👋'] },
      { id: 'wie_geht_es',     german: 'Wie geht es Ihnen?',   emojis: ['❓', '😊'] },
      { id: 'gut_danke',       german: 'Gut, danke!',          emojis: ['😊', '🙏'] },
      { id: 'auf_wiedersehen', german: 'Auf Wiedersehen',      emojis: ['👋', '🚶'] },
    ]
  },

  // ─── ESSEN & TRINKEN ──────────────────────────────────────────────────
  {
    id: 'food',
    name: 'Essen & Trinken',
    emoji: '🍎',
    color: '#d4816b',
    words: [
      { id: 'wasser',  german: 'Wasser',   emoji: '💧' },
      { id: 'brot',    german: 'Brot',      emoji: '🍞' },
      { id: 'apfel',   german: 'Apfel',     emoji: '🍎' },
      { id: 'kaffee',  german: 'Kaffee',    emoji: '☕' },
      { id: 'tee',     german: 'Tee',       emoji: '🍵' },
      { id: 'milch',   german: 'Milch',     emoji: '🥛' },
      { id: 'reis',    german: 'Reis',      emoji: '🍚' },
      { id: 'ei',      german: 'Ei',        emoji: '🥚' },
      { id: 'banane',  german: 'Banane',    emoji: '🍌' },
      { id: 'suppe',   german: 'Suppe',     emoji: '🍲' },
    ],
    sentences: [
      { id: 'ich_habe_hunger',    german: 'Ich habe Hunger',       emojis: ['🙋', '😋'] },
      { id: 'ich_habe_durst',     german: 'Ich habe Durst',        emojis: ['🙋', '🥵', '💧'] },
      { id: 'ich_moechte_wasser', german: 'Ich möchte Wasser',     emojis: ['🙋', '👉', '💧'] },
      { id: 'ich_moechte_brot',   german: 'Ich möchte Brot',       emojis: ['🙋', '👉', '🍞'] },
      { id: 'ich_moechte_kaffee', german: 'Ich möchte Kaffee',     emojis: ['🙋', '👉', '☕'] },
      { id: 'das_schmeckt_gut',   german: 'Das schmeckt gut',      emojis: ['🍽️', '😊', '👍'] },
    ]
  },

  // ─── ALLTAG & ZUHAUSE ─────────────────────────────────────────────────
  {
    id: 'home',
    name: 'Alltag & Zuhause',
    emoji: '🏠',
    color: '#8b7dba',
    words: [
      { id: 'tuer',      german: 'Tür',        emoji: '🚪' },
      { id: 'fenster',   german: 'Fenster',     emoji: '🪟' },
      { id: 'bett',      german: 'Bett',        emoji: '🛏️' },
      { id: 'stuhl',     german: 'Stuhl',       emoji: '🪑' },
      { id: 'tisch',     german: 'Tisch',       emoji: '🪵' },
      { id: 'toilette',  german: 'Toilette',    emoji: '🚽' },
      { id: 'kueche',    german: 'Küche',       emoji: '🍳' },
      { id: 'dusche',    german: 'Dusche',      emoji: '🚿' },
      { id: 'schluessel',german: 'Schlüssel',   emoji: '🔑' },
      { id: 'telefon',   german: 'Telefon',     emoji: '📱' },
    ],
    sentences: [
      { id: 'wo_ist_toilette',  german: 'Wo ist die Toilette?',    emojis: ['❓', '🚽'] },
      { id: 'ich_gehe_schlafen',german: 'Ich gehe schlafen',       emojis: ['🙋', '🛏️', '😴'] },
      { id: 'ich_brauche_hilfe',german: 'Ich brauche Hilfe',       emojis: ['🙋', '🆘'] },
      { id: 'die_tuer_ist_zu',  german: 'Die Tür ist zu',          emojis: ['🚪', '🔒'] },
      { id: 'die_tuer_ist_auf', german: 'Die Tür ist auf',         emojis: ['🚪', '🔓'] },
    ]
  },

  // ─── KÖRPERPFLEGE & KLEIDUNG ──────────────────────────────────────────
  {
    id: 'hygiene',
    name: 'Körperpflege',
    emoji: '🧼',
    color: '#5aadad',
    words: [
      { id: 'duschen',      german: 'duschen',       emoji: '🚿' },
      { id: 'waschen',      german: 'waschen',       emoji: '🧼' },
      { id: 'zaehne_putzen',german: 'Zähne putzen',  emoji: '🪥' },
      { id: 'seife',        german: 'Seife',         emoji: '🧴' },
      { id: 'handtuch',     german: 'Handtuch',      emoji: '🛁' },
      { id: 'zahnbuerste',  german: 'Zahnbürste',    emoji: '🪥' },
      { id: 'kleidung',     german: 'Kleidung',      emoji: '👕' },
      { id: 'hose',         german: 'Hose',          emoji: '👖' },
      { id: 'tshirt',       german: 'T-Shirt',       emoji: '👕' },
      { id: 'schuhe',       german: 'Schuhe',        emoji: '👟' },
      { id: 'jacke',        german: 'Jacke',         emoji: '🧥' },
      { id: 'socken',       german: 'Socken',        emoji: '🧦' },
    ],
    sentences: [
      { id: 'ich_muss_duschen',        german: 'Ich muss duschen',              emojis: ['🙋', '🚿'] },
      { id: 'ich_muss_zaehne_putzen',  german: 'Ich muss Zähne putzen',         emojis: ['🙋', '🪥'] },
      { id: 'ich_muss_mich_waschen',   german: 'Ich muss mich waschen',         emojis: ['🙋', '🧼'] },
      { id: 'ich_muss_mich_umziehen',  german: 'Ich muss mich umziehen',        emojis: ['🙋', '🔄', '👕'] },
      { id: 'ich_brauche_handtuch',    german: 'Ich brauche ein Handtuch',      emojis: ['🙋', '👉', '🛁'] },
      { id: 'ich_brauche_kleidung',    german: 'Ich brauche saubere Kleidung',  emojis: ['🙋', '👉', '👕', '✨'] },
      { id: 'wo_ist_meine_jacke',      german: 'Wo ist meine Jacke?',           emojis: ['❓', '🧥'] },
      { id: 'die_kleidung_ist_schmutzig', german: 'Die Kleidung ist schmutzig', emojis: ['👕', '💩'] },
    ]
  },

  // ─── GEFÜHLE & GESUNDHEIT ─────────────────────────────────────────────
  {
    id: 'feelings',
    name: 'Gefühle',
    emoji: '😊',
    color: '#7cb97c',
    words: [
      { id: 'gut',        german: 'gut',         emoji: '😊' },
      { id: 'schlecht',   german: 'schlecht',     emoji: '😞' },
      { id: 'muede',      german: 'müde',         emoji: '😴' },
      { id: 'krank',      german: 'krank',        emoji: '🤒' },
      { id: 'schmerzen',  german: 'Schmerzen',    emoji: '🤕' },
      { id: 'arzt',       german: 'Arzt',         emoji: '👨‍⚕️' },
      { id: 'kopf',       german: 'Kopf',         emoji: '🧠' },
      { id: 'bauch',      german: 'Bauch',        emoji: '🫃' },
      { id: 'gluecklich', german: 'glücklich',     emoji: '😄' },
      { id: 'traurig',    german: 'traurig',      emoji: '😢' },
    ],
    sentences: [
      { id: 'mir_geht_gut',         german: 'Mir geht es gut',           emojis: ['🙋', '😊', '👍'] },
      { id: 'mir_geht_schlecht',    german: 'Mir geht es schlecht',      emojis: ['🙋', '😞', '👎'] },
      { id: 'ich_bin_muede',        german: 'Ich bin müde',              emojis: ['🙋', '😴'] },
      { id: 'ich_habe_schmerzen',   german: 'Ich habe Schmerzen',        emojis: ['🙋', '🤕'] },
      { id: 'ich_brauche_arzt',     german: 'Ich brauche einen Arzt',    emojis: ['🙋', '🆘', '👨‍⚕️'] },
      { id: 'ich_habe_kopfschmerzen', german: 'Ich habe Kopfschmerzen',  emojis: ['🙋', '🤕', '🧠'] },
      { id: 'ich_habe_bauchschmerzen',german: 'Ich habe Bauchschmerzen', emojis: ['🙋', '🤕', '🫃'] },
    ]
  },

  // ─── WOHNBEREICHSAUFGABEN ──────────────────────────────────────────────
  {
    id: 'chores',
    name: 'Wohnbereichsaufgaben',
    emoji: '🧹',
    color: '#e74c3c',
    words: [
      { id: 'fegen',           german: 'fegen',            emoji: '🧹' },
      { id: 'wischen',         german: 'wischen',          emoji: '🧽' },
      { id: 'muelleimer',      german: 'Mülleimer',        emoji: '🗑️' },
      { id: 'reinigungsmittel',german: 'Reinigungsmittel', emoji: '🧴' },
      { id: 'handschuhe',      german: 'Handschuhe',       emoji: '🧤' },
      { id: 'abspuelen',       german: 'abspülen',         emoji: '🚿' },
      { id: 'geschirr',        german: 'Geschirr',         emoji: '🍽️' },
      { id: 'eimer',           german: 'Eimer',            emoji: '🪣' },
      { id: 'waesche',         german: 'Wäsche',           emoji: '🧺' },
      { id: 'gemeinschaftsraum',german: 'Gemeinschaftsraum',emoji: '🛋️' },
      { id: 'staubsauger',     german: 'Staubsauger',      emoji: '🧹' },
      { id: 'muellbeutel',     german: 'Müllbeutel',       emoji: '🗑️' },
    ],
    sentences: [
      { id: 'ich_muss_fegen',           german: 'Ich muss den Boden fegen',         emojis: ['🙋', '🧹'] },
      { id: 'ich_muss_wischen',         german: 'Ich muss den Boden wischen',       emojis: ['🙋', '🧽'] },
      { id: 'ich_muss_geschirr_spuelen',german: 'Ich muss das Geschirr spülen',     emojis: ['🙋', '🍽️', '🚿'] },
      { id: 'ich_muss_muell_rausbringen',german: 'Ich muss den Müll rausbringen',   emojis: ['🙋', '🗑️', '🚶'] },
      { id: 'wo_ist_reinigungsmittel',  german: 'Wo ist das Reinigungsmittel?',     emojis: ['❓', '🧴'] },
      { id: 'ich_brauche_handschuhe',   german: 'Ich brauche Handschuhe',           emojis: ['🙋', '👉', '🧤'] },
      { id: 'tisch_abwischen',          german: 'Der Tisch muss abgewischt werden', emojis: ['🪵', '🧽'] },
      { id: 'kueche_sauber',            german: 'Die Küche muss sauber sein',       emojis: ['🍳', '✨'] },
      { id: 'ich_bin_mit_dienst_fertig',german: 'Ich bin mit dem Dienst fertig',     emojis: ['🙋', '✅', '🧹'] },
      { id: 'waesche_waschen',          german: 'Ich muss Wäsche waschen',          emojis: ['🙋', '🧺'] },
    ]
  },

  // ─── ZAHLEN ────────────────────────────────────────────────────────────
  {
    id: 'numbers',
    name: 'Zahlen',
    emoji: '🔢',
    color: '#c4a35a',
    words: [
      { id: 'eins',   german: 'eins',    emoji: '1️⃣' },
      { id: 'zwei',   german: 'zwei',    emoji: '2️⃣' },
      { id: 'drei',   german: 'drei',    emoji: '3️⃣' },
      { id: 'vier',   german: 'vier',    emoji: '4️⃣' },
      { id: 'fuenf',  german: 'fünf',    emoji: '5️⃣' },
      { id: 'sechs',  german: 'sechs',   emoji: '6️⃣' },
      { id: 'sieben', german: 'sieben',  emoji: '7️⃣' },
      { id: 'acht',   german: 'acht',    emoji: '8️⃣' },
      { id: 'neun',   german: 'neun',    emoji: '9️⃣' },
      { id: 'zehn',   german: 'zehn',    emoji: '🔟' },
    ],
    sentences: []
  },

  // ─── WICHTIGE SÄTZE ────────────────────────────────────────────────────
  {
    id: 'phrases',
    name: 'Wichtige Sätze',
    emoji: '💬',
    color: '#6ba5a5',
    words: [],
    sentences: [
      { id: 'ich_verstehe_nicht',   german: 'Ich verstehe nicht',           emojis: ['🙋', '❓', '🤷'] },
      { id: 'bitte_langsam',        german: 'Bitte langsam sprechen',       emojis: ['🤲', '🐢', '🗣️'] },
      { id: 'wie_heisst_das',       german: 'Wie heißt das?',              emojis: ['❓', '👉', '🏷️'] },
      { id: 'ich_heisse',           german: 'Ich heiße...',                emojis: ['🙋', '🏷️'] },
      { id: 'koennen_sie_helfen',   german: 'Können Sie mir helfen?',      emojis: ['❓', '🆘', '🙏'] },
      { id: 'wo_ist',               german: 'Wo ist...?',                  emojis: ['❓', '📍'] },
      { id: 'ich_moechte',          german: 'Ich möchte...',               emojis: ['🙋', '👉'] },
      { id: 'entschuldigung',       german: 'Entschuldigung',              emojis: ['🙇', '🙏'] },
      { id: 'ich_weiss_nicht',      german: 'Ich weiß nicht',              emojis: ['🙋', '🤷'] },
      { id: 'noch_einmal_bitte',    german: 'Noch einmal, bitte',          emojis: ['🔄', '🤲'] },
    ]
  },

  // ─── UNTERWEGS & EINKAUFEN ─────────────────────────────────────────────
  {
    id: 'outandabout',
    name: 'Unterwegs',
    emoji: '🚌',
    color: '#e67e22',
    words: [
      { id: 'bus',          german: 'Bus',          emoji: '🚌' },
      { id: 'strasse',      german: 'Straße',       emoji: '🛣️' },
      { id: 'supermarkt',   german: 'Supermarkt',   emoji: '🛒' },
      { id: 'apotheke',     german: 'Apotheke',     emoji: '💊' },
      { id: 'geld',         german: 'Geld',         emoji: '💶' },
      { id: 'kaufen',       german: 'kaufen',       emoji: '🛍️' },
      { id: 'park',         german: 'Park',         emoji: '🌳' },
      { id: 'bushaltestelle', german: 'Bushaltestelle', emoji: '🚏' },
      { id: 'kasse',        german: 'Kasse',        emoji: '🧾' },
      { id: 'tasche',       german: 'Tasche',       emoji: '👜' },
    ],
    sentences: [
      { id: 'ich_moechte_einkaufen',  german: 'Ich möchte einkaufen gehen',    emojis: ['🙋', '🛒', '🚶'] },
      { id: 'wo_ist_supermarkt',      german: 'Wo ist der Supermarkt?',        emojis: ['❓', '🛒'] },
      { id: 'wo_ist_apotheke',        german: 'Wo ist die Apotheke?',          emojis: ['❓', '💊'] },
      { id: 'wann_kommt_bus',         german: 'Wann kommt der Bus?',           emojis: ['⏰', '❓', '🚌'] },
      { id: 'ich_brauche_geld',       german: 'Ich brauche Geld',             emojis: ['🙋', '👉', '💶'] },
      { id: 'was_kostet_das',         german: 'Was kostet das?',               emojis: ['❓', '💶', '👉'] },
      { id: 'ich_moechte_bezahlen',   german: 'Ich möchte bezahlen',          emojis: ['🙋', '💶', '🧾'] },
      { id: 'ich_gehe_spazieren',     german: 'Ich gehe spazieren',           emojis: ['🙋', '🚶', '🌳'] },
      { id: 'ich_brauche_medikamente', german: 'Ich brauche Medikamente',     emojis: ['🙋', '👉', '💊'] },
    ]
  },

  // ─── ZEIT & WETTER ─────────────────────────────────────────────────────
  {
    id: 'timweather',
    name: 'Zeit & Wetter',
    emoji: '⏰',
    color: '#2980b9',
    words: [
      { id: 'heute',    german: 'heute',     emoji: '📅' },
      { id: 'morgen',   german: 'morgen',    emoji: '➡️📅' },
      { id: 'gestern',  german: 'gestern',   emoji: '⬅️📅' },
      { id: 'uhr',      german: 'Uhr',       emoji: '⏰' },
      { id: 'montag',   german: 'Montag',    emoji: '1️⃣📅' },
      { id: 'sonne',    german: 'Sonne',     emoji: '☀️' },
      { id: 'regen',    german: 'Regen',     emoji: '🌧️' },
      { id: 'kalt',     german: 'kalt',      emoji: '🥶' },
      { id: 'warm',     german: 'warm',      emoji: '🥵' },
      { id: 'frueh',    german: 'früh',      emoji: '🌅' },
      { id: 'spaet',    german: 'spät',      emoji: '🌙' },
      { id: 'schnee',   german: 'Schnee',    emoji: '❄️' },
    ],
    sentences: [
      { id: 'wie_spaet',             german: 'Wie spät ist es?',              emojis: ['❓', '⏰'] },
      { id: 'heute_ist_kalt',        german: 'Heute ist es kalt',             emojis: ['📅', '🥶'] },
      { id: 'heute_ist_warm',        german: 'Heute ist es warm',             emojis: ['📅', '🥵'] },
      { id: 'es_regnet',             german: 'Es regnet',                     emojis: ['🌧️'] },
      { id: 'die_sonne_scheint',     german: 'Die Sonne scheint',             emojis: ['☀️', '😊'] },
      { id: 'ich_habe_termin',       german: 'Ich habe einen Termin',         emojis: ['🙋', '📅', '⏰'] },
      { id: 'wann_ist_essen',        german: 'Wann gibt es Essen?',           emojis: ['⏰', '❓', '🍽️'] },
      { id: 'morgen_habe_termin',    german: 'Morgen habe ich einen Termin',  emojis: ['➡️📅', '🙋', '📅'] },
    ]
  },

  // ─── AKTIVITÄTEN ───────────────────────────────────────────────────────
  {
    id: 'activities',
    name: 'Aktivitäten',
    emoji: '🏃',
    color: '#8e44ad',
    words: [
      { id: 'kochen',      german: 'kochen',       emoji: '👨‍🍳' },
      { id: 'aufraumen',   german: 'aufräumen',    emoji: '🧹' },
      { id: 'putzen',      german: 'putzen',       emoji: '🧽' },
      { id: 'fernsehen',   german: 'fernsehen',    emoji: '📺' },
      { id: 'musik',       german: 'Musik hören',  emoji: '🎵' },
      { id: 'schreiben',   german: 'schreiben',    emoji: '✍️' },
      { id: 'lesen',       german: 'lesen',        emoji: '📚' },
      { id: 'spielen',     german: 'spielen',      emoji: '🎮' },
      { id: 'warten',      german: 'warten',       emoji: '⏳' },
      { id: 'anrufen',     german: 'anrufen',      emoji: '📞' },
    ],
    sentences: [
      { id: 'ich_moechte_kochen',     german: 'Ich möchte kochen',            emojis: ['🙋', '👨‍🍳'] },
      { id: 'ich_moechte_fernsehen',  german: 'Ich möchte fernsehen',         emojis: ['🙋', '📺'] },
      { id: 'ich_moechte_musik',      german: 'Ich möchte Musik hören',       emojis: ['🙋', '🎵'] },
      { id: 'kann_ich_spielen',       german: 'Kann ich spielen?',            emojis: ['❓', '🙋', '🎮'] },
      { id: 'ich_muss_aufraumen',     german: 'Ich muss aufräumen',           emojis: ['🙋', '🧹'] },
      { id: 'ich_moechte_anrufen',    german: 'Ich möchte telefonieren',      emojis: ['🙋', '📞'] },
      { id: 'ich_moechte_rausgehen',  german: 'Ich möchte nach draußen gehen', emojis: ['🙋', '🚶', '🌳'] },
      { id: 'kann_ich_helfen',        german: 'Kann ich helfen?',             emojis: ['❓', '🙋', '🤝'] },
      { id: 'ich_bin_fertig',         german: 'Ich bin fertig',               emojis: ['🙋', '✅'] },
      { id: 'was_machen_wir_heute',   german: 'Was machen wir heute?',        emojis: ['❓', '👥', '📅'] },
    ]
  },
];

// Helper: Get a category by ID
function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id);
}

// Helper: Get all words across categories (for mixed quizzes)
function getAllWords() {
  return CATEGORIES.flatMap(c => c.words.map(w => ({ ...w, categoryId: c.id })));
}

// Helper: Get all sentences across categories
function getAllSentences() {
  return CATEGORIES.flatMap(c => c.sentences.map(s => ({ ...s, categoryId: c.id })));
}
