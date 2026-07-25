/* AI Workshop deck — 13 waypoints, bilingual (mr default / en), portal for
 * the Shruti welcome film; ChatGPT/voice/NotebookLM slides are live demos. */
window.DECK = {
  legs: [
    'assets/vid/leg01.mp4', 'assets/vid/leg02.mp4', 'assets/vid/leg03.mp4',
    'assets/vid/leg04.mp4', 'assets/vid/leg05.mp4', 'assets/vid/leg06.mp4',
    'assets/vid/leg07.mp4', 'assets/vid/leg08.mp4', 'assets/vid/leg09.mp4',
    'assets/vid/leg10.mp4', 'assets/vid/leg11.mp4', 'assets/vid/leg12.mp4',
    'assets/vid/leg13.mp4'
  ],
  stills: [
    'assets/stills/s01.jpg', 'assets/stills/s02.jpg', 'assets/stills/s03.jpg',
    'assets/stills/s04.jpg', 'assets/stills/s05.jpg', 'assets/stills/s06.jpg',
    'assets/stills/s07.jpg', 'assets/stills/s08.jpg', 'assets/stills/s09.jpg',
    'assets/stills/s10.jpg', 'assets/stills/s11.jpg', 'assets/stills/s12.jpg',
    'assets/stills/s13.jpg', 'assets/stills/s14.jpg'
  ],
  wp: [
    {
      pos: { leg: 0, t: 0 }, scene: 0, accent: '#E8935A',
      portal: { src: 'assets/demos/welcome.mp4', big: true, sound: true },
      mr: { chip: 'मोफत AI कार्यशाळा', head: 'नमस्कार! स्वागत आहे.',
        sub: 'स्वर्गीय अजितदादा जयंती जनसेवा सप्ताह · २५ जुलै २०२६',
        pcap: 'Jarvis Daily — श्रुती',
        cue: 'व्हिडिओ संपल्यावर सांगा — ही श्रुती AI ने बनवली आहे. खरी श्रुती मी आहे!' },
      en: { chip: 'Free AI Workshop', head: 'Welcome!',
        sub: 'Late Ajit-dada Jayanti Janseva Saptah · 25 July 2026',
        pcap: 'Jarvis Daily — Shruti',
        cue: 'After the film: reveal this Shruti is AI-made. The real one is presenting.' }
    },
    {
      pos: { leg: 0, t: 1 }, scene: 1, accent: '#D97B29',
      mr: { chip: 'AI ची गोष्ट', head: 'AI म्हणजे नक्की काय?',
        sub: 'वीज आली आणि प्रत्येक घर बदललं. AI तशीच गोष्ट आहे — आणि ती आजपासून तुमची आहे.',
        cue: 'वीजेची उपमा. आजचा प्रवास: समजून घेऊ → वापरून पाहू → व्यवसायात लावू.' },
      en: { chip: 'The AI story', head: 'What exactly is AI?',
        sub: 'Electricity changed every home. AI is that kind of story — and from today it is yours.',
        cue: 'Electricity analogy. Journey: understand → try → apply to business.' }
    },
    {
      pos: { leg: 1, t: 1 }, scene: 2, accent: '#C2447E',
      mr: { chip: 'एका स्लाईडमध्ये', head: 'पुढचा शब्द ओळखणारं यंत्र.',
        sub: 'कोट्यवधी वाक्यं वाचून AI एकच गोष्ट शिकला — पुढे काय येईल. एवढंच. बाकी सगळी जादू यातूनच येते.',
        cue: '६० सेकंद, गणित नाही. "आज हवामान ___" — तुम्हीही ओळखता, AI हेच करतो.' },
      en: { chip: 'In one slide', head: 'A machine that guesses the next word.',
        sub: 'From billions of sentences AI learned one thing — what comes next. That is all. Every bit of the magic flows from it.',
        cue: '60 seconds, no math. "Today the weather is ___" — you can guess too; that is all AI does.' }
    },
    {
      pos: { leg: 2, t: 1 }, scene: 3, accent: '#5F9E54',
      mr: { chip: 'तुम्ही आधीच वापरता', head: 'AI तुमच्या खिशात आधीपासूनच आहे.',
        receipt: ['WhatsApp मधला Meta AI', 'Google Lens — फोटोतून भाषांतर', 'YouTube — तुमच्यासाठी निवडलेले व्हिडिओ'],
        cue: 'भीती काढा — तुम्ही रोज AI वापरताच. आता जाणीवपूर्वक वापरायला शिकू.' },
      en: { chip: 'You already use it', head: 'AI is already in your pocket.',
        receipt: ['Meta AI inside WhatsApp', 'Google Lens — translate from a photo', 'YouTube — videos picked for you'],
        cue: 'Remove the fear — everyone already uses AI daily. Now we use it deliberately.' }
    },
    {
      pos: { leg: 4, t: 1 }, scene: 5, accent: '#3D4A8F',
      mr: { chip: 'पुढची पातळी', head: 'ChatGPT च्या युक्त्या — ज्या फार कमी जणांना माहीत आहेत.',
        receipt: ['आजची खास युक्ती — प्रत्यक्ष माझ्या स्क्रीनवर, live', 'तुमच्या व्यवसायाचा LOGO — काही मिनिटांत', 'हिशोबाची Excel फाईल द्या — विश्लेषण, चार्ट, अहवाल तयार', 'Scheduled Tasks — रोज ठरल्या वेळी ChatGPT स्वतःहून काम करून पाठवतो'],
        cue: 'Live screen: reel-वाली युक्ती दाखवा. मग LOGO, Excel विश्लेषण, Tasks. प्रेक्षकांकडून एक काम मागा!' },
      en: { chip: 'Next level', head: 'ChatGPT tricks — that very few people know.',
        receipt: ['Today\'s special trick — live on my screen', 'Your business LOGO — in minutes', 'Hand it your accounts Excel — analysis, charts, reports ready', 'Scheduled Tasks — ChatGPT does a job for you at a fixed time, daily'],
        cue: 'Live screen: show the reel trick. Then LOGO, Excel analysis, Tasks. Take a live request!' }
    },
    {
      pos: { leg: 5, t: 1 }, scene: 6, accent: '#E07856',
      mr: { chip: 'तुमचा शिक्षक', head: 'कोणताही विषय — बोलून शिका.',
        sub: 'ChatGPT Voice शी सरळ गप्पा मारा. तो शिकवतो, प्रश्न विचारतो, पुन्हा समजावतो — न थकता.',
        cue: 'LIVE DEMO फोनवर: ChatGPT Voice शी मराठीत गप्पा. मुलांचा अभ्यास, स्पर्धा परीक्षा, नवीन कौशल्य.' },
      en: { chip: 'Your tutor', head: 'Any subject — learn by talking.',
        sub: 'Just converse with ChatGPT Voice. It teaches, quizzes, re-explains — without tiring.',
        cue: 'LIVE DEMO on the phone: chat with ChatGPT Voice in Marathi. Homework, exams, new skills.' }
    },
    {
      pos: { leg: 6, t: 1 }, scene: 7, accent: '#7B5EA7',
      mr: { chip: 'NotebookLM', head: 'तुमचं पुस्तक द्या — ते शिकवेल.',
        sub: 'कोणतीही PDF, नोट्स, पुस्तक — त्यातून धडे, प्रश्नोत्तरं, अगदी podcast सुद्धा. फुकट.',
        cue: 'शेतकरी योजना PDF, अभ्यासक्रम, करार — जे तुमचं आहे त्यावर AI. Google चं, मोफत.' },
      en: { chip: 'NotebookLM', head: 'Give it your book — it will teach you.',
        sub: 'Any PDF, notes, book — lessons, Q&A, even a podcast from it. Free.',
        cue: 'A scheme PDF, a syllabus, a contract — AI over YOUR documents. By Google, free.' }
    },
    {
      pos: { leg: 7, t: 1 }, scene: 8, accent: '#C2447E',
      // Revealed only on Z / X so the origami scene stays untouched until asked.
      reels: [{ src: 'assets/demos/reel1.mp4', key: 'z', cap: 'प्रॉडक्ट जाहिरात — कॅमेरा नाही, मॉडेल नाही' },
              { src: 'assets/demos/reel2.mp4', key: 'x', cap: 'पर्सनल ब्रँड reel — पूर्णपणे AI' }],
      mr: { chip: 'AI निर्माण करतो', head: 'हे संपूर्ण presentation Claude Code ने बनवलं आहे.',
        sub: 'प्रत्येक चित्र, प्रत्येक दृश्य, हा संपूर्ण कागदी प्रवास — आणि हो, सुरुवातीची श्रुती सुद्धा.',
        receipt: ['LinkedIn पोस्ट, Reels — संपूर्ण social media आपोआप', 'Client साठी cinematic proposals — प्रत्यक्ष उदाहरण पाहू', 'अशा cinematic websites सुद्धा — ही website स्वतःच त्याचं उदाहरण'],
        cue: 'थांबा, क्षण द्या. मग Swati Vaidya proposal LIVE दाखवा (bookmark तयार ठेवा). ही website सुद्धा Claude Code नेच बनवली.' },
      en: { chip: 'AI creates', head: 'This entire presentation was made by Claude Code.',
        sub: 'Every image, every scene, this whole paper journey — and yes, the Shruti who welcomed you.',
        receipt: ['LinkedIn posts, Reels — your entire social media, automated', 'Cinematic client proposals — live example coming up', 'Cinematic websites too — this very site is one: ai.jarvisdaily.com'],
        cue: 'Pause, let it land. Then show the Swati Vaidya proposal LIVE (keep the bookmark ready). This site too was built by Claude Code.' }
    },
    {
      pos: { leg: 8, t: 1 }, scene: 9, accent: '#5F9E54',
      mr: { chip: 'खिशातला agent', head: 'AI फक्त उत्तरं देत नाही — कामं करून टाकतो.',
        sub: 'माझ्या WhatsApp मध्ये एक AI agent राहतो. निरोप वाचतो, उत्तरं देतो, आठवणी ठेवतो, भेटी ठरवतो.',
        cue: 'स्वतःची गोष्ट — रोज सकाळी brief, आपोआप उत्तरं. Agent = पुढचं पाऊल. हेच आम्ही व्यवसायांसाठी बनवतो.' },
      en: { chip: 'Agent in your pocket', head: 'AI does not just answer — it gets things done.',
        sub: 'An AI agent lives in my WhatsApp. It reads messages, replies, remembers, books meetings.',
        cue: 'Personal story — morning brief, auto replies. Agents are the next step. This is what we build for businesses.' }
    },
    {
      pos: { leg: 9, t: 1 }, scene: 10, accent: '#3D4A8F',
      mr: { chip: 'व्यवसायासाठी', head: 'ग्राहक, हिशोब, follow-up — AI सांभाळतो.',
        receipt: ['नवीन ग्राहक शोधणं — आपोआप याद्या', 'Invoice, हिशोब, GST ची तयारी', 'ग्राहकांच्या प्रश्नांची उत्तरं — रात्री सुद्धा'],
        cue: 'उद्योजकांसाठी: prospecting, accounting, 24x7 ग्राहक सेवा. उदाहरणं सांगा — दुकान, builder, डॉक्टर.' },
      en: { chip: 'For business', head: 'Customers, accounts, follow-ups — AI handles them.',
        receipt: ['Finding new customers — automatic lists', 'Invoices, accounts, GST prep', 'Customer replies — even at midnight'],
        cue: 'For entrepreneurs: prospecting, accounting, 24x7 support. Examples: shop, builder, clinic.' }
    },
    {
      pos: { leg: 10, t: 1 }, scene: 11, accent: '#2A2F4F',
      mr: { chip: 'सावधान', head: 'AI खोटंही बोलू शकतो — ओळखायला शिका.',
        receipt: ['आवाजाची हुबेहूब नक्कल होते — फोनवर पैसे मागितले तर थांबा, पडताळा', 'खोटे फोटो-व्हिडिओ (deepfake) — विश्वास ठेवण्याआधी तपासा', 'OTP, बँक माहिती कोणत्याही chatbot ला देऊ नका'],
        cue: 'जनसेवेचा भाग — घरी जाऊन हेच सांगा. एक नियम: घाई करायला लावणारा कॉल = संशय.' },
      en: { chip: 'Stay alert', head: 'AI can also lie — learn to spot it.',
        receipt: ['Voices are cloned perfectly — if a call asks for money, stop and verify', 'Fake photos and videos (deepfakes) — check before you believe', 'Never share OTPs or bank details with any chatbot'],
        cue: 'The janseva part — tell your family. One rule: a call that rushes you = suspicion.' }
    },
    {
      pos: { leg: 11, t: 1 }, scene: 12, accent: '#2E8A87',
      mr: { chip: 'आजपासून सुरुवात', head: '७ दिवसांचं आव्हान.',
        receipt: ['दिवस १ — एक पत्र किंवा अर्ज लिहा', 'दिवस २ — फोटो काढून प्रश्न विचारा', 'दिवस ३ — एक विषय बोलून शिका', 'दिवस ४-७ — रोज एक नवं काम AI कडून'],
        cue: 'रोज एक काम. सात दिवसांत सवय. website वर पूर्ण यादी आहे — पुढच्या स्लाईडवर.' },
      en: { chip: 'Start today', head: 'The 7-day challenge.',
        receipt: ['Day 1 — write a letter or application', 'Day 2 — snap a photo, ask about it', 'Day 3 — learn one topic by voice', 'Days 4-7 — one new task every day'],
        cue: 'One task a day. A habit in seven days. Full list on the website — next slide.' }
    },
    {
      pos: { leg: 12, t: 1 }, scene: 13, accent: '#A88317', qr: true,
      mr: { chip: 'Jarvis Daily', head: 'हे सगळं तुमच्या व्यवसायासाठी — आम्ही करून देतो.',
        sub: 'ही website च तुमचं takeaway आहे. QR स्कॅन करा — हा संपूर्ण प्रवास, सगळी tools, ७ दिवसांचं आव्हान — पुन्हा पहा, पुढे पाठवा.',
        byline: 'श्रुती पेठकर · Co-founder, Jarvis Daily · jarvisdaily.com',
        cue: 'CTA: QR स्कॅन करायला वेळ द्या. "AI कुठून सुरू करू?" — हा प्रश्न घेऊन या, बाकी आम्ही करतो.' },
      en: { chip: 'Jarvis Daily', head: 'All of this, for your business — we build it for you.',
        sub: 'This website is your takeaway. Scan the QR — this whole journey, every tool, the 7-day challenge — rewatch it, share it.',
        byline: 'Shruti Pethkar · Co-founder, Jarvis Daily · jarvisdaily.com',
        cue: 'CTA: give them time to scan. Bring the question "where do I start with AI?" — we do the rest.' }
    }
  ]
};
