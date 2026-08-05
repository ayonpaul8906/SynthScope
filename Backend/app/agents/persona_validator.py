from typing import Any, Dict, List


class PersonaValidator:
    """
    Deterministic rule-based validator for generated user persona payloads.
    Ensures complete field presence, correct data types, valid ranges,
    nested structure integrity, and basic logical consistency without LLM dependency.
    """

    REQUIRED_STR_FIELDS = [
        "name",
        "gender",
        "city",
        "country",
        "occupation",
        "education",
        "annual_income",
        "marital_status",
        "persona_summary",
        "lifestyle",
        "technology_usage",
        "digital_literacy",
        "fitness_level",
        "budget",
        "purchase_channel",
        "purchase_frequency",
        "brand_loyalty",
        "operating_system",
        "ecosystem",
        "quote",
    ]

    REQUIRED_LIST_FIELDS = [
        "hobbies",
        "daily_routine",
        "goals",
        "motivations",
        "pain_points",
        "frustrations",
        "preferred_features",
        "devices",
        "favourite_apps",
    ]

    REQUIRED_NESTED_DICTS = {
        "personality": ["traits", "communication_style", "decision_making", "description"],
        "buying_behaviour": [
            "price_sensitivity",
            "decision_factor",
            "purchase_trigger",
            "description",
        ],
    }

    def validate_persona(self, persona: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates a single persona dictionary against structural, range, and type constraints.
        Returns a dict: {"valid": bool, "errors": List[str]}
        """
        errors: List[str] = []

        if not isinstance(persona, dict):
            return {"valid": False, "errors": ["Persona must be a JSON object (dict)."]}

        # Age Validation
        age = persona.get("age")
        if age is None:
            errors.append("Field 'age' is missing.")
        elif not isinstance(age, int):
            try:
                int_age = int(age)
                if not (18 <= int_age <= 100):
                    errors.append(f"Field 'age' must be between 18 and 100, got {int_age}.")
            except (TypeError, ValueError):
                errors.append(f"Field 'age' must be an integer, got {type(age).__name__}.")
        elif not (18 <= age <= 100):
            errors.append(f"Field 'age' must be between 18 and 100, got {age}.")

        # Required String Fields Validation
        for field in self.REQUIRED_STR_FIELDS:
            val = persona.get(field)
            if val is None:
                errors.append(f"Field '{field}' is missing.")
            elif not isinstance(val, str):
                errors.append(f"Field '{field}' must be a string, got {type(val).__name__}.")
            elif not str(val).strip():
                errors.append(f"Field '{field}' cannot be empty.")

        # Required List Fields Validation
        for field in self.REQUIRED_LIST_FIELDS:
            val = persona.get(field)
            if val is None:
                errors.append(f"Field '{field}' is missing.")
            elif not isinstance(val, list):
                errors.append(f"Field '{field}' must be a list, got {type(val).__name__}.")
            elif len(val) == 0:
                errors.append(f"List field '{field}' cannot be empty.")
            else:
                for idx, item in enumerate(val):
                    if not isinstance(item, str) or not str(item).strip():
                        errors.append(
                            f"Item at index {idx} in field '{field}' must be a non-empty string."
                        )

        # Required Nested Dicts Validation
        for dict_name, required_keys in self.REQUIRED_NESTED_DICTS.items():
            dict_val = persona.get(dict_name)
            if dict_val is None:
                errors.append(f"Nested object '{dict_name}' is missing.")
            elif not isinstance(dict_val, dict):
                errors.append(
                    f"Nested object '{dict_name}' must be a dict, got {type(dict_val).__name__}."
                )
            else:
                for req_key in required_keys:
                    sub_val = dict_val.get(req_key)
                    if sub_val is None:
                        errors.append(
                            f"Missing sub-field '{req_key}' inside nested object '{dict_name}'."
                        )
                    elif req_key == "traits" and not isinstance(sub_val, list):
                        errors.append(
                            f"Sub-field 'traits' in '{dict_name}' must be a list."
                        )

        # Internal Consistency Check
        name = str(persona.get("name", "")).strip().lower()
        if name in ["string", "unknown", "none", "null"]:
            errors.append(f"Field 'name' contains generic placeholder value '{persona.get('name')}'.")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
        }

    def validate_personas(self, personas: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validates a list of personas. Returns aggregate validity and detailed error mapping.
        """
        if not isinstance(personas, list):
            return {"valid": False, "errors": ["Input must be a list of persona objects."]}

        all_errors: List[str] = []

        for idx, persona in enumerate(personas):
            res = self.validate_persona(persona)
            if not res["valid"]:
                for err in res["errors"]:
                    all_errors.append(f"Persona [{idx}]: {err}")

        return {
            "valid": len(all_errors) == 0,
            "errors": all_errors,
        }
