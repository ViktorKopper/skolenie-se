import { getPayload } from 'payload'
import config from './payload.config'

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

const p = (text: string) => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  textFormat: 0,
  children: [txt(text)],
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

type T = { slug: string; title: string; summary: string; order: number; content: unknown }

const topics: T[] = [
  {
    slug: 'uvod',
    title: 'Čo je social engineering',
    summary: 'Prečo útoky na ľudí fungujú a aké psychologické páky útočníci používajú.',
    order: 1,
    content: doc([
      p('Social engineering je manipulácia, pri ktorej útočník namiesto techniky zneužíva dôveru, emócie a zvyky ľudí, aby získal prístup k informáciám, systémom alebo peniazom.'),
      h2('Prečo to funguje'),
      ul([
        'Autorita – pokyn „od šéfa“ alebo „od IT“ ľudia spochybňujú menej.',
        'Naliehavosť – časový tlak bráni tomu, aby sme si vec overili.',
        'Dôvera a reciprocita – máme tendenciu vyhovieť tomu, kto pôsobí ústretovo.',
        'Strach – hrozba straty prístupu alebo postihu nás tlačí konať rýchlo.',
        'Zvedavosť – lákadlo (výhra, dokument) nás navedie kliknúť.',
      ]),
      h2('Základné pravidlo'),
      p('Keď niečo vyvoláva tlak a žiada okamžitú akciu, spomaľte a overte to iným kanálom. Práve spomalenie je najlepšia obrana.'),
    ]),
  },
  {
    slug: 'phishing',
    title: 'Phishing (e-mail)',
    summary: 'Podvodné e-maily, ktoré lákajú na odkaz alebo prílohu. Vrátane cieleného spear phishingu.',
    order: 2,
    content: doc([
      p('Phishing je podvodný e-mail, ktorý sa tvári ako dôveryhodný a snaží sa vás prinútiť kliknúť na odkaz, otvoriť prílohu alebo zadať prihlasovacie údaje.'),
      h2('Varovné signály'),
      ul([
        'Naliehavosť a hrozby („heslo vyprší“, „konto bude zablokované“).',
        'Odkaz nevedie na oficiálnu adresu – podržte myš a skontrolujte cieľ.',
        'Žiadosť zadať heslo cez odkaz v e-maile.',
        'Všeobecné oslovenie a drobné jazykové nezrovnalosti.',
      ]),
      h2('Spear phishing a whaling'),
      p('Cielený phishing (spear phishing) je pripravený na konkrétnu osobu a používa reálny kontext, takže je ťažšie ho odhaliť. Útok mierený na vedenie sa nazýva whaling.'),
      h2('Čo robiť'),
      ul([
        'Neklikajte na odkaz – k systému pristúpte priamo cez záložku alebo portál.',
        'Pri pochybnosti e-mail nahláste IT podpore.',
      ]),
    ]),
  },
  {
    slug: 'vishing',
    title: 'Vishing (telefón)',
    summary: 'Telefonické podvody, napríklad „IT podpora“ žiadajúca heslo alebo vzdialený prístup.',
    order: 3,
    content: doc([
      p('Vishing je social engineering cez telefón. Útočník sa vydáva za IT podporu, banku alebo kolegu a snaží sa z vás vylákať údaje alebo vzdialený prístup.'),
      h2('Typické scenáre'),
      ul([
        '„Volám z IT, potrebujem vaše heslo na údržbu.“',
        '„Nainštalujte nám nástroj na vzdialený prístup, pomôžeme vám.“',
        'Tlak a naliehavosť, aby ste nestihli zavolať a overiť.',
      ]),
      h2('Čo robiť'),
      ul([
        'Nikomu nediktujte heslo – IT ho od vás nikdy nepotrebuje.',
        'Zavesťe a zavolajte späť na overené interné číslo.',
        'Neinštalujte nič na pokyn z telefonátu, ktorý ste nečakali.',
      ]),
    ]),
  },
  {
    slug: 'smishing',
    title: 'Smishing (SMS)',
    summary: 'Podvodné SMS s odkazmi – doručenie zásielky, banka, overenie účtu.',
    order: 4,
    content: doc([
      p('Smishing je phishing cez SMS. Správa obsahuje odkaz a zámienku – nedoručená zásielka, problém s účtom, výzva na overenie.'),
      h2('Varovné signály'),
      ul([
        'Neočakávaná SMS s odkazom.',
        'Skrátené alebo cudzie odkazy namiesto oficiálnej domény.',
        'Žiadosť o prihlásenie alebo platbu cez odkaz.',
      ]),
      h2('Čo robiť'),
      ul([
        'Na odkaz neklikajte; stránku si otvorte priamo cez oficiálnu aplikáciu alebo web.',
        'Pri pochybnosti overte u odosielateľa overeným kanálom.',
      ]),
    ]),
  },
  {
    slug: 'quishing',
    title: 'Quishing (QR kódy)',
    summary: 'Podvodné QR kódy v e-mailoch, na plagátoch či nálepkách, ktoré vedú na falošnú stránku.',
    order: 5,
    content: doc([
      p('Quishing využíva QR kód, ktorý vás nasmeruje na podvodnú stránku. QR obchádza časť mailových kontrol a presúva útok na mobil, kde je ťažšie skontrolovať cieľ.'),
      h2('Varovné signály'),
      ul([
        'QR kód v neočakávanom e-maile alebo prelepený kód na plagáte.',
        'Po naskenovaní vás stránka hneď žiada o prihlásenie.',
      ]),
      h2('Čo robiť'),
      ul([
        'Pred otvorením skontrolujte URL, ktorú kód zobrazí.',
        'Na prihlásenie používajte radšej uloženú záložku než QR kód.',
      ]),
    ]),
  },
  {
    slug: 'pretexting',
    title: 'Pretexting',
    summary: 'Vymyslená, uveriteľná zámienka a identita, ktorou si útočník získa dôveru.',
    order: 6,
    content: doc([
      p('Pretexting je vybudovanie vymyslenej zámienky a identity. Útočník sa vydáva napríklad za nového kolegu, audítora či technika a postupne z vás ťahá informácie.'),
      h2('Ako to vyzerá'),
      ul([
        'Útočník pôsobí informovane a sebaisto, pozná detaily o úrade.',
        'Žiada „len drobnosť“ – potvrdenie údaja, prístup, výnimku.',
        'Buduje dôveru postupne, nie jedným krokom.',
      ]),
      h2('Čo robiť'),
      ul([
        'Overte identitu nezávislým kanálom, nie údajmi, ktoré dal on.',
        'Pri citlivej žiadosti sa držte štandardného postupu, bez výnimiek pod tlakom.',
      ]),
    ]),
  },
  {
    slug: 'baiting',
    title: 'Baiting (lákadlá)',
    summary: 'Podstrčené USB, „výhra“ alebo iné lákadlo, ktoré vás navedie urobiť nebezpečný krok.',
    order: 7,
    content: doc([
      p('Baiting stavia na zvedavosti alebo chamtivosti. Klasikou je „zabudnuté“ USB na parkovisku alebo e-mail s výhrou či zadarmo softvérom.'),
      h2('Varovné signály'),
      ul([
        'Nájdené USB alebo zariadenie neznámeho pôvodu.',
        'Ponuka, ktorá je príliš dobrá na to, aby bola pravdivá.',
      ]),
      h2('Čo robiť'),
      ul([
        'Nájdené USB nepripájajte do počítača – odovzdajte ho IT.',
        'Sťahujte softvér len z oficiálnych a schválených zdrojov.',
      ]),
    ]),
  },
  {
    slug: 'tailgating',
    title: 'Tailgating / fyzický prístup',
    summary: 'Vpustenie cudzej osoby do budovy „za sebou“ bez overenia.',
    order: 8,
    content: doc([
      p('Tailgating (piggybacking) je získanie fyzického prístupu do budovy tak, že útočník prejde cez dvere za oprávnenou osobou, často s rukami plnými krabíc alebo v montérkach.'),
      h2('Ako to vyzerá'),
      ul([
        '„Zabudol som kartu, pustíte ma?“',
        'Osoba v uniforme technika alebo kuriéra bez overenia.',
      ]),
      h2('Čo robiť'),
      ul([
        'Nepúšťajte do zabezpečených priestorov nikoho, koho nepoznáte a nemá prístup.',
        'Neznámu osobu slušne nasmerujte na recepciu alebo ohláste.',
      ]),
    ]),
  },
  {
    slug: 'bec',
    title: 'BEC / impersonácia autority',
    summary: 'Falošný pokyn „od riaditeľa“ – urgentná platba, zmena údajov, žiadosť o dáta.',
    order: 9,
    content: doc([
      p('Business Email Compromise (BEC) je napodobenie autority. Príde „pokyn od riaditeľa“ alebo „od dodávateľa“ na urgentnú platbu, zmenu bankového účtu alebo poskytnutie údajov.'),
      h2('Varovné signály'),
      ul([
        'Urgentnosť a dôraz na diskrétnosť („vybav to hneď, nehovor o tom“).',
        'Zmena bankových údajov e-mailom.',
        'Adresa odosielateľa je podobná, ale nie presne vaša doména.',
      ]),
      h2('Čo robiť'),
      ul([
        'Pri platbe alebo zmene údajov pravosť vždy overte druhým kanálom (telefón, osobne).',
        'Držte sa interného schvaľovacieho postupu aj pod tlakom.',
      ]),
    ]),
  },
  {
    slug: 'obrana',
    title: 'Ako sa brániť',
    summary: 'Praktické zásady: overovanie, bezpečné návyky a nahlasovanie.',
    order: 10,
    content: doc([
      p('Spoločná obrana proti všetkým technikám social engineeringu je overovanie a zdravá nedôvera voči naliehavým žiadostiam.'),
      h2('Zásady'),
      ul([
        'K systémom a dokumentom pristupujte priamo, nie cez odkazy z e-mailu či SMS.',
        'Naliehavé žiadosti o prihlásenie, platbu alebo údaje overte iným kanálom.',
        'Heslá meňte len vo svojom počítači alebo na overenom portáli; nikdy ich nediktujte.',
        'Buďte opatrní aj vtedy, keď téma presne sedí do vašej agendy.',
      ]),
      h2('Nahlasovanie'),
      ul([
        'Podozrivý e-mail alebo telefonát nahláste IT podpore – čím skôr, tým lepšie.',
        'Nahlásenie nie je zlyhanie; rýchle nahlásenie zabráni väčšej škode.',
      ]),
    ]),
  },
]

const questions = [
  {
    question: 'E-mail tvrdí, že vaše heslo vyprší o hodinu a žiada kliknúť na odkaz a prihlásiť sa. Čo urobíte?',
    order: 1,
    explanation: 'Legitímny systém vás nenúti prihlasovať sa cez odkaz z e-mailu. K zmene hesla pristúpte priamo a e-mail nahláste.',
    options: [
      { text: 'Kliknem na odkaz a zadám heslo, nech ho stihnem zmeniť.', correct: false },
      { text: 'Neklikám; heslo zmením priamo v počítači a e-mail nahlásim IT.', correct: true },
      { text: 'Prepošlem e-mail kolegom, nech sa tiež prihlásia.', correct: false },
    ],
  },
  {
    question: 'Volá vám „IT podpora“ a žiada vaše heslo kvôli údržbe. Správny postup?',
    order: 2,
    explanation: 'IT od vás heslo nikdy nepotrebuje. Zaveste a overte cez interné číslo.',
    options: [
      { text: 'Heslo nadiktujem, veď je to IT.', correct: false },
      { text: 'Heslo nedám, zavesím a overím cez známe interné číslo.', correct: true },
      { text: 'Pošlem heslo radšej cez SMS.', correct: false },
    ],
  },
  {
    question: 'Čo je typický znak cieleného (spear) phishingu oproti bežnému?',
    order: 3,
    explanation: 'Spear phishing je na mieru a používa reálny kontext, preto pôsobí dôveryhodne.',
    options: [
      { text: 'Je plný gramatických chýb a posiela sa masovo.', correct: false },
      { text: 'Je prispôsobený konkrétnej osobe a používa reálny kontext.', correct: true },
      { text: 'Vždy obsahuje prílohu .exe.', correct: false },
    ],
  },
  {
    question: 'Dostanete SMS o „nedoručenej zásielke“ s odkazom na zaplatenie poplatku. Čo urobíte?',
    order: 4,
    explanation: 'Na odkaz neklikajte; stav zásielky overte priamo u prepravcu cez jeho oficiálny web alebo appku.',
    options: [
      { text: 'Kliknem na odkaz a zaplatím poplatok.', correct: false },
      { text: 'Neklikám; overím u prepravcu cez oficiálnu appku alebo web.', correct: true },
      { text: 'Odpíšem na SMS svoje údaje.', correct: false },
    ],
  },
  {
    question: 'Na parkovisku nájdete USB kľúč. Čo s ním?',
    order: 5,
    explanation: 'Nájdené USB môže obsahovať škodlivý kód. Nepripájajte ho – odovzdajte IT.',
    options: [
      { text: 'Pripojím ho do počítača, nech zistím, čie je.', correct: false },
      { text: 'Nepripájam ho; odovzdám ho IT.', correct: true },
      { text: 'Pripojím ho do služobného aj súkromného počítača.', correct: false },
    ],
  },
  {
    question: 'Pri dverách do zabezpečenej časti vás cudzí človek poprosí, aby ste ho pustili „za sebou“. Ako reagujete?',
    order: 6,
    explanation: 'Do zabezpečených priestorov nepúšťajte neznáme osoby bez prístupu; nasmerujte ich na recepciu.',
    options: [
      { text: 'Pustím ho, veď má plné ruky.', correct: false },
      { text: 'Nepustím; slušne ho nasmerujem na recepciu alebo ohlásim.', correct: true },
      { text: 'Dám mu svoju kartu.', correct: false },
    ],
  },
  {
    question: '„Riaditeľ“ e-mailom urgentne žiada previesť platbu na nový účet a byť diskrétny. Čo urobíte?',
    order: 7,
    explanation: 'Klasický BEC. Zmenu účtu a platbu vždy overte druhým kanálom a držte sa schvaľovacieho postupu.',
    options: [
      { text: 'Hneď prevediem platbu, je to od riaditeľa.', correct: false },
      { text: 'Pravosť overím telefonicky/osobne a dodržím schvaľovací postup.', correct: true },
      { text: 'Odpíšem na e-mail a počkám na potvrdenie v tom istom vlákne.', correct: false },
    ],
  },
  {
    question: 'Čo je najspoľahlivejšia všeobecná obrana proti social engineeringu?',
    order: 8,
    explanation: 'Spomalenie a overenie naliehavej žiadosti iným kanálom je najlepšia obrana.',
    options: [
      { text: 'Rýchlo vyhovieť, aby sme nezdržiavali.', correct: false },
      { text: 'Pri naliehavých žiadostiach spomaliť a overiť iným kanálom.', correct: true },
      { text: 'Spoliehať sa len na antivírus.', correct: false },
    ],
  },
]

const run = async () => {
  const payload = await getPayload({ config: await config })

  const existing = await payload.count({ collection: 'topics' })
  if (existing.totalDocs > 0) {
    payload.logger.info('Témy už existujú – seed preskakujem.')
    process.exit(0)
  }

  for (const t of topics) {
    await payload.create({ collection: 'topics', data: t as never })
    payload.logger.info(`Téma vytvorená: ${t.title}`)
  }

  for (const q of questions) {
    await payload.create({ collection: 'questions', data: q as never })
  }
  payload.logger.info(`Vytvorených otázok: ${questions.length}`)

  payload.logger.info('Seed hotový.')
  process.exit(0)
}

run()
