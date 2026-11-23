// --- Pomocníci na stavbu Lexical obsahu ---
const txt = (text: string, bold = false) => ({
  type: 'text',
  text,
  version: 1,
  format: bold ? 1 : 0,
  mode: 'normal',
  style: '',
  detail: 0,
})

// p('text') alebo p(['Tučne: ', true], 'zvyšok vety')
type Part = string | [string, boolean]
const p = (...parts: Part[]) => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  textFormat: 0,
  children: parts.map((x) => (typeof x === 'string' ? txt(x) : txt(x[0], x[1]))),
})

const h2 = (text: string) => ({
  type: 'heading',
  tag: 'h2',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  children: [txt(text)],
})

const ul = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  children: items.map((it, i) => ({
    type: 'listitem',
    value: i + 1,
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    children: [txt(it)],
  })),
})

const doc = (nodes: unknown[]) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: nodes,
  },
})

const items = (arr: string[]) => arr.map((text) => ({ text }))
const flags = (arr: [string, string][]) => arr.map(([title, text]) => ({ title, text }))

export type SeedTopic = {
  slug: string
  title: string
  summary: string
  order: number
  readingMinutes: number
  content: unknown
  exampleCaption: string
  flagsHeading: string
  redFlags: { title: string; text: string }[]
  dos: { text: string }[]
  donts: { text: string }[]
  cheatsheet: { text: string }[]
  related: string[] // slugy, v seede sa preložia na ID
}

