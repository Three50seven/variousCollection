var UTILITIES = {
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    getNumberWithEnding: function (number) {
        //just return 0 if anything less than 1 is passed in
        if (number <= 0)
            return 0;
        //get the 'th' numbers first since this covers the majority:
        if (number % 100 === 10 || number % 100 === 11 || number % 100 === 12 || number % 100 === 13
            || number % 10 === 4 || number % 10 === 5 || number % 10 === 6 || number % 10 === 7
            || number % 10 === 8 || number % 10 === 9 || number % 10 === 0)
            return number.toString() + 'th';
        if (number % 10 === 1)
            return number.toString() + 'st';
        if (number % 10 === 2)
            return number.toString() + 'nd';
        if (number % 10 === 3)
            return number.toString() + 'rd';
    },
    //note, only works for minutes/seconds as of writing of function and needs at the time
    getTimeDisplay: function (timeSeconds) {
        console.log('timeSeconds: %s', timeSeconds);
        if (timeSeconds > 0) {
            var minutes = Math.floor(timeSeconds / 60);
            var seconds = timeSeconds - minutes * 60;
            return this.strPadLeft(minutes, '0', 2) + ':' + this.strPadLeft(seconds, '0', 2);
        }
        else {
            return '00:00';
        }
    },
    strPadLeft: function (string, pad, length) {
        return (new Array(length + 1).join(pad) + string).slice(-length);
    },
    titleCase: function (str) {
        let splitStr = '';

        if (str) {
            splitStr = str.toLowerCase().split(' ');
            for (var i = 0; i < splitStr.length; i++) {
                // You do not need to check if i is larger than splitStr length, as your for does that for you
                // Assign it back to the array
                splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
            }
            splitStr = splitStr.join(' ');
        }
        // Directly return the joined string
        return splitStr;
    },
    splitCamelCase: function (str) {
        if (str)
            return str.replace(/([A-Z]+)/g, "$1").replace(/([A-Z][a-z])/g, " $1"); //split on capital letters first (camel case strings) , e.g. thisString = this String       
        else
            return '';
    },
    splitAndTitleCase: function (str) {
        return this.titleCase(UTILITIES.splitCamelCase(str));
    },
    isNumber: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    getRandomElement: function (list) {
        var i = this.getRandomInt(0, list.length);
        return list[i];
    },
    getRandomAnimal: function (useTitleCase) {
        let animals = ["alligator", "anteater", "antelope", "armadillo", "pelican", "muskrat", "badger", "bat", "beaver", "buffalo", "camel", "jackalope", "starfish",
            "chameleon", "cheetah", "chinchilla", "chipmunk", "chupacabra", "flamingo", "coyote", "crow", "dingo", "dinosaur", "dog", "cow", "opossum", "jellyfish",
            "dolphin", "dragon", "duck", "octopus", "elephant", "ferret", "fox", "frog", "giraffe", "gopher", "grizzly", "hedgehog", "chicken", "Tasmanian devil",
            "hippo", "hyena", "jackal", "seagull", "coyote", "iguana", "koala", "kraken", "lemur", "leopard", "liger", "lion", "llama", "manatee", "lamb", "stingray",
            "mink", "monkey", "narwhal", "cat", "orangutan", "otter", "panda", "penguin", "platypus", "snake", "python", "zebra", "parakeet", "newt", "panther", "sloth",
            "rabbit", "raccoon", "rhino", "sheep", "shrew", "skunk", "loris", "squirrel", "tiger", "turtle", "unicorn", "walrus", "whale", "shark", "bear", "blue-jay",
            "wolf", "wolverine", "wombat", "cardinal", "wildcat", "falcon", "eagle", "bronco", "colt", "jaguar", "ram", "goat", "hawk", "warthog", "snail", "canary",
            "parrot", "salamander", "mole", "dragon", "lizard", "guppy", "deer", "gorilla", "gecko", "blowfish", "mouse", "mammoth", "owl", "puppy", "porcupine",
            "sea-turtle", "jackrabbit", "kangaroo", "kitten", "cub", "moose", "oyster", "goose", "wasp", "spider", "crab", "donkey", "mule", "elk", "swan", "horse", "pig",
            "weasel", "seal", "peacock", "butterfly", "bull", "lobster", "roadrunner"];

        let animal = this.getRandomElement(animals);

        return useTitleCase ? this.titleCase(animal) : animal;
    },
    getRandomAnimalWithAdjective: function (useTitleCase) {
        let adjectives = ["adamant", "cuddly" , "baleful", "violent", "embarrassed", "self-centered", "naked", "caustic", "bright", "wise-cracking", "horrible", "jumpy",
            "angry", "comely", "shaky", "sick", "zippy", "drunken", "defamatory", "sticky", "fighting", "painfully honest", "frozen", "filthy", "sporadic", "extreme",
            "bonkers", "harsh", "fluffy", "frisky", "greedy", "hideous", "crawly", "ungodly", "abusive", "idiotic", "hateful", "twisted", "morbid", "twitchy", "conniving",
            "useless", "yapping", "smelly", "magical", "indecent", "insolent", "arrogant", "confused", "flirting", "high-end", "insecure", "maniacal", "sneaky", "carnivorous",
            "sickened", "slippery", "stubborn", "talkative", "luminous", "mannered", "tripping", "vengeful", "sinister", "cowardly", "haunting", "wicked", "tiny", "kind", "nice",
            "noxious", "obtuse", "alcoholic", "demanding", "shivering", "offensive", "elusive", "startling", "disgusting", "slap happy", "disturbing", "sleazy", "joking", "jolly",
            "blathering", "rebellious", "lovely", "sexy", "hyperactive", "raunchy", "infuriating", "pea-brained", "territorial", "mischievous", "free-loading", "woolly", "grumpy",
            "house-broken", "house-trained", "cruel-hearted", "misunderstood", "narrow-minded", "tenacious", "self-absorbed", "crazy", "fierce", "swollen", "ubiquitous",
            "lush", "incessant", "voracious", "smoky", "withering", "zealous", "lazy", "rabid", "diseased", "hyper", "hairy", "gassy", "wise", "saber-tooth", "timid",
            "ferocious", "domesticated", "abnormal", "medicated", "cocky", "disrespectful", "impressive", "hilarious", "hot", "tactful", "bearded", "slimy", "insane",
            "energetic", "gentle", "playful", "intelligent", "loyal", "rough", "high", "wasted"];

        let name = this.getRandomElement(adjectives) + ' ' + this.getRandomAnimal(useTitleCase);

        return useTitleCase ? this.titleCase(name) : name;
    }
};