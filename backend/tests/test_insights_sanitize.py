from app.services.insights import InsightContent, InsightRecommendation, _sanitize, _strip_em_dashes


def test_strip_em_dashes_removes_the_character():
    assert "—" not in _strip_em_dashes("this has an em dash—right there")


def test_strip_em_dashes_reads_naturally_as_a_comma_break():
    assert _strip_em_dashes("some text—more text") == "some text, more text"


def test_strip_em_dashes_leaves_normal_text_untouched():
    assert _strip_em_dashes("nothing unusual here.") == "nothing unusual here."


def test_sanitize_cleans_every_field_of_an_insight():
    dirty = InsightContent(
        explanation="exposed—badly",
        recommendations=[
            InsightRecommendation(title="Do X—now", detail="details—here", impact="big—impact")
        ],
    )
    clean = _sanitize(dirty)
    combined = clean.explanation + clean.recommendations[0].title + clean.recommendations[0].detail + clean.recommendations[0].impact
    assert "—" not in combined
