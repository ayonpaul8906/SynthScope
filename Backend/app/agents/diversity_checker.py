from typing import Any, Dict, List, Set


class DiversityChecker:
    """
    Deterministic analytical agent that audits the diversity and variation
    across a complete set of generated synthetic user personas.
    Detects duplicates, demographic clustering, repeated occupations, and traits.
    """

    def evaluate_diversity(self, personas: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes a batch of personas and returns a diversity report with score, warnings,
        and recommendations.
        """
        if not personas or not isinstance(personas, list):
            return {
                "diversity_score": 0.0,
                "warnings": ["No personas provided for diversity evaluation."],
                "recommendations": ["Generate a non-empty list of personas."],
            }

        total_count = len(personas)
        warnings: List[str] = []
        recommendations: List[str] = []

        names: Set[str] = set()
        duplicate_names: List[str] = []
        occupations: Dict[str, int] = {}
        countries: Dict[str, int] = {}
        genders: Dict[str, int] = {}
        age_groups = {"18-29": 0, "30-45": 0, "46-65": 0, "65+": 0}
        all_traits: Dict[str, int] = {}

        for p in personas:
            # Check duplicate names
            name = str(p.get("name", "")).strip()
            if name:
                name_key = name.lower()
                if name_key in names:
                    duplicate_names.append(name)
                names.add(name_key)

            # Occupation frequency
            occ = str(p.get("occupation", "")).strip().title()
            if occ:
                occupations[occ] = occupations.get(occ, 0) + 1

            # Country frequency
            country = str(p.get("country", "")).strip().title()
            if country:
                countries[country] = countries.get(country, 0) + 1

            # Gender frequency
            gender = str(p.get("gender", "")).strip().title()
            if gender:
                genders[gender] = genders.get(gender, 0) + 1

            # Age group distribution
            try:
                age = int(p.get("age", 30))
                if age < 30:
                    age_groups["18-29"] += 1
                elif age <= 45:
                    age_groups["30-45"] += 1
                elif age <= 65:
                    age_groups["46-65"] += 1
                else:
                    age_groups["65+"] += 1
            except (TypeError, ValueError):
                pass

            # Personality traits frequency
            personality = p.get("personality", {})
            if isinstance(personality, dict):
                traits = personality.get("traits", [])
                if isinstance(traits, list):
                    for trait in traits:
                        t_str = str(trait).strip().title()
                        if t_str:
                            all_traits[t_str] = all_traits.get(t_str, 0) + 1

        # Calculate score metrics
        score = 100.0

        # Duplicate names penalty
        if duplicate_names:
            penalty = len(duplicate_names) * 15.0
            score -= penalty
            warnings.append(
                f"Detected duplicate persona names: {', '.join(set(duplicate_names))}."
            )
            recommendations.append("Ensure all persona names are unique.")

        # Occupation concentration penalty
        for occ, count in occupations.items():
            ratio = count / total_count
            if total_count > 1 and ratio > 0.4:
                penalty = (ratio - 0.4) * 50.0
                score -= penalty
                warnings.append(
                    f"High occupation concentration: {count} of {total_count} personas are '{occ}'."
                )
                recommendations.append(
                    f"Vary occupations to reduce over-representation of '{occ}'."
                )

        # Gender concentration penalty
        for gender, count in genders.items():
            ratio = count / total_count
            if total_count >= 3 and ratio > 0.75:
                penalty = (ratio - 0.75) * 30.0
                score -= penalty
                warnings.append(
                    f"Demographic skew: {count} of {total_count} personas have gender '{gender}'."
                )
                recommendations.append("Balance gender distribution across personas.")

        # Country / Geography concentration penalty
        if len(countries) == 1 and total_count > 2:
            score -= 10.0
            unique_country = list(countries.keys())[0]
            warnings.append(
                f"Geographic clustering: All personas are located in '{unique_country}'."
            )
            recommendations.append(
                "Include personas from multiple geographic regions if relevant to target audience."
            )

        # Age distribution concentration
        for group, count in age_groups.items():
            if total_count >= 4 and count == total_count:
                score -= 15.0
                warnings.append(
                    f"Age clustering: All personas fall into the {group} age bracket."
                )
                recommendations.append(
                    "Include a broader age spread across young adults, mid-career professionals, and seniors."
                )
                break

        # Trait diversity
        if len(all_traits) < min(3, total_count * 2):
            score -= 10.0
            warnings.append("Low personality trait diversity detected across persona set.")
            recommendations.append(
                "Incorporate diverse personality traits (e.g., pragmatic, exploratory, skeptical, analytical)."
            )

        final_score = max(0.0, min(100.0, round(score, 1)))

        if final_score >= 80.0 and not warnings:
            warnings.append("No diversity issues detected.")
            recommendations.append("Persona diversity profile is strong and well-distributed.")

        return {
            "diversity_score": final_score,
            "warnings": warnings,
            "recommendations": recommendations,
        }