export const topics: SeedTopic[] = [
  // 1 ─────────────────────────────────────────────
  {
    slug: 'uvod',
    title: 'Čo je social engineering',
    summary: 'Prečo útoky na ľudí fungujú a aké psychologické páky útočníci používajú.',
    order: 1,
    readingMinutes: 4,
    content: doc([
      p(
        'Social engineering (sociálne inžinierstvo) je manipulácia, pri ktorej útočník namiesto prelomenia techniky zneužije človeka. Cieľom je, aby ste mu ',
        ['sami a dobrovoľne', true],
        ' dali to, čo chce – heslo, prístup, peniaze alebo informáciu.',
      ),
      p(
        'Firewall, antivírus ani šifrovanie nepomôžu, ak útočník presvedčí oprávneného používateľa, aby ich obišiel. Preto sa väčšina reálnych útokov – aj na štátne inštitúcie – začína práve e-mailom, telefonátom alebo správou.',
      ),
      h2('Ako útok prebieha'),
      ul([
        'Prieskum – útočník si zistí mená, funkcie a agendu z webu, výročných správ či sociálnych sietí.',
        'Zámienka – vymyslí uveriteľný príbeh a rolu (IT podpora, dodávateľ, riaditeľ, kuriér).',
        'Kontakt a tlak – osloví vás a vytvorí situáciu, v ktorej nemáte čas premýšľať.',
        'Zneužitie – získa údaje alebo prístup a pokračuje ďalej do siete či k ďalším ľuďom.',
      ]),
      h2('Psychologické páky'),
      p(
        'Útočníci nemusia byť technickí géniovia. Stačí im poznať pár prirodzených ľudských reakcií. Na obrázku nižšie je päť pák, ktoré sa opakujú takmer v každom útoku. Keď niektorú z nich v komunikácii spozorujete, je to signál spomaliť.',
      ),
      h2('Nie ste slabý článok'),
      p(
        'Ľudia nie sú „najslabší článok“ – sú posledná línia obrany. Kto vie rozpoznať manipuláciu a včas ju nahlási, zastaví útok skôr, než napácha škodu. Nahlásenie podozrenia nikdy nie je chyba.',
      ),
    ]),
    exampleCaption: 'Päť psychologických pák, na ktorých stojí väčšina útokov, s typickými vetami.',
    flagsHeading: 'Psychologické páky',
    redFlags: flags([
      ['Autorita', 'Pokyn „od riaditeľa“, „z ministerstva“ alebo „od IT“ spochybňujeme menej. Útočník si autoritu požičia.'],
      ['Naliehavosť', 'Časový tlak („do hodiny“, „hneď“) vám berie čas na overenie. Skutočné urgentné veci sa dajú overiť za minútu.'],
      ['Dôvera a ochota pomôcť', 'Chceme byť ústretoví k milému kolegovi či dodávateľovi. Útočník to zneužije prosbou o „drobnú láskavosť“.'],
      ['Strach', 'Hrozba zablokovania účtu, pokuty či problému vás tlačí konať rýchlo a bez rozmyslu.'],
      ['Zvedavosť a chamtivosť', 'Výhra, odmeny kolegov, „dôverný“ dokument – lákadlo, ktorému je ťažké odolať.'],
    ]),
    dos: items([
      'Keď cítite tlak, zastavte sa a dajte si minútu na premyslenie.',
      'Overujte žiadosti iným kanálom, ako ktorým prišli.',
      'Podozrenie nahláste IT podpore, aj keď si nie ste istí.',
    ]),
    donts: items([
      'Nekonajte pod časovým tlakom bez overenia.',
      'Nepredpokladajte, že útok spoznáte podľa chýb – dnešné útoky sú bezchybné.',
      'Nehanbite sa nahlásiť omyl – rýchle nahlásenie zmenší škodu.',
    ]),
    cheatsheet: items([
      'Útočí sa na ľudí, nie na stroje.',
      'Tlak + neobvyklá žiadosť = spomaľ.',
      'Overiť iným kanálom, potom konať.',
    ]),
    related: ['obrana', 'phishing', 'pretexting'],
  },

  // 2 ─────────────────────────────────────────────
  {
    slug: 'phishing',
    title: 'Phishing (e-mail)',
    summary: 'Podvodné e-maily, ktoré lákajú na odkaz alebo prílohu. Vrátane cieleného spear phishingu.',
    order: 2,
    readingMinutes: 5,
    content: doc([
      p(
        'Phishing je podvodný e-mail, ktorý sa tvári ako správa od dôveryhodného odosielateľa – IT oddelenia, banky, dodávateľa či úradu. Jeho cieľom je, aby ste ',
        ['klikli na odkaz, otvorili prílohu alebo zadali prihlasovacie údaje', true],
        ' na falošnej stránke.',
      ),
      h2('Ako to funguje'),
      p(
        'Útočník pošle e-mail s presvedčivou zámienkou (vypršanie hesla, nová faktúra, zdieľaný dokument). Odkaz vedie na stránku, ktorá vyzerá ako prihlásenie do pošty alebo intranetu. Čo tam napíšete, putuje rovno útočníkovi – a ten sa o pár minút prihlási ako vy.',
      ),
      h2('Spear phishing a whaling'),
      p(
        'Hromadný phishing chodí tisícom ľudí naraz. ',
        ['Spear phishing', true],
        ' je pripravený na konkrétneho človeka: pozná vaše meno, funkciu, aktuálny projekt aj kolegov, takže nemá gramatické chyby ani podozrivé oslovenie. Ak cieli na vedenie, hovoríme o ',
        ['whalingu', true],
        '. Práve cielené útoky sú pre úrad najnebezpečnejšie.',
      ),
      h2('Ako skontrolovať odkaz'),
      p(
        'Pred kliknutím podržte kurzor myši nad odkazom (na mobile podržte prst) a pozrite sa na skutočnú adresu. Rozhodujúca je časť tesne pred prvou lomkou – napr. pri adrese vicepremier.gov.sk.prihlasenie-overenie.net/login je skutočná doména prihlasenie-overenie.net, nie úrad.',
      ),
    ]),
    exampleCaption: 'Fiktívny e-mail o „vypršaní hesla“. Odosielateľ aj doména sú vymyslené.',
    flagsHeading: 'Varovné znaky',
    redFlags: flags([
      ['Cudzia doména odosielateľa', 'Zobrazované meno „IT-Helpdesk“ si môže nastaviť ktokoľvek. Rozhoduje adresa – tá nie je @vicepremier.gov.sk.'],
      ['Neosobné oslovenie', '„Dobrý deň“ alebo „Vážený používateľ“ namiesto mena naznačuje hromadne rozoslanú správu.'],
      ['Časový tlak a hrozba', '„Vyprší o 60 minút“, „účet bude zablokovaný“ – cieľom je, aby ste konali skôr, než premýšľate.'],
      ['Odkaz vedie inam', 'Tlačidlo vyzerá oficiálne, ale cieľová adresa patrí cudzej doméne. Prihlasujte sa vždy cez vlastnú záložku.'],
    ]),
    dos: items([
      'Pred kliknutím skontrolujte skutočnú adresu odkazu.',
      'Do systémov sa prihlasujte cez uloženú záložku alebo intranet, nie z e-mailu.',
      'Podozrivý e-mail nahláste IT podpore (ako prílohu alebo tlačidlom Nahlásiť).',
      'Ak ste už klikli alebo zadali heslo, okamžite to nahláste – rýchlosť rozhoduje.',
    ]),
    donts: items([
      'Nezadávajte heslo na stránke, na ktorú vás priviedol e-mail.',
      'Neotvárajte neočakávané prílohy (.zip, .html, .docm, .iso).',
      'Neodpovedajte odosielateľovi ani nepreposielajte e-mail kolegom „na overenie“.',
      'Nemažte e-mail potichu – IT ho potrebuje na zablokovanie útoku pre ostatných.',
    ]),
    cheatsheet: items([
      'Meno odosielateľa klame, adresa nie.',
      'Myš nad odkaz – čítaj doménu pred prvou lomkou.',
      'Heslo nikdy cez odkaz z e-mailu.',
    ]),
    related: ['bec', 'smishing', 'quishing'],
  },

  // 3 ─────────────────────────────────────────────
  {
    slug: 'vishing',
    title: 'Vishing (telefón)',
    summary: 'Telefonické podvody, napríklad „IT podpora“ žiadajúca heslo alebo vzdialený prístup.',
    order: 3,
    readingMinutes: 4,
    content: doc([
      p(
        'Vishing (voice phishing) je social engineering cez telefón. Útočník sa vydáva za IT podporu, banku, dodávateľa alebo kolegu z iného oddelenia a v rozhovore z vás ',
        ['vyláka heslo, overovací kód alebo vzdialený prístup', true],
        ' k počítaču.',
      ),
      h2('Prečo je telefón taký účinný'),
      p(
        'V rozhovore nemáte čas premýšľať – na otázku sa čaká odpoveď hneď. Útočník reaguje na vaše námietky, pôsobí sebaisto a často pozná vaše meno či oddelenie. Číslo na displeji sa navyše dá podvrhnúť (tzv. spoofing), takže hovor môže vyzerať, akoby prichádzal z interného čísla.',
      ),
      h2('Typické scenáre'),
      ul([
        '„Volám z IT, robíme migráciu pošty, potrebujem vaše heslo, inak prídete o e-maily.“',
        '„Prišiel vám kód v SMS, prečítajte mi ho, overujem vašu identitu.“',
        '„Nainštalujte si aplikáciu na vzdialenú správu, pozriem sa vám na ten problém.“',
        'Kombinácia s e-mailom: najprv príde phishing, potom „IT“ zavolá a „pomôže“ s prihlásením.',
      ]),
      h2('Zlaté pravidlo'),
      p(
        ['IT podpora od vás heslo ani overovací kód nikdy nepotrebuje.', true],
        ' Ak ho niekto pýta, je to útok – bez ohľadu na to, ako presvedčivo znie.',
      ),
    ]),
    exampleCaption: 'Fiktívny hovor od „IT podpory“ s prepisom rozhovoru.',
    flagsHeading: 'Varovné znaky',
    redFlags: flags([
      ['Neočakávaný hovor', 'Hovor ste neočakávali a nikde ste problém nenahlasovali. Číslo na displeji sa dá podvrhnúť, nedôverujte mu.'],
      ['Vytváranie tlaku', '„Ak to neurobíme hneď, prídete o dáta.“ Tlak má zabrániť tomu, aby ste zavesili a overili si to.'],
      ['Žiadosť o heslo alebo kód', 'Heslo, PIN ani kód z SMS či autentifikačnej aplikácie nikdy nikomu nediktujte.'],
      ['Inštalácia nástroja', 'Žiadosť nainštalovať aplikáciu na vzdialený prístup dá útočníkovi plnú kontrolu nad vaším počítačom.'],
    ]),
    dos: items([
      'Slušne ukončite hovor a zavolajte späť na overené číslo IT podpory.',
      'Overte si meno volajúceho cez interný adresár alebo helpdesk.',
      'Hovor nahláste – útočníci často volajú viacerým kolegom za sebou.',
    ]),
    donts: items([
      'Nediktujte heslo, PIN ani overovací kód – nikomu.',
      'Neinštalujte nič a nepovoľujte vzdialený prístup na pokyn z neočakávaného hovoru.',
      'Nespoliehajte sa na číslo zobrazené na displeji.',
      'Nepotvrdzujte ani „len“ meno účtu či podrobnosti o systémoch.',
    ]),
    cheatsheet: items([
      'IT heslo nikdy nepotrebuje.',
      'Zavesiť a zavolať späť na známe číslo.',
      'Kód z SMS je ako heslo.',
    ]),
    related: ['smishing', 'pretexting', 'phishing'],
  },

  // 4 ─────────────────────────────────────────────
  {
    slug: 'smishing',
    title: 'Smishing (SMS)',
    summary: 'Podvodné SMS s odkazmi – doručenie zásielky, banka, overenie účtu.',
    order: 4,
    readingMinutes: 3,
    content: doc([
      p(
        'Smishing je phishing cez SMS alebo chatovacie aplikácie. Správa je krátka, obsahuje ',
        ['odkaz a uveriteľnú zámienku', true],
        ' – nedoručená zásielka, doplatok, problém s bankovým účtom alebo výzva na overenie identity.',
      ),
      h2('Prečo na to ľudia naletia'),
      p(
        'Na mobile vidíte len časť adresy, správy čítame v pohybe a SMS pôsobí osobnejšie než e-mail. Zásielku navyše čaká takmer každý, takže zámienka často „sedí“. Malá suma (napr. 1,49 €) znižuje ostražitosť – v skutočnosti však nejde o poplatok, ale o údaje z platobnej karty.',
      ),
      h2('Pozor na služobný telefón'),
      p(
        'Ak máte na mobile služobnú poštu alebo autentifikačnú aplikáciu, smishing môže ohroziť aj úrad. Útočník tak môže získať prihlasovacie údaje alebo vás presmerovať na falošné prihlásenie do Microsoft 365.',
      ),
    ]),
    exampleCaption: 'Fiktívna SMS o „nedoručenej zásielke“. Odosielateľ aj adresa sú vymyslené.',
    flagsHeading: 'Varovné znaky',
    redFlags: flags([
      ['Neznámy odosielateľ', 'Číslo alebo názov odosielateľa nepoznáte. Aj názov firmy v SMS sa dá podvrhnúť.'],
      ['Zásielka, ktorú nečakáte', 'Neviete, o akú zásielku ide, a správa neuvádza konkrétny obchod ani objednávku.'],
      ['Krátka lehota', '„Do 24 hodín, inak sa zásielka vráti.“ Tlak má zabrániť overeniu.'],
      ['Podozrivá adresa', 'Doména nesúvisí s prepravcom, má nezvyčajnú koncovku alebo je skrátená.'],
    ]),
    dos: items([
      'Stav zásielky overte priamo v aplikácii alebo na webe prepravcu, ktorý si sami otvoríte.',
      'Podozrivú SMS zmažte, prípadne číslo zablokujte.',
      'Ak ste zadali údaje karty, okamžite volajte banku a kartu zablokujte.',
    ]),
    donts: items([
      'Neklikajte na odkazy v neočakávaných SMS.',
      'Nezadávajte údaje platobnej karty ani prihlasovacie údaje cez odkaz z SMS.',
      'Neodpovedajte na správu – potvrdíte tým, že číslo je aktívne.',
    ]),
    cheatsheet: items([
      'Neočakávaná SMS s odkazom = podozrivá.',
      'Zásielku over v appke prepravcu.',
      'Malá suma, veľká škoda.',
    ]),
    related: ['phishing', 'quishing', 'vishing'],
  },

  // 5 ─────────────────────────────────────────────
  {
    slug: 'quishing',
    title: 'Quishing (QR kódy)',
    summary: 'Podvodné QR kódy v e-mailoch, na plagátoch či nálepkách, ktoré vedú na falošnú stránku.',
    order: 5,
    readingMinutes: 3,
    content: doc([
      p(
        'Quishing (QR phishing) využíva QR kód, ktorý vás po naskenovaní ',
        ['nasmeruje na podvodnú stránku', true],
        ' – na platbu, prihlásenie alebo stiahnutie aplikácie.',
      ),
      h2('Prečo je QR kód zradný'),
      ul([
        'Okom neprečítate, kam kód vedie – musíte veriť tomu, kto ho umiestnil.',
        'QR kód v e-maile je obrázok, takže ho poštové filtre často nerozpoznajú ako odkaz.',
        'Útok sa presúva na mobil, kde je menej ochrany a menšia obrazovka.',
      ]),
      h2('Kde ho stretnete'),
      p(
        'Na falošných nálepkách prelepených cez pôvodný kód (parkovanie, nabíjacie stanice, reštaurácie), v e-mailoch typu „naskenujte na obnovenie MFA“ či na letákoch. Pri prihlasovaní do služobných systémov QR kódy z e-mailu nikdy nepotrebujete.',
      ),
    ]),
    exampleCaption: 'Fiktívna nálepka na parkovacom automate. QR kód nie je funkčný.',
    flagsHeading: 'Varovné znaky',
    redFlags: flags([
      ['Nálepka cez pôvodný kód', 'Kód je nalepený navrch, má iné farby alebo prečnieva. Originálny kód býva súčasťou tlače.'],
      ['Výzva na platbu či prihlásenie', 'Po naskenovaní sa hneď pýta platobná karta alebo prihlasovacie údaje.'],
      ['Hrozba pokutou', '„Zaplaťte do 15 minút, inak pokuta.“ Klasický časový tlak.'],
      ['Adresa nesedí', 'Mobil pred otvorením ukáže adresu – tá nepatrí prevádzkovateľovi, má zvláštnu koncovku.'],
    ]),
    dos: items([
      'Pred otvorením si v mobile prečítajte adresu, ktorú QR kód zobrazí.',
      'Platby robte radšej cez oficiálnu aplikáciu alebo web, ktorý si otvoríte sami.',
      'Prelepený QR kód na úrade nahláste správe budovy alebo IT.',
    ]),
    donts: items([
      'Neskenujte QR kódy z neočakávaných e-mailov („obnovte MFA“, „podpíšte dokument“).',
      'Nezadávajte heslo na stránke otvorenej z QR kódu.',
      'Nesťahujte aplikácie odporúčané QR kódom z letáku.',
    ]),
    cheatsheet: items([
      'QR kód = odkaz, ktorý nevidíš.',
      'Najprv prečítať adresu, potom otvoriť.',
      'Služobné prihlásenie nikdy cez QR z e-mailu.',
    ]),
    related: ['phishing', 'smishing', 'baiting'],
  },

  // 6 ─────────────────────────────────────────────
  {
    slug: 'pretexting',
    title: 'Pretexting',
    summary: 'Vymyslená, uveriteľná zámienka a identita, ktorou si útočník získa dôveru.',
    order: 6,
    readingMinutes: 4,
    content: doc([
      p(
        'Pretexting je útok postavený na ',
        ['vymyslenom príbehu a falošnej identite', true],
        '. Útočník sa vydáva za audítora, nového kolegu, technika dodávateľa či pracovníka iného úradu a postupne z vás získava informácie alebo výnimky z postupov.',
      ),
      h2('Prečo pôsobí dôveryhodne'),
      p(
        'Útočník sa dobre pripraví. Z verejných zdrojov pozná mená vedúcich, názvy projektov, interné skratky či aktuálne udalosti (napr. audit kybernetickej bezpečnosti). Vďaka tomu pôsobí ako zasvätený človek, ktorému je „trápne“ odmietnuť.',
      ),
      h2('Ako to prebieha'),
      ul([
        'Prvý kontakt je nenápadný – otázka, ktorá vyzerá úplne nevinne.',
        'Každá ďalšia žiadosť je o kúsok väčšia a stavia na predošlej odpovedi.',
        'Na konci príde to podstatné: zoznam účtov, prístup do systému, kontakt na kľúčovú osobu.',
      ]),
      p(
        'Informácie, ktoré sa samostatne zdajú bezvýznamné (kto má dovolenku, aký systém používate, kto schvaľuje platby), sú pre útočníka skladačka, z ktorej zostaví ďalší, presnejší útok.',
      ),
    ]),
    exampleCaption: 'Fiktívna konverzácia v chate s „externým audítorom“.',
    flagsHeading: 'Varovné znaky',
    redFlags: flags([
      ['Neznámy kontakt s úradnou rolou', 'Píše vám niekto, koho nepoznáte, ale predstavuje sa dôležitou funkciou (audítor, kontrola, ministerstvo).'],
      ['Odvolávanie sa na nadriadeného', '„Pán riaditeľ vás určite informoval.“ Požičaná autorita má zabrániť otázkam.'],
      ['Znalosť interných detailov', 'Pozná vaše meno, oddelenie či projekt – to však nie je dôkaz, je to výsledok prieskumu.'],
      ['Žiadosť o citlivé údaje', 'Na konci chce zoznamy, prístupy alebo výnimku z postupu – „len tentoraz, je to súrne“.'],
    ]),
    dos: items([
      'Identitu overte nezávisle – cez adresár, nadriadeného alebo oficiálne kontakty organizácie.',
      'Pri žiadostiach o údaje sa držte štandardného postupu a schvaľovania.',
      'Ak si nie ste istí, povedzte, že sa ozvete – a overte si to.',
    ]),
    donts: items([
      'Neoverujte identitu pomocou kontaktov, ktoré vám dal sám žiadateľ.',
      'Neposkytujte zoznamy zamestnancov, účtov ani technické detaily neovereným osobám.',
      'Nerobte výnimky z postupov len preto, že niekto pôsobí dôležito alebo súrne.',
    ]),
    cheatsheet: items([
      'Znalosť detailov nie je dôkaz identity.',
      'Overiť nezávislým kanálom.',
      'Postup platí aj pre „VIP“ žiadosti.',
    ]),
    related: ['bec', 'vishing', 'uvod'],
  },

  // 7 ─────────────────────────────────────────────
  {
    slug: 'baiting',
    title: 'Baiting (lákadlá)',
    summary: 'Podstrčené USB, „výhra“ alebo iné lákadlo, ktoré vás navedie urobiť nebezpečný krok.',
    order: 7,
    readingMinutes: 3,
    content: doc([
      p(
        'Baiting stavia na ',
        ['zvedavosti a chamtivosti', true],
        '. Útočník nastraží lákadlo – nájdené USB, „výhru“, softvér zadarmo či dokument s lákavým názvom – a čaká, kým ho niekto použije.',
      ),
      h2('Klasika: nájdený USB kľúč'),
      p(
        'USB s nápisom „Odmeny 2026“ alebo „Dôverné“ položené na parkovisku či v kuchynke je prekvapivo účinné. Po pripojení môže spustiť škodlivý kód, ktorý sa tvári ako dokument. Niektoré zariadenia sa navyše správajú ako klávesnica a za pár sekúnd samy „napíšu“ príkazy.',
      ),
      h2('Online lákadlá'),
      ul([
        'Bezplatná verzia plateného programu alebo „crack“.',
        'Výhra v súťaži, do ktorej ste sa neprihlásili.',
        'Súbor s lákavým názvom zdieľaný cez odkaz („platy_2026.xlsx“).',
      ]),
    ]),
    exampleCaption: 'Fiktívny USB kľúč „nájdený“ na parkovisku a čo by na ňom bolo.',
    flagsHeading: 'Varovné znaky',
    redFlags: flags([
      ['Neznámy pôvod', 'Zariadenie nikto nehľadá a neviete, odkiaľ sa vzalo. Práve to je zámer.'],
      ['Lákavý popis', '„Odmeny“, „Dôverné“, „Platy“ – názov je zvolený tak, aby ste ho chceli otvoriť.'],
      ['Zamaskovaná prípona', 'Súbor vyzerá ako tabuľka, ale v skutočnosti je to program (.xlsx.exe, .pdf.lnk).'],
    ]),
    dos: items([
      'Nájdené USB alebo iné zariadenie odovzdajte IT bez pripojenia.',
      'Softvér si inštalujte len zo schválených zdrojov alebo cez IT.',
      'Pri ponuke „príliš dobrej na to, aby bola pravdivá“ spozornite.',
    ]),
    donts: items([
      'Nepripájajte neznáme USB do služobného ani súkromného počítača.',
      'Nesťahujte „cracknutý“ alebo neoverený softvér.',
      'Neotvárajte súbory s dvojitou príponou či nezvyčajnou ikonou.',
    ]),
    cheatsheet: items([
      'Nájdené USB patrí IT, nie do počítača.',
      'Zvedavosť je páka útočníka.',
      'Zadarmo často znamená za vaše dáta.',
    ]),
    related: ['tailgating', 'quishing', 'uvod'],
  },

  // 8 ─────────────────────────────────────────────
  {
    slug: 'tailgating',
    title: 'Tailgating / fyzický prístup',
    summary: 'Vpustenie cudzej osoby do budovy „za sebou“ bez overenia.',
    order: 8,
    readingMinutes: 3,
    content: doc([
      p(
        'Tailgating (alebo piggybacking) je získanie ',
        ['fyzického prístupu do budovy či zabezpečenej zóny', true],
        ' tak, že útočník prejde dverami za oprávnenou osobou. Nepotrebuje kartu – stačí, že mu niekto podrží dvere.',
      ),
      h2('Prečo to funguje'),
      p(
        'Slušnosť. Podržať dvere niekomu s plnými rukami je prirodzené a odmietnuť pôsobí neochotne. Útočníci to vedia, preto prichádzajú s krabicami, kávou, v reflexnej veste technika alebo ako kuriér.',
      ),
      h2('Čo môže urobiť vo vnútri'),
      ul([
        'Pripojiť zariadenie do siete alebo nechať USB v zasadačke.',
        'Odfotiť dokumenty na stoloch, heslá na lístočkoch či obrazovky.',
        'Použiť odomknutý počítač, kým je majiteľ na káve.',
        'Ukradnúť notebook, telefón či prístupovú kartu.',
      ]),
      p('Fyzický prístup často obíde všetky technické ochrany naraz. Preto zamykajte obrazovku (Win + L) aj vtedy, keď odchádzate „len na chvíľu“.'),
    ]),
    exampleCaption: 'Fiktívna situácia pri vstupe do zabezpečenej zóny.',
    flagsHeading: 'Varovné znaky',
    redFlags: flags([
      ['Bez viditeľného preukazu', 'Osoba nemá preukaz zamestnanca ani návštevníka a nepoužije vlastnú kartu.'],
      ['Zneužitie ochoty', '„Pustíte ma? Mám plné ruky.“ Prosba je navrhnutá tak, aby bolo trápne odmietnuť.'],
      ['Zabezpečená zóna', 'Ide o dvere s čítačkou kariet – prístup do nich má mať len oprávnená osoba.'],
    ]),
    dos: items([
      'Slušne požiadajte, aby osoba použila vlastnú kartu, alebo ju nasmerujte na recepciu.',
      'Návštevu sprevádzajte a neznámu osobu bez preukazu ohláste.',
      'Pri odchode od počítača vždy zamknite obrazovku (Win + L).',
    ]),
    donts: items([
      'Nepúšťajte nikoho „za sebou“ do zabezpečených priestorov.',
      'Nepožičiavajte svoju prístupovú kartu – ani kolegovi.',
      'Nenechávajte citlivé dokumenty a heslá na stole.',
    ]),
    cheatsheet: items([
      'Jedna karta = jeden človek.',
      'Slušnosť áno, výnimky nie.',
      'Odchádzam = Win + L.',
    ]),
    related: ['baiting', 'pretexting', 'obrana'],
  },

  // 9 ─────────────────────────────────────────────
  {
    slug: 'bec',
    title: 'BEC / impersonácia autority',
    summary: 'Falošný pokyn „od riaditeľa“ – urgentná platba, zmena údajov, žiadosť o dáta.',
    order: 9,
    readingMinutes: 4,
    content: doc([
      p(
        'Business Email Compromise (BEC) je útok, pri ktorom sa útočník vydáva za ',
        ['riaditeľa, vedúceho alebo dodávateľa', true],
        ' a žiada urgentnú platbu, zmenu bankového účtu alebo citlivé údaje. Často neobsahuje žiadny odkaz ani prílohu, preto ho filtre nezachytia.',
      ),
      h2('Dve hlavné varianty'),
      ul([
        'CEO podvod – „riaditeľ“ píše z podobnej adresy, že je na rokovaní a potrebuje okamžite uhradiť faktúru.',
        'Podvod s dodávateľom – „dodávateľ“ oznamuje nové číslo účtu; ďalšie platby tak putujú útočníkovi.',
      ]),
      h2('Prečo je nebezpečný'),
      p(
        'Jedna úspešná platba môže znamenať škodu v desaťtisícoch eur, ktoré sa už nedajú vrátiť. Útočník často najprv získa prístup k skutočnej schránke (cez phishing) a potom píše z nej – v pokračovaní reálneho vlákna.',
      ),
      p(['Každú zmenu bankových údajov a každú neobvyklú platbu treba overiť druhým kanálom', true], ' – telefonicky na známe číslo alebo osobne. Nie odpoveďou na ten istý e-mail.'),
    ]),
    exampleCaption: 'Fiktívny e-mail „od riaditeľa“ z podobnej, ale cudzej domény.',
    flagsHeading: 'Varovné znaky',
    redFlags: flags([
      ['Podobná, ale cudzia doména', 'vicepremier-gov.sk namiesto vicepremier.gov.sk. Jeden znak rozdielu, iný vlastník.'],
      ['Naliehavosť a diskrétnosť', '„Ešte dnes“ a „zatiaľ o tom nikomu nehovorte“ – má to zabrániť konzultácii s kolegami.'],
      ['Zákaz overenia', '„Som na rokovaní, nevolajte, len potvrďte e-mailom.“ Útočník blokuje práve ten kanál, ktorý by ho odhalil.'],
      ['Nový bankový účet', 'Platba na neznámy alebo práve zmenený účet je najsilnejší signál podvodu.'],
    ]),
    dos: items([
      'Neobvyklú platbu či zmenu účtu vždy overte telefonicky na známom čísle alebo osobne.',
      'Dodržte schvaľovací postup bez ohľadu na funkciu žiadateľa.',
      'Skontrolujte presnú adresu odosielateľa, nielen zobrazované meno.',
      'Pri podozrení kontaktujte IT a ekonomický útvar.',
    ]),
    donts: items([
      'Neoverujte žiadosť odpoveďou na ten istý e-mail.',
      'Nemeňte bankové údaje dodávateľa len na základe e-mailu.',
      'Nenechajte sa zastrašiť funkciou ani tlakom na diskrétnosť.',
    ]),
    cheatsheet: items([
      'Peniaze + e-mail = overiť telefonicky.',
      'Diskrétnosť a zákaz volať sú alarm.',
      'Postup platí aj pre riaditeľa.',
    ]),
    related: ['phishing', 'pretexting', 'vishing'],
  },

  // 10 ────────────────────────────────────────────
  {
    slug: 'obrana',
    title: 'Ako sa brániť',
    summary: 'Praktické zásady: overovanie, bezpečné návyky a nahlasovanie.',
    order: 10,
    readingMinutes: 4,
    content: doc([
      p(
        'Všetky techniky social engineeringu majú spoločné to isté: ',
        ['chcú, aby ste konali rýchlo a bez overenia', true],
        '. Preto aj obrana je pre všetky rovnaká – spomaliť, overiť a nahlásiť.',
      ),
      h2('Každodenné návyky'),
      ul([
        'K systémom a dokumentom pristupujte cez záložky alebo intranet, nie cez odkazy zo správ.',
        'Používajte silné, jedinečné heslá a viacfaktorové overenie; kód z aplikácie nikomu nehovorte.',
        'Zamykajte obrazovku pri každom odchode od počítača (Win + L).',
        'Na sociálnych sieťach zverejňujte o práci len to, čo je nevyhnutné.',
        'Inštalujte softvér len zo schválených zdrojov.',
      ]),
      h2('Keď sa to už stalo'),
      p(
        'Klikli ste, zadali heslo alebo pripojili neznáme zariadenie? ',
        ['Okamžite to nahláste IT podpore.', true],
        ' Každá minúta je dôležitá – IT môže zablokovať účet, zmeniť heslo a zastaviť útok skôr, než sa rozšíri. Nikto vás za nahlásenie nebude trestať; nebezpečné je mlčať.',
      ),
    ]),
    exampleCaption: 'Tri kroky, ktoré fungujú proti každej technike.',
    flagsHeading: 'Postup pri podozrení',
    redFlags: flags([
      ['Zastavte sa', 'Cítite tlak, strach alebo zvedavosť? To je signál. Nič nekliknite a nič neodosielajte.'],
      ['Overte iným kanálom', 'Zavolajte na známe číslo, choďte osobne, otvorte systém cez vlastnú záložku. Nie cez kontakt zo správy.'],
      ['Nahláste', 'Podozrivú správu, hovor či situáciu nahláste IT podpore – aj keď si nie ste istí.'],
    ]),
    dos: items([
      'Spomaľte pri každej naliehavej žiadosti.',
      'Overujte cez nezávislý kanál.',
      'Nahláste podozrenie aj omyl čo najskôr.',
      'Zamykajte počítač a chráňte prístupovú kartu.',
    ]),
    donts: items([
      'Nekonajte pod tlakom bez overenia.',
      'Nezdieľajte heslá ani overovacie kódy.',
      'Nezamlčujte chybu – mlčanie škodí najviac.',
    ]),
    cheatsheet: items([
      'Zastav sa.',
      'Over iným kanálom.',
      'Nahlás.',
    ]),
    related: ['uvod', 'phishing', 'bec'],
  },
]
