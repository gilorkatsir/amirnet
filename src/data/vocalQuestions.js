// Vocal Exam Questions for AMIRNET
// Two types:
// 1. Lecture + Questions: Listen to 3 audio clips, answer 5 questions (7 min)
// 2. Text Continuation: 4 clips cut off mid-sentence, pick continuation (4 min)

export const VOCAL_SECTIONS = [
  // ─── LECTURE + QUESTIONS ────────────────────────────────────
  {
    id: 'lecture_1',
    type: 'lecture',
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

  // ─── TEXT CONTINUATION ──────────────────────────────────────
  {
    id: 'continuation_1',
    type: 'continuation',
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
