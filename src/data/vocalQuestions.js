// Vocal Exam Questions for AMIRNET
// Two types:
// 1. Lecture + Questions: Listen to 3 audio clips, answer 5 questions (7 min)
// 2. Text Continuation: 4 clips cut off mid-sentence, pick continuation (4 min)

export const VOCAL_SECTIONS = [
  // ─── LECTURE + QUESTIONS ────────────────────────────────────
  {
    id: 'lecture_1',
    type: 'lecture',
    voiceId: 'daniel',
    title: 'The History of Coffee',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_1_clip_1',
        text: "Coffee has a long and fascinating history that begins in the highlands of Ethiopia. According to legend, a goat herder named Kaldi noticed that his goats became unusually energetic after eating berries from a certain tree. Curious, he tried the berries himself and experienced a similar burst of energy. Word of these energizing berries spread to a local monastery, where monks began to brew a drink from them to help stay awake during long hours of prayer."
      },
      {
        id: 'lecture_1_clip_2',
        text: "By the fifteenth century, coffee cultivation had spread to the Arabian Peninsula. Coffee houses, known as qahveh khaneh, became important centers of social activity in cities throughout the Middle East. People gathered there not only to drink coffee but also to engage in conversation, listen to music, watch performers, and discuss the news of the day. These establishments became such important centers for the exchange of information that they were often referred to as schools of the wise."
      },
      {
        id: 'lecture_1_clip_3',
        text: "Coffee arrived in Europe in the seventeenth century and quickly became popular across the continent. Some people reacted with suspicion, calling it the bitter invention of Satan. However, when Pope Clement the Eighth was asked to intervene, he found the beverage so satisfying that he gave it papal approval. Today, coffee is one of the most traded commodities in the world, with over two billion cups consumed every day. The global coffee industry employs more than twenty-five million people in over fifty countries."
      }
    ],
    questions: [
      {
        question: "According to the lecture, how was coffee first discovered?",
        options: [
          "Monks found coffee plants growing near their monastery.",
          "A herder noticed his animals became energetic after eating certain berries.",
          "Arabian traders brought coffee seeds from Asia.",
          "European explorers found coffee growing in Africa."
        ],
        correctIndex: 2
      },
      {
        question: "What role did coffee houses play in the Middle East?",
        options: [
          "They served mainly as places for religious worship.",
          "They were centers for social interaction and information exchange.",
          "They were exclusive clubs for wealthy merchants.",
          "They functioned primarily as music venues."
        ],
        correctIndex: 2
      },
      {
        question: "How did some Europeans initially react to coffee?",
        options: [
          "They embraced it immediately as a health remedy.",
          "They were suspicious and associated it with negative forces.",
          "They banned it from all public places.",
          "They considered it too expensive for ordinary people."
        ],
        correctIndex: 2
      },
      {
        question: "What happened when the Pope was asked about coffee?",
        options: [
          "He banned it throughout the Catholic Church.",
          "He ignored the request entirely.",
          "He approved the beverage after tasting it.",
          "He ordered further scientific research."
        ],
        correctIndex: 3
      },
      {
        question: "Which of the following is stated in the lecture about coffee today?",
        options: [
          "Coffee production is declining worldwide.",
          "Over two billion cups are consumed daily around the world.",
          "Coffee is grown in over one hundred countries.",
          "The coffee industry employs fifty million people."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'lecture_2',
    type: 'lecture',
    voiceId: 'rachel',
    title: 'Sleep and Memory',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_2_clip_1',
        text: "Today we will discuss the relationship between sleep and memory. Research has shown that sleep plays a critical role in memory consolidation, the process by which short-term memories are transformed into long-lasting ones. During sleep, the brain replays experiences from the day, strengthening the neural connections that form memories. This process occurs primarily during two stages of sleep: slow-wave sleep and rapid eye movement, or REM, sleep."
      },
      {
        id: 'lecture_2_clip_2',
        text: "Studies have demonstrated that people who sleep after learning new information retain it significantly better than those who remain awake. In one experiment, participants were taught a series of word pairs. Half of the group slept for eight hours while the other half stayed awake. When tested the following day, the group that slept recalled thirty-five percent more word pairs. Scientists believe this is because during slow-wave sleep, the hippocampus transfers information to the neocortex for long-term storage."
      },
      {
        id: 'lecture_2_clip_3',
        text: "Perhaps most surprisingly, sleep deprivation does not merely impair the retention of existing memories. It also severely reduces the brain's ability to form new memories in the first place. Research at Harvard Medical School found that sleep-deprived individuals showed a forty percent reduction in their ability to create new memories compared to well-rested participants. This finding has important implications for students, who often sacrifice sleep to study for exams, potentially undermining the very learning they hope to achieve."
      }
    ],
    questions: [
      {
        question: "What is memory consolidation?",
        options: [
          "The ability to recall information immediately after learning it.",
          "The process of converting short-term memories into long-term ones.",
          "A technique used to memorize large amounts of data.",
          "The gradual loss of memories over time."
        ],
        correctIndex: 2
      },
      {
        question: "During which stages of sleep does memory consolidation primarily occur?",
        options: [
          "Only during the first hour of sleep.",
          "During light sleep and waking periods.",
          "During slow-wave sleep and REM sleep.",
          "Exclusively during REM sleep."
        ],
        correctIndex: 3
      },
      {
        question: "In the word-pair experiment, what was the difference in recall between the two groups?",
        options: [
          "The sleep group recalled fifty percent more.",
          "There was no significant difference between the groups.",
          "The awake group performed slightly better.",
          "The sleep group recalled thirty-five percent more."
        ],
        correctIndex: 4
      },
      {
        question: "What did the Harvard Medical School research reveal about sleep deprivation?",
        options: [
          "It has no effect on forming new memories.",
          "It reduces the ability to form new memories by about forty percent.",
          "It only affects emotional memories, not factual ones.",
          "It improves focus but reduces creativity."
        ],
        correctIndex: 2
      },
      {
        question: "What implication does the lecture suggest for students?",
        options: [
          "Students should study only during the day.",
          "Reducing sleep to study more may actually harm learning.",
          "Sleep is only important before, not after, studying.",
          "Short naps are more effective than full nights of sleep."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'lecture_3',
    type: 'lecture',
    voiceId: 'charlie',
    title: 'The Psychology of Color',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_3_clip_1',
        text: "Color psychology is the study of how colors affect human behavior, mood, and decision-making. While the idea that colors influence us may seem intuitive, scientific research has revealed some surprising findings. For example, studies show that the color red can increase heart rate and create a sense of urgency, which is why it is commonly used in clearance sales and fast-food restaurants. Blue, on the other hand, tends to have a calming effect and is associated with trust and reliability."
      },
      {
        id: 'lecture_3_clip_2',
        text: "In marketing and branding, color choice is far from arbitrary. Research conducted at the University of Winnipeg found that up to ninety percent of snap judgments about products are based on color alone. Companies invest heavily in selecting the right colors for their logos and packaging. For instance, green is frequently used by companies that want to convey environmental responsibility, while black and gold are associated with luxury and exclusivity."
      },
      {
        id: 'lecture_3_clip_3',
        text: "However, the effects of color are not universal. Cultural background plays a significant role in how colors are perceived. In Western cultures, white is traditionally associated with purity and weddings, while in many East Asian cultures, white is the color of mourning. Similarly, red symbolizes good fortune in China but can represent danger in other parts of the world. Researchers emphasize that while general trends exist, individual responses to color are shaped by personal experience and cultural context."
      }
    ],
    questions: [
      {
        question: "According to the lecture, what effect does the color red have on people?",
        options: [
          "It promotes relaxation and calm.",
          "It increases heart rate and creates urgency.",
          "It improves concentration and focus.",
          "It reduces appetite and energy."
        ],
        correctIndex: 2
      },
      {
        question: "What did the University of Winnipeg research find?",
        options: [
          "People prefer products in blue packaging.",
          "Up to ninety percent of quick product judgments are based on color.",
          "Color has no measurable effect on consumer behavior.",
          "Green products sell better than other colors."
        ],
        correctIndex: 2
      },
      {
        question: "Why do companies use green in their branding?",
        options: [
          "To suggest their products are affordable.",
          "To convey environmental responsibility.",
          "To appeal to younger consumers.",
          "To stand out from competitors."
        ],
        correctIndex: 2
      },
      {
        question: "How does the meaning of white differ across cultures?",
        options: [
          "It means the same thing in all cultures.",
          "It is associated with purity in the West but mourning in parts of East Asia.",
          "It is considered unlucky everywhere except Europe.",
          "It represents wealth in Asian cultures and simplicity in Western ones."
        ],
        correctIndex: 2
      },
      {
        question: "What do researchers conclude about color perception?",
        options: [
          "Color effects are identical for all people.",
          "Only age affects how we perceive color.",
          "Personal experience and culture shape individual responses to color.",
          "Scientific research has disproven most color psychology claims."
        ],
        correctIndex: 3
      }
    ]
  },
  {
    id: 'lecture_4',
    type: 'lecture',
    voiceId: 'fin',
    title: 'The Economics of Water Scarcity',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_4_clip_1',
        text: "Water covers about seventy percent of the Earth's surface, yet only three percent of it is fresh water, and less than one percent is easily accessible for human use. As the global population continues to grow and climate patterns shift, water scarcity has become one of the most pressing economic challenges of our time. The United Nations estimates that by twenty-fifty, nearly half of the world's population will live in areas facing water stress."
      },
      {
        id: 'lecture_4_clip_2',
        text: "The economic impact of water scarcity is enormous. Agriculture accounts for roughly seventy percent of global freshwater consumption. When water becomes scarce, crop yields decline, food prices rise, and rural economies suffer. In regions like sub-Saharan Africa and parts of South Asia, women and children spend hours each day collecting water, time that could otherwise be spent in school or in productive employment. The World Bank has estimated that water scarcity could reduce GDP growth in some regions by up to six percent."
      },
      {
        id: 'lecture_4_clip_3',
        text: "Several approaches are being explored to address this crisis. Desalination, the process of converting seawater into fresh water, has become increasingly cost-effective, particularly in the Middle East. Israel, for example, now produces over fifty percent of its domestic water through desalination. Other solutions include water recycling, efficient irrigation technologies like drip systems, and better management of existing water resources. Economists argue that pricing water to reflect its true value could encourage more responsible use."
      }
    ],
    questions: [
      {
        question: "What percentage of Earth's water is easily accessible fresh water?",
        options: [
          "About three percent.",
          "Less than one percent.",
          "Roughly seventy percent.",
          "Approximately ten percent."
        ],
        correctIndex: 2
      },
      {
        question: "What does the United Nations predict about water scarcity?",
        options: [
          "Water scarcity will be solved by twenty-fifty.",
          "Nearly half the world's population will face water stress by twenty-fifty.",
          "Only Africa will experience serious water shortages.",
          "Global water supply will increase by twenty percent."
        ],
        correctIndex: 2
      },
      {
        question: "How does water scarcity affect education in some regions?",
        options: [
          "Schools close due to flooding.",
          "Children spend time collecting water instead of attending school.",
          "Water shortages force schools to relocate.",
          "Students study water management instead of regular subjects."
        ],
        correctIndex: 2
      },
      {
        question: "What is mentioned about Israel's approach to water scarcity?",
        options: [
          "Israel imports most of its water from neighboring countries.",
          "Israel produces over fifty percent of its water through desalination.",
          "Israel relies entirely on rainwater collection.",
          "Israel has banned agricultural water use."
        ],
        correctIndex: 2
      },
      {
        question: "What do economists suggest about water pricing?",
        options: [
          "Water should be free for everyone.",
          "Water prices should be reduced to encourage consumption.",
          "Pricing water to reflect its true value could promote responsible use.",
          "Water pricing has no effect on consumption patterns."
        ],
        correctIndex: 3
      }
    ]
  },
  {
    id: 'lecture_5',
    type: 'lecture',
    voiceId: 'charlotte',
    title: 'Artificial Intelligence in Healthcare',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_5_clip_1',
        text: "Artificial intelligence is transforming the healthcare industry in ways that were unimaginable just a decade ago. Machine learning algorithms can now analyze medical images, such as X-rays and MRI scans, with accuracy that matches or even exceeds that of experienced radiologists. In a landmark study published in Nature, an AI system developed by Google Health detected breast cancer in mammograms more accurately than human doctors, reducing both false positives and false negatives."
      },
      {
        id: 'lecture_5_clip_2',
        text: "Beyond diagnostics, AI is being used to accelerate drug discovery. Traditional drug development takes an average of ten to fifteen years and costs over two billion dollars. AI systems can analyze millions of molecular structures and predict which compounds are most likely to be effective against a particular disease, dramatically reducing the time and cost of bringing new treatments to market. During the COVID-nineteen pandemic, AI helped identify potential antiviral drugs within weeks rather than years."
      },
      {
        id: 'lecture_5_clip_3',
        text: "However, the integration of AI in healthcare raises important ethical concerns. Questions about patient privacy arise when large datasets of medical records are used to train algorithms. There are also concerns about algorithmic bias, as AI systems trained on data from one population may not perform well for patients from different backgrounds. Additionally, the question of liability remains unresolved: when an AI system makes a medical error, who is responsible — the developer, the hospital, or the physician who relied on the recommendation?"
      }
    ],
    questions: [
      {
        question: "What achievement of AI in medical imaging is mentioned in the lecture?",
        options: [
          "AI replaced all radiologists in major hospitals.",
          "AI detected breast cancer in mammograms more accurately than human doctors.",
          "AI can only analyze simple X-ray images.",
          "AI imaging is still years away from clinical use."
        ],
        correctIndex: 2
      },
      {
        question: "How long does traditional drug development typically take?",
        options: [
          "Two to three years.",
          "Five to seven years.",
          "Ten to fifteen years.",
          "Over twenty years."
        ],
        correctIndex: 3
      },
      {
        question: "How did AI contribute during the COVID-19 pandemic?",
        options: [
          "It replaced doctors in treating patients.",
          "It helped identify potential antiviral drugs much faster than traditional methods.",
          "It had no significant impact on the pandemic response.",
          "It was used only for tracking infection rates."
        ],
        correctIndex: 2
      },
      {
        question: "What is algorithmic bias in the context of healthcare AI?",
        options: [
          "AI systems that favor more expensive treatments.",
          "Systems trained on one population may not work well for different backgrounds.",
          "AI that only treats certain diseases.",
          "A preference for AI over human doctors."
        ],
        correctIndex: 2
      },
      {
        question: "What unresolved issue does the lecture raise about AI medical errors?",
        options: [
          "Whether AI should be banned from hospitals.",
          "Who is legally responsible when AI makes a mistake.",
          "Whether patients should be told AI was involved.",
          "How to prevent all AI errors completely."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'lecture_6',
    type: 'lecture',
    voiceId: 'george',
    title: 'The Rise of Remote Work',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_6_clip_1',
        text: "The global shift to remote work, accelerated by the pandemic, has fundamentally changed how millions of people approach their careers. Before twenty-twenty, only about five percent of full-time employees worked from home. By twenty-twenty-three, that number had risen to nearly thirty percent in many developed countries. Technology companies were among the first to embrace the change, with major firms like Twitter and Shopify announcing that employees could work from home permanently."
      },
      {
        id: 'lecture_6_clip_2',
        text: "The benefits of remote work are well documented. Employees report higher satisfaction due to reduced commuting time, greater flexibility, and improved work-life balance. Companies benefit from lower office costs and access to a broader talent pool, as they are no longer limited to hiring people who live near their offices. A Stanford study found that remote workers were thirteen percent more productive than their office-based colleagues, partly because they took fewer breaks and sick days."
      },
      {
        id: 'lecture_6_clip_3',
        text: "Despite these advantages, remote work presents significant challenges. Many workers report feelings of isolation and difficulty separating their professional and personal lives. Collaboration can suffer when teams are dispersed across different time zones. Junior employees, in particular, may miss out on informal mentoring and learning opportunities that occur naturally in an office environment. As a result, many organizations have adopted hybrid models, requiring employees to be in the office two or three days per week while allowing remote work on the remaining days."
      }
    ],
    questions: [
      {
        question: "What percentage of employees worked from home before the pandemic?",
        options: [
          "About five percent.",
          "Approximately fifteen percent.",
          "Nearly thirty percent.",
          "Less than one percent."
        ],
        correctIndex: 1
      },
      {
        question: "What did the Stanford study find about remote workers?",
        options: [
          "They were less productive than office workers.",
          "They were thirteen percent more productive.",
          "Their productivity was identical to office workers.",
          "They worked fewer hours overall."
        ],
        correctIndex: 2
      },
      {
        question: "Which challenge of remote work is mentioned for junior employees?",
        options: [
          "They earn lower salaries when working remotely.",
          "They may miss informal mentoring opportunities.",
          "They are not allowed to work from home.",
          "They struggle with technology more than senior staff."
        ],
        correctIndex: 2
      },
      {
        question: "What is a hybrid work model?",
        options: [
          "Working exclusively from home.",
          "A mix of in-office and remote work days.",
          "Working from a different office each day.",
          "Having two separate jobs simultaneously."
        ],
        correctIndex: 2
      },
      {
        question: "What company benefit of remote work is discussed?",
        options: [
          "Higher employee turnover.",
          "Access to a broader talent pool beyond local geography.",
          "Reduced employee satisfaction.",
          "Increased management complexity."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'lecture_7',
    type: 'lecture',
    voiceId: 'aria',
    title: 'Coral Reef Ecosystems',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_7_clip_1',
        text: "Coral reefs are among the most biologically diverse ecosystems on the planet, often called the rainforests of the sea. Although they cover less than one percent of the ocean floor, they support approximately twenty-five percent of all marine species. Reefs are built by tiny animals called coral polyps, which secrete calcium carbonate to form hard structures. Over thousands of years, these structures accumulate into the massive reef formations we see today, such as Australia's Great Barrier Reef."
      },
      {
        id: 'lecture_7_clip_2',
        text: "Coral reefs provide enormous economic value to human societies. They protect coastlines from storm damage and erosion, support fishing industries that feed hundreds of millions of people, and generate billions of dollars through tourism. The total economic value of the world's coral reefs has been estimated at over three hundred seventy-five billion dollars annually. In many small island nations, reef-dependent industries account for more than half of the national income."
      },
      {
        id: 'lecture_7_clip_3',
        text: "Unfortunately, coral reefs are under severe threat. Rising ocean temperatures cause coral bleaching, a process in which stressed corals expel the algae that give them color and provide them with nutrients. Without these algae, the corals eventually starve and die. Ocean acidification, caused by increased carbon dioxide absorption, further weakens reef structures. Scientists estimate that we have already lost about half of the world's coral reefs and warn that without significant action to reduce carbon emissions, ninety percent could disappear by twenty-fifty."
      }
    ],
    questions: [
      {
        question: "What percentage of marine species do coral reefs support?",
        options: [
          "About five percent.",
          "Approximately twenty-five percent.",
          "Nearly fifty percent.",
          "Over seventy-five percent."
        ],
        correctIndex: 2
      },
      {
        question: "What are coral polyps?",
        options: [
          "A type of seaweed found in tropical waters.",
          "Tiny animals that build reef structures by secreting calcium carbonate.",
          "Microscopic plants that color the reef.",
          "Fish that live exclusively in coral formations."
        ],
        correctIndex: 2
      },
      {
        question: "What is the estimated annual economic value of coral reefs?",
        options: [
          "About fifty billion dollars.",
          "Over three hundred seventy-five billion dollars.",
          "Approximately one trillion dollars.",
          "Less than ten billion dollars."
        ],
        correctIndex: 2
      },
      {
        question: "What causes coral bleaching?",
        options: [
          "Pollution from plastic waste.",
          "Rising ocean temperatures stress corals, causing them to expel their algae.",
          "Overfishing reduces the coral's food supply.",
          "Freshwater runoff from rivers."
        ],
        correctIndex: 2
      },
      {
        question: "What do scientists warn about the future of coral reefs?",
        options: [
          "Reefs are recovering faster than expected.",
          "Ninety percent of reefs could disappear by twenty-fifty without action.",
          "Only Arctic reefs are at risk.",
          "Coral reefs will adapt naturally to climate change."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'lecture_8',
    type: 'lecture',
    voiceId: 'callum',
    title: 'The Science of Habit Formation',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_8_clip_1',
        text: "Every day, roughly forty percent of our actions are not conscious decisions but habits. Habits are automatic behaviors that the brain develops to conserve mental energy. Neuroscientists at MIT discovered that habits follow a three-step pattern known as the habit loop: first, a cue or trigger signals the brain to enter automatic mode; second, the routine — the behavior itself — unfolds; and third, a reward reinforces the behavior, making the brain more likely to repeat the loop in the future."
      },
      {
        id: 'lecture_8_clip_2',
        text: "Research shows that it takes an average of sixty-six days for a new behavior to become automatic, though this varies widely depending on the complexity of the behavior and the individual. A study at University College London tracked participants trying to form new habits like eating fruit at lunch or running for fifteen minutes each day. Simple habits formed faster, while more complex routines took significantly longer. Importantly, missing a single day did not significantly affect the habit formation process."
      },
      {
        id: 'lecture_8_clip_3',
        text: "Understanding the science of habits has practical implications. To build good habits, experts recommend attaching new behaviors to existing cues. This technique, called habit stacking, involves linking a desired behavior to something you already do consistently. For example, if you want to start meditating, you might commit to meditating for two minutes immediately after your morning coffee. To break bad habits, the most effective strategy is to identify and modify the cue that triggers the unwanted behavior, rather than relying on willpower alone."
      }
    ],
    questions: [
      {
        question: "What percentage of daily actions are habits rather than conscious decisions?",
        options: [
          "About ten percent.",
          "Roughly twenty percent.",
          "Approximately forty percent.",
          "Over sixty percent."
        ],
        correctIndex: 3
      },
      {
        question: "What are the three parts of the habit loop?",
        options: [
          "Planning, execution, and review.",
          "Cue, routine, and reward.",
          "Trigger, response, and punishment.",
          "Motivation, action, and satisfaction."
        ],
        correctIndex: 2
      },
      {
        question: "How long does it typically take to form a new habit?",
        options: [
          "About twenty-one days.",
          "Approximately sixty-six days on average.",
          "Exactly ninety days.",
          "One full year."
        ],
        correctIndex: 2
      },
      {
        question: "What is habit stacking?",
        options: [
          "Trying to form multiple habits at the same time.",
          "Linking a new behavior to an existing routine.",
          "Breaking several bad habits simultaneously.",
          "Recording your habits in a journal."
        ],
        correctIndex: 2
      },
      {
        question: "What is the most effective way to break a bad habit?",
        options: [
          "Using willpower to resist the urge.",
          "Identifying and modifying the triggering cue.",
          "Replacing it with an equally unhealthy alternative.",
          "Avoiding all situations where the habit might occur."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'lecture_9',
    type: 'lecture',
    voiceId: 'lily',
    title: 'The Industrial Revolution',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_9_clip_1',
        text: "The Industrial Revolution, which began in Britain in the late eighteenth century, is considered one of the most transformative periods in human history. Before industrialization, most goods were produced by hand in small workshops or at home. The invention of the steam engine by James Watt in seventeen-sixty-nine provided a new source of power that could drive machines, enabling mass production in factories for the first time."
      },
      {
        id: 'lecture_9_clip_2',
        text: "The textile industry was the first to be transformed. New machines like the spinning jenny and the power loom could produce cloth far more quickly and cheaply than hand weavers. Factories sprang up across northern England, drawing workers from the countryside into rapidly growing industrial cities. This migration had profound social consequences: traditional rural communities were disrupted, and a new urban working class emerged, often living and working in harsh conditions."
      },
      {
        id: 'lecture_9_clip_3',
        text: "The Industrial Revolution eventually spread from Britain to continental Europe, North America, and beyond. It brought enormous increases in wealth and standards of living over the long term, but the transition was painful for many. Child labor was widespread, working hours were long, and factory conditions were often dangerous. These problems eventually led to the development of labor laws, trade unions, and the modern welfare state. Historians note that the effects of the Industrial Revolution are still being felt today, as we navigate the challenges of a new technological revolution."
      }
    ],
    questions: [
      {
        question: "Where did the Industrial Revolution begin?",
        options: [
          "In the United States.",
          "In France.",
          "In Britain.",
          "In Germany."
        ],
        correctIndex: 3
      },
      {
        question: "What was the significance of the steam engine?",
        options: [
          "It replaced all human labor immediately.",
          "It provided power to drive machines, enabling mass production.",
          "It was mainly used for transportation.",
          "It had little impact on manufacturing."
        ],
        correctIndex: 2
      },
      {
        question: "Which industry was first transformed by the Industrial Revolution?",
        options: [
          "The steel industry.",
          "The mining industry.",
          "The textile industry.",
          "The food processing industry."
        ],
        correctIndex: 3
      },
      {
        question: "What social change resulted from factory migration?",
        options: [
          "Rural communities grew stronger.",
          "A new urban working class emerged, often in harsh conditions.",
          "Most workers became wealthier immediately.",
          "Cities became smaller and more organized."
        ],
        correctIndex: 2
      },
      {
        question: "What developments arose in response to poor working conditions?",
        options: [
          "A return to pre-industrial methods.",
          "Labor laws, trade unions, and the welfare state.",
          "The abolition of all factory work.",
          "Widespread emigration to rural areas."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'lecture_10',
    type: 'lecture',
    voiceId: 'drew',
    title: 'The Placebo Effect',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_10_clip_1',
        text: "The placebo effect is one of the most fascinating phenomena in medicine. It occurs when a patient experiences a real improvement in their condition after receiving a treatment with no active therapeutic ingredients, such as a sugar pill or saline injection. The term placebo comes from the Latin word meaning I shall please. While once dismissed as mere trickery, scientists now recognize that the placebo effect involves real, measurable changes in brain chemistry."
      },
      {
        id: 'lecture_10_clip_2',
        text: "Research has shown that placebos can trigger the release of endorphins, the body's natural painkillers, and even dopamine, a neurotransmitter associated with reward and pleasure. In studies of pain management, placebo treatments have been found to reduce reported pain by an average of thirty percent. Remarkably, in some clinical trials, the placebo effect has been nearly as strong as the effect of the actual medication being tested, particularly for conditions like depression, anxiety, and chronic pain."
      },
      {
        id: 'lecture_10_clip_3',
        text: "What makes the placebo effect even more intriguing is that it can work even when patients know they are receiving a placebo. Studies at Harvard Medical School gave participants clearly labeled placebo pills and found that they still experienced significant symptom improvement. Researchers believe this is because the ritual of taking medicine — visiting a doctor, receiving a prescription, following a treatment routine — activates healing processes in the brain regardless of whether the treatment itself is pharmacologically active."
      }
    ],
    questions: [
      {
        question: "What is the placebo effect?",
        options: [
          "A side effect of powerful medication.",
          "Improvement in a condition after receiving a treatment with no active ingredients.",
          "A type of therapy using only natural herbs.",
          "The failure of a medicine to produce results."
        ],
        correctIndex: 2
      },
      {
        question: "What brain chemicals can placebos trigger?",
        options: [
          "Only adrenaline.",
          "Endorphins and dopamine.",
          "Serotonin exclusively.",
          "No measurable brain chemicals."
        ],
        correctIndex: 2
      },
      {
        question: "By how much can placebo treatments reduce pain on average?",
        options: [
          "About five percent.",
          "Approximately thirty percent.",
          "Roughly fifty percent.",
          "Over seventy percent."
        ],
        correctIndex: 2
      },
      {
        question: "What surprising finding came from the Harvard open-label study?",
        options: [
          "Patients refused to take pills they knew were placebos.",
          "Patients improved even when they knew the pills were placebos.",
          "The placebo effect disappeared completely.",
          "Only children responded to open-label placebos."
        ],
        correctIndex: 2
      },
      {
        question: "Why might the ritual of treatment itself be healing?",
        options: [
          "Because all medicines are essentially placebos.",
          "Because visiting a doctor and following routines activate brain healing processes.",
          "Because patients are always trying to please their doctors.",
          "Because the brain cannot distinguish between real and fake pills."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'lecture_11',
    type: 'lecture',
    voiceId: 'daniel',
    title: 'Urban Planning and Public Spaces',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_11_clip_1',
        text: "Public spaces — parks, plazas, pedestrian streets, and waterfronts — are essential components of successful cities. Urban planners have long recognized that well-designed public spaces improve quality of life, promote physical activity, and strengthen social bonds within communities. The Danish architect Jan Gehl, whose research transformed urban planning in Copenhagen, argues that cities should be designed for people, not cars, and that the quality of outdoor spaces directly influences how much people use them."
      },
      {
        id: 'lecture_11_clip_2',
        text: "One of the most successful examples of public space transformation is New York City's High Line, an elevated park built on a disused railway track. Opened in two thousand nine, the High Line attracts over eight million visitors annually and has stimulated billions of dollars in private investment in the surrounding neighborhood. Similarly, Seoul's Cheonggyecheon project, which replaced an elevated highway with a restored stream and greenway, reduced local temperatures, improved air quality, and revitalized the city center."
      },
      {
        id: 'lecture_11_clip_3',
        text: "Despite the clear benefits, many cities struggle to create adequate public space. Rapid urbanization, particularly in developing countries, often prioritizes roads and buildings over green areas. Economic pressures can lead to the privatization of public spaces, restricting access for certain groups. Urban planners advocate for inclusive design that ensures public spaces are accessible to people of all ages, abilities, and economic backgrounds. The challenge for twenty-first century cities is to balance growth with the preservation and creation of spaces that serve everyone."
      }
    ],
    questions: [
      {
        question: "What does Jan Gehl argue about city design?",
        options: [
          "Cities should prioritize vehicle traffic over pedestrians.",
          "Cities should be designed for people, not cars.",
          "Public spaces are less important than commercial zones.",
          "Architecture matters more than urban planning."
        ],
        correctIndex: 2
      },
      {
        question: "What was New York's High Line before it became a park?",
        options: [
          "A underground tunnel system.",
          "A disused railway track.",
          "An abandoned parking structure.",
          "A former shipping canal."
        ],
        correctIndex: 2
      },
      {
        question: "What effect did Seoul's Cheonggyecheon project have?",
        options: [
          "It increased traffic congestion significantly.",
          "It reduced local temperatures and improved air quality.",
          "It led to decreased property values nearby.",
          "It had no measurable environmental impact."
        ],
        correctIndex: 2
      },
      {
        question: "What challenge does rapid urbanization pose for public spaces?",
        options: [
          "Too many parks are built in developing cities.",
          "Roads and buildings are prioritized over green areas.",
          "Cities become too spread out for public spaces to be useful.",
          "Public spaces are only needed in wealthy nations."
        ],
        correctIndex: 2
      },
      {
        question: "What do urban planners advocate for?",
        options: [
          "Building more highways through city centers.",
          "Inclusive design accessible to all people regardless of background.",
          "Restricting public spaces to residents only.",
          "Replacing all parks with commercial developments."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'lecture_12',
    type: 'lecture',
    voiceId: 'rachel',
    title: 'The History of Writing Systems',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_12_clip_1',
        text: "Writing is one of humanity's most important inventions, allowing knowledge to be recorded, stored, and transmitted across generations. The earliest known writing system, cuneiform, was developed by the Sumerians in Mesopotamia around thirty-four hundred BCE. Initially used for record-keeping — tracking grain harvests and trade transactions — cuneiform gradually evolved to express more complex ideas, including laws, literature, and religious texts."
      },
      {
        id: 'lecture_12_clip_2',
        text: "Independently, the ancient Egyptians developed hieroglyphics, and the Chinese developed their own character-based writing system around fifteen hundred BCE. While these systems served similar purposes, they worked in fundamentally different ways. Cuneiform and hieroglyphics used a mix of symbols representing sounds and meanings, while Chinese characters primarily represented words or concepts. The Phoenician alphabet, developed around eleven hundred BCE, was revolutionary because it used a small set of symbols to represent individual sounds, making writing far more accessible."
      },
      {
        id: 'lecture_12_clip_3',
        text: "The Phoenician alphabet is the ancestor of nearly all modern alphabets. The Greeks adapted it by adding vowels, and the Romans further modified it into the Latin alphabet used by much of the world today. Writing has continued to evolve with technology, from the printing press to typewriters to digital text. Today, some linguists worry that the rise of emojis and text abbreviations may represent a return to a more pictographic form of communication, though others see this as simply the latest evolution in humanity's long relationship with written language."
      }
    ],
    questions: [
      {
        question: "What was the earliest known writing system?",
        options: [
          "Hieroglyphics.",
          "The Phoenician alphabet.",
          "Cuneiform.",
          "Chinese characters."
        ],
        correctIndex: 3
      },
      {
        question: "What was cuneiform initially used for?",
        options: [
          "Writing poetry and literature.",
          "Record-keeping such as tracking grain and trade.",
          "Sending messages between cities.",
          "Teaching children to read."
        ],
        correctIndex: 2
      },
      {
        question: "Why was the Phoenician alphabet considered revolutionary?",
        options: [
          "It was the first writing carved in stone.",
          "It used a small set of sound-based symbols, making writing more accessible.",
          "It was the first to include numbers.",
          "It could express more languages than any other system."
        ],
        correctIndex: 2
      },
      {
        question: "How did the Greeks change the Phoenician alphabet?",
        options: [
          "They removed most of the consonants.",
          "They added vowels.",
          "They replaced letters with pictures.",
          "They made it read from right to left."
        ],
        correctIndex: 2
      },
      {
        question: "What concern do some linguists have about modern communication?",
        options: [
          "That digital text is too difficult to read.",
          "That emojis may represent a return to pictographic communication.",
          "That typing is slower than handwriting.",
          "That alphabets are becoming too complex."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'lecture_13',
    type: 'lecture',
    voiceId: 'charlie',
    title: 'Behavioral Economics',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_13_clip_1',
        text: "Traditional economics assumes that people make rational decisions to maximize their own benefit. Behavioral economics challenges this assumption by demonstrating that humans are predictably irrational. The field was largely established by psychologists Daniel Kahneman and Amos Tversky, whose research showed that cognitive biases systematically distort our judgment. Kahneman later won the Nobel Prize in Economics for this work, despite being a psychologist."
      },
      {
        id: 'lecture_13_clip_2',
        text: "One of the most important concepts in behavioral economics is loss aversion: the finding that people feel the pain of losing something about twice as strongly as the pleasure of gaining the same thing. This explains why investors hold onto losing stocks too long and sell winning stocks too early. Another key concept is the anchoring effect, where the first piece of information we encounter disproportionately influences our subsequent judgments. For example, seeing a high original price on a sale tag makes the discounted price seem like a better deal, even if the original price was inflated."
      },
      {
        id: 'lecture_13_clip_3',
        text: "Governments around the world have begun applying behavioral economics through what are called nudge policies. Rather than using laws or financial incentives, nudges change the way choices are presented to encourage better decisions. For example, making organ donation the default option rather than requiring people to opt in has dramatically increased donation rates in several countries. Similarly, automatically enrolling employees in retirement savings plans, while allowing them to opt out, has significantly boosted savings rates compared to requiring them to actively sign up."
      }
    ],
    questions: [
      {
        question: "What does behavioral economics challenge about traditional economics?",
        options: [
          "That markets always crash eventually.",
          "That people make rational decisions to maximize their benefit.",
          "That money is the only motivator.",
          "That supply and demand determine all prices."
        ],
        correctIndex: 2
      },
      {
        question: "What is loss aversion?",
        options: [
          "The fear of investing in the stock market.",
          "People feel the pain of losing about twice as strongly as the pleasure of gaining.",
          "A strategy for minimizing financial risk.",
          "The tendency to avoid all risky decisions."
        ],
        correctIndex: 2
      },
      {
        question: "How does the anchoring effect work?",
        options: [
          "People make decisions based on the opinions of experts.",
          "The first piece of information disproportionately influences later judgments.",
          "People always choose the middle option.",
          "Past experiences have no effect on current decisions."
        ],
        correctIndex: 2
      },
      {
        question: "What is a nudge policy?",
        options: [
          "A law that forces people to make specific choices.",
          "A financial penalty for bad decisions.",
          "A change in how choices are presented to encourage better decisions.",
          "A tax incentive for healthy behavior."
        ],
        correctIndex: 3
      },
      {
        question: "How has default organ donation affected donation rates?",
        options: [
          "It had no measurable effect.",
          "It slightly decreased donation rates.",
          "It dramatically increased donation rates.",
          "It was banned in most countries."
        ],
        correctIndex: 3
      }
    ]
  },
  {
    id: 'lecture_14',
    type: 'lecture',
    voiceId: 'fin',
    title: 'Climate Change and Migration',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_14_clip_1',
        text: "Climate change is increasingly recognized as a driver of human migration. Rising sea levels, prolonged droughts, and intensifying natural disasters are displacing millions of people from their homes. The World Bank estimates that by twenty-fifty, climate change could force up to two hundred sixteen million people to migrate within their own countries. These climate migrants, unlike traditional refugees who flee war or persecution, are leaving because their environments can no longer sustain them."
      },
      {
        id: 'lecture_14_clip_2',
        text: "Small island nations face the most immediate threat. Countries like Tuvalu, Kiribati, and the Maldives are at risk of becoming uninhabitable as sea levels rise. Tuvalu's highest point is just four and a half meters above sea level, and saltwater intrusion has already contaminated freshwater supplies and destroyed farmland. In response, some island nations have begun purchasing land in other countries as a potential relocation strategy. The government of Kiribati, for instance, bought land in Fiji as an insurance policy for its citizens."
      },
      {
        id: 'lecture_14_clip_3',
        text: "The concept of climate refugees poses a significant legal challenge. Current international law, specifically the nineteen-fifty-one Refugee Convention, does not recognize environmental displacement as grounds for refugee status. This means that people forced from their homes by climate change have no guaranteed legal right to resettle in another country. Advocates are pushing for an expansion of international protections, but progress has been slow. Meanwhile, the humanitarian consequences continue to grow as climate-related displacement accelerates around the world."
      }
    ],
    questions: [
      {
        question: "How many people could climate change force to migrate by 2050?",
        options: [
          "About ten million.",
          "Up to fifty million.",
          "Up to two hundred sixteen million.",
          "Over one billion."
        ],
        correctIndex: 3
      },
      {
        question: "What makes small island nations particularly vulnerable?",
        options: [
          "They have the largest populations.",
          "They are located in earthquake zones.",
          "Their low elevation makes them susceptible to rising sea levels.",
          "They lack any natural resources."
        ],
        correctIndex: 3
      },
      {
        question: "What has the government of Kiribati done to prepare?",
        options: [
          "Built a massive seawall around the entire country.",
          "Purchased land in Fiji as a relocation option.",
          "Moved all citizens to Australia.",
          "Refused to acknowledge the threat of rising seas."
        ],
        correctIndex: 2
      },
      {
        question: "Why is the legal status of climate refugees problematic?",
        options: [
          "Too many countries want to accept them.",
          "International law does not recognize environmental displacement as grounds for refugee status.",
          "Climate migrants prefer to stay in their home countries.",
          "The UN has already solved this problem."
        ],
        correctIndex: 2
      },
      {
        question: "What are advocates pushing for?",
        options: [
          "Closing all international borders.",
          "Eliminating the Refugee Convention entirely.",
          "Expanding international protections to include climate displacement.",
          "Stopping all migration permanently."
        ],
        correctIndex: 3
      }
    ]
  },
  {
    id: 'lecture_15',
    type: 'lecture',
    voiceId: 'charlotte',
    title: 'The Microbiome and Human Health',
    timeLimit: 7 * 60,
    clips: [
      {
        id: 'lecture_15_clip_1',
        text: "The human body is home to trillions of microorganisms — bacteria, viruses, fungi, and other microbes — collectively known as the microbiome. Most of these organisms reside in the gut, where they play a crucial role in digestion, immune function, and even mental health. In fact, the number of microbial cells in and on the human body roughly equals the number of human cells, leading some scientists to describe us as superorganisms."
      },
      {
        id: 'lecture_15_clip_2',
        text: "Research has revealed a surprising connection between gut bacteria and the brain, often called the gut-brain axis. Studies in mice have shown that altering gut bacteria can change behavior, affecting anxiety levels and social interaction. In humans, people with depression have been found to have significantly different gut microbiome compositions compared to healthy individuals. Some researchers are now exploring whether probiotics — supplements containing beneficial bacteria — could serve as a treatment for mental health conditions."
      },
      {
        id: 'lecture_15_clip_3',
        text: "The composition of the microbiome is influenced by many factors including diet, antibiotic use, and environment. A diet rich in fiber and fermented foods tends to promote a diverse and healthy microbiome, while diets high in processed foods and sugar can reduce microbial diversity. The widespread use of antibiotics, while essential for fighting infections, has been shown to disrupt the microbiome for months or even years after treatment. Scientists warn that declining microbial diversity in modern populations may be contributing to the rise of autoimmune diseases, allergies, and obesity."
      }
    ],
    questions: [
      {
        question: "Where do most microbiome organisms reside in the body?",
        options: [
          "In the lungs.",
          "On the skin.",
          "In the gut.",
          "In the bloodstream."
        ],
        correctIndex: 3
      },
      {
        question: "What is the gut-brain axis?",
        options: [
          "A nerve that controls digestion.",
          "A connection between gut bacteria and brain function.",
          "A type of probiotic supplement.",
          "A surgical procedure for treating depression."
        ],
        correctIndex: 2
      },
      {
        question: "What has been found about gut bacteria in people with depression?",
        options: [
          "They have identical microbiomes to healthy people.",
          "They have significantly different gut microbiome compositions.",
          "They have more gut bacteria than average.",
          "Their gut bacteria have no connection to their condition."
        ],
        correctIndex: 2
      },
      {
        question: "How do antibiotics affect the microbiome?",
        options: [
          "They have no effect on gut bacteria.",
          "They only kill harmful bacteria.",
          "They can disrupt the microbiome for months or years.",
          "They permanently improve microbial diversity."
        ],
        correctIndex: 3
      },
      {
        question: "What may declining microbial diversity contribute to?",
        options: [
          "Improved athletic performance.",
          "Autoimmune diseases, allergies, and obesity.",
          "Better resistance to infections.",
          "Increased lifespan."
        ],
        correctIndex: 2
      }
    ]
  },

  // ─── TEXT CONTINUATION ──────────────────────────────────────
  {
    id: 'continuation_1',
    type: 'continuation',
    voiceId: 'george',
    title: 'Text Continuation Set 1',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_1_clip_1',
        text: "The city council announced plans to build a new park in the downtown area. However, local business owners expressed concern that construction would",
        options: [
          "increase property values throughout the neighborhood.",
          "disrupt traffic and reduce foot traffic to their stores during the building phase.",
          "attract more tourists to the historic district.",
          "be completed well ahead of schedule."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_1_clip_2',
        text: "Although renewable energy sources like solar and wind power have become increasingly affordable, many countries continue to rely heavily on fossil fuels because",
        options: [
          "solar panels are too large to install on most buildings.",
          "wind turbines produce too much noise pollution.",
          "the existing energy infrastructure was designed around fossil fuels, and replacing it requires enormous investment.",
          "renewable energy has been proven to be less efficient in all conditions."
        ],
        correctIndex: 3
      },
      {
        id: 'cont_1_clip_3',
        text: "The professor explained that the ancient Egyptians developed a sophisticated writing system known as hieroglyphics. For centuries, scholars were unable to decipher these symbols until",
        options: [
          "the discovery of the Rosetta Stone provided a key to understanding them.",
          "Egyptian schools began teaching the language again.",
          "computers were invented to analyze the patterns.",
          "a library of translated documents was found in Rome."
        ],
        correctIndex: 1
      },
      {
        id: 'cont_1_clip_4',
        text: "Marathon runners must carefully manage their energy throughout the race. Many experienced runners recommend starting at a slower pace and gradually increasing speed, rather than",
        options: [
          "walking the first few kilometers to conserve energy.",
          "sprinting at the beginning and risking exhaustion before the finish line.",
          "skipping water stations to save time during the race.",
          "training for shorter distances instead."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'continuation_2',
    type: 'continuation',
    voiceId: 'aria',
    title: 'Text Continuation Set 2',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_2_clip_1',
        text: "Recent studies have shown that spending time in nature can significantly reduce stress levels and improve mental health. Researchers found that even a twenty-minute walk in a park",
        options: [
          "had no measurable effect on participants' mood.",
          "was enough to lower cortisol levels and increase feelings of well-being.",
          "was only beneficial for people under the age of thirty.",
          "made participants feel more anxious about their daily responsibilities."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_2_clip_2',
        text: "The library is considering extending its opening hours to better serve the community. While this would benefit students and working professionals, the main challenge is",
        options: [
          "that most people prefer to read books at home anyway.",
          "the additional cost of staffing and electricity during evening hours.",
          "finding enough new books to fill the extra hours.",
          "convincing people that libraries are still relevant."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_2_clip_3',
        text: "Electric vehicles are becoming more popular worldwide, but one significant barrier to widespread adoption remains. Many potential buyers are concerned about",
        options: [
          "the color options available for electric cars.",
          "the limited range of batteries and the availability of charging stations.",
          "whether electric cars can be driven in rainy weather.",
          "the excessive noise produced by electric motors."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_2_clip_4',
        text: "The school introduced a new policy requiring students to leave their phones in their lockers during class. Initially, students protested, but after a few weeks, teachers reported that",
        options: [
          "students began bringing tablets instead of phones.",
          "classroom participation and focus had noticeably improved.",
          "most students dropped out of school in response.",
          "the policy was reversed due to lack of support."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'continuation_3',
    type: 'continuation',
    voiceId: 'callum',
    title: 'Text Continuation Set 3',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_3_clip_1',
        text: "The human brain consumes roughly twenty percent of the body's total energy, despite accounting for only about two percent of body weight. This high energy demand is necessary because",
        options: [
          "the brain stores large amounts of fat for insulation.",
          "neurons require constant energy to maintain electrical signals and form new connections.",
          "the brain generates heat that warms the rest of the body.",
          "physical movement is controlled entirely by the brain."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_3_clip_2',
        text: "Many historians consider the invention of the printing press in fourteen-forty to be one of the most important events in human history. Before the printing press, books had to be copied by hand, which meant that",
        options: [
          "only wealthy individuals and institutions could afford them.",
          "books were more accurate and better preserved.",
          "literacy rates were actually higher than they are today.",
          "there was no need for public libraries."
        ],
        correctIndex: 1
      },
      {
        id: 'cont_3_clip_3',
        text: "Honeybees communicate the location of food sources through an elaborate movement known as the waggle dance. By varying the direction and duration of their dance, bees can indicate",
        options: [
          "which flowers produce the best honey.",
          "how many bees should go to collect the food.",
          "the precise distance and direction of a food source from the hive.",
          "the time of day when flowers are most likely to bloom."
        ],
        correctIndex: 3
      },
      {
        id: 'cont_3_clip_4',
        text: "The Mediterranean diet, which emphasizes fruits, vegetables, whole grains, and olive oil, has been linked to numerous health benefits. Studies involving thousands of participants have found that following this diet can",
        options: [
          "cure all forms of heart disease immediately.",
          "reduce the risk of heart attack and stroke by up to thirty percent.",
          "replace the need for all medications.",
          "guarantee a lifespan of over one hundred years."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'continuation_4',
    type: 'continuation',
    voiceId: 'lily',
    title: 'Text Continuation Set 4',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_4_clip_1',
        text: "Languages around the world are disappearing at an alarming rate. Linguists estimate that of the approximately seven thousand languages currently spoken, nearly half are endangered. When a language dies, the community loses not only a means of communication but also",
        options: [
          "the ability to learn any other language.",
          "a unique body of knowledge, cultural traditions, and ways of understanding the world.",
          "access to modern technology and education.",
          "the desire to interact with other cultures."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_4_clip_2',
        text: "Sleep researchers have found that the blue light emitted by smartphones and computer screens can interfere with the body's production of melatonin, a hormone that regulates sleep. As a result, experts recommend",
        options: [
          "using electronic devices only in complete darkness.",
          "avoiding screens for at least an hour before bedtime.",
          "replacing all light bulbs with blue ones.",
          "sleeping only during daylight hours."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_4_clip_3',
        text: "The ancient Romans built an extensive network of roads that connected their vast empire. These roads were so well constructed that",
        options: [
          "modern highways follow completely different routes.",
          "many of them are still visible and some remain in use nearly two thousand years later.",
          "they were only used by the military and never by civilians.",
          "they were destroyed within a century of being built."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_4_clip_4',
        text: "Space tourism, once the stuff of science fiction, is becoming a reality. Companies like SpaceX and Blue Origin have begun offering commercial flights to the edge of space. However, critics point out that",
        options: [
          "nobody is actually interested in traveling to space.",
          "these flights are currently too expensive for anyone to afford.",
          "the environmental impact and enormous cost make it accessible only to the ultra-wealthy, raising questions of fairness.",
          "space tourism has already been available for decades."
        ],
        correctIndex: 3
      }
    ]
  },
  {
    id: 'continuation_5',
    type: 'continuation',
    voiceId: 'drew',
    title: 'Text Continuation Set 5',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_5_clip_1',
        text: "Trees in urban areas provide benefits that extend far beyond their visual appeal. Research has shown that neighborhoods with more trees tend to have lower crime rates, and residents report",
        options: [
          "feeling more isolated from their neighbors.",
          "higher levels of satisfaction with their community and better mental health.",
          "spending less time outdoors than residents of treeless areas.",
          "no difference in quality of life compared to other neighborhoods."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_5_clip_2',
        text: "The discovery of penicillin by Alexander Fleming in nineteen-twenty-eight is often described as one of the greatest accidents in medical history. Fleming noticed that a mold growing on a discarded petri dish had killed the bacteria around it, which led him to",
        options: [
          "immediately mass-produce the antibiotic for hospitals.",
          "investigate the mold further, eventually leading to the development of the first antibiotic.",
          "discard the contaminated sample and start a new experiment.",
          "publish his findings without any further research."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_5_clip_3',
        text: "International trade has increased dramatically over the past century, connecting economies around the world in complex networks of exchange. While free trade can promote economic growth, it also means that",
        options: [
          "countries no longer need to produce anything domestically.",
          "economic crises in one country can quickly spread to others through these interconnections.",
          "every country benefits equally from global trade.",
          "tariffs and trade barriers have completely disappeared."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_5_clip_4',
        text: "Archaeologists studying ancient civilizations often rely on carbon dating to determine the age of organic artifacts. This technique works by measuring the amount of carbon-fourteen remaining in a sample, because",
        options: [
          "all organic material contains the same amount of carbon-fourteen at all times.",
          "carbon-fourteen decays at a predictable rate after an organism dies.",
          "carbon-fourteen is only found in human-made objects.",
          "the technique was used by ancient civilizations themselves."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'continuation_6',
    type: 'continuation',
    voiceId: 'daniel',
    title: 'Text Continuation Set 6',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_6_clip_1',
        text: "The concept of emotional intelligence, popularized by psychologist Daniel Goleman, refers to the ability to recognize, understand, and manage our own emotions, as well as the emotions of others. Studies have shown that emotional intelligence is often a better predictor of career success than",
        options: [
          "physical fitness or athletic ability.",
          "IQ or technical skills alone.",
          "the university a person attended.",
          "the number of languages a person speaks."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_6_clip_2',
        text: "Volcanic eruptions, while destructive, play an important role in shaping the Earth's landscape and atmosphere. The ash and minerals released during eruptions enrich the surrounding soil, which is why",
        options: [
          "no plants can grow near volcanoes for hundreds of years.",
          "volcanic regions often have exceptionally fertile farmland.",
          "people always build cities as far from volcanoes as possible.",
          "volcanic rock is used to make building materials."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_6_clip_3',
        text: "The rise of social media has transformed how news is consumed around the world. While social platforms allow information to spread faster than ever before, they also make it easier for",
        options: [
          "journalists to verify their sources before publishing.",
          "misinformation and fake news to reach millions of people within hours.",
          "governments to control all forms of media effectively.",
          "people to become professional reporters."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_6_clip_4',
        text: "Scientists have recently discovered that octopuses are among the most intelligent invertebrates on Earth. In laboratory experiments, they have demonstrated the ability to solve complex puzzles, use tools, and even",
        options: [
          "communicate using human language.",
          "escape from sealed containers by unscrewing lids from the inside.",
          "live on land for extended periods of time.",
          "teach other marine animals new behaviors."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'continuation_7',
    type: 'continuation',
    voiceId: 'rachel',
    title: 'Text Continuation Set 7',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_7_clip_1',
        text: "Learning a second language has been shown to have cognitive benefits that extend well beyond communication. Bilingual individuals tend to perform better on tasks that require switching between activities, and research suggests that speaking two languages may even",
        options: [
          "reduce the risk of age-related cognitive decline and delay the onset of dementia.",
          "cause confusion and slower thinking in most situations.",
          "prevent people from mastering either language fully.",
          "have no measurable effect on brain function."
        ],
        correctIndex: 1
      },
      {
        id: 'cont_7_clip_2',
        text: "The Great Wall of China, one of the world's most famous landmarks, was built over many centuries by multiple dynasties. Contrary to the popular myth that it can be seen from space with the naked eye, astronauts have confirmed that",
        options: [
          "it is clearly visible from the International Space Station.",
          "it is actually impossible to distinguish from the surrounding landscape at such a distance.",
          "it can only be seen from space during winter months.",
          "it appears as a bright line across the Chinese landscape."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_7_clip_3',
        text: "Microplastics — tiny fragments of plastic less than five millimeters in size — have been found in virtually every environment on Earth, from the deepest ocean trenches to Arctic ice. What concerns scientists most is that",
        options: [
          "microplastics are actually beneficial for marine ecosystems.",
          "these particles can enter the food chain, accumulating in fish and eventually in the humans who consume them.",
          "microplastics dissolve naturally within a few weeks.",
          "only one type of plastic breaks down into microplastics."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_7_clip_4',
        text: "Throughout history, pandemics have shaped the course of human civilization. The Black Death of the fourteenth century killed approximately one-third of Europe's population, but paradoxically, it also",
        options: [
          "had no lasting effect on European society.",
          "led to higher wages for surviving workers and contributed to the end of feudalism.",
          "strengthened the feudal system and increased poverty.",
          "only affected rural areas, leaving cities untouched."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'continuation_8',
    type: 'continuation',
    voiceId: 'charlie',
    title: 'Text Continuation Set 8',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_8_clip_1',
        text: "The James Webb Space Telescope, launched in twenty-twenty-one, has provided astronomers with unprecedented views of the early universe. One of its most remarkable discoveries has been the detection of galaxies that formed much earlier than previously thought, suggesting that",
        options: [
          "the universe is actually much younger than scientists believed.",
          "our models of how galaxies formed in the early universe may need to be revised.",
          "stars cannot form without the presence of dark matter.",
          "the telescope is malfunctioning and producing inaccurate data."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_8_clip_2',
        text: "Public transportation systems are a critical part of sustainable urban development. Cities with well-designed subway and bus networks tend to have lower carbon emissions per capita because",
        options: [
          "public transit vehicles produce zero emissions.",
          "fewer residents need to rely on private cars for daily commuting.",
          "people who use public transit never travel outside the city.",
          "cities with public transit have smaller populations."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_8_clip_3',
        text: "The concept of universal basic income — a regular cash payment to all citizens regardless of employment status — has gained attention as automation threatens to replace many jobs. Supporters argue that UBI would",
        options: [
          "eliminate all poverty and unemployment overnight.",
          "provide a safety net that allows people to retrain, start businesses, or pursue education during economic transitions.",
          "discourage people from working entirely.",
          "cost nothing to implement because it replaces all other social programs."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_8_clip_4',
        text: "Coffee plants are highly sensitive to temperature changes, and climate scientists predict that by twenty-fifty, roughly half of the land currently used for coffee cultivation will no longer be suitable. This could devastate the economies of countries like Ethiopia and Colombia, which",
        options: [
          "have already transitioned to growing other crops.",
          "depend heavily on coffee exports for national income and employment.",
          "produce only a small fraction of the world's coffee.",
          "are investing exclusively in indoor coffee farming."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'continuation_9',
    type: 'continuation',
    voiceId: 'fin',
    title: 'Text Continuation Set 9',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_9_clip_1',
        text: "The fashion industry is one of the largest polluters in the world, responsible for an estimated ten percent of global carbon emissions. The trend toward fast fashion — inexpensive clothing produced quickly in response to trends — has significantly worsened the problem because",
        options: [
          "people now buy fewer clothes overall.",
          "consumers purchase and discard clothing at much higher rates than previous generations.",
          "fast fashion uses only organic materials.",
          "fashion companies have eliminated all waste from production."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_9_clip_2',
        text: "The ancient city of Pompeii, buried under volcanic ash when Mount Vesuvius erupted in seventy-nine AD, has provided archaeologists with an extraordinary window into Roman daily life. The ash preserved buildings, artwork, and even food in such detail that",
        options: [
          "historians have been able to reconstruct daily routines and social structures of the time.",
          "the city was rebuilt exactly as it was before the eruption.",
          "nothing of historical value was actually found at the site.",
          "the ash destroyed all evidence of how Romans lived."
        ],
        correctIndex: 1
      },
      {
        id: 'cont_9_clip_3',
        text: "Studies on childhood development have shown that play is not merely a recreational activity but a critical component of learning. Through play, children develop problem-solving skills, social competence, and creativity, which is why",
        options: [
          "playtime should be eliminated from school schedules.",
          "many education experts advocate for more, not less, unstructured play time in early education.",
          "children who play more tend to perform worse academically.",
          "play is only beneficial for children under the age of three."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_9_clip_4',
        text: "Quantum computers operate on fundamentally different principles than classical computers, using quantum bits or qubits that can exist in multiple states simultaneously. While still in early stages of development, quantum computers have the potential to",
        options: [
          "replace all classical computers within the next year.",
          "solve certain complex problems, like drug discovery and cryptography, exponentially faster than current technology.",
          "only perform simple arithmetic calculations.",
          "work without any electricity or physical hardware."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'continuation_10',
    type: 'continuation',
    voiceId: 'charlotte',
    title: 'Text Continuation Set 10',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_10_clip_1',
        text: "Music education has been shown to benefit children in ways that extend far beyond learning to play an instrument. Students who participate in regular music instruction tend to score higher on standardized tests, because",
        options: [
          "music classes are easier than other subjects.",
          "learning music strengthens skills in pattern recognition, memory, and mathematical reasoning.",
          "teachers grade music students more generously.",
          "music replaces the need for studying other subjects."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_10_clip_2',
        text: "The Amazon rainforest produces approximately twenty percent of the world's oxygen and absorbs vast quantities of carbon dioxide. Deforestation of the Amazon is therefore not only a regional environmental issue but a global one, because",
        options: [
          "the Amazon is the only forest in the world.",
          "losing the Amazon would significantly reduce the planet's capacity to regulate atmospheric carbon.",
          "the Amazon has no impact on global weather patterns.",
          "deforestation actually increases oxygen production."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_10_clip_3',
        text: "Self-driving cars use a combination of sensors, cameras, and artificial intelligence to navigate roads without human input. While proponents argue they could drastically reduce traffic accidents caused by human error, the technology still faces challenges such as",
        options: [
          "the inability to detect any objects on the road.",
          "difficulty handling unpredictable situations like extreme weather and unexpected obstacles.",
          "cars that move too slowly to be practical.",
          "the fact that all self-driving cars must be electric."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_10_clip_4',
        text: "The Dead Sea, shared by Israel and Jordan, is one of the saltiest bodies of water on Earth, with a salinity about ten times that of ordinary ocean water. This extreme saltiness means that",
        options: [
          "no fish or other complex organisms can survive in it.",
          "the water is frozen year-round due to the salt content.",
          "it is a major source of drinking water for the region.",
          "only freshwater fish can be found in the Dead Sea."
        ],
        correctIndex: 1
      }
    ]
  },
  {
    id: 'continuation_11',
    type: 'continuation',
    voiceId: 'george',
    title: 'Text Continuation Set 11',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_11_clip_1',
        text: "The concept of time zones was established in the nineteenth century to standardize timekeeping across different regions. Before this system was adopted, each city set its clocks according to the local position of the sun, which caused confusion for",
        options: [
          "farmers who needed to know when to plant crops.",
          "railroad companies trying to coordinate train schedules across long distances.",
          "astronomers studying distant stars and planets.",
          "sailors navigating the open seas."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_11_clip_2',
        text: "Vertical farming — growing crops in stacked layers inside controlled indoor environments — is being explored as a solution to food production challenges. Unlike traditional agriculture, vertical farms can operate year-round regardless of weather conditions, and they use up to",
        options: [
          "twice as much water as conventional farms.",
          "ninety-five percent less water through recirculating hydroponic systems.",
          "the same amount of water as outdoor farming.",
          "no water at all, relying entirely on sunlight."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_11_clip_3',
        text: "The invention of the internet has transformed nearly every aspect of modern life, from communication to commerce. Yet the original network, known as ARPANET, was developed in the late nineteen-sixties by the United States military, primarily to",
        options: [
          "provide entertainment for soldiers stationed overseas.",
          "create a communication system that could survive a nuclear attack.",
          "connect universities for sharing research papers.",
          "replace the postal service with electronic mail."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_11_clip_4',
        text: "In many countries, the gender pay gap — the difference in average earnings between men and women — persists despite decades of progress toward equality. Economists attribute the gap partly to occupational segregation and partly to",
        options: [
          "the fact that women work fewer hours than men in every industry.",
          "differences in career interruptions, often related to childcare responsibilities, and unconscious bias in promotion decisions.",
          "women choosing lower-paying jobs on purpose.",
          "legal requirements that mandate different pay scales."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'continuation_12',
    type: 'continuation',
    voiceId: 'aria',
    title: 'Text Continuation Set 12',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_12_clip_1',
        text: "Elephants are known for their remarkable memory and complex social structures. Female elephants live in tight-knit family groups led by the oldest female, called the matriarch, who is responsible for",
        options: [
          "hunting food for the entire group.",
          "guiding the herd to water sources and safe locations based on decades of accumulated knowledge.",
          "defending the group from all predators single-handedly.",
          "deciding when young elephants should leave the family."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_12_clip_2',
        text: "The development of vaccines is considered one of the greatest achievements in public health history. Smallpox, which once killed millions of people annually, was completely eradicated by nineteen-eighty thanks to",
        options: [
          "improved nutrition and hygiene alone.",
          "a coordinated global vaccination campaign led by the World Health Organization.",
          "the development of a cure that treated infected individuals.",
          "the virus naturally dying out without human intervention."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_12_clip_3',
        text: "Architectural historians have long debated how the ancient Egyptians constructed the pyramids without modern technology. Recent discoveries of a ramp system near the Great Pyramid suggest that workers may have",
        options: [
          "used alien technology to lift the massive stone blocks.",
          "transported the blocks using internal and external ramps combined with water lubrication.",
          "only used wooden tools that have all since decomposed.",
          "built the pyramids from the top down."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_12_clip_4',
        text: "The global shipping industry transports approximately ninety percent of the world's trade goods. While container ships are an efficient means of moving large quantities of cargo, the industry faces increasing pressure to reduce its carbon footprint because",
        options: [
          "ships are the fastest form of transportation available.",
          "maritime transport accounts for nearly three percent of global greenhouse gas emissions.",
          "most ships already run on clean energy sources.",
          "the shipping industry has no environmental impact."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'continuation_13',
    type: 'continuation',
    voiceId: 'callum',
    title: 'Text Continuation Set 13',
    timeLimit: 4 * 60,
    clips: [
      {
        id: 'cont_13_clip_1',
        text: "The field of epigenetics has revealed that our genes are not simply fixed instructions. Environmental factors such as diet, stress, and exposure to toxins can alter how genes are expressed without changing the DNA sequence itself. Even more remarkably, some of these changes can be",
        options: [
          "passed down to future generations through inheritance.",
          "immediately reversed by taking a specific medication.",
          "detected only with equipment that does not yet exist.",
          "observed only in plants, not in animals or humans."
        ],
        correctIndex: 1
      },
      {
        id: 'cont_13_clip_2',
        text: "The Renaissance, which began in fourteenth-century Italy, marked a dramatic shift in European art, science, and philosophy. Artists like Leonardo da Vinci and Michelangelo pushed the boundaries of what was possible, while thinkers like Galileo challenged established beliefs. This cultural explosion was partly fueled by",
        options: [
          "a decline in interest in classical Greek and Roman knowledge.",
          "the wealth of Italian city-states and the patronage of powerful families like the Medici.",
          "the isolation of Italy from the rest of Europe.",
          "a period of severe economic hardship across the continent."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_13_clip_3',
        text: "Noise pollution is an often-overlooked environmental health hazard. Prolonged exposure to high noise levels, such as those found near busy roads or airports, has been linked to increased rates of cardiovascular disease. This is because chronic noise exposure",
        options: [
          "directly damages the heart muscle.",
          "triggers a stress response that raises blood pressure and cortisol levels over time.",
          "prevents people from exercising regularly.",
          "only affects people with pre-existing hearing conditions."
        ],
        correctIndex: 2
      },
      {
        id: 'cont_13_clip_4',
        text: "The board game chess has been played for over fifteen hundred years and is considered one of the ultimate tests of strategic thinking. In nineteen-ninety-seven, IBM's Deep Blue computer defeated world champion Garry Kasparov, which many saw as a turning point because",
        options: [
          "chess was immediately banned from international competition.",
          "it demonstrated that machines could outperform humans in complex strategic reasoning.",
          "Kasparov later proved the match was rigged.",
          "computers had already beaten all other chess champions."
        ],
        correctIndex: 2
      }
    ]
  }
];

/**
 * Get all vocal sections of a specific type
 * @param {'lecture' | 'continuation'} type
 * @returns {Array}
 */
export function getVocalSectionsByType(type) {
  return VOCAL_SECTIONS.filter(s => s.type === type);
}

/**
 * Get a specific vocal section by ID
 * @param {string} id
 * @returns {Object|undefined}
 */
export function getVocalSectionById(id) {
  return VOCAL_SECTIONS.find(s => s.id === id);
}
