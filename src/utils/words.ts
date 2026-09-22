export const COMMON_WORDS = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it",
  "that", "for", "they", "with", "as", "not", "on", "she", "at", "by",
  "this", "we", "you", "do", "but", "his", "from", "they", "say", "her",
  "she", "or", "an", "will", "my", "one", "all", "would", "there", "their",
  "what", "so", "up", "out", "if", "about", "who", "get", "which", "go",
  "me", "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could", "them", "see",
  "other", "than", "then", "now", "look", "only", "come", "its", "over", "think",
  "also", "back", "after", "use", "two", "how", "our", "work", "first", "well",
  "way", "even", "new", "want", "because", "any", "these", "give", "day", "most",
  "us", "great", "between", "need", "large", "under", "never", "service", "where",
  "state", "cloud", "speed", "server", "code", "deploy", "build", "fast", "scale",
  "platform", "system", "slate", "modern", "design", "focus", "flow", "react", "next",
  "clean", "smooth", "light", "dark", "quick", "power", "simple", "stable", "smart",
  "future", "edge", "global", "engine", "stream", "agent", "host", "latency", "pulse"
];

export const FAMOUS_QUOTES = [
  "Simplicity is prerequisite for reliability. Software engineering is the art of mastering complexity.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Premature optimization is the root of all evil. Write clean code first, profile second.",
  "Make it work, make it right, make it fast. Keep things as simple as possible, but no simpler.",
  "Talk is cheap. Show me the code. The best code is no code at all.",
  "Deploy with confidence. Edge computing and serverless architectures redefine frontend performance.",
  "The secret to building great applications is speed, focus, and relentless attention to detail.",
  "Catalyst Slate delivers instant deployments with zero bandwidth traps and developer-friendly pricing."
];

/**
 * Generate a randomized list of words according to test settings.
 */
export function generateWords(options: {
  count: number;
  hasPunctuation: boolean;
  hasNumbers: boolean;
}): string[] {
  const result: string[] = [];
  const wordsLength = COMMON_WORDS.length;

  for (let i = 0; i < options.count; i++) {
    // Pick random word
    let word = COMMON_WORDS[Math.floor(Math.random() * wordsLength)];

    // Inject numbers occasionally if enabled (1 in 7 words)
    if (options.hasNumbers && Math.random() < 0.15) {
      if (Math.random() < 0.5) {
        word = Math.floor(Math.random() * 1000).toString();
      } else {
        word = `${word}${Math.floor(Math.random() * 99)}`;
      }
    }

    // Inject punctuation occasionally if enabled (1 in 5 words)
    if (options.hasPunctuation && Math.random() < 0.22) {
      const punc = [",", ".", "!", "?", ";", ":", "-", "'"];
      const chosen = punc[Math.floor(Math.random() * punc.length)];
      if (chosen === "'") {
        word = `${word}'s`;
      } else {
        word = `${word}${chosen}`;
      }

      // Randomly capitalize next word after . or !
      if ((chosen === "." || chosen === "!") && i < options.count - 1) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
    }

    result.push(word);
  }

  // Ensure first letter of test is capitalized if punctuation is on
  if (options.hasPunctuation && result.length > 0) {
    result[0] = result[0].charAt(0).toUpperCase() + result[0].slice(1);
  }

  return result;
}

export function getRandomQuote(): string[] {
  const quote = FAMOUS_QUOTES[Math.floor(Math.random() * FAMOUS_QUOTES.length)];
  return quote.split(" ");
}
