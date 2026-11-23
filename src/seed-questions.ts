// Banka otázok (schválená 23. 11. 2026). Generované z dokumentu „Kvíz – banka 60 otázok“.
export type SeedQuestion = {
  topic: string // slug témy
  order: number
  difficulty: 'easy' | 'medium' | 'hard'
  multiple: boolean
  question: string
  options: { text: string; correct: boolean }[]
  explanation: string
}

export const questions: SeedQuestion[] = [
  {
    "topic": "uvod",
    "order": 1,
    "difficulty": "easy",
    "multiple": false,
    "question": "Čo je social engineering?",
    "options": [
      {
        "text": "Útok, pri ktorom útočník manipuluje ľudí, aby mu sami dali údaje, prístup alebo peniaze",
        "correct": true
      },
      {
        "text": "Prelomenie hesla skúšaním všetkých kombinácií",
        "correct": false
      },
      {
        "text": "Zneužitie chyby v softvéri",
        "correct": false
      }
    ],
    "explanation": "Social engineering necieli na techniku, ale na dôveru, emócie a zvyky ľudí."
  },
  {
    "topic": "uvod",
    "order": 2,
    "difficulty": "easy",
    "multiple": false,
    "question": "Ktorá veta je typickým znakom manipulácie?",
    "options": [
      {
        "text": "„Pošlite mi to, keď budete mať čas.“",
        "correct": false
      },
      {
        "text": "„Musí to byť hotové do hodiny, inak budú problémy.“",
        "correct": true
      },
      {
        "text": "„Pozvánka na poradu je v kalendári.“",
        "correct": false
      }
    ],
    "explanation": "Naliehanie a strašenie následkami je klasická páka – berie vám čas na overenie."
  },
  {
    "topic": "uvod",
    "order": 3,
    "difficulty": "medium",
    "multiple": true,
    "question": "Volajúci sa predstaví ako asistent riaditeľa a žiada ihneď poslať zoznam kontaktov odboru. Ktoré psychologické páky používa?",
    "options": [
      {
        "text": "Autoritu",
        "correct": true
      },
      {
        "text": "Naliehavosť",
        "correct": true
      },
      {
        "text": "Zvedavosť",
        "correct": false
      },
      {
        "text": "Chamtivosť",
        "correct": false
      }
    ],
    "explanation": "Požičaná autorita („od riaditeľa“) a časový tlak („ihneď“). Zvedavosť ani zisk tu nehrajú úlohu."
  },
  {
    "topic": "uvod",
    "order": 4,
    "difficulty": "medium",
    "multiple": false,
    "question": "Prečo útočníci pred útokom zisťujú informácie z webu, LinkedInu či výročných správ?",
    "options": [
      {
        "text": "Aby útok pôsobil dôveryhodne – poznajú mená, funkcie a agendu",
        "correct": true
      },
      {
        "text": "Aby zistili, aký antivírus úrad používa",
        "correct": false
      },
      {
        "text": "Nerobia to, útoky sú vždy hromadné",
        "correct": false
      }
    ],
    "explanation": "Prieskum robí z hromadného útoku cielený – správa potom presne sedí do vašej práce."
  },
  {
    "topic": "uvod",
    "order": 5,
    "difficulty": "hard",
    "multiple": false,
    "question": "Ktoré tvrdenie o dnešných útokoch je pravdivé?",
    "options": [
      {
        "text": "Podvod sa dá vždy spoznať podľa gramatických chýb",
        "correct": false
      },
      {
        "text": "Dobre pripravený útok môže byť bezchybný a presne sedieť do vašej agendy",
        "correct": true
      },
      {
        "text": "Správa z internej adresy alebo čísla je vždy bezpečná",
        "correct": false
      },
      {
        "text": "Útoky cielia len na vedenie",
        "correct": false
      }
    ],
    "explanation": "Cielené útoky bývajú jazykovo bezchybné a môžu prísť aj z napadnutej internej schránky. Terčom je ktokoľvek s prístupom."
  },
  {
    "topic": "uvod",
    "order": 6,
    "difficulty": "hard",
    "multiple": false,
    "question": "Kolega vám povie, že mu dnes volala „IT podpora“ a pýtala heslo, ale on nič nedal. Čo je správne?",
    "options": [
      {
        "text": "Nič, veď sa nič nestalo",
        "correct": false
      },
      {
        "text": "Nahlásiť to IT – útočník pravdepodobne volá aj ďalším kolegom",
        "correct": true
      },
      {
        "text": "Zavolať späť na číslo, z ktorého volali, a zistiť, kto to bol",
        "correct": false
      },
      {
        "text": "Upozorniť kolegov e-mailom a ďalej to neriešiť",
        "correct": false
      }
    ],
    "explanation": "Aj neúspešný pokus treba nahlásiť – IT môže varovať ostatných a útok zablokovať. Volanie späť na podvrhnuté číslo nič neoveruje."
  },
  {
    "topic": "phishing",
    "order": 1,
    "difficulty": "easy",
    "multiple": false,
    "question": "E-mail vás upozorní, že heslo vyprší, a žiada prihlásiť sa cez odkaz. Čo urobíte?",
    "options": [
      {
        "text": "Kliknem a prihlásim sa, nech nestratím prístup",
        "correct": false
      },
      {
        "text": "Neklikám; heslo zmením priamo v systéme a e-mail nahlásim IT",
        "correct": true
      },
      {
        "text": "Prepošlem e-mail kolegom, nech si to tiež skontrolujú",
        "correct": false
      }
    ],
    "explanation": "Legitímny systém vás nenúti prihlasovať sa cez odkaz z e-mailu. K zmene hesla pristúpte priamo."
  },
  {
    "topic": "phishing",
    "order": 2,
    "difficulty": "easy",
    "multiple": false,
    "question": "Čo je spear phishing?",
    "options": [
      {
        "text": "Phishing rozoslaný hromadne tisíckam ľudí",
        "correct": false
      },
      {
        "text": "Phishing pripravený na konkrétnu osobu s využitím reálneho kontextu",
        "correct": true
      },
      {
        "text": "Phishing cez SMS",
        "correct": false
      }
    ],
    "explanation": "Spear phishing pozná vaše meno, funkciu aj projekt, preto pôsobí dôveryhodne."
  },
  {
    "topic": "phishing",
    "order": 3,
    "difficulty": "medium",
    "multiple": false,
    "question": "Text odkazu ukazuje „intranet.vicepremier.gov.sk“, ale po podržaní myši vidíte adresu https://intranet.vicepremier.gov.sk.overenie-uctu.net/login. Komu stránka patrí?",
    "options": [
      {
        "text": "Úradu – adresa začína správne",
        "correct": false
      },
      {
        "text": "Doméne overenie-uctu.net",
        "correct": true
      },
      {
        "text": "Nedá sa to určiť",
        "correct": false
      }
    ],
    "explanation": "Rozhoduje koniec názvu pred prvou lomkou. Všetko pred ním si útočník môže nazvať, ako chce."
  },
  {
    "topic": "phishing",
    "order": 4,
    "difficulty": "medium",
    "multiple": false,
    "question": "Ktorá príloha v neočakávanom e-maile je najrizikovejšia?",
    "options": [
      {
        "text": "Faktura_2026.pdf",
        "correct": false
      },
      {
        "text": "Faktura_2026.pdf.html",
        "correct": true
      },
      {
        "text": "Zapisnica_porada.docx",
        "correct": false
      }
    ],
    "explanation": "Dvojitá prípona maskuje HTML súbor – po otvorení často zobrazí falošný prihlasovací formulár."
  },
  {
    "topic": "phishing",
    "order": 5,
    "difficulty": "hard",
    "multiple": false,
    "question": "Kolega vám v existujúcom vlákne zo svojej skutočnej adresy pošle odkaz na „zdieľaný dokument“, ktorý žiada prihlásenie do Microsoft 365. Čo je najrozumnejšie?",
    "options": [
      {
        "text": "Prihlásim sa, adresa aj vlákno sú pravé",
        "correct": false
      },
      {
        "text": "Odpíšem mu do vlákna, či to naozaj poslal on",
        "correct": false
      },
      {
        "text": "Overím to u neho telefonicky alebo osobne a podozrenie nahlásim IT",
        "correct": true
      },
      {
        "text": "E-mail ignorujem a zmažem",
        "correct": false
      }
    ],
    "explanation": "Kolegova schránka môže byť napadnutá. Odpoveď do vlákna by čítal útočník, preto treba iný kanál."
  },
  {
    "topic": "phishing",
    "order": 6,
    "difficulty": "hard",
    "multiple": true,
    "question": "Zadali ste heslo na podozrivej stránke. Vzápätí vám príde v aplikácii Authenticator výzva na schválenie prihlásenia, ktorú ste nevyvolali. Čo urobíte?",
    "options": [
      {
        "text": "Výzvu zamietnem",
        "correct": true
      },
      {
        "text": "Výzvu schválim, nech ma prestane otravovať",
        "correct": false
      },
      {
        "text": "Okamžite kontaktujem IT",
        "correct": true
      },
      {
        "text": "S pomocou IT si zmením heslo",
        "correct": true
      }
    ],
    "explanation": "Útočník má vaše heslo a čaká, kým mu prihlásenie schválite. Zamietnuť, nahlásiť a zmeniť heslo."
  },
  {
    "topic": "vishing",
    "order": 1,
    "difficulty": "easy",
    "multiple": false,
    "question": "Volá „IT podpora“ a pýta si vaše heslo kvôli údržbe. Čo urobíte?",
    "options": [
      {
        "text": "Heslo nadiktujem, veď je to IT",
        "correct": false
      },
      {
        "text": "Heslo nedám, hovor ukončím a zavolám na známe číslo IT",
        "correct": true
      },
      {
        "text": "Heslo pošlem radšej e-mailom",
        "correct": false
      }
    ],
    "explanation": "IT heslo nikdy nepotrebuje. Overte si to cez číslo, ktoré poznáte vy, nie volajúci."
  },
  {
    "topic": "vishing",
    "order": 2,
    "difficulty": "easy",
    "multiple": false,
    "question": "Môže od vás IT podpora legitímne žiadať heslo alebo kód z SMS?",
    "options": [
      {
        "text": "Áno, pri údržbe systémov",
        "correct": false
      },
      {
        "text": "Nie, nikdy",
        "correct": true
      },
      {
        "text": "Len ak volá z interného čísla",
        "correct": false
      }
    ],
    "explanation": "Heslo ani overovací kód nikomu nediktujte – ani IT, ani nadriadenému."
  },
  {
    "topic": "vishing",
    "order": 3,
    "difficulty": "medium",
    "multiple": false,
    "question": "Na displeji svieti interné číslo úradu. Je hovor dôveryhodný?",
    "options": [
      {
        "text": "Áno, interné číslo sa nedá podvrhnúť",
        "correct": false
      },
      {
        "text": "Nie nutne – číslo volajúceho sa dá podvrhnúť",
        "correct": true
      },
      {
        "text": "Áno, ak volajúci pozná vaše meno",
        "correct": false
      }
    ],
    "explanation": "Zobrazené číslo (caller ID) si útočník môže nastaviť. Meno a oddelenie zistí z webu."
  },
  {
    "topic": "vishing",
    "order": 4,
    "difficulty": "medium",
    "multiple": false,
    "question": "Volajúci tlačí: „Ak to nevyriešime do 10 minút, prídete o dáta.“ Čo je správne?",
    "options": [
      {
        "text": "Rýchlo urobiť, čo žiada",
        "correct": false
      },
      {
        "text": "Hovor ukončiť a problém si overiť cez helpdesk",
        "correct": true
      },
      {
        "text": "Vypýtať si od neho číslo a zavolať mu späť",
        "correct": false
      }
    ],
    "explanation": "Číslo od volajúceho nič neoveruje. Kontakt na IT musí pochádzať z vašich zdrojov."
  },
  {
    "topic": "vishing",
    "order": 5,
    "difficulty": "hard",
    "multiple": false,
    "question": "„IT“ vás požiada, aby ste prečítali kód, ktorý vám práve prišiel v SMS, „na overenie identity“. Čo sa v skutočnosti deje?",
    "options": [
      {
        "text": "Bežné overenie totožnosti pri hovore",
        "correct": false
      },
      {
        "text": "Útočník sa pravdepodobne prihlasuje do vášho účtu a potrebuje váš overovací kód",
        "correct": true
      },
      {
        "text": "IT vám resetuje heslo a kód potvrdzuje reset",
        "correct": false
      }
    ],
    "explanation": "Kód z SMS je druhý faktor prihlásenia. Kto ho od vás získa, prihlási sa ako vy."
  },
  {
    "topic": "vishing",
    "order": 6,
    "difficulty": "hard",
    "multiple": true,
    "question": "Volajúci znie presne ako riaditeľ a naliehavo chce, aby ste ihneď poslali citlivý dokument na externú adresu. Čo je správne?",
    "options": [
      {
        "text": "Poslať ho, hlas sedí",
        "correct": false
      },
      {
        "text": "Hovor ukončiť a zavolať riaditeľovi späť na známe číslo",
        "correct": true
      },
      {
        "text": "Postupovať podľa bežného postupu pre odosielanie dokumentov",
        "correct": true
      },
      {
        "text": "Poslať len časť dokumentu",
        "correct": false
      }
    ],
    "explanation": "Hlas sa dá napodobniť (deepfake). Overenie spätným hovorom a štandardný postup platia aj pre vedenie."
  },
  {
    "topic": "smishing",
    "order": 1,
    "difficulty": "easy",
    "multiple": false,
    "question": "Príde SMS o nedoručenej zásielke s odkazom na doplatok 1,49 €. Čo urobíte?",
    "options": [
      {
        "text": "Zaplatím, je to malá suma",
        "correct": false
      },
      {
        "text": "Neklikám; stav zásielky overím v aplikácii alebo na webe prepravcu",
        "correct": true
      },
      {
        "text": "Odpíšem na SMS a spýtam sa, o akú zásielku ide",
        "correct": false
      }
    ],
    "explanation": "Odkaz z neočakávanej SMS neotvárajte. Prepravcu si otvorte sami."
  },
  {
    "topic": "smishing",
    "order": 2,
    "difficulty": "easy",
    "multiple": false,
    "question": "Čo je smishing?",
    "options": [
      {
        "text": "Phishing cez SMS alebo chatovacie aplikácie",
        "correct": true
      },
      {
        "text": "Podvodný telefonát",
        "correct": false
      },
      {
        "text": "Podvodný QR kód",
        "correct": false
      }
    ],
    "explanation": "Smishing = SMS + phishing. Cieľom je dostať vás na falošnú stránku."
  },
  {
    "topic": "smishing",
    "order": 3,
    "difficulty": "medium",
    "multiple": true,
    "question": "SMS znie: „Vaša zásielka nebola doručená. Doplaťte 1,49 € do 24 hodín: zasielka-doplatok.top/sk“. Čo je podozrivé?",
    "options": [
      {
        "text": "Zásielka, ktorú nečakáte",
        "correct": true
      },
      {
        "text": "Krátka lehota „do 24 hodín“",
        "correct": true
      },
      {
        "text": "Adresa, ktorá nepatrí prepravcovi",
        "correct": true
      },
      {
        "text": "To, že je správa po slovensky",
        "correct": false
      }
    ],
    "explanation": "Neočakávaná udalosť, časový tlak a cudzia doména sú tri klasické znaky."
  },
  {
    "topic": "smishing",
    "order": 4,
    "difficulty": "medium",
    "multiple": false,
    "question": "Prečo podvodníci často žiadajú len malú sumu, napríklad 1,49 €?",
    "options": [
      {
        "text": "Malá suma znižuje ostražitosť – v skutočnosti chcú údaje platobnej karty",
        "correct": true
      },
      {
        "text": "Ide o skutočný poplatok za doručenie",
        "correct": false
      },
      {
        "text": "Malé platby nie sú trestné",
        "correct": false
      }
    ],
    "explanation": "Po zadaní karty môže útočník strhnúť oveľa vyššie sumy alebo kartu zneužiť inde."
  },
  {
    "topic": "smishing",
    "order": 5,
    "difficulty": "hard",
    "multiple": false,
    "question": "SMS sa vám zobrazí vo vlákne s kontaktom „Banka“, kde máte aj staršie pravé správy. Žiada potvrdiť platbu cez odkaz. Čo platí?",
    "options": [
      {
        "text": "Je pravá, telefón ju priradil k uloženému kontaktu",
        "correct": false
      },
      {
        "text": "Odosielateľa SMS sa dá podvrhnúť, takže sa podvod môže zaradiť aj medzi pravé správy",
        "correct": true
      },
      {
        "text": "Banky bežne posielajú odkazy na potvrdenie platieb",
        "correct": false
      }
    ],
    "explanation": "Meno odosielateľa SMS nie je overené. Platby potvrdzujte len v aplikácii banky."
  },
  {
    "topic": "smishing",
    "order": 6,
    "difficulty": "hard",
    "multiple": false,
    "question": "Na služobnom mobile ste cez odkaz z SMS zadali prihlasovacie údaje do „Microsoft 365“. Čo urobíte ako prvé?",
    "options": [
      {
        "text": "Nič, je to len mobil",
        "correct": false
      },
      {
        "text": "Okamžite to nahlásim IT, aby zablokovali prístup a zmenili heslo",
        "correct": true
      },
      {
        "text": "Vymažem SMS, aby nezostala stopa",
        "correct": false
      },
      {
        "text": "Počkám, či sa objaví niečo podozrivé",
        "correct": false
      }
    ],
    "explanation": "Útočník môže údaje použiť o pár minút. Rýchle nahlásenie rozhoduje o rozsahu škody."
  },
  {
    "topic": "quishing",
    "order": 1,
    "difficulty": "easy",
    "multiple": false,
    "question": "Čo je quishing?",
    "options": [
      {
        "text": "Phishing pomocou QR kódu",
        "correct": true
      },
      {
        "text": "Rýchly hromadný phishing",
        "correct": false
      },
      {
        "text": "Podvod cez hlasový hovor",
        "correct": false
      }
    ],
    "explanation": "QR kód vás nasmeruje na podvodnú stránku – na platbu, prihlásenie alebo stiahnutie aplikácie."
  },
  {
    "topic": "quishing",
    "order": 2,
    "difficulty": "easy",
    "multiple": false,
    "question": "Na parkovacom automate je nálepka s QR kódom na platbu. Čo je rozumné?",
    "options": [
      {
        "text": "Naskenovať a hneď zaplatiť",
        "correct": false
      },
      {
        "text": "Skontrolovať, či nie je prelepená, a radšej platiť cez oficiálnu aplikáciu",
        "correct": true
      },
      {
        "text": "Naskenovať a zadať kartu, keď stránka vyzerá profesionálne",
        "correct": false
      }
    ],
    "explanation": "Falošné nálepky sa lepia cez pôvodné kódy. Vzhľad stránky nič nedokazuje."
  },
  {
    "topic": "quishing",
    "order": 3,
    "difficulty": "medium",
    "multiple": false,
    "question": "E-mail vás vyzýva naskenovať QR kód na „obnovenie MFA“. Prečo je to podozrivé?",
    "options": [
      {
        "text": "Obnovenie MFA cez QR z e-mailu nie je bežný postup a QR odkaz obchádza kontrolu pošty",
        "correct": true
      },
      {
        "text": "Nie je to podozrivé, MFA sa tak bežne obnovuje",
        "correct": false
      },
      {
        "text": "QR kódy sú vždy vírusy",
        "correct": false
      }
    ],
    "explanation": "Pri služobnom prihlásení QR kód z e-mailu nikdy nepotrebujete. Nastavenia MFA riešte cez IT."
  },
  {
    "topic": "quishing",
    "order": 4,
    "difficulty": "medium",
    "multiple": false,
    "question": "Pred otvorením stránky z QR kódu vám mobil ukáže adresu „parkovanie-platba.xyz“. Čo urobíte?",
    "options": [
      {
        "text": "Otvorím ju, mobil ju už skontroloval",
        "correct": false
      },
      {
        "text": "Neotvorím ju – adresa nepatrí prevádzkovateľovi parkoviska",
        "correct": true
      },
      {
        "text": "Otvorím ju a pozriem, či stránka vyzerá dôveryhodne",
        "correct": false
      }
    ],
    "explanation": "Mobil adresu len zobrazí, neoveruje ju. Zvláštna doména je dôvod skončiť."
  },
  {
    "topic": "quishing",
    "order": 5,
    "difficulty": "hard",
    "multiple": true,
    "question": "Prečo je QR kód v e-maile pre úrad nebezpečnejší ako bežný odkaz?",
    "options": [
      {
        "text": "Poštové filtre ho ako odkaz často nerozpoznajú",
        "correct": true
      },
      {
        "text": "Otvára sa na mobile, často mimo ochrany úradu",
        "correct": true
      },
      {
        "text": "Na malom displeji sa ťažšie kontroluje celá adresa",
        "correct": true
      },
      {
        "text": "QR kód po naskenovaní sám nainštaluje malvér",
        "correct": false
      }
    ],
    "explanation": "QR je obrázok, nie text, a presunie útok na mobil. Sám o sebe ale nič neinštaluje."
  },
  {
    "topic": "quishing",
    "order": 6,
    "difficulty": "hard",
    "multiple": false,
    "question": "Kolega tvrdí: „QR kód na plagáte v našej budove je bezpečný, veď visí u nás.“ Prečo to neplatí?",
    "options": [
      {
        "text": "K chodbe má prístup veľa ľudí a nálepku môže ktokoľvek prelepiť",
        "correct": true
      },
      {
        "text": "Platí, interné plagáty sú vždy bezpečné",
        "correct": false
      },
      {
        "text": "Neplatí, lebo QR kódy na plagátoch sú zakázané",
        "correct": false
      }
    ],
    "explanation": "Miesto, kde kód visí, nehovorí nič o tom, kam vedie. Vždy skontrolujte adresu."
  },
  {
    "topic": "pretexting",
    "order": 1,
    "difficulty": "easy",
    "multiple": false,
    "question": "Čo je pretexting?",
    "options": [
      {
        "text": "Útok postavený na vymyslenom príbehu a falošnej identite",
        "correct": true
      },
      {
        "text": "Hromadné rozosielanie podvodných e-mailov",
        "correct": false
      },
      {
        "text": "Útok na webovú stránku úradu",
        "correct": false
      }
    ],
    "explanation": "Útočník sa vydáva za audítora, technika či kolegu a postupne získava informácie."
  },
  {
    "topic": "pretexting",
    "order": 2,
    "difficulty": "easy",
    "multiple": false,
    "question": "Neznámy „audítor“ vás požiada o zoznam používateľských účtov odboru. Čo urobíte?",
    "options": [
      {
        "text": "Pošlem ho, audit je dôležitý",
        "correct": false
      },
      {
        "text": "Overím jeho identitu a oprávnenie nezávisle a postupujem podľa postupu",
        "correct": true
      },
      {
        "text": "Pošlem len časť zoznamu",
        "correct": false
      }
    ],
    "explanation": "Skutočný audit má oznámený rozsah a kontaktné osoby, ktoré sa dajú overiť."
  },
  {
    "topic": "pretexting",
    "order": 3,
    "difficulty": "medium",
    "multiple": false,
    "question": "Človek, ktorý vám píše, pozná vaše meno, odbor aj aktuálny projekt. Čo to dokazuje?",
    "options": [
      {
        "text": "Že je to kolega z úradu",
        "correct": false
      },
      {
        "text": "Nič – také údaje sa dajú zistiť prieskumom",
        "correct": true
      },
      {
        "text": "Že ho poslal váš nadriadený",
        "correct": false
      }
    ],
    "explanation": "Znalosť detailov nie je dôkaz identity. Je to výsledok prípravy útočníka."
  },
  {
    "topic": "pretexting",
    "order": 4,
    "difficulty": "medium",
    "multiple": false,
    "question": "Ako správne overiť človeka, ktorý sa predstavuje ako technik dodávateľa?",
    "options": [
      {
        "text": "Zavolať na číslo z jeho podpisu",
        "correct": false
      },
      {
        "text": "Overiť ho cez kontakt z vlastných zdrojov – zmluva, adresár, nadriadený",
        "correct": true
      },
      {
        "text": "Opýtať sa ho na detaily, ktoré by mal poznať",
        "correct": false
      }
    ],
    "explanation": "Kontakty od žiadateľa aj jeho odpovede kontroluje on sám. Overenie musí ísť mimo neho."
  },
  {
    "topic": "pretexting",
    "order": 5,
    "difficulty": "hard",
    "multiple": false,
    "question": "Niekto sa vás postupne pýta, kto má dovolenku, aký systém používate na schvaľovanie a kto podpisuje platby. Každá otázka pôsobí nevinne. Čo je správne?",
    "options": [
      {
        "text": "Odpovedať, nič z toho nie je citlivé",
        "correct": false
      },
      {
        "text": "Rozpoznať, že skladá informácie na presnejší útok, a overiť, kto je a na čo to potrebuje",
        "correct": true
      },
      {
        "text": "Odpovedať len na prvé dve otázky",
        "correct": false
      }
    ],
    "explanation": "Samostatne bezvýznamné údaje tvoria skladačku, z ktorej vznikne cielený útok, napríklad BEC."
  },
  {
    "topic": "pretexting",
    "order": 6,
    "difficulty": "hard",
    "multiple": true,
    "question": "„Pán riaditeľ vás o tom určite informoval, termín máme do piatku.“ Prečo je táto veta varovným znakom?",
    "options": [
      {
        "text": "Požičiava si autoritu, aby ste sa nepýtali",
        "correct": true
      },
      {
        "text": "Vytvára časový tlak",
        "correct": true
      },
      {
        "text": "Odrádza vás od overenia u riaditeľa",
        "correct": true
      },
      {
        "text": "Nie je to varovný znak, je to bežná zdvorilosť",
        "correct": false
      }
    ],
    "explanation": "Autorita, termín a nenápadný tlak, aby ste si to u nikoho neoverili, je typická kombinácia pri pretextingu."
  },
  {
    "topic": "baiting",
    "order": 1,
    "difficulty": "easy",
    "multiple": false,
    "question": "Na parkovisku nájdete USB kľúč. Čo s ním?",
    "options": [
      {
        "text": "Pripojím ho, nech zistím, čí je",
        "correct": false
      },
      {
        "text": "Nepripojím ho a odovzdám ho IT",
        "correct": true
      },
      {
        "text": "Pripojím ho do súkromného počítača, nie služobného",
        "correct": false
      }
    ],
    "explanation": "Nájdené USB môže obsahovať škodlivý kód. Rizikové je aj pre súkromný počítač."
  },
  {
    "topic": "baiting",
    "order": 2,
    "difficulty": "easy",
    "multiple": false,
    "question": "Čo je baiting?",
    "options": [
      {
        "text": "Útok, ktorý láka na zvedavosť alebo zisk – nájdené USB, výhra, softvér zadarmo",
        "correct": true
      },
      {
        "text": "Podvodný telefonát",
        "correct": false
      },
      {
        "text": "Vniknutie do budovy za zamestnancom",
        "correct": false
      }
    ],
    "explanation": "Útočník nastraží lákadlo a čaká, kým ho niekto použije."
  },
  {
    "topic": "baiting",
    "order": 3,
    "difficulty": "medium",
    "multiple": false,
    "question": "Na USB je súbor „Odmeny_2026.xlsx.exe“. Čo to je?",
    "options": [
      {
        "text": "Excelová tabuľka",
        "correct": false
      },
      {
        "text": "Spustiteľný program zamaskovaný ako tabuľka",
        "correct": true
      },
      {
        "text": "Poškodený súbor",
        "correct": false
      }
    ],
    "explanation": "Rozhoduje posledná prípona – .exe. Windows ju predvolene skrýva, preto súbor vyzerá ako .xlsx."
  },
  {
    "topic": "baiting",
    "order": 4,
    "difficulty": "medium",
    "multiple": false,
    "question": "Prečo je štítok „DÔVERNÉ – ODMENY 2026“ na nájdenom USB podozrivý?",
    "options": [
      {
        "text": "Je zvolený tak, aby vzbudil zvedavosť a ľudia USB pripojili",
        "correct": true
      },
      {
        "text": "Nie je, dôverné médiá sa tak označujú",
        "correct": false
      },
      {
        "text": "Lebo USB kľúče sa neštítkujú",
        "correct": false
      }
    ],
    "explanation": "Lákavý názov je súčasť návnady – má vás presvedčiť, aby ste USB pripojili."
  },
  {
    "topic": "baiting",
    "order": 5,
    "difficulty": "hard",
    "multiple": false,
    "question": "Prečo môže byť USB nebezpečné, aj keď na ňom neotvoríte žiadny súbor?",
    "options": [
      {
        "text": "Niektoré zariadenia sa po pripojení tvária ako klávesnica a samy „napíšu“ príkazy",
        "correct": true
      },
      {
        "text": "Nemôže, nebezpečné sú len otvorené súbory",
        "correct": false
      },
      {
        "text": "Lebo USB môže prehriať počítač",
        "correct": false
      }
    ],
    "explanation": "Špeciálne zariadenia za pár sekúnd spustia príkazy, ako keby ich niekto písal na klávesnici."
  },
  {
    "topic": "baiting",
    "order": 6,
    "difficulty": "hard",
    "multiple": true,
    "question": "Kolega si stiahol „zadarmo“ plnú verziu plateného programu z neoficiálnej stránky. Čo je správne?",
    "options": [
      {
        "text": "Upozorniť ho, že ide o rizikový zdroj, a nahlásiť to IT",
        "correct": true
      },
      {
        "text": "Stiahnuť si ho tiež, keď u neho funguje",
        "correct": false
      },
      {
        "text": "Softvér inštalovať len zo schválených zdrojov cez IT",
        "correct": true
      },
      {
        "text": "Spustiť antivírus a ďalej to neriešiť",
        "correct": false
      }
    ],
    "explanation": "„Cracknuté“ programy sú častým nosičom malvéru. Antivírus ho nemusí zachytiť, preto treba IT."
  },
  {
    "topic": "tailgating",
    "order": 1,
    "difficulty": "easy",
    "multiple": false,
    "question": "Cudzí človek s krabicami vás pri dverách do zabezpečenej zóny požiada, aby ste ho pustili. Čo urobíte?",
    "options": [
      {
        "text": "Pustím ho, má plné ruky",
        "correct": false
      },
      {
        "text": "Nepustím ho a slušne ho nasmerujem na recepciu",
        "correct": true
      },
      {
        "text": "Požičiam mu svoju kartu",
        "correct": false
      }
    ],
    "explanation": "Do zabezpečených priestorov nepúšťajte nikoho bez vlastného prístupu."
  },
  {
    "topic": "tailgating",
    "order": 2,
    "difficulty": "easy",
    "multiple": false,
    "question": "Odchádzate od počítača „len na kávu“. Čo urobíte?",
    "options": [
      {
        "text": "Nechám ho odomknutý, hneď som späť",
        "correct": false
      },
      {
        "text": "Zamknem obrazovku (Win + L)",
        "correct": true
      },
      {
        "text": "Vypnem monitor",
        "correct": false
      }
    ],
    "explanation": "Vypnutý monitor počítač nezamkne. Stačí pár sekúnd a niekto môže použiť váš účet."
  },
  {
    "topic": "tailgating",
    "order": 3,
    "difficulty": "medium",
    "multiple": false,
    "question": "Osoba v reflexnej veste s nápisom „Servis“ tvrdí, že ide opraviť tlačiareň. Čo je správne?",
    "options": [
      {
        "text": "Uniforma stačí, pustím ju",
        "correct": false
      },
      {
        "text": "Overím, či je návšteva ohlásená, a nasmerujem ju na recepciu",
        "correct": true
      },
      {
        "text": "Pustím ju, ale budem ju sledovať",
        "correct": false
      }
    ],
    "explanation": "Uniformu alebo vestu si kúpi ktokoľvek. Rozhoduje ohlásená a overená návšteva."
  },
  {
    "topic": "tailgating",
    "order": 4,
    "difficulty": "medium",
    "multiple": false,
    "question": "Kolega zabudol kartu doma a prosí vás, či si môže požičať vašu. Čo urobíte?",
    "options": [
      {
        "text": "Požičiam mu ju, je to kolega",
        "correct": false
      },
      {
        "text": "Nepožičiam; nech si vybaví náhradnú kartu cez recepciu alebo správu budovy",
        "correct": true
      },
      {
        "text": "Kartu nepožičiam, ale každý deň ho pustím za sebou",
        "correct": false
      }
    ],
    "explanation": "Karta je vydaná na vaše meno – všetky vstupy s ňou sa zapíšu vám."
  },
  {
    "topic": "tailgating",
    "order": 5,
    "difficulty": "hard",
    "multiple": true,
    "question": "Čo môže útočník urobiť, keď sa dostane do kancelárie?",
    "options": [
      {
        "text": "Pripojiť vlastné zariadenie do siete",
        "correct": true
      },
      {
        "text": "Odfotiť dokumenty a heslá na lístočkoch",
        "correct": true
      },
      {
        "text": "Použiť odomknutý počítač",
        "correct": true
      },
      {
        "text": "Nič, bez hesla nemôže nič spraviť",
        "correct": false
      }
    ],
    "explanation": "Fyzický prístup obchádza mnohé technické ochrany naraz."
  },
  {
    "topic": "tailgating",
    "order": 6,
    "difficulty": "hard",
    "multiple": false,
    "question": "Pri vstupe sa k vám pridá sebaistý človek s preukazom na šnúrke, ktorý je otočený. Telefonuje a kývne vám. Čo urobíte?",
    "options": [
      {
        "text": "Pustím ho, preukaz má",
        "correct": false
      },
      {
        "text": "Slušne ho požiadam, aby použil vlastnú kartu; inak ho nasmerujem na recepciu",
        "correct": true
      },
      {
        "text": "Nič nepoviem, bolo by to trápne",
        "correct": false
      }
    ],
    "explanation": "Otočený preukaz a telefonát sú technika, ako sa vyhnúť otázkam. Platný preukaz otvorí dvere sám."
  },
  {
    "topic": "bec",
    "order": 1,
    "difficulty": "easy",
    "multiple": false,
    "question": "„Riaditeľ“ e-mailom žiada urgentnú platbu na nový účet a diskrétnosť. Čo urobíte?",
    "options": [
      {
        "text": "Zaplatím, je to pokyn riaditeľa",
        "correct": false
      },
      {
        "text": "Pravosť overím telefonicky alebo osobne a dodržím schvaľovací postup",
        "correct": true
      },
      {
        "text": "Odpíšem na e-mail a počkám na potvrdenie",
        "correct": false
      }
    ],
    "explanation": "Peniaze a zmena účtu sa vždy overujú druhým kanálom, bez ohľadu na funkciu žiadateľa."
  },
  {
    "topic": "bec",
    "order": 2,
    "difficulty": "easy",
    "multiple": false,
    "question": "Čo je BEC (Business Email Compromise)?",
    "options": [
      {
        "text": "Napodobenie riaditeľa alebo dodávateľa s cieľom získať platbu či údaje",
        "correct": true
      },
      {
        "text": "Druh počítačového vírusu",
        "correct": false
      },
      {
        "text": "Výpadok e-mailového servera",
        "correct": false
      }
    ],
    "explanation": "BEC často neobsahuje odkaz ani prílohu, preto ho filtre nezachytia."
  },
  {
    "topic": "bec",
    "order": 3,
    "difficulty": "medium",
    "multiple": false,
    "question": "Ktorá adresa nepatrí úradu?",
    "options": [
      {
        "text": "riaditel@vicepremier.gov.sk",
        "correct": false
      },
      {
        "text": "riaditel@vicepremier-gov.sk",
        "correct": true
      },
      {
        "text": "Obe patria úradu",
        "correct": false
      }
    ],
    "explanation": "Pomlčka namiesto bodky znamená úplne inú doménu s iným vlastníkom."
  },
  {
    "topic": "bec",
    "order": 4,
    "difficulty": "medium",
    "multiple": false,
    "question": "Dodávateľ e-mailom oznámi nové číslo účtu pre budúce platby. Čo urobíte?",
    "options": [
      {
        "text": "Zmením účet v systéme podľa e-mailu",
        "correct": false
      },
      {
        "text": "Zmenu overím telefonicky na čísle zo zmluvy alebo zo staršej komunikácie",
        "correct": true
      },
      {
        "text": "Odpíšem a vyžiadam si potvrdenie e-mailom",
        "correct": false
      }
    ],
    "explanation": "Ak je e-mail podvrhnutý alebo schránka napadnutá, potvrdenie e-mailom pošle znova útočník."
  },
  {
    "topic": "bec",
    "order": 5,
    "difficulty": "hard",
    "multiple": false,
    "question": "E-mail od „riaditeľa“ obsahuje vetu: „Som na rokovaní, nevolajte mi, len potvrďte e-mailom.“ Prečo je to vážny varovný znak?",
    "options": [
      {
        "text": "Útočník blokuje práve ten kanál, ktorý by ho odhalil",
        "correct": true
      },
      {
        "text": "Riaditelia bežne počas rokovaní nedvíhajú",
        "correct": false
      },
      {
        "text": "Nie je to varovný znak",
        "correct": false
      }
    ],
    "explanation": "Zákaz overenia je jeden z najsilnejších znakov podvodu. Práve vtedy treba overiť."
  },
  {
    "topic": "bec",
    "order": 6,
    "difficulty": "hard",
    "multiple": true,
    "question": "Faktúra s novým účtom príde v pokračovaní skutočného vlákna so známym dodávateľom, z jeho pravej adresy. Čo platí?",
    "options": [
      {
        "text": "Schránka dodávateľa môže byť napadnutá",
        "correct": true
      },
      {
        "text": "Pravá adresa a existujúce vlákno zaručujú pravosť",
        "correct": false
      },
      {
        "text": "Zmenu účtu treba overiť telefonicky na známom čísle",
        "correct": true
      },
      {
        "text": "Treba upozorniť ekonomický útvar a IT",
        "correct": true
      }
    ],
    "explanation": "Útočníci často najprv ovládnu schránku dodávateľa a pokračujú v reálnej komunikácii. Adresa vtedy nič nedokazuje."
  },
  {
    "topic": "obrana",
    "order": 1,
    "difficulty": "easy",
    "multiple": false,
    "question": "Aké sú tri kroky pri akomkoľvek podozrení?",
    "options": [
      {
        "text": "Zastav sa, over iným kanálom, nahlás",
        "correct": true
      },
      {
        "text": "Klikni, over, zmaž",
        "correct": false
      },
      {
        "text": "Ignoruj, zmaž, zabudni",
        "correct": false
      }
    ],
    "explanation": "Spomalenie, nezávislé overenie a nahlásenie fungujú proti každej technike."
  },
  {
    "topic": "obrana",
    "order": 2,
    "difficulty": "easy",
    "multiple": false,
    "question": "Omylom ste klikli na podozrivý odkaz. Čo urobíte?",
    "options": [
      {
        "text": "Nič nepoviem, aby som nemal problém",
        "correct": false
      },
      {
        "text": "Okamžite to nahlásim IT",
        "correct": true
      },
      {
        "text": "E-mail zmažem",
        "correct": false
      }
    ],
    "explanation": "Rýchle nahlásenie zmenší škodu. Mlčanie škodí najviac."
  },
  {
    "topic": "obrana",
    "order": 3,
    "difficulty": "medium",
    "multiple": false,
    "question": "Čo znamená „overiť iným kanálom“?",
    "options": [
      {
        "text": "Odpovedať na ten istý e-mail a spýtať sa",
        "correct": false
      },
      {
        "text": "Kontaktovať odosielateľa cez overený kontakt – známe číslo, osobne, vlastná záložka",
        "correct": true
      },
      {
        "text": "Preposlať správu kolegovi na posúdenie",
        "correct": false
      }
    ],
    "explanation": "Kanál pod kontrolou útočníka (jeho e-mail, jeho číslo, jeho odkaz) nič neoveruje."
  },
  {
    "topic": "obrana",
    "order": 4,
    "difficulty": "medium",
    "multiple": true,
    "question": "Ktoré návyky znižujú riziko?",
    "options": [
      {
        "text": "Prihlasovať sa cez vlastné záložky, nie cez odkazy zo správ",
        "correct": true
      },
      {
        "text": "Používať viacfaktorové overenie a kód nikomu nehovoriť",
        "correct": true
      },
      {
        "text": "Zamykať obrazovku pri každom odchode",
        "correct": true
      },
      {
        "text": "Používať jedno silné heslo všade",
        "correct": false
      }
    ],
    "explanation": "Jedno heslo všade znamená, že únik z jednej služby otvorí všetky ostatné."
  },
  {
    "topic": "obrana",
    "order": 5,
    "difficulty": "hard",
    "multiple": false,
    "question": "Prečo treba nahlásiť aj omyl, keď sa zdá, že sa „nič nestalo“?",
    "options": [
      {
        "text": "IT môže zastaviť útok skôr, než sa rozšíri, a varovať ostatných",
        "correct": true
      },
      {
        "text": "Kvôli disciplinárnemu konaniu",
        "correct": false
      },
      {
        "text": "Nie je to potrebné, keď sa nič nestalo",
        "correct": false
      }
    ],
    "explanation": "Mnohé útoky sa prejavia až po čase. IT vidí súvislosti, ktoré jednotlivec nevidí."
  },
  {
    "topic": "obrana",
    "order": 6,
    "difficulty": "hard",
    "multiple": false,
    "question": "Ste vedúci odboru a váš zamestnanec prizná, že klikol na phishing. Ako je najlepšie reagovať?",
    "options": [
      {
        "text": "Potrestať ho, aby si to zapamätal",
        "correct": false
      },
      {
        "text": "Oceniť, že to nahlásil, a zabezpečiť okamžitý kontakt s IT",
        "correct": true
      },
      {
        "text": "Vyriešiť to len v rámci odboru, bez IT",
        "correct": false
      }
    ],
    "explanation": "Ak sa ľudia boja trestu, omyly zatajujú. Kultúra nahlasovania je najlepšia obrana úradu."
  }
]
