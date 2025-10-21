import { Kamus } from '../types';

class WordService {
  private words: Kamus = {};
  private wordsByLength: Map<number, string[]> = new Map();

  async initialize(): Promise<void> {
    try {
      const response = await fetch('/data/kamus.json');
      if (!response.ok) {
        throw new Error('Failed to load dictionary');
      }
      this.words = await response.json();
      this.prepareWords();
    } catch (error) {
      console.error("Error initializing WordService:", error);
    }
  }

  private prepareWords(): void {
    const allWords = Object.keys(this.words);
    const filteredWords = allWords.filter(word => word.length === 5 && /^[a-z]+$/.test(word));
    this.wordsByLength.set(5, filteredWords);
  }

  getWordsByLength(length: number): string[] {
    return this.wordsByLength.get(length) || [];
  }

  getRandomWord(length: number): string {
    const wordList = this.getWordsByLength(length);
    if (wordList.length === 0) {
      console.error(`No words of length ${length} found.`);
      return 'GAGAL';
    }
    const randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex].toUpperCase();
  }

  isValidWord(word: string): boolean {
    return this.words.hasOwnProperty(word.toLowerCase());
  }

  getWordDefinition(word: string): { submakna: string[], contoh: string[] } | null {
      const entry = this.words[word.toLowerCase()];
      if (entry) {
          return {
              submakna: entry.submakna || [],
              contoh: entry.contoh || []
          };
      }
      return null;
  }
}

const wordService = new WordService();
export default wordService;
