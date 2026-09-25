// =====================================================================
// Moteur de matching — §4.1 du cahier des charges
// Score = cosinus(S, R) * 0.7 + CorrespondanceLieu * 0.15 + CorrespondanceDomaine * 0.15
// =====================================================================

/**
 * Calcule un IDF simplifié par compétence, sur l'ensemble des offres publiées.
 * idf(skill) = ln( N / (1 + df(skill)) )
 * @param {Array<{skill_id:number}>} allInternshipSkillRows lignes internship_skills jointes à internships publiées
 * @param {number} totalPublishedInternships
 * @returns {Map<number, number>} skill_id -> idf
 */
export function computeIdf(allInternshipSkillRows, totalPublishedInternships) {
  const df = new Map();
  for (const row of allInternshipSkillRows) {
    df.set(row.skill_id, (df.get(row.skill_id) || 0) + 1);
  }
  const idf = new Map();
  const N = Math.max(totalPublishedInternships, 1);
  for (const [skillId, count] of df.entries()) {
    idf.set(skillId, Math.log(N / (1 + count)) + 1); // +1 : évite un idf nul/négatif
  }
  return idf;
}

/** Construit un vecteur pondéré { skill_id: poids_tfidf } à partir de lignes {skill_id, weight}. */
function toTfIdfVector(skillWeightRows, idfMap) {
  const vec = new Map();
  for (const { skill_id, weight } of skillWeightRows) {
    const idf = idfMap.get(skill_id) ?? 1;
    vec.set(skill_id, Number(weight) * idf);
  }
  return vec;
}

/** Similarité cosinus entre deux vecteurs creux (Map<skill_id, poids>). */
export function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const v of vecA.values()) normA += v * v;
  for (const v of vecB.values()) normB += v * v;
  for (const [skillId, va] of vecA.entries()) {
    const vb = vecB.get(skillId);
    if (vb) dot += va * vb;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Score de matching final, sur une échelle 0-100.
 * @param {Array<{skill_id:number, weight:number}>} studentSkills
 * @param {Array<{skill_id:number, weight:number}>} internshipSkills
 * @param {Map<number, number>} idfMap
 * @param {boolean} locationMatch
 * @param {boolean} domainMatch
 */
export function computeMatchScore({ studentSkills, internshipSkills, idfMap, locationMatch, domainMatch }) {
  const studentVec = toTfIdfVector(studentSkills, idfMap);
  const internshipVec = toTfIdfVector(internshipSkills, idfMap);
  const skillSimilarity = cosineSimilarity(studentVec, internshipVec); // 0..1

  const score =
    skillSimilarity * 0.7 +
    (locationMatch ? 1 : 0) * 0.15 +
    (domainMatch ? 1 : 0) * 0.15;

  return Math.round(score * 10000) / 100; // 0.00 à 100.00
}

/** Compétences de l'offre que l'étudiant n'a pas — pour "suggestions de compétences manquantes" (§4.2). */
export function missingSkills(studentSkillIds, internshipSkillRows) {
  const known = new Set(studentSkillIds);
  return internshipSkillRows.filter((s) => !known.has(s.skill_id));
}
