import os
import json
import re
from typing import Dict, Any, Tuple, List

import streamlit as st
from dotenv import load_dotenv

try:
    from openai import OpenAI
except Exception:
    OpenAI = None


# ----------------------------
# Load environment variables
# ----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

# Prevent empty OPENAI_BASE_URL from breaking requests
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "").strip()
if not OPENAI_BASE_URL:
    os.environ.pop("OPENAI_BASE_URL", None)

PRIMARY_PROVIDER = os.getenv("PRIMARY_PROVIDER", "openai").strip().lower()
FALLBACK_TO_LOCAL = os.getenv("FALLBACK_TO_LOCAL", "true").strip().lower() == "true"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.4-mini").strip()

OLLAMA_ENABLED = os.getenv("OLLAMA_ENABLED", "true").strip().lower() == "true"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3").strip()
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1/").strip()
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "ollama").strip()
LANDING_PAGE_URL = os.getenv("LANDING_PAGE_URL", "http://localhost:3000").strip()


# ----------------------------
# Demo cases
# ----------------------------
DEMO_CASES = {
    "Coffee Shop Launch": {
        "topic": "Launch campaign for a new strawberry matcha latte at a local coffee shop",
        "audience": "Young professionals and college students in New York who like trendy drinks and cafe experiences",
        "goal": "Increase foot traffic, boost engagement, and drive limited-time purchases",
        "tone": "Trendy, upbeat, visually appealing, and persuasive",
        "script": """We just launched our new strawberry matcha latte, and it might be our prettiest drink yet. It has a fresh strawberry layer at the bottom, smooth matcha on top, and a flavor that is both refreshing and creamy. If you are looking for a new cafe drink to try this week, this one is only here for a limited time. Come by with a friend, take a picture, and tell us if this should stay on the menu permanently.""",
        "comments": """Where is this shop located?
How long is this drink available?
Is it too sweet?
Do you have oat milk?
What is the price?
This looks so good
I want to try this after class"""
    },
    "Beauty Creator Launch": {
        "topic": "New lip tint launch review",
        "audience": "Gen Z beauty lovers in the US",
        "goal": "Increase watch-through and comments",
        "tone": "Friendly, trendy, fast-paced",
        "script": """I tried this new lip tint that everyone keeps talking about.
The color looks super natural at first, but after a few hours I noticed something surprising.
If you're thinking about buying it, here are three things you should know before you do.""",
        "comments": """Does it last after eating?
What shade are you wearing?
I need this for summer makeup"""
    },
    "Campus Study Tips": {
        "topic": "Study tips for finals week",
        "audience": "College students",
        "goal": "Boost saves and shares",
        "tone": "Helpful, motivating, practical",
        "script": """If you're behind before finals, don't start by making a perfect study plan.
Start with one 25-minute session on your hardest class.
Here are the three steps I use when I only have two days left before an exam.""",
        "comments": """This is literally me right now
Can you do one for biostat?
Pomodoro never works for me"""
    },
    "Small Business Promo": {
        "topic": "Promoting a local cake shop",
        "audience": "Young adults in New York",
        "goal": "Drive store visits and engagement",
        "tone": "Warm, appetizing, local",
        "script": """I found a cake shop in New York that honestly deserves more attention.
The texture was soft, not too sweet, and the design looked even better in person.
If you're looking for a birthday cake spot, this one might be worth saving.""",
        "comments": """Where is this?
How much was it?
Do they do custom cakes?"""
    }
}


# ----------------------------
# System prompt
# ----------------------------
SYSTEM_PROMPT = """
You are an AI product assistant for a short-video creator copilot.
Your job is to analyze a draft video concept before publishing.

Return ONLY valid JSON with this exact top-level structure:
{
  "hooks": [
    {"text": "...", "why_it_works": "...", "score": 1}
  ],
  "captions": [
    {"text": "...", "why_it_works": "..."}
  ],
  "cta_suggestions": [
    "..."
  ],
  "risk_flags": [
    {"level": "Low/Medium/High", "issue": "...", "explanation": "...", "fix": "..."}
  ],
  "comment_reply_suggestions": [
    {"comment": "...", "reply": "..."}
  ],
  "overall_summary": "...",
  "recommended_next_step": "..."
}

Rules:
- Give exactly 3 hooks.
- Give exactly 2 captions.
- Give exactly 3 CTA suggestions.
- Give 1 to 3 risk flags.
- Give exactly 3 comment reply suggestions.
- Hook scores should be integers from 1 to 10.
- Keep outputs concise, product-ready, and creator-friendly.
- Prefer actionable wording.
"""


# ----------------------------
# Client setup
# ----------------------------
def get_openai_client():
    if OpenAI is None or not OPENAI_API_KEY:
        return None
    return OpenAI(api_key=OPENAI_API_KEY)


def get_ollama_client():
    if OpenAI is None or not OLLAMA_ENABLED:
        return None
    return OpenAI(
        api_key=OLLAMA_API_KEY,
        base_url=OLLAMA_BASE_URL
    )


# ----------------------------
# Utilities
# ----------------------------
def extract_json(text: str) -> Dict[str, Any]:
    text = text.strip()

    try:
        return json.loads(text)
    except Exception:
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))

    raise ValueError("Could not parse JSON from model output.")


def build_user_prompt(
    topic: str,
    audience: str,
    goal: str,
    tone: str,
    script: str,
    comments: str
) -> str:
    return f"""
Analyze this short-video draft for pre-publish optimization.

Topic:
{topic}

Target audience:
{audience}

Primary goal:
{goal}

Desired tone:
{tone}

Draft script:
{script}

Sample audience comments:
{comments}

Please return the JSON only.
"""


def call_llm(client, model_name: str, user_prompt: str) -> Dict[str, Any]:
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7
    )
    content = response.choices[0].message.content
    return extract_json(content)


def mock_response(topic: str, audience: str, goal: str, tone: str, script: str, comments: str) -> Dict[str, Any]:
    return {
        "hooks": [
            {
                "text": f"Before you post about {topic}, here’s the one line that could make people stop scrolling.",
                "why_it_works": "Creates curiosity and frames immediate value.",
                "score": 8
            },
            {
                "text": f"I almost posted this for {audience} — then I realized it needed a stronger first 3 seconds.",
                "why_it_works": "Feels authentic and highlights optimization.",
                "score": 7
            },
            {
                "text": f"If your goal is to {goal.lower()}, this opening may work better than your current one.",
                "why_it_works": "Connects directly to creator intent and outcome.",
                "score": 9
            }
        ],
        "captions": [
            {
                "text": f"Testing a better way to talk about {topic.lower()} 👀 Would you watch this version?",
                "why_it_works": "Invites interaction and sounds native to short-form platforms."
            },
            {
                "text": f"For {audience.lower()}: a sharper, more scroll-stopping version of this idea.",
                "why_it_works": "Directly targets the audience and frames value quickly."
            }
        ],
        "cta_suggestions": [
            "Ask viewers which version they would click first.",
            "Invite viewers to comment with their experience or preference.",
            "Prompt viewers to save the video for later reference."
        ],
        "risk_flags": [
            {
                "level": "Medium",
                "issue": "Hook may be too general",
                "explanation": "The opening does not yet create a strong curiosity gap.",
                "fix": "Use a clearer contrast, surprise, or outcome in the first sentence."
            },
            {
                "level": "Low",
                "issue": "CTA could be stronger",
                "explanation": "The current draft suggests value but does not explicitly ask for engagement.",
                "fix": "Add one direct question at the end to encourage comments."
            }
        ],
        "comment_reply_suggestions": [
            {
                "comment": "Does this actually work?",
                "reply": "I tested a few versions, and this one feels much stronger in the opening. I can share another version too."
            },
            {
                "comment": "Can you make one for students?",
                "reply": "Yes — I’d tailor the hook and CTA more directly to student pain points and timing."
            },
            {
                "comment": "What would you change first?",
                "reply": "I’d improve the first 3 seconds first, because that usually has the biggest impact on whether people keep watching."
            }
        ],
        "overall_summary": f"This draft has a solid idea, but it would benefit from a stronger opening, a clearer engagement prompt, and more audience-specific phrasing for {audience}.",
        "recommended_next_step": "Test 2 to 3 opening variants and compare which one feels most specific, curiosity-driven, and natural."
    }


def analyze_content(
    topic: str,
    audience: str,
    goal: str,
    tone: str,
    script: str,
    comments: str,
    use_mock: bool
) -> Tuple[Dict[str, Any], str]:
    if use_mock:
        return mock_response(topic, audience, goal, tone, script, comments), "mock"

    user_prompt = build_user_prompt(topic, audience, goal, tone, script, comments)

    providers = []
    if PRIMARY_PROVIDER == "openai":
        providers.append(("openai", get_openai_client(), OPENAI_MODEL))
        if FALLBACK_TO_LOCAL:
            providers.append(("ollama", get_ollama_client(), OLLAMA_MODEL))
    else:
        providers.append(("ollama", get_ollama_client(), OLLAMA_MODEL))
        if FALLBACK_TO_LOCAL:
            providers.append(("openai", get_openai_client(), OPENAI_MODEL))

    last_error = None

    for provider_name, client, model_name in providers:
        if client is None:
            continue
        try:
            result = call_llm(client, model_name, user_prompt)
            return result, provider_name
        except Exception as e:
            last_error = f"{provider_name}: {e}"

    return mock_response(topic, audience, goal, tone, script, comments), f"mock_fallback ({last_error})"


# ----------------------------
# UI helpers
# ----------------------------
def get_hook_scores(hooks: List[Dict[str, Any]]) -> List[int]:
    scores = []
    for hook in hooks:
        try:
            scores.append(int(hook.get("score", 0)))
        except Exception:
            continue
    return scores


def get_risk_penalty(risk_flags: List[Dict[str, Any]]) -> int:
    penalty_map = {"High": 15, "Medium": 8, "Low": 3}
    return sum(penalty_map.get(str(r.get("level", "Low")).title(), 3) for r in risk_flags)


def compute_overall_score(result: Dict[str, Any]) -> int:
    hooks = result.get("hooks", [])
    risk_flags = result.get("risk_flags", [])
    scores = get_hook_scores(hooks)
    hook_avg = sum(scores) / len(scores) if scores else 7.0
    base = 55 + hook_avg * 4
    score = base - min(get_risk_penalty(risk_flags), 18)
    return max(0, min(100, round(score)))


def compute_hook_strength(result: Dict[str, Any]) -> int:
    scores = get_hook_scores(result.get("hooks", []))
    if not scores:
        return 0
    return round(sum(scores) / len(scores) * 10)


def get_risk_label(result: Dict[str, Any]) -> str:
    levels = [str(r.get("level", "Low")).title() for r in result.get("risk_flags", [])]
    if "High" in levels:
        return "High"
    if "Medium" in levels:
        return "Medium"
    if "Low" in levels:
        return "Low"
    return "Low"


def get_business_insight(result: Dict[str, Any], goal: str) -> str:
    risk_label = get_risk_label(result)
    summary = result.get("overall_summary", "")
    next_step = result.get("recommended_next_step", "")

    if risk_label == "High":
        prefix = "This content has strong potential, but the current draft still has blockers that may reduce conversion."
    elif risk_label == "Medium":
        prefix = "This content is commercially promising, but a few execution gaps may limit performance."
    else:
        prefix = "This content is well-positioned for launch and should support business goals with minor refinements."

    return f"{prefix} For the stated goal of {goal.lower()}, the most important action before publishing is to tighten the first-frame value proposition and remove friction that could prevent viewers from taking action. {summary} Next priority: {next_step}"


