import type { Project } from '../types/project';

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

// Calculate similarity score between two strings
function getSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  // Exact match gets highest score
  if (s1 === s2) return 1;
  
  // Contains match gets high score
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Calculate word match score
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  const matchingWords = words1.filter(word => 
    words2.some(w2 => w2.includes(word) || word.includes(w2))
  );
  
  return matchingWords.length / Math.max(words1.length, words2.length);
}

export function searchProjects(project: Project, query: string): boolean {
  const searchTerms = normalizeText(query).split(/\s+/);
  const threshold = 0.3; // Minimum similarity score to consider a match
  
  // Search in title (highest weight)
  const titleScore = searchTerms.some(term => 
    getSimilarity(project.title, term) > threshold
  ) ? 1 : 0;
  
  // Search in description
  const descriptionScore = searchTerms.some(term => 
    getSimilarity(project.description, term) > threshold ||
    getSimilarity(project.shortDescription, term) > threshold
  ) ? 0.8 : 0;
  
  // Search in tags
  const tagScore = project.tags.some(tag =>
    searchTerms.some(term => getSimilarity(tag, term) > threshold)
  ) ? 0.6 : 0;
  
  // Search in tech stack
  const techScore = project.techStack.some(tech =>
    searchTerms.some(term => getSimilarity(tech, term) > threshold)
  ) ? 0.4 : 0;
  
  // Calculate final score with weights
  const finalScore = Math.max(
    titleScore,
    descriptionScore,
    tagScore,
    techScore
  );
  
  return finalScore > 0;
}