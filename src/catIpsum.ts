import { RNG, defaultRng } from './rng';

// ── Data ──────────────────────────────────────────────────────────────────────

const NAMES = [
  'Whiskers',
  'Mittens',
  'Patches',
  'Tabitha',
  'Felix',
  'Figaro',
  'Cheshire',
  'Crookshanks',
  'Jiji',
  'Binx',
  'Salem',
  'Duchess',
  'Sable',
  'Luna',
  'Nova',
  'Stella',
  'Aurora',
  'Comet',
  'Eclipse',
  'Nyx',
  'Soleil',
  'Nebula',
  'Lyra',
  'Vega',
  'Zephyr',
  'Shadow',
  'Loki',
  'Raven',
  'Ghost',
  'Storm',
  'Onyx',
  'Ash',
  'Hex',
  'Jinx',
  'Vex',
  'Dusk',
  'Rogue',
  'Bella',
  'Nala',
  'Cleo',
  'Mochi',
  'Milo',
  'Simba',
  'Oliver',
  'Jasper',
  'Pixel',
  'Stormy',
  'Daisy',
  'Lily',
  'Rosie',
  'Poppy',
  'Ivy',
  'Pearl',
  'Ruby',
  'Opal',
  'Biscuit',
  'Pumpkin',
  'Oreo',
  'Muffin',
  'Caramel',
  'Sushi',
  'Nugget',
  'Waffles',
  'Pickles',
  'Jellybean',
  'Pretzel',
  'Noodle',
  'Tofu',
  'Chai',
  'Coco',
  'Pepper',
  'Mango',
  'Gizmo',
  'Nacho',
  'Taco',
  'Pretzel',
  'Brownie',
  'Cheddar',
  'Boba',
  'Matcha',
  'Espresso',
  'Maple',
  'Peaches',
  'Butterscotch',
  'Clover',
  'Gandalf',
  'Merlin',
  'Sherlock',
  'Watson',
  'Ripley',
  'Spock',
  'Pixel',
  'Glitch',
  'Byte',
  'Sudo',
  'Cache',
  'Kernel',
  'Flux',
  'Radar',
  'Vector',
  'Duke',
  'Earl',
  'Baron',
  'Prince',
  'Admiral',
  'Colonel',
  'Countess',
  'Marquis',
  'Duchess',
  'Empress',
  'Kit',
  'Sox',
  'Dot',
  'Pip',
  'Boo',
  'Rue',
  'Fig',
  'Ace',
  'Tex',
  'Rio',
  'Oz',
  'Fern',
];

const PARAGRAPHS = [
  `Cat ipsum dolor sit amet, lick butt and make a weird face eat the rubberband sees bird in air, breaks into cage and attacks creature play time. Walk on keyboard scamper cat dog hate mouse eat string barf pillow no baths hate everything. Catch small lizards, bring them into house, then unable to find them on carpet get poop stuck in paws jumping out of litter box and run around the house scream meowing and smearing hot cat mud all over stare out the window and walk on a keyboard. Missing until dinner time. Cats woo leave fur on owners clothes. Litter kitter kitty litty little kitten big roar roar feed me attempt to leap between furniture but woefully miscalibrate and bellyflop onto the floor; what's your problem? i meant to do that now i shall wash myself intently.`,

  `The dog smells bad eat half my food and ask for more and sweet beast. Cat sit like bread cat sit like bread headbutt owner's knee. Scratch me now! stop scratching me! head nudges leave hair on owner's clothes. Murr i hate humans they are so annoying sleep on dog bed, force dog to sleep on floor meow meow mama chase dog then run away. Eat half my food and ask for more experiences short bursts of poo-phoria after going to the loo or human is in bath tub, emergency! drowning! meooowww!`,

  `You are a captive audience while sitting on the toilet, pet me chase the pig around the house is good you understand your place in my world. Thinking about you i'm joking it's food always food cat ass trophy, but my slave human didn't give me any food so i pooped on the floor, so eat grass, throw it back up sniff all the things. Purr purr purr until owner pets why owner not pet me hiss scratch meow bawl under human beds and love lick human with sandpaper tongue but hack up furballs. Pushed the mug off the table. Make it to the carpet before i vomit mmmmmm purrr purr littel cat, little cat purr purr.`,

  `Scream for no reason at 4 am pet me pet me don't pet me yet soft kitty warm kitty little ball of furr lick master's hand at first then bite because i'm moody and rub face on owner. Jumps off balcony gives owner dead mouse at present then poops in litter box snatches yarn and fights with dog cat chases laser then plays in grass finds tiny spot in cupboard and sleeps all day jumps in bathtub and meows when owner fills food dish the cat knocks over the food dish. Lick butt curl up and sleep on the freshly laundered towels. Make muffins love and coo around boyfriend who purrs and makes the perfect moonlight eyes so i can purr and swat the glittery gleaming yarn to him and i love cuddles. Caticus cuteicus missing until dinner time, for human is washing you why halp oh the horror flee scratch hiss bite.`,

  `Cat is love, cat is life friends are not food chase mice, yet fall asleep on the washing machine nya nya nyan. Be superior ooh, are those your $250 dollar sandals? lemme use that as my litter box or swipe at owner's legs or stare at ceiling light scamper yet sleeps on my head meow. Cat playing a fiddle in hey diddle diddle? carrying out surveillance on the neighbour's dog. What a cat-ass-trophy! nyan nyan goes the cat, scraaaaape scraaaape goes the walls when the cat murders them with its claws. Munch on tasty moths cats are the world. Chase little red dot someday it will be mine! bury the poop bury it deep yet growl at dogs in my sleep.`,

  `Meow meow mama. Chirp at birds. Sniff all the things. Fight own tail prow?? ew dog you drink from the toilet, yum yum warm milk hotter pls, ouch too hot and my slave human didn't give me any food so i pooped on the floor yet kitty time meow in empty rooms yet whatever stare at the wall, play with food and get confused by dust. Please let me outside pouty face yay! wait, it's cold out please let me inside pouty face oh, thank you rub against mommy's leg oh it looks so nice out, please let me outside again the neighbor cat was mean to me please let me back inside i want to go outside let me go outside nevermind inside is better.`,

  `Chirp at birds caticus cuteicus for purr while eating for open the door, let me out, let me out, let me-out, let me-aow, let meaow, meaow! cats are fats i like to pets them they like to meow back. Toilet paper attack claws fluff everywhere meow miao french ciao litterbox prow?? ew dog you drink from the toilet, yum yum warm milk hotter pls, ouch too hot, purrrrrr. Attack the dog then pretend like nothing happened. Gimme attention gimme attention gimme attention gimme attention just kidding i don't want it anymore meow bye fish i must find my red catnip fishy fish, with tail in the air.`,

  `Scratch at fleas, meow until belly rubs, hide behind curtain when vacuum cleaner is on scratch strangers and poo on owners food destroy house in 5 seconds for refuse to come home when humans are going to bed; stay out all night then yowl like i am dying at 4am. Hiiiiiiiiii feed me now pretend you want to go out but then don't and meow for food, then when human fills food dish, take a few bites of food and continue meowing. I bet my nine lives on you don't wait for the storm to pass, dance in the rain. Grab pompom in mouth and put in water dish lick yarn hanging out of own butt so nyaa nyaa so poop on floor and watch human clean up walk on a keyboard purr as loud as possible, be the most annoying cat that you can, and, knock everything off the table.`,

  `Have secret plans love to play with owner's hair tie. Hack trip owner up in kitchen i want food so flee in terror at cucumber discovered on floor knock over christmas tree unwrap toilet paper for attack like a vicious monster. Cat slap dog in face sees bird in air, breaks into cage and attacks creature for stare at the wall, play with food and get confused by dust for refuse to come home when humans are going to bed; stay out all night then yowl like i am dying at 4am. Shake treat bag. Have my breakfast spaghetti yarn ooh, are those your $250 dollar sandals? lemme use that as my litter box haha you hold me hooman i scratch yet cat ass trophy.`,

  `Fight own tail thinking about you i'm joking it's food always food headbutt owner's knee and stinky cat for scratch me now! stop scratching me! yet i like frogs and 0 gravity yet being gorgeous with belly side up. Sleep nap eat grass, throw it back up yet tickle my belly at your own peril i will pester for food when you're in the kitchen even if it's salad burrow under covers. Eat my own ears lick butt meow to be let out, for purr when being pet so kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff. Meow get suspicious of own shadow then go play with toilette paper.`,

  `Lie on your belly and purr when you are asleep ignore the human until she needs to get up, then climb on her lap and sprawl yet if it fits, i sits so the fat cat sat on the mat bat away with paws yet touch my tail, i shred your hand purrrr. Intently sniff hand eat too much then proceed to regurgitate all over living room carpet while humans eat dinner wack the mini furry mouse why use post when this sofa is here. Refuse to drink water except out of someone's glass. Lick sellotape at four in the morning wake up owner meeeeeeooww scratch at legs and beg for food then cry and yowl until they wake up at two pm jump on window and sleep while observing the bootyful cat next door.`,

  `Destroy couch as revenge i cry and cry and cry unless you pet me, and then maybe i cry just for fun so roll over and sun my belly. Scream at teh bath it's 3am, time to create some chaos so get scared by sudden appearance of cucumber. Purr for no reason cough furball into food bowl then scratch owner for a new one yet i will be pet i will be pet and then i will hiss, so cats making all the muffins. When owners are asleep, cry for no apparent reason meowing non stop for food. Gimme attention gimme attention gimme attention gimme attention just kidding i don't want it anymore meow bye. Groom forever, stretch tongue and leave it slightly out, blep use lap as chair.`,

  `Stretch and yawn and look so cute that human pets me, then bites my hand sit by the fire eat the fat cats food, and meowzers but kitty pounce, trip, faceplant. Need to chase tail wake up human for food at 4am for if it fits, i sits chase laser. Inspect anything brought into the house unwrap toilet paper kitty kitty pussy cat doll meow meow yummy there is a bunch of cats hanging around eating catnip purr like a car engine then released suddenly a tiger pounces and sleeps on your face instead. Run outside as soon as door open scratch the post, hard, with claws then walk away yet i could pee on this if i had the energy.`,

  `Climb a tree, wait for a fireman jump to fireman then bite fireman lick yarn hanging out of own butt purr while eating sleep nap eat grass, throw it back up. Kitty pie chocolate cake until i fall over standing there looking stupid with big eyes attack the dog then pretend like nothing happened pretend you want to go out but then don't. Annoying meow rub against owner's leg sit and stare so attack the dog then pretend like nothing happened. I show my fluffy belly but it's a trap rub face on everything. Annoying meow find a way to fit in the smallest box possible.`,

  `Put toy mouse in food bowl run out of litter box at full speed eat the fat cats food but meow to be let out claw drapes, but pretend you want to go out but then don't and chase ball of string then run suddenly away for no reason. Stick butt in face stand on the dishwasher door when i'm not looking, but stand directly in front of tv, or attack feathers, kill it, and not eat it. I am the best human give me attention meow leave hair everywhere yet stand in front of the tv. Sit by the fire scratch leg; meow for can opener to feed me and human hands give attention.`,

  `Run outside as soon as door open chase imaginary bugs, but lick the other cats. Climb a tree, wait for a fireman jump to fireman then bite fireman walk on car leaving paw prints on hood and windshield rub face on everything refuse to drink water except out of someone's glass for cat is love, cat is life. Need to chase tail or sleep on dog bed, force dog to sleep on floor caticus cuteicus dream about hunting birds. Find a sunny spot and sleep on top of bed, butsit on human, stare at wall, play with food and get confused by dust. White cat sleeps on window where it is dark and night-time outside instead of going to it's cat bed for night, even though night is dark and cat is light colored and visible to human eyes only because the cat fur is so bright, and i hate other cats jump in box yet hide at bottom of staircase to trip human.`,

  `Sit in window and stare oooh, a bird, yum hopped up on catnip stand in front of the computer screen but lounge in doorway. Pee in the shoe behave like nothing happened destroy the blinds yet for kitty scratches couch bad kitty. Rub face on everything hide at bottom of staircase to trip human run outside as soon as door open instead of drinking water from the cat bowl, make sure to steal water from the toilet missing until dinner time chase mice find a way to fit in the smallest box possible kitty pounce, trip, faceplant. Find a way to fit in a tiny box for chase ball of string then run suddenly away for no reason yet for stand in front of the tv.`,

  `Decide to want nothing to do with my owner today demand to be let outside at once, and expect owner to wait for me as i think about it lick yarn hanging out of own butt for love is licking my owner's hand then biting it hard and for some reason they don't like that, but who cares, i'm a cat or destroy couch, sleep on shoes for inspect anything brought into the house. Cough furball into food bowl then scratch owner for a new one if it fits, i sits, but pelt around the house and up and down stairs at high speeds for no apparent reason whatsoever, and especially when guests come over jump on the table, meow constantly until told to get down, and then once down meow to be put back on the table.`,

  `Hate dog have secret plans pelt around the house and up and down stairs at high speeds for no apparent reason whatsoever, and especially when guests come over for sit on the laptop jump off balcony, onto stranger's head poop on grasses for asdflkjaspdofiasdjf;ajksdfais. Bathe private parts with tongue then lick owner's face attack the dog then pretend like nothing happened, but stretch and then wave tail in the air as you walk away from your owner who wants to cuddle with you and only you scratch the post, hard, with claws then walk away. Meow loudly just to annoy owner give attitude. Adventure always for sit on the laptop, but cat eat plants, meow, and throw up because i ate plants why must they do this to me.`,

  `Roll on the floor purring your whiskers off chase mice intently sniff hand. White kitty sneaks up on you and bites your leg then walks away as nothing happened claw drapes attack feet, sleep nap. Cat slap dog in face for love and coo around boyfriend who purrs and makes the perfect moonlight eyes so i can purr and swat the glittery gleaming yarn to him purrrrrr but cats secretly make all the worlds muffins. Sit by the fire purr for no reason favor packaging over toy lounge in doorway sit on the laptop stare at the wall, play with food and get confused by dust meowzers.`,

  `Rub face on everything chase laser sit on the laptop chew foot for poop in the plant pot but make muffins. Stick butt in face shake treat bag instead of drinking water from the cat bowl, make sure to steal water from the toilet adventure always meowzers cat is love, cat is life. Caticus cuteicus pose purrfectly to show my beauty hide from vacuum cleaner sit in box jumps off balcony gives owner dead mouse at present then poops in litter box and use lap as chair. Run outside as soon as door open behave like nothing happened, hate dog and lick the curtain just to annoy my human slave then i fall asleep.`,

  `Scratch the post, hard, with claws then walk away meowww meowww eat owner's food purrs and rubs against everything, demanding food. I could pee on this if i had the energy lounge in doorway eat the fat cats food. Wake up lick paw wake up owner meow meow scratch the door to be let outside then change mind once outside spend rest of day yelling at teh bath. Refuse to drink water except out of someone's glass meowww favor packaging over toy chew on cable destroy the blinds, but i could pee on this if i had the energy stretch.`,
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[], rng: RNG): T {
  return arr[Math.floor(rng() * arr.length)] as T;
}

function shuffle<T>(arr: readonly T[], rng: RNG): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function randomName(rng: RNG = defaultRng): string {
  return pick(NAMES, rng);
}

/** Returns a single sentence picked from a random paragraph. */
export function randomSentence(rng: RNG = defaultRng): string {
  const para = pick(PARAGRAPHS, rng);
  const sentences = para.match(/[^.!?]+[.!?]+/g) ?? [para];
  return pick(sentences, rng).trim();
}

/** Returns one full paragraph of cat ipsum. */
export function randomParagraph(rng: RNG = defaultRng): string {
  return pick(PARAGRAPHS, rng);
}

/** Returns multiple paragraphs of cat ipsum joined by double newlines. */
export function randomText(rng: RNG = defaultRng, paragraphCount = 4): string {
  return shuffle(PARAGRAPHS, rng)
    .slice(0, Math.min(paragraphCount, PARAGRAPHS.length))
    .join('\n\n');
}
