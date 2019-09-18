const passGen = require('./passwordGen')

var list1 = [
    'Time','Past','Future','Dev',
    'Fly','Flying','Soar','Soaring','Power','Falling',
    'Fall','Jump','Cliff','Mountain','Rend','Red','Blue',
    'Green','Yellow','Gold','Demon','Demonic','Panda','Cat',
    'Kitty','Kitten','Zero','Memory','Trooper','XX','Bandit',
    'Fear','Light','Glow','Tread','Deep','Deeper','Deepest',
    'Mine','Your','Worst','Enemy','Hostile','Force','Video',
    'Game','Donkey','Mule','Colt','Cult','Cultist','Magnum',
    'Gun','Assault','Recon','Trap','Trapper','Redeem','Code',
    'Script','Writer','Near','Close','Open','Cube','Circle',
    'Geo','Genome','Germ','Spaz','Shot','Echo','Beta','Alpha',
    'Gamma','Omega','Seal','Squid','Money','Cash','Lord','King',
    'Duke','Rest','Fire','Flame','Morrow','Break','Breaker','Numb',
    'Ice','Cold','Rotten','Sick','Sickly','Janitor','Camel','Rooster',
    'Sand','Desert','Dessert','Hurdle','Racer','Eraser','Erase','Big',
    'Small','Short','Tall','Sith','Bounty','Hunter','Cracked','Broken',
    'Sad','Happy','Joy','Joyful','Crimson','Destiny','Deceit','Lies',
    'Lie','Honest','Destined','Bloxxer','Hawk','Eagle','Hawker','Walker',
    'Zombie','Sarge','Capt','Captain','Punch','One','Two','Uno','Slice',
    'Slash','Melt','Melted','Melting','Fell','Wolf','Hound',
    'Legacy','Sharp','Dead','Mew','Chuckle','Bubba','Bubble','Sandwich','Smasher',
    'Extreme','Multi','Universe','Ultimate','Death','Ready','Monkey','Elevator','Wrench',
    'Grease','Head','Theme','Grand','Cool','Kid','Boy','Girl','Vortex','Paradox'
  ]; 
   var list2 = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry",
  "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring",
  "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered",
  "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
  "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
  "red", "rough", "still", "small", "sparkling", "throbbing", "shy",
  "wandering", "withered", "wild", "black", "young", "holy", "solitary",
  "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
  "polished", "ancient", "purple", "lively", "nameless"]

  var list3 = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea",
  "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn",
  "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird",
  "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower",
  "firefly", "feather", "grass", "haze", "mountain", "night", "pond",
  "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf",
  "thunder", "violet", "water", "wildflower", "wave", "water", "resonance",
  "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
  "frog", "smoke", "star"];

  
  
  function smallRandom() {
    return passGen.generatePassword(5, true, true, true, false, true)   
  }
  
  function pick(l) {
      return l[Math.floor( Math.random() * l.length )];
  }
  function maybe(func) {
       const i = Math.random()
        if(i < 0.5) {
           return func() 
        } else {
           return ""     
        }
  }
  
  
  function oneOf(l1, l2, l3) {
     const i = Math.random()
     if(i < 0.2) {
        return pick(l1) 
     } else  if(i < 0.4) {
        return pick(l2) 
     } else if(i < 0.6) {
        return pick(l2) 
     } else {
         return smallRandom()
     }
     
    }
    
    function oneWord() {
        return oneOf(list1, list2, list3)
    }
  
  function randName(){
      const i = Math.random()
       if(i < 0.5) {
           return  maybe(oneWord) + oneWord() + smallRandom() + maybe(oneWord) 
        } else {
           return  maybe(oneWord) +  smallRandom() + oneWord() + maybe(oneWord)    
        }
  }
  
  exports.generateUsername = randName