﻿//source: https://stackoverflow.com/questions/22515847/how-can-i-use-defineproperty-to-create-a-readonly-array-property

class ReadOnlyArray extends Array {
    constructor(mutable) {
        super(0);
        this.push(...mutable);
        Object.freeze(this);
    }
    static get [Symbol.species]() { return Array; }
}

MODULES.DataSets = (function () {
    const animals = ["alligator", "anteater", "antelope", "armadillo", "pelican", "muskrat", "badger", "bat", "beaver", "buffalo", "camel", "jackalope", "starfish",
        "chameleon", "cheetah", "chinchilla", "chipmunk", "chupacabra", "flamingo", "coyote", "crow", "dingo", "dinosaur", "dog", "cow", "opossum", "jellyfish",
        "dolphin", "dragon", "duck", "octopus", "elephant", "ferret", "fox", "frog", "giraffe", "gopher", "grizzly", "hedgehog", "chicken", "Tasmanian devil",
        "hippo", "hyena", "jackal", "seagull", "coyote", "iguana", "koala", "kraken", "lemur", "leopard", "liger", "lion", "llama", "manatee", "lamb", "stingray",
        "mink", "monkey", "narwhal", "cat", "orangutan", "otter", "panda", "penguin", "platypus", "snake", "python", "zebra", "parakeet", "newt", "panther", "sloth",
        "rabbit", "raccoon", "rhino", "sheep", "shrew", "skunk", "loris", "squirrel", "tiger", "turtle", "unicorn", "walrus", "whale", "shark", "bear", "jay",
        "wolf", "wolverine", "wombat", "cardinal", "wildcat", "falcon", "eagle", "bronco", "colt", "jaguar", "ram", "goat", "hawk", "warthog", "snail", "canary",
        "parrot", "salamander", "mole", "dragon", "lizard", "guppy", "deer", "gorilla", "gecko", "blowfish", "mouse", "mammoth", "owl", "puppy", "porcupine",
        "sea-turtle", "jackrabbit", "kangaroo", "kitten", "cub", "moose", "oyster", "goose", "wasp", "spider", "crab", "donkey", "mule", "elk", "swan", "horse", "pig",
        "weasel", "seal", "peacock", "butterfly", "bull", "lobster", "roadrunner", "fish", "goldfish", "reindeer"];

    const adjectives = ["adamant", "cuddly", "baleful", "violent", "embarrassed", "self-centered", "naked", "caustic", "bright", "wise-cracking", "horrible", "jumpy",
        "angry", "comely", "shaky", "sick", "zippy", "drunken", "defamatory", "sticky", "fighting", "painfully honest", "frozen", "filthy", "sporadic", "extreme",
        "bonkers", "harsh", "fluffy", "frisky", "greedy", "hideous", "crawly", "ungodly", "abusive", "idiotic", "hateful", "twisted", "morbid", "twitchy", "conniving",
        "useless", "yapping", "smelly", "magical", "indecent", "insolent", "arrogant", "confused", "flirting", "high-end", "insecure", "maniacal", "sneaky", "carnivorous",
        "sickened", "slippery", "stubborn", "talkative", "luminous", "mannered", "tripping", "vengeful", "sinister", "cowardly", "haunting", "wicked", "tiny", "kind", "nice",
        "noxious", "obtuse", "alcoholic", "demanding", "shivering", "offensive", "elusive", "startling", "disgusting", "slap happy", "disturbing", "sleazy", "joking", "jolly",
        "blathering", "rebellious", "lovely", "sexy", "hyperactive", "raunchy", "infuriating", "pea-brained", "territorial", "mischievous", "free-loading", "woolly", "grumpy",
        "house-broken", "house-trained", "cruel-hearted", "misunderstood", "narrow-minded", "tenacious", "self-absorbed", "crazy", "fierce", "swollen", "ubiquitous",
        "lush", "incessant", "voracious", "smoky", "withering", "zealous", "lazy", "rabid", "diseased", "hyper", "hairy", "gassy", "wise", "saber-tooth", "timid",
        "ferocious", "domesticated", "abnormal", "medicated", "cocky", "disrespectful", "impressive", "hilarious", "hot", "tactful", "bearded", "slimy", "insane",
        "energetic", "gentle", "playful", "intelligent", "loyal", "rough", "high", "wasted", "benevolent", "scared", "delicious", "tasty", "colorful", "slightly-plump",
        "adaptable", "adventurous", "daring", "affectionate", "ambitious", "compassionate", "considerate", "courageous", "courteous", "diligent", "empathetic", "exuberant",
        "generous", "impartial", "short", "long", "intuitive", "inventive", "passionate", "persistent", "philosophical", "knowledgeable", "practical", "rational", "reliable",
        "trusty", "resourceful", "sensible", "sincere", "sympathetic", "witty", "unassuming", "nauseating", "malevolent", "humorous", "lighthearted", "amusing", "amazing",
        "entertaining", "comical", "whimsical", "eccentric", "single-haired", "fuzzy", "darling", "caring", "sour", "remarkable", "bold", "quiet", "roaring", "loud", "delighted",
        "content", "annoying", "disappointed", "sad", "unhappy", "tiring", "exhausted", "excited", "relaxed", "sleeping", "sleepy", "homesick", "seasick", "world-weary",
        "man-made", "time-consuming", "clean-shaven", "fine-looking", "indoor", "recluse", "only", "afraid", "ashamed", "ill", "glad", "upset", "exempt", "outspoken", "good-humored",
        "loving", "terrible", "awful", "shiny", "soggy", "wooden", "thin", "plump", "juicy", "slender", "petite", "evil", "scary", "lumpy", "weird", "creepy", "big", "little",
        "large", "gigantic", "racist", "mean", "stingy", "mighty", "vile", "hostile", "puny", "fit", "unreliable", "noble", "magic", "cunning", "foxy", "tricky", "clever", "brave",
        "smart", "pleasant", "happy", "late", "graceful", "beautiful", "cheerful", "fishy", "icy", "keen", "merry", "nasty", "obnoxious", "prissy", "respectful", "silent", "unique",
        "vain", "wary", "yummy", "over-achieving", "under-achieving", "slick", "clean", "dirty", "flirtatious", "secretive", "luscious", "rare", "mountain", "extinct",
        "limited-edition", "abundant", "purple", "pink", "blue", "red", "green", "orange", "yellow", "indigo", "violet", "neon", "fluorescent", "tan", "gray", "black", "white",
        "one-eyed", "yellow-bellied", "one-legged"];

    const states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia',
        'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
        'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
        'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

    //comma separated list of global constants
    return {
        ANIMALS: new ReadOnlyArray(animals),
        ADJECTIVES: new ReadOnlyArray(adjectives),
        US_STATES: new ReadOnlyArray(states)
    };

})();