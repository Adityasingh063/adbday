/* =====================================================================
   config.js  -  THIS IS THE ONLY FILE YOU NEED TO EDIT
   =====================================================================

   FOLDER LAYOUT
   birthday/
   |-- index.html
   |-- style.css
   |-- script.js
   |-- config.js        <-- you are here
   |-- images/          <-- put your photos here (hero.jpg, photo1.jpg ...)
   |-- songs/           <-- put your songs here (wishes.mp3, memories.mp3)

   If a photo or song file is missing, the website does NOT break:
   a photo is replaced by a pretty placeholder and a song is replaced by
   the built-in melody. So you can add things step by step.
   ===================================================================== */

const CONFIG = {

  /* ---------- 1. NAMES & DATE ---------- */

  herName: "Maahivii",            // her name or nickname, e.g. "Priya"
  fromName: "Yours, ADii",    // how you sign each letter, e.g. "Rohan"

  // The moment your story began. Format: "YYYY-MM-DDTHH:MM:SS" (24-hour clock).
  // Example: 14 Feb 2023, 6:30 PM  ->  "2023-02-14T18:30:00"
  // If you don't remember the time, use "T00:00:00".
  startDate: "2019-01-10T10:30:00",


  /* ---------- 2. PAGE 1 : BACKGROUND PHOTO ---------- */

  // Put a photo in the images/ folder and write its path here.
  // Portrait or landscape both work. Leave "" for the pink gradient instead.
  heroPhoto: "images/hero.jpg",

  // The line under "Happy Birthday". Use {name} to insert her name.
  wishLine: "Today the world celebrates the girl who turned my ordinary days into my favourite ones.",


  /* ---------- 3. PAGE 1 : THE CARDS AND LOVE MESSAGES ----------
     Each card = one { } block. Tapping it opens a letter with "text".
     - icon  : flower | sun | heart | infinity | sparkle | star
     - title : the name shown on the card
     - text  : the message. {name} = her name, {from} = your name.
     You can have 2 to 9 cards. Add or delete blocks freely,
     but keep a comma after every block except the last one.
     Keep the text inside "double quotes" on ONE line.
     If you want a quote mark inside a message, write \" (backslash + quote).
  ------------------------------------------------------------------ */
  cards: [
    { icon: "flower", title: "You are beautiful",
      text: "Kuch log bas pretty hote hain… but tum kuch aur hi ho. ❤️ Tumhari woh smile, jisme tumhari aankhein aur bhi zyada chamakne lagti hain… jab tum shy hoti ho aur apne baal kaan ke peeche karti ho… aur pata nahi kaise, but tumhare enter karte hi poora atmosphere thoda aur soft, thoda aur beautiful lagne lagta hai. Tum sirf bahar se beautiful nahi ho. Tumhari beauty tumhari baaton mein hai, tumhare nature mein hai, tumhari smile mein hai, aur un chhoti-chhoti cheezon mein bhi hai jo tumhe lagta hai shayad koi notice nahi karta. But I do. Main tumhari woh little things bhi notice karta hoon… aur honestly, shayad isi wajah se tum mujhe har din thodi aur beautiful lagti ho. ❤️Tum bas beautiful nahi ho, Maahi… tum meri favourite kind of beautiful ho. ❤️" },

    { icon: "sun", title: "Your smile",
      text: "Your smile is my favourite place in the whole world. A bad day? One look at you and it is fixed. If I could keep only one thing forever, it would be the sound of your laugh and the sight of you smiling because of something silly I said." },

    { icon: "heart", title: "My heart",
      text: "I love you more than I can ever put into words, aur maine tumhe ye batane ke hundred ways try kiye hain. Tum woh first person ho jise main har good news batana chahta hoon, aur woh bhi jiske saath hard days thode easy lagte hain. Mera heart found its home, jis din usne tumhe paaya. ❤️{name}." },

    { icon: "infinity", title: "Forever",
      text: "Mujhe nahi pata future mein kya hai, but I know I want you in it. Main jo bhi plan banata hoon, somehow usmein tum hoti ho. Aage jo bhi aaye - woh peaceful evenings, crazy adventures, ya simple si ordinary Tuesdays - main ye sab tumhare saath hi jeena chahta hoon. ❤️" },

    { icon: "sparkle", title: "Thank you",
      text: "Thank you for being patient with me, for believing in me when I doubted myself, and for loving me even on the days I didn't deserve it. You make me a better person without even trying." },

    { icon: "star", title: "My birthday wish",
      text: "On your birthday my only wish is that you feel a fraction of the happiness you give me every single day. May this year bring you everything you dream of, and may you always know how deeply, madly, endlessly loved you are. Happy Birthday, My love Maahivii.❤️" }
  ],


  /* ---------- 4. PAGE 2 : PHOTO ALBUM ----------
     One { } block per photo. The album loops forever, so even 3-4 photos work.
     - src     : path to the photo inside the images/ folder
     - caption : the handwritten text under the photo
     - date    : small typewriter text (e.g. "14 . 02 . 2023"), or "" for none

     TIP: delete the blocks you don't need. Any block whose file is missing
     shows a placeholder polaroid ("your photo here").
     TIP: photos are cropped to a portrait 4:5 frame, so keep faces near the
     centre. Use .jpg, about 1200 px wide, under 500 KB each so it loads fast.
  ------------------------------------------------------------------ */
  photos: [
    { src: "images/photo6.jpg", caption: "Your Smile...Haaye!!",                  date: "" },
 
    { src: "images/photo1.jpg", caption: "Where..I lost myself..#julfein",       date: "" },
    { src: "images/photo2.jpg", caption: "That Togetherness",         date: "" },
    { src: "images/photo3.jpg", caption: "Our Promise for life.",           date: "" },
    { src: "images/photo4.jpg", caption: "A day I'd replay",         date: "" },
    { src: "images/photo5.jpg", caption: "Golden hour, golden you",  date: "" },
    { src: "images/photo7.jpg", caption: "My favourite person",      date: "" },
    { src: "images/photo8.jpg", caption: "To many more",             date: "" },
    { src: "images/photo9.jpg", caption: "sirf tum",             date: "" },
    { src: "images/photo10.jpg", caption: "The Best time",             date: "" }
  ],

  // Little typewriter notes that appear between the photos (every 3rd photo).
  notes: [
    "Some memories never fade. They just get softer, like old film.",
    "If I could rewind to any day, I'd pick every one with you.",
    "Look how far we've come, and I'm only getting started loving you.",
    "Every photo here has a story. You are in every one of my favourites."
  ],


  /* ---------- 5. PAGE 3 : CLOSING LINE ---------- */
  closing: "Every tick of this clock is a moment I'm grateful I got to spend with you.",


  /* ---------- 6. SONGS ----------
     Put .mp3 files in the songs/ folder and write the paths here.
     - wishes   : plays on page 1
     - album    : plays on page 2 (and page 3 too, unless "together" is set)
     - together : optional separate song for page 3. Leave "" to keep the album song.
     If a file is missing, a built-in melody plays instead.
     To use the built-in melody on purpose, set the value to "".
     Keep each song under ~5 MB (128 kbps mp3 is plenty).
  ------------------------------------------------------------------ */
  songs: {
    wishes:   "songs/wishes.mp3",
    album:    "songs/memories.mp3",
    together: "songs/song3.mp3"
  }
};
