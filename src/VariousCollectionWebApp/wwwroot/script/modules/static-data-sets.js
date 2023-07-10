//source: https://stackoverflow.com/questions/22515847/how-can-i-use-defineproperty-to-create-a-readonly-array-property

class ReadOnlyArray extends Array {
    constructor(mutable) {
        super(0);
        this.push(...mutable);
        Object.freeze(this);
    }
    static get [Symbol.species]() { return Array; }
}

MODULES.DataSets = (function () {
    const animals = ["alligator","anteater","antelope","armadillo","pelican","muskrat","badger","bat","beaver","buffalo","camel","jackalope","starfish",
        "chameleon","cheetah","chinchilla","chipmunk","chupacabra","flamingo","crow","dingo","dinosaur","dog","cow","opossum","jellyfish",
        "dolphin","dragon","duck","octopus","elephant","ferret","fox","frog","giraffe","gopher","grizzly","hedgehog","chicken","Tasmanian devil",
        "hippo","hyena","jackal","seagull","coyote","iguana","koala","kraken","lemur","leopard","liger","lion","llama","manatee","lamb","stingray",
        "mink","monkey","narwhal","cat","orangutan","otter","panda","penguin","platypus","snake","python","zebra","parakeet","newt","panther","sloth",
        "rabbit","raccoon","rhino","sheep","shrew","skunk","loris","squirrel","tiger","turtle","unicorn","walrus","whale","shark","bear","jay",
        "wolf","wolverine","wombat","cardinal","wildcat","falcon","eagle","bronco","colt","jaguar","ram","goat","hawk","warthog","snail","canary",
        "parrot","salamander","mole","dragon","lizard","guppy","deer","gorilla","gecko","blowfish","mouse","mammoth","owl","puppy","porcupine",
        "sea-turtle","jackrabbit","kangaroo","kitten","cub","moose","oyster","goose","wasp","spider","crab","donkey","mule","elk","swan","horse","pig",
        "weasel","seal","peacock","butterfly","bull","lobster","roadrunner","fish","goldfish","reindeer","pangolin","ostrich","turkey","alpaca","ant",
        "cobra","aardvark","lizard","aligator","crocodile","toad","cockroach","baboon","bee","bird","catfish","cockatoo","squid","hamster","emu","eel",
        "groundhog","husky","rottweiler","vulture","yak"];

    const adjectives = ["adamant","cuddly","baleful","violent","embarrassed","self-centered","naked","caustic","bright","wise-cracking","horrible","jumpy",
        "angry","comely","shaky","sick","sickly","zippy","drunken","defamatory","sticky","fighting","painfully honest","frozen","filthy","sporadic","extreme",
        "bonkers","harsh","fluffy","frisky","greedy","hideous","crawly","ungodly","abusive","idiotic","hateful","twisted","morbid","twitchy","conniving",
        "useless","yapping","smelly","magical","indecent","insolent","arrogant","confused","flirting","high-end","insecure","maniacal","sneaky","carnivorous",
        "sickened","slippery","stubborn","talkative","luminous","mannered","tripping","vengeful","sinister","cowardly","haunting","wicked","tiny","kind","nice",
        "noxious","obtuse","alcoholic","demanding","shivering","offensive","elusive","startling","disgusting","slap happy","disturbing","sleazy","joking","jolly",
        "blathering","rebellious","lovely","sexy","hyperactive","raunchy","infuriating","pea-brained","territorial","mischievous","free-loading","woolly","grumpy",
        "house-broken","house-trained","cruel-hearted","misunderstood","narrow-minded","tenacious","self-absorbed","crazy","fierce","swollen","ubiquitous",
        "lush","incessant","voracious","smoky","withering","zealous","lazy","rabid","diseased","hyper","hairy","gassy","flatulent","wise","saber-tooth","timid",
        "ferocious","domesticated","abnormal","medicated","cocky","disrespectful","impressive","hilarious","hot","tactful","bearded","slimy","insane",
        "energetic","gentle","playful","intelligent","loyal","rough","high","wasted","benevolent","scared","delicious","tasty","colorful","slightly-plump",
        "adaptable","adventurous","daring","affectionate","ambitious","compassionate","considerate","courageous","courteous","diligent","empathetic","exuberant",
        "generous","impartial","short","long","intuitive","inventive","passionate","persistent","philosophical","knowledgeable","practical","rational","reliable",
        "trusty","resourceful","sensible","sincere","sympathetic","witty","unassuming","nauseating","malevolent","humorous","lighthearted","amusing","amazing",
        "entertaining","comical","whimsical","eccentric","single-haired","fuzzy","darling","caring","sour","remarkable","bold","quiet","roaring","loud","delighted",
        "content","annoying","disappointed","sad","unhappy","tiring","exhausted","excited","relaxed","sleeping","sleepy","homesick","seasick","world-weary",
        "man-made","time-consuming","clean-shaven","fine-looking","indoor","recluse","only","afraid","ashamed","ill","glad","upset","exempt","outspoken","good-humored",
        "loving","terrible","awful","shiny","soggy","wooden","thin","plump","juicy","slender","petite","evil","scary","lumpy","weird","creepy","big","little",
        "large","gigantic","racist","mean","stingy","mighty","vile","hostile","puny","fit","unreliable","noble","magic","cunning","foxy","tricky","clever","brave",
        "smart","pleasant","happy","late","graceful","beautiful","cheerful","fishy","icy","keen","merry","nasty","obnoxious","prissy","respectful","silent","unique",
        "vain","wary","yummy","over-achieving","under-achieving","slick","clean","dirty","flirtatious","secretive","luscious","rare","mountain","extinct",
        "limited-edition","abundant","purple","pink","blue","red","green","orange","yellow","indigo","violet","neon","fluorescent","tan","gray","black","white",
        "one-eyed","yellow-bellied","one-legged","naive","comedic","funny","scruffy","ludicrous","ridiculous","riotous","screaming","friendly","opulent","eager",
        "delightful","rich","authentic","super","big"];

    const states = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia',
        'Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan',
        'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota',
        'Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah',
        'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

    const colors = ['brown', 'red', 'green', 'blue', 'orange', 'purple', 'violet', 'yellow', 'indigo'];

    const nouns = ['mage', 'strike', 'mandaloun', 'country', 'house', 'nyquist', 'american', 'pharoah', 'chrome', 'orb', 'animal', 'kingdom', 'saver', 'mine', 'bird', 'brown',
        'smarty', 'jones', 'street', 'sense', 'barbaro', 'giacomo', 'cide','war','emblem','monarchos'];    

    const pronouns = ['he', 'she', 'it', 'I', 'that', 'this', 'these', 'those'];

    const verbs = ['justify', 'dreaming', 'will'];

    const adverbs = ['always', 'sometimes'];

    const derbyWinners = ["Mage", "Rich Strike", "Mandaloun", "Authentic", "Country House", "Justify ", "Always Dreaming", "Nyquist", "American Pharoah ", "California Chrome",
        "Orb", "I'll Have Another", "Animal Kingdom", "Super Saver", "Mine That Bird", "Big Brown", "Street Sense", "Barbaro", "Giacomo", "Smarty Jones", "Funny Cide",
        "War Emblem", "Monarchos", "Fusaichi Pegasus", "Charismatic", "Real Quiet", "Silver Charm", "Grindstone", "Thunder Gulch", "Go for Gin", "Sea Hero", "Lil E. Tee",
        "Strike the Gold", "Unbridled", "Sunday Silence", "Winning Colors", "Alysheba", "Ferdinand", "Spend A Buck", "Swale", "Sunny's Halo", "Gato Del Sol", "Pleasant Colony",
        "Genuine Risk", "Spectacular Bid", "Affirmed ", "Seattle Slew ", "Bold Forbes", "Foolish Pleasure", "Cannonade", "Secretariat ", "Riva Ridge", "Canonero II",
        "Dust Commander", "Majestic Prince", "Forward Pass", "Proud Clarion", "Kauai King", "Lucky Debonair", "Northern Dancer", "Chateaugay", "Decidedly", "Carry Back",
        "Venetian Way", "Tomy Lee", "Tim Tam", "Iron Liege", "Needles", "Swaps", "Determine", "Dark Star", "Hill Gail", "Count Turf", "Middleground", "Ponder", "Citation ",
        "Jet Pilot", "Assault ", "Hoop Jr.", "Pensive", "Count Fleet ", "Shut Out", "Whirlaway ", "Gallahadion", "Johnstown", "Lawrin", "War Admiral ", "Bold Venture",
        "Omaha ", "Cavalcade", "Brokers Tip", "Burgoo King", "Twenty Grand", "Gallant Fox ", "Clyde Van Dusen", "Reigh Count", "Whiskery", "Bubbling Over", "Flying Ebony",
        "Black Gold", "Zev", "Morvich", "Behave Yourself", "Paul Jones", "Sir Barton ", "Exterminator", "Omar Khayyam", "George Smith", "Regret", "Old Rosebud", "Donerail",
        "Worth", "Meridian", "Donau", "Wintergreen", "Stone Street", "Pink Star", "Sir Huon", "Agile", "Elwood", "Judge Himes", "Alan-a-Dale", "His Eminence", "Lieut. Gibson",
        "Manuel", "Plaudit", "Typhoon II", "Ben Brush", "Halma", "Chant", "Lookout", "Azra", "Kingman", "Riley", "Spokane", "Macbeth II", "Montrose", "Ben Ali", "Joe Cotton",
        "Buchanan", "Leonatus", "Apollo", "Hindoo", "Fonso", "Lord Murphy", "Day Star", "Baden-Baden", "Vagrant", "Aristides"];

    const betTypes = [{ Id: 1, Name: "Win" }, { Id: 2, Name: "Place" }, { Id: 3, Name: "Show" }, { Id: 4, Name: "WPS" }];

    const betFilters = [{ Id: 1, Name: "all" }, { Id: 2, Name: "active" }, { Id: 3, Name: "completed" }];

    //comma separated list of global constants
    return {
        ANIMALS: new ReadOnlyArray(animals),
        ADJECTIVES: new ReadOnlyArray(adjectives),
        US_STATES: new ReadOnlyArray(states),
        DERBY_WINNERS: new ReadOnlyArray(derbyWinners),
        BET_TYPES: new ReadOnlyArray(betTypes),
        BET_FILTERS: new ReadOnlyArray(betFilters)
    };

})();