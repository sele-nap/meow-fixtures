import { RNG, defaultRng } from './rng'

// ── Locales ───────────────────────────────────────────────────────────────────

const DATA = {
  en: {
    names: [
      'Whiskers', 'Luna', 'Mochi', 'Nala', 'Oliver', 'Simba', 'Bella', 'Cleo',
      'Felix', 'Mittens', 'Shadow', 'Pepper', 'Coco', 'Loki', 'Nyx', 'Pixel',
      'Jasper', 'Milo', 'Mango', 'Biscuit', 'Pumpkin', 'Oreo', 'Gizmo', 'Binx',
      'Salem', 'Duchess', 'Figaro', 'Cheshire', 'Crookshanks', 'Jiji', 'Sable',
      'Stormy', 'Patches', 'Tabitha', 'Muffin', 'Caramel', 'Sushi', 'Nugget',
      'Waffles', 'Pickles', 'Jellybean', 'Pretzel', 'Noodle', 'Tofu', 'Chai',
    ],
    sentences: [
      'Knock everything off the counter for absolutely no reason.',
      'Stare at the wall for twenty minutes, then run away at full speed.',
      'Sit in the exact spot you are trying to work on.',
      'Bring a dead mouse as a heartfelt gift and expect gratitude.',
      'Meow loudly at 3am until someone gets up, then ignore them.',
      'Ignore the expensive cat bed and sleep in the cardboard box it came in.',
      'Demand food, sniff it once, and walk away in disgust.',
      'Knock over a full glass of water and watch it spill with deep satisfaction.',
      'Bite the hand that pets you, then demand more pets immediately.',
      'Fit your entire body into a container three sizes too small.',
      'Knock a pen off the table, watch it fall, knock another pen off the table.',
      'Run at full speed into a wall, shake it off, and pretend nothing happened.',
      'Claim the laptop keyboard as your personal sleeping spot during an important meeting.',
      'Stare intensely at the human eating and refuse to break eye contact.',
      'Chirp at birds through the window with extreme enthusiasm but zero results.',
      'Walk across the keyboard and send a very important email to nobody.',
      'Find the warmest spot in the house and guard it with your life.',
      'Get the zoomies at exactly midnight for no discernible reason.',
      'Carefully push one specific item off the shelf while maintaining eye contact.',
      'Refuse to acknowledge your name unless food is involved.',
      'Sit directly in front of the television during the most critical scene.',
      'Meow at the closed door, get let in, immediately meow to be let out again.',
      'Spend four hours grooming and then roll in a dirt pile.',
      'Sleep twenty hours a day and still act exhausted.',
      'Judge every life decision the human makes from a comfortable height.',
      'Knock over the plant you have been plotting against all week.',
      'Drape yourself dramatically over the most inconvenient piece of furniture.',
      'Demand belly rubs, allow exactly two strokes, then attack.',
      'Wake human at 5am by sitting directly on their face.',
      'Sprint from one end of the house to the other for no reason whatsoever.',
      'Find the single sunbeam in the room and occupy it entirely.',
      'Pretend the laser dot was not interesting. You were just stretching.',
      'Yowl at the refrigerator until someone opens it, then decide you are not hungry.',
      'Claim every blanket in the house as personal territory.',
      'Sit in the sink for three hours despite having a perfectly good bed.',
      'Aggressively rub your face against every sharp corner in the house.',
      'Detect when the human is about to leave and become suddenly very affectionate.',
      'Ignore the human for six hours, then scream at them for not paying attention.',
      'Steal a hair tie and hoard it under the couch with the others.',
      'Chase your own tail with the intensity of a professional athlete.',
      'Inspect every grocery bag as if defusing a bomb.',
      'Accept cuddles reluctantly. Pretend you do not enjoy them. You do.',
      'Sit on the book the human is reading, blocking exactly the paragraph they need.',
      'Begin grooming yourself immediately after being moved from a comfortable spot.',
      'Make direct eye contact and knock one more thing off the table.',
      'Find the one squeaky toy and play with it only at 2am.',
      'Supervise the shower from a safe dry distance with visible concern.',
      'Refuse to use the litterbox if it has been used even once recently.',
      'Develop a vendetta against a specific houseplant and pursue it daily.',
      'Decide that 4am is the perfect time to practice hunting skills on human feet.',
      'Leave a generous amount of fur on every dark item of clothing in the house.',
      'Loaf aggressively on the warm router until the internet slows down.',
      'Perform the ancient ritual of knocking things off the nightstand at 6am.',
      'Become inexplicably afraid of the same vacuum cleaner you have seen for five years.',
      'Sit in the exact center of the freshly cleaned floor and begin shedding.',
      'Demand to be let outside, realize it is raining, stare at the rain accusingly.',
      'Discover a crinkle bag and announce this to the entire neighbourhood.',
      'Develop a strong opinion about where the human sits and enforce it.',
      'Knock the water bowl over, then look at the human like they did it.',
    ],
  },

  fr: {
    names: [
      'Minou', 'Félix', 'Minette', 'Caramel', 'Gribouille', 'Mistigri', 'Pelote',
      'Rouquin', 'Titou', 'Cannelle', 'Pistache', 'Noisette', 'Coquin', 'Malice',
      'Plume', 'Chipie', 'Fripouille', 'Câlin', 'Poussin', 'Griotte', 'Papillon',
      'Filou', 'Mousse', 'Biscotte', 'Praline', 'Réglisse', 'Escargot', 'Pantoufle',
      'Chaussette', 'Pompom', 'Galette', 'Nougat', 'Truffe', 'Cachou', 'Capucine',
    ],
    sentences: [
      'Renverser le verre d\'eau et observer la catastrophe avec une satisfaction évidente.',
      'Fixer le mur pendant vingt minutes puis fuir à toute vitesse sans explication.',
      'S\'installer précisément là où le travail doit être effectué.',
      'Rapporter une souris morte comme cadeau délicat et attendre de la reconnaissance.',
      'Miauler bruyamment à 3h du matin jusqu\'à ce que quelqu\'un se lève, puis l\'ignorer.',
      'Ignorer le panier coûteux et dormir dans la boîte en carton dans laquelle il est arrivé.',
      'Réclamer de la nourriture, la renifler une fois, et repartir avec mépris.',
      'Mordre la main qui caresse, puis réclamer davantage de caresses immédiatement.',
      'Faire entrer l\'intégralité du corps dans un contenant trois fois trop petit.',
      'Pousser un stylo de la table, le regarder tomber, puis pousser un autre stylo.',
      'Occuper le clavier de l\'ordinateur lors d\'une réunion particulièrement importante.',
      'Fixer intensément la personne qui mange sans jamais détourner le regard.',
      'Siffler les oiseaux à travers la fenêtre avec enthousiasme et aucun résultat.',
      'Trouver l\'endroit le plus chaud de la maison et le défendre avec acharnement.',
      'Avoir les fous furieux exactement à minuit sans raison discernable.',
      'Refuser de répondre à son prénom sauf quand de la nourriture est impliquée.',
      'S\'asseoir directement devant la télévision lors de la scène la plus cruciale.',
      'Miauler devant la porte fermée, entrer, miauler immédiatement pour ressortir.',
      'Passer quatre heures à se toiletter puis se rouler dans un tas de poussière.',
      'Dormir vingt heures par jour et paraître néanmoins épuisé.',
      'Juger chaque décision de vie humaine depuis un endroit en hauteur.',
      'Renverser la plante contre laquelle un complot mûrit depuis toute la semaine.',
      'Se draper dramatiquement sur le meuble le plus gênant possible.',
      'Réclamer des gratouilles, tolérer exactement deux caresses, puis attaquer.',
      'Réveiller les humains à 5h du matin en s\'asseyant directement sur leur visage.',
      'Trouver le seul rayon de soleil de la pièce et l\'occuper entièrement.',
      'Hurler devant le réfrigérateur jusqu\'à ce qu\'il soit ouvert, puis décider de ne pas avoir faim.',
      'Revendiquer toutes les couvertures de la maison comme territoire personnel.',
      'S\'installer dans l\'évier pendant trois heures malgré un panier parfaitement disponible.',
      'Détecter que l\'humain est sur le point de partir et devenir soudainement très affectueux.',
      'Ignorer l\'humain pendant six heures puis lui crier dessus pour manque d\'attention.',
      'Voler un élastique à cheveux et le planquer sous le canapé avec les autres.',
      'Inspecter chaque sac de courses comme s\'il s\'agissait de désamorcer une bombe.',
      'Accepter les câlins à contrecœur. Prétendre ne pas les apprécier. Les apprécier quand même.',
      'Commencer à se toiletter immédiatement après avoir été déplacé d\'un endroit confortable.',
      'Laisser une quantité généreuse de poils sur chaque vêtement sombre de la maison.',
    ],
  },
} as const

export type Locale = keyof typeof DATA

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[], rng: RNG): T {
  return arr[Math.floor(rng() * arr.length)] as T
}

function shuffle<T>(arr: readonly T[], rng: RNG): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
  }
  return copy
}

// ── Public API ────────────────────────────────────────────────────────────────

export function randomName(locale: Locale = 'en', rng: RNG = defaultRng): string {
  return pick(DATA[locale].names, rng)
}

export function randomSentence(locale: Locale = 'en', rng: RNG = defaultRng): string {
  return pick(DATA[locale].sentences, rng)
}

export function randomParagraph(locale: Locale = 'en', rng: RNG = defaultRng, min = 3, max = 6): string {
  const count = min + Math.floor(rng() * (max - min + 1))
  return shuffle(DATA[locale].sentences, rng).slice(0, count).join(' ')
}

export function randomText(locale: Locale = 'en', rng: RNG = defaultRng, paragraphCount = 4): string {
  return Array.from({ length: paragraphCount }, () => randomParagraph(locale, rng)).join('\n\n')
}