def metric_card(
    title: str,
    value: str,
    subtitle: str = "",
    value_font_size: str = "1.9rem",
):
    st.markdown(
        f"""
        <div style="
            background: linear-gradient(135deg, #ffffff 0%, #f7f8fc 100%);
            border: 1px solid #e8ebf3;
            border-radius: 18px;
            padding: 18px 18px 14px 18px;
            box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
            min-height: 118px;
        ">
            <div style="font-size: 0.9rem; color: #5b6475; margin-bottom: 8px;">{title}</div>
            <div style="font-size: {value_font_size}; font-weight: 700; color: #111827; line-height: 1.1;">{value}</div>
            <div style="font-size: 0.85rem; color: #6b7280; margin-top: 8px;">{subtitle}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def pill(text: str, bg: str = "#eef2ff", fg: str = "#3730a3"):
    st.markdown(
        f"""
        <span style="
            display:inline-block;
            padding:6px 10px;
            border-radius:999px;
            background:{bg};
            color:{fg};
            font-size:0.82rem;
            font-weight:600;
            margin-right:8px;
            margin-bottom:8px;
        ">{text}</span>
        """,
        unsafe_allow_html=True,
    )


def render_results(result: Dict[str, Any], provider_used: str, topic: str, goal: str):
    overall_score = compute_overall_score(result)
    hook_strength = compute_hook_strength(result)
    risk_label = get_risk_label(result)
    business_insight = get_business_insight(result, goal)

    st.markdown("### Executive View")
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        metric_card("Overall Content Score", f"{overall_score}/100", "Quick read on launch readiness")
    with c2:
        metric_card("Hook Strength", f"{hook_strength}/100", "Based on average hook score")
    with c3:
        metric_card(
            "Risk Level",
            risk_label,
            "Higher risk means more conversion friction",
            value_font_size="1.55rem",
        )
    with c4:
        metric_card("Provider", provider_used, "Current generation source")

    st.markdown("")

    st.markdown(
        f"""
        <div style="
            background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
            color: white;
            border-radius: 22px;
            padding: 22px 24px;
            margin-bottom: 18px;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
        ">
            <div style="font-size: 0.95rem; opacity: 0.85; margin-bottom: 8px;">Business Insight</div>
            <div style="font-size: 1.15rem; font-weight: 700; margin-bottom: 10px;">How this draft supports business outcomes</div>
            <div style="font-size: 0.98rem; line-height: 1.65;">{business_insight}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    tab1, tab2, tab3 = st.tabs(["Summary", "Creative Assets", "Risks & Replies"])

    with tab1:
        st.markdown("#### Overall Summary")
        st.write(result.get("overall_summary", ""))

        st.markdown("#### Recommended Next Step")
        st.info(result.get("recommended_next_step", ""))

        st.markdown("#### Priority Signals")
        pill(f"Topic: {topic}", "#eef2ff", "#3730a3")
        pill(f"Goal: {goal}", "#ecfeff", "#155e75")
        pill(f"Risk: {risk_label}", "#fff7ed", "#9a3412")
        pill(f"Provider: {provider_used}", "#f5f3ff", "#6d28d9")

        st.markdown("#### CTA Suggestions")
        for item in result.get("cta_suggestions", []):
            st.markdown(
                f"""
                <div style="
                    border:1px solid #e5e7eb;
                    background:#ffffff;
                    border-radius:14px;
                    padding:12px 14px;
                    margin-bottom:10px;
                    color:#111827;
                    font-size:0.98rem;
                    font-weight:700;
                    line-height:1.6;
                ">• {item}</div>
                """,
                unsafe_allow_html=True,
            )

    with tab2:
        st.markdown("#### Hook Recommendations")
        for i, hook in enumerate(result.get("hooks", []), start=1):
            score = hook.get("score", "")
            st.markdown(
                f"""
                <div style="
                    border:1px solid #e5e7eb;
                    background:#ffffff;
                    border-radius:16px;
                    padding:16px;
                    margin-bottom:12px;
                ">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
                        <div style="font-weight:700;color:#111827;">Hook {i}</div>
                        <div style="
                            background:#eef2ff;
                            color:#3730a3;
                            border-radius:999px;
                            padding:4px 10px;
                            font-size:0.82rem;
                            font-weight:700;
                        ">Score: {score}/10</div>
                    </div>
                    <div style="font-size:1.02rem;color:#111827;margin-top:10px;margin-bottom:8px;">{hook.get("text", "")}</div>
                    <div style="color:#6b7280;font-size:0.92rem;">{hook.get("why_it_works", "")}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        st.markdown("#### Caption Options")
        for i, cap in enumerate(result.get("captions", []), start=1):
            st.markdown(
                f"""
                <div style="
                    border:1px solid #e5e7eb;
                    background:#ffffff;
                    border-radius:16px;
                    padding:16px;
                    margin-bottom:12px;
                ">
                    <div style="font-weight:700;color:#111827;margin-bottom:8px;">Caption {i}</div>
                    <div style="font-size:1.0rem;color:#111827;margin-bottom:8px;">{cap.get("text", "")}</div>
                    <div style="color:#6b7280;font-size:0.92rem;">{cap.get("why_it_works", "")}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    with tab3:
        left, right = st.columns([1, 1])

        with left:
            st.markdown("#### Risk Flags")
            for risk in result.get("risk_flags", []):
                level = str(risk.get("level", "Medium")).title()
                color_map = {
                    "High": ("#fef2f2", "#991b1b"),
                    "Medium": ("#fff7ed", "#9a3412"),
                    "Low": ("#eff6ff", "#1d4ed8"),
                }
                bg, fg = color_map.get(level, ("#fff7ed", "#9a3412"))
                st.markdown(
                    f"""
                    <div style="
                        border:1px solid #e5e7eb;
                        background:#ffffff;
                        border-radius:16px;
                        padding:16px;
                        margin-bottom:12px;
                    ">
                        <div style="margin-bottom:10px;">
                            <span style="
                                background:{bg};
                                color:{fg};
                                border-radius:999px;
                                padding:4px 10px;
                                font-size:0.82rem;
                                font-weight:700;
                            ">{level} Risk</span>
                        </div>
                        <div style="font-weight:700;color:#111827;margin-bottom:8px;">{risk.get("issue", "")}</div>
                        <div style="color:#4b5563;font-size:0.93rem;margin-bottom:8px;"><strong>Explanation:</strong> {risk.get("explanation", "")}</div>
                        <div style="color:#4b5563;font-size:0.93rem;"><strong>Suggested fix:</strong> {risk.get("fix", "")}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

        with right:
            st.markdown("#### Comment Reply Suggestions")
            for item in result.get("comment_reply_suggestions", []):
                st.markdown(
                    f"""
                    <div style="
                        border:1px solid #e5e7eb;
                        background:#ffffff;
                        border-radius:16px;
                        padding:16px;
                        margin-bottom:12px;
                    ">
                        <div style="font-weight:700;color:#111827;margin-bottom:8px;">Comment</div>
                        <div style="color:#111827;margin-bottom:12px;">{item.get("comment", "")}</div>
                        <div style="font-weight:700;color:#111827;margin-bottom:8px;">Suggested reply</div>
                        <div style="color:#4b5563;">{item.get("reply", "")}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )


# ----------------------------
# Streamlit config
# ----------------------------
st.set_page_config(page_title="Creator Copilot", layout="wide")

st.markdown(
    """
    <style>
        .block-container {
            padding-top: 1.8rem;
            padding-bottom: 2rem;
            max-width: 1280px;
        }
        .stTabs [data-baseweb="tab-list"] {
            gap: 8px;
        }
        .stTabs [data-baseweb="tab"] {
            border-radius: 999px;
            padding-left: 14px;
            padding-right: 14px;
            height: 42px;
        }
        div[data-testid="stTextInput"] input,
        div[data-testid="stTextArea"] textarea {
            border-radius: 12px;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    f"""
    <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:16px;
        background:#ffffff;
        border:1px solid #e5e7eb;
        border-radius:18px;
        padding:14px 18px;
        margin-bottom:18px;
        box-shadow:0 8px 24px rgba(15, 23, 42, 0.06);
    ">
        <div>
            <div style="font-size:0.88rem;color:#64748b;margin-bottom:4px;">Navigation</div>
            <div style="font-size:1rem;font-weight:700;color:#111827;">
                Return to the landing page whenever you want to switch back to the web preview.
            </div>
        </div>
        <a href="{LANDING_PAGE_URL}" target="_self" style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            white-space:nowrap;
            padding:11px 16px;
            border-radius:12px;
            background:#111827;
            color:#ffffff;
            text-decoration:none;
            font-weight:700;
            font-size:0.92rem;
        ">Back to Landing Page</a>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div style="
        background: linear-gradient(135deg, #111827 0%, #312e81 55%, #7c3aed 100%);
        color: white;
        border-radius: 26px;
        padding: 28px 30px;
        margin-bottom: 22px;
        box-shadow: 0 18px 40px rgba(79, 70, 229, 0.18);
    ">
        <div style="font-size: 0.95rem; opacity: 0.9; margin-bottom: 8px;">AI Product Demo</div>
        <div style="font-size: 2rem; font-weight: 800; margin-bottom: 10px;">Creator Copilot</div>
        <div style="font-size: 1.02rem; max-width: 900px; line-height: 1.7; opacity: 0.95;">
            An AI assistant that helps short-video creators and small businesses optimize content before publishing by improving hooks, captions, engagement prompts, and launch-readiness signals.
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

with st.sidebar:
    st.header("Settings")
    selected_case = st.selectbox("Load a demo case", ["Custom"] + list(DEMO_CASES.keys()))
    default_use_mock = not (bool(OPENAI_API_KEY) or OLLAMA_ENABLED)
    use_mock = st.checkbox("Use mock mode", value=default_use_mock)
    st.caption("Mock mode is useful for UI testing and backup demos.")

    st.markdown("---")
    st.markdown("**Provider routing**")
    st.write(f"Primary: `{PRIMARY_PROVIDER}`")
    st.write(f"Fallback enabled: `{FALLBACK_TO_LOCAL}`")

if selected_case != "Custom":
    defaults = DEMO_CASES[selected_case]
else:
    defaults = {
        "topic": "",
        "audience": "",
        "goal": "",
        "tone": "",
        "script": "",
        "comments": ""
    }

input_col, output_col = st.columns([1.05, 1.35], gap="large")

with input_col:
    st.markdown("### Input")
    st.caption("Define the campaign, audience, and creative draft you want the AI to improve.")

    topic = st.text_input("Video topic", value=defaults["topic"])
    audience = st.text_input("Target audience", value=defaults["audience"])
    goal = st.text_input("Primary goal", value=defaults["goal"])
    tone = st.text_input("Desired tone", value=defaults["tone"])
    script = st.text_area("Draft script", value=defaults["script"], height=250)
    comments = st.text_area("Sample comments", value=defaults["comments"], height=180)

    run = st.button("Generate AI Suggestions", use_container_width=True)

    with st.expander("What this product is doing"):
        st.write(
            "This AI copilot reviews a short-form content draft before publishing. "
            "It proposes stronger hooks and captions, surfaces conversion risks, and suggests replies and calls-to-action that better support business outcomes."
        )

with output_col:
    st.markdown("### Output")

    if run:
        if not topic or not audience or not goal or not tone or not script:
            st.warning("Please fill in the key fields before generating suggestions.")
        else:
            with st.spinner("Analyzing content..."):
                try:
                    result, provider_used = analyze_content(topic, audience, goal, tone, script, comments, use_mock)
                    render_results(result, provider_used, topic, goal)
                except Exception as e:
                    st.error(f"Something went wrong: {e}")
    else:
        st.markdown(
            """
            <div style="
                border: 1px dashed #cbd5e1;
                background: #f8fafc;
                border-radius: 18px;
                padding: 28px;
                color: #475569;
                line-height: 1.7;
            ">
                Fill in the campaign details and click <strong>Generate AI Suggestions</strong> to see a product-style output view with executive summary, creative recommendations, risk signals, and business-focused launch guidance.
            </div>
            """,
            unsafe_allow_html=True,
        )
