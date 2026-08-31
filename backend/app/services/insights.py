"""Turns a scan's breach + risk data into a plain-language explanation and
specific recommendations, via the Claude API (Anthropic). Mirrors
breach_lookup.py's pattern: a NotConfigured exception when no key is set, a
Failed exception for runtime errors, both translated to clean HTTP
responses by the router.

Generation is deliberately not automatic — it only runs the first time a
scan's insight is requested, then the result is cached in the `insights`
table. A Claude call on every dashboard view would be a latency and cost
problem, not a feature.
"""

import re

import anthropic
from pydantic import BaseModel

from .hibp_catalog import get_all_breaches

# Haiku, not Sonnet or Opus: this is a short, structured text-generation
# task with no need for deep reasoning, so the fastest/cheapest model in
# the family is the right fit.
DEFAULT_MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS = 1024


class InsightRecommendation(BaseModel):
    title: str
    detail: str
    impact: str


class InsightContent(BaseModel):
    explanation: str
    recommendations: list[InsightRecommendation]


class InsightNotConfigured(Exception):
    """Raised when ANTHROPIC_API_KEY is not set."""


class InsightGenerationFailed(Exception):
    """Raised when the Claude API call itself fails (network, quota, bad
    response, model unavailable, ...)."""


_SYSTEM_PROMPT = (
    "You are a security analyst explaining a data breach exposure report to "
    "someone with no security background. Be direct and specific, not "
    "alarmist. Reference the actual breaches and exposed fields you were "
    "given by name. When a breach includes a 'How it happened' note, use it "
    "to explain why and how that specific incident occurred, not just what "
    "was exposed, since that's the point of giving it to you. Recommendations "
    "must be concrete actions the reader can personally take, ordered by "
    "impact, most important first. Never use an em dash (—); write plain "
    "sentences or use a comma instead."
)

_HTML_TAG_RE = re.compile(r"<[^>]+>")
_DESCRIPTION_MAX_LEN = 220


def _catalog_descriptions() -> dict[str, str]:
    """breach name/title (lowercased) -> a short, plain-text account of how
    that breach happened, pulled from HIBP's public breach catalog. Not
    every breach in a scan has an entry here (HIBP's curated catalog is far
    smaller than DeHashed's raw corpus) — that's fine, the prompt just
    works with whatever it's given. A catalog fetch failure must never
    block insight generation, so this degrades to an empty lookup instead
    of raising."""
    lookup: dict[str, str] = {}
    try:
        for b in get_all_breaches():
            if not b.description:
                continue
            clean = _HTML_TAG_RE.sub("", b.description).strip()
            if len(clean) > _DESCRIPTION_MAX_LEN:
                clean = clean[:_DESCRIPTION_MAX_LEN].rsplit(" ", 1)[0] + "..."
            lookup[b.name.lower()] = clean
            lookup[b.title.lower()] = clean
    except Exception:
        return {}
    return lookup

# Belt-and-braces on top of the system prompt above: a model instruction is
# not a guarantee, and this text is shown to users verbatim on the
# dashboard and in the PDF report, where an em dash is a hard style
# violation for this product.
_EM_DASH_RE = re.compile(r"\s*—\s*")


def _strip_em_dashes(text: str) -> str:
    return _EM_DASH_RE.sub(", ", text).strip()


def _sanitize(content: InsightContent) -> InsightContent:
    return InsightContent(
        explanation=_strip_em_dashes(content.explanation),
        recommendations=[
            InsightRecommendation(
                title=_strip_em_dashes(r.title),
                detail=_strip_em_dashes(r.detail),
                impact=_strip_em_dashes(r.impact),
            )
            for r in content.recommendations
        ],
    )


def _build_prompt(email: str, breaches: list[dict], risk_total: int, classification: str) -> str:
    descriptions = _catalog_descriptions()

    lines = []
    for b in breaches:
        line = (
            f"- {b['breach_name']} ({b.get('breach_date') or 'date unknown'}), source: {b['source']}, "
            f"exposed: {', '.join(b['exposed_fields'])}, severity: {b['severity']}"
        )
        how = descriptions.get(b["breach_name"].strip().lower())
        if how:
            line += f"\n  How it happened: {how}"
        lines.append(line)
    breach_lines = "\n".join(lines) if lines else "(no breaches found)"

    return (
        f"Email: {email}\n"
        f"Risk score: {risk_total}/100 ({classification})\n"
        f"Breaches found:\n{breach_lines}\n\n"
        "Write a short explanation (2-4 sentences) of what this exposure "
        "means in practice, then 2-4 specific recommendations."
    )


class ClaudeInsightGenerator:
    def __init__(self, api_key: str, model: str = DEFAULT_MODEL):
        self._client = anthropic.Anthropic(api_key=api_key)
        self._model = model

    def generate(self, email: str, breaches: list[dict], risk_total: int, classification: str) -> InsightContent:
        try:
            message = self._client.messages.parse(
                model=self._model,
                max_tokens=MAX_TOKENS,
                system=_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": _build_prompt(email, breaches, risk_total, classification)}],
                output_format=InsightContent,
            )
        except Exception as exc:  # Anthropic's SDK raises several distinct
            # error types (auth, rate limit, connection, ...) — all of them
            # mean the same thing to the caller: generation failed this time.
            raise InsightGenerationFailed(str(exc)) from exc

        parsed = message.parsed_output
        if parsed is None:
            raise InsightGenerationFailed("Model response did not match the expected schema.")
        return _sanitize(parsed)


def get_insight_generator(api_key: str | None) -> ClaudeInsightGenerator:
    if not api_key:
        raise InsightNotConfigured("Set ANTHROPIC_API_KEY to enable AI insights.")
    return ClaudeInsightGenerator(api_key)
