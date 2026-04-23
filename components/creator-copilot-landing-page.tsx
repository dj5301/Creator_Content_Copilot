"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  Mail,
  MessageCircleMore,
  MessageSquareReply,
  MessageSquareText,
  Phone,
  Play,
  SendHorizontal,
  ShieldAlert,
  Sparkles,
  Store,
  Wand2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Provider = "openai" | "ollama" | "mock";
type DemoCaseKey = "coffee" | "beauty" | "bakery";
type ActiveTab = "summary" | "creative" | "risk";

type DemoOutput = {
  provider: Provider;
  overallScore: number;
  hookStrength: number;
  riskLevel: "Low" | "Medium" | "High";
  overallSummary: string;
  topHook: string;
  caption: string;
  riskFlag: string;
  nextStep: string;
  replies: string[];
};

type DemoCase = {
  label: string;
  topic: string;
  audience: string;
  goal: string;
  tone: string;
  script: string;
  comments: string;
  output: DemoOutput;
};

const features = [
  {
    icon: Sparkles,
    title: "Stronger hooks and captions",
    description:
      "Generate sharper openings and clearer captions designed to improve attention, retention, and engagement.",
  },
  {
    icon: ShieldAlert,
    title: "Launch-readiness risk detection",
    description:
      "Identify missing details, unclear offers, and friction points that may reduce clicks, visits, or conversions.",
  },
  {
    icon: MessageSquareText,
    title: "Business-focused engagement guidance",
    description:
      "Get CTA ideas, reply suggestions, and practical next steps aligned with audience response and campaign goals.",
  },
] as const;

const useCases = [
  {
    icon: Clapperboard,
    title: "Creators",
    description: "Improve hooks, captions, and comment strategy before posting.",
  },
  {
    icon: Building2,
    title: "Small businesses",
    description:
      "Turn product launches and promotions into stronger short-form campaigns.",
  },
  {
    icon: Store,
    title: "Local brands",
    description:
      "Highlight offers, reduce conversion friction, and drive store visits more effectively.",
  },
] as const;

const steps = [
  "Add your topic, audience, and draft script",
  "Generate AI suggestions for hooks, captions, risks, and replies",
  "Refine your content before publishing",
] as const;

const demoCases: Record<DemoCaseKey, DemoCase> = {
  coffee: {
    label: "Coffee Shop Launch",
    topic:
      "Launch campaign for a new strawberry matcha latte at a local coffee shop",
    audience:
      "Young professionals and college students in New York who like trendy drinks and cafe experiences",
    goal:
      "Increase foot traffic, boost engagement, and drive limited-time purchases",
    tone: "Trendy, upbeat, visually appealing, and persuasive",
    script:
      "We just launched our new strawberry matcha latte, and it might be our prettiest drink yet. It has a fresh strawberry layer at the bottom, smooth matcha on top, and a flavor that is both refreshing and creamy. If you are looking for a new cafe drink to try this week, this one is only here for a limited time. Come by with a friend, take a picture, and tell us if this should stay on the menu permanently.",
    comments: `Where is this shop located?
How long is this drink available?
Is it too sweet?
Do you have oat milk?
What is the price?`,
    output: {
      provider: "openai",
      overallScore: 84,
      hookStrength: 87,
      riskLevel: "Medium",
      overallSummary:
        "Strong visual concept with clear trend appeal and good urgency, but it needs more conversion details to turn views into visits.",
      topHook: "This might be our prettiest drink yet...",
      caption:
        "Fresh strawberry layer, smooth matcha top, and major cafe vibes. Tag your coffee date and stop by this week.",
      riskFlag: "Missing location and pricing details in the video.",
      nextStep:
        "Add on-screen text or a pinned comment with address, hours, price, and launch window.",
      replies: [
        "We're in NYC. Check our pinned comment for the full address and hours.",
        "It's a limited-time launch, so grab it soon while it's still on the menu.",
      ],
    },
  },
  beauty: {
    label: "Beauty Creator Launch",
    topic: "New lip tint launch review",
    audience: "Gen Z beauty lovers in the US",
    goal: "Increase watch-through and comments",
    tone: "Friendly, trendy, fast-paced",
    script:
      "I tried this new lip tint that everyone keeps talking about. The color looks super natural at first, but after a few hours I noticed something surprising. If you're thinking about buying it, here are three things you should know before you do.",
    comments: `Does it last after eating?
What shade are you wearing?
I need this for summer makeup`,
    output: {
      provider: "openai",
      overallScore: 81,
      hookStrength: 85,
      riskLevel: "Medium",
      overallSummary:
        "The concept is relevant and creator-friendly, but the opening can be more curiosity-driven and the call-to-action can be stronger.",
      topHook:
        "I thought this lip tint was overhyped until I saw what happened after a few hours.",
      caption:
        "Tried the lip tint everyone keeps talking about and the wear test surprised me.",
      riskFlag:
        "The draft hints at value, but it does not yet create a strong enough first-three-second hook.",
      nextStep:
        "Lead with the most surprising result first, then invite viewers to comment with their favorite shade.",
      replies: [
        "It held up better than I expected. I can share a full wear update too.",
        "I'm wearing the rosy neutral shade. I can compare a few others next.",
      ],
    },
  },
  bakery: {
    label: "Local Bakery Promo",
    topic: "Promoting a weekend discount campaign for a neighborhood bakery",
    audience:
      "Families, young adults, and nearby office workers looking for desserts and weekend treats",
    goal: "Increase weekend store visits and encourage repeat purchases",
    tone: "Warm, inviting, community-focused, and appetizing",
    script:
      "This weekend only, we are offering a special discount on our best-selling cakes and pastries. If you have been meaning to stop by, this is the perfect time to try our most popular flavors. Everything is baked fresh daily, and we also have limited seasonal items that usually sell out quickly. Bring a friend, grab a dessert, and make your weekend a little sweeter.",
    comments: `What time do you open?
Which flavor is the best seller?
Is this discount only for this weekend?
Do you have smaller cakes?`,
    output: {
      provider: "ollama",
      overallScore: 79,
      hookStrength: 82,
      riskLevel: "Low",
      overallSummary:
        "The campaign is inviting and conversion-oriented, with a clear weekend offer and strong community appeal.",
      topHook:
        "This weekend might be the best time to finally try our most-loved pastries.",
      caption:
        "Weekend dessert plans solved. Fresh bakes, best sellers, and a limited-time discount.",
      riskFlag:
        "The offer is clear, but adding store hours and a stronger visual opening would improve urgency.",
      nextStep:
        "Feature the best-selling pastry in the first frame and add store hours in the caption or pinned comment.",
      replies: [
        "We open early on weekends, perfect for a morning pastry run.",
        "Our best seller is the strawberry shortcake, but the seasonal items go quickly too.",
      ],
    },
  },
};

function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_30px_80px_rgba(15,23,42,0.24)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Contact
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Talk to the Creator Copilot team
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close contact modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          Tell us what you're building and we can help you shape a stronger
          creator workflow, business launch flow, or local brand content system.
        </p>

        <div className="mt-6 space-y-3">
          {[
            {
              icon: Mail,
              title: "Email",
              value: "hello@creatorcopilot.ai",
            },
            {
              icon: Phone,
              title: "Phone",
              value: "+1 (212) 555-0149",
            },
            {
              icon: MessageCircleMore,
              title: "DM",
              value: "@creatorcopilot",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">
                    {item.title}
                  </div>
                  <div className="text-sm font-semibold text-slate-950">
                    {item.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="rounded-2xl bg-slate-950 px-5 hover:bg-slate-800">
            <SendHorizontal className="mr-2 h-4 w-4" />
            Request a demo
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 px-5"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function ProductPreviewCard({
  onContact,
}: {
  onContact: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-500">
            Product Preview
          </div>
          <div className="text-[1.75rem] font-semibold tracking-tight text-slate-950">
            Creator Copilot Dashboard
          </div>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Launch Ready
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 p-5">
          <div className="text-sm font-medium text-slate-400">
            Overall Content Score
          </div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            84/100
          </div>
          <div className="mt-2 text-sm text-slate-500">Launch readiness</div>
        </div>
        <div className="rounded-3xl border border-slate-200 p-5">
          <div className="text-sm font-medium text-slate-400">
            Hook Strength
          </div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            87/100
          </div>
          <div className="mt-2 text-sm text-slate-500">Attention potential</div>
        </div>
        <div className="rounded-3xl border border-slate-200 p-5">
          <div className="text-sm font-medium text-slate-400">Risk Level</div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Medium
          </div>
          <div className="mt-2 text-sm text-slate-500">Fix before posting</div>
        </div>
        <div className="relative rounded-3xl border border-slate-200 p-5">
          <div className="text-sm font-medium text-slate-400">Provider</div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            OpenAI
          </div>
          <div className="mt-2 text-sm text-slate-500">Active route</div>
          <button
            onClick={onContact}
            className="mt-4 flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-slate-800 md:absolute md:-right-5 md:top-1/2 md:mt-0 md:-translate-y-1/2"
          >
            <MessageCircleMore className="h-4 w-4" />
            Contact Us
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[1.75rem] bg-slate-950 p-6 text-white">
        <div className="text-sm font-medium text-slate-300">Business Insight</div>
        <div className="mt-3 text-[1.45rem] font-semibold leading-9">
          This content is commercially promising, but a few execution gaps may
          limit performance.
        </div>
        <div className="mt-3 text-base leading-8 text-slate-300">
          Add pricing, location, and availability details before posting so
          interested viewers can convert without extra friction.
        </div>
      </div>

      <div className="mt-5 rounded-[1.75rem] border border-slate-200 p-5">
        <div className="text-sm font-medium text-slate-400">
          Recommended Next Step
        </div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="text-base leading-8 text-slate-700">
            Add on-screen text or a pinned comment with location, hours,
            pricing, and limited-time availability.
          </div>
          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
        </div>
      </div>
    </motion.div>
  );
}

function DemoWorkspace() {
  const [selectedCase, setSelectedCase] = useState<DemoCaseKey>("coffee");
  const [topic, setTopic] = useState(demoCases.coffee.topic);
  const [audience, setAudience] = useState(demoCases.coffee.audience);
  const [goal, setGoal] = useState(demoCases.coffee.goal);
  const [tone, setTone] = useState(demoCases.coffee.tone);
  const [script, setScript] = useState(demoCases.coffee.script);
  const [comments, setComments] = useState(demoCases.coffee.comments);
  const [result, setResult] = useState<DemoOutput>(demoCases.coffee.output);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");

  const loadCase = (key: DemoCaseKey) => {
    const item = demoCases[key];
    setSelectedCase(key);
    setTopic(item.topic);
    setAudience(item.audience);
    setGoal(item.goal);
    setTone(item.tone);
    setScript(item.script);
    setComments(item.comments);
    setResult(item.output);
    setActiveTab("summary");
  };

  const providerPill = useMemo(() => {
    const map: Record<Provider, string> = {
      openai: "bg-emerald-50 text-emerald-700",
      ollama: "bg-indigo-50 text-indigo-700",
      mock: "bg-amber-50 text-amber-700",
    };
    return map[result.provider];
  }, [result.provider]);

  const generateSuggestions = () => {
    setIsGenerating(true);

    window.setTimeout(() => {
      const loweredGoal = goal.toLowerCase();
      const isLocalBusiness =
        /store|visit|foot traffic|purchase|launch|discount|campaign/.test(
          loweredGoal,
        );
      const provider: Provider =
        selectedCase === "bakery" ? "ollama" : "openai";
      const summary = isLocalBusiness
        ? "This draft has strong commercial potential, but it will convert better if the offer details are easier to understand at a glance."
        : "This draft has a strong core idea, but it needs a sharper opening and a clearer reason for viewers to engage immediately.";

      setResult({
        provider,
        overallScore: isLocalBusiness ? 83 : 80,
        hookStrength: 86,
        riskLevel: isLocalBusiness ? "Medium" : "Low",
        overallSummary: summary,
        topHook: `If your goal is to ${goal.toLowerCase()}, this opening should work harder in the first three seconds.`,
        caption: `Built for ${audience.toLowerCase()} with a cleaner, stronger version of this idea before publishing.`,
        riskFlag: isLocalBusiness
          ? "The draft could perform better if price, location, timing, or offer details are easier to find."
          : "The script explains the idea, but the opening does not yet create a strong enough curiosity gap.",
        nextStep: isLocalBusiness
          ? "Add clearer conversion details and tighten the first frame so viewers immediately understand the value."
          : "Lead with the most surprising outcome first, then add one direct prompt for comments or saves.",
        replies: [
          `I can share more detail based on what ${audience.toLowerCase()} would care about most.`,
          "That's exactly the kind of question this content should answer before publishing.",
          "This response can be refined further once real audience questions start coming in.",
        ],
      });

      setActiveTab("summary");
      setIsGenerating(false);
    }, 900);
  };

  const scoreTone =
    result.overallScore >= 83
      ? "text-emerald-600"
      : result.overallScore >= 78
        ? "text-amber-600"
        : "text-rose-600";

  const tabBase = "rounded-full px-4 py-2 text-sm font-medium transition";

  return (
    <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Product demo
        </div>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Experience the product flow end to end
        </h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          This workspace mirrors the Creator Copilot product flow: define the
          campaign, generate AI guidance, and review launch-readiness before
          publishing.
        </p>

        <div className="mt-8 space-y-4">
          {[
            "Input a content idea, target audience, and draft script",
            "Generate structured AI suggestions for hooks, captions, risks, and replies",
            "Review launch-readiness signals before publishing",
            "Switch between creator and business demos to compare outcomes",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
              <p className="text-sm leading-6 text-slate-700">{item}</p>
            </div>
          ))}
        </div>

        <Card className="mt-8 rounded-[1.5rem] border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-500">
                  Interactive preview
                </div>
                <div className="text-xl font-semibold tracking-tight text-slate-950">
                  Creator Copilot Workspace
                </div>
              </div>
              <select
                value={selectedCase}
                onChange={(e) => loadCase(e.target.value as DemoCaseKey)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
              >
                {Object.entries(demoCases).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Video topic
                </label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Target audience
                </label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Primary goal
                  </label>
                  <input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Desired tone
                  </label>
                  <input
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Draft script
                </label>
                <textarea
                  rows={6}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Sample comments
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>
              <Button
                onClick={generateSuggestions}
                className="w-full rounded-xl bg-slate-950 py-6 text-base hover:bg-slate-800"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate AI Suggestions"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="text-sm font-medium text-slate-500">Output</div>
            <div className="text-xl font-semibold tracking-tight text-slate-950">
              Launch-readiness results
            </div>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold ${providerPill}`}
          >
            Provider used: {result.provider}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <BarChart3 className="h-4 w-4" />
              Overall score
            </div>
            <div className={`mt-3 text-3xl font-semibold ${scoreTone}`}>
              {result.overallScore}/100
            </div>
            <div className="mt-2 text-xs text-slate-500">Launch readiness</div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Hook strength
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-950">
              {result.hookStrength}/100
            </div>
            <div className="mt-2 text-xs text-slate-500">Attention potential</div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <AlertCircle className="h-4 w-4" />
              Risk level
            </div>
            <div className="mt-3 text-[1.7rem] font-semibold leading-none text-slate-950">
              {result.riskLevel}
            </div>
            <div className="mt-2 text-xs text-slate-500">Fix before publish</div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Primary goal
            </div>
            <div className="mt-3 text-[0.9rem] font-semibold leading-5 text-slate-950">
              {goal}
            </div>
            <div className="mt-2 text-xs text-slate-500">Campaign target</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab("summary")}
            className={`${tabBase} ${
              activeTab === "summary"
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("creative")}
            className={`${tabBase} ${
              activeTab === "creative"
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Creative Assets
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`${tabBase} ${
              activeTab === "risk"
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Risks & Replies
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {activeTab === "summary" && (
            <>
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-300">
                  Overall Summary
                </div>
                <div className="mt-3 text-sm leading-7">{result.overallSummary}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Business Insight
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-700">
                  For the goal of{" "}
                  <span className="font-semibold text-slate-950">
                    {goal.toLowerCase()}
                  </span>
                  , this content should tighten the first-frame value
                  proposition and remove friction before launch.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recommended Next Step
                </div>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div className="text-sm leading-7 text-slate-700">
                    {result.nextStep}
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
                </div>
              </div>
            </>
          )}

          {activeTab === "creative" && (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Top Hook
                  </div>
                  <div className="mt-3 text-sm font-medium leading-7 text-slate-900">
                    {result.topHook}
                  </div>
                  <div className="mt-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Hook strength: {result.hookStrength}/100
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Suggested Caption
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-700">
                    {result.caption}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  CTA Suggestions
                </div>
                <div className="mt-3 grid gap-3">
                  {[
                    "Ask viewers to comment with their preference or question.",
                    "Encourage saves by highlighting the practical value of the content.",
                    "Add a direct prompt tied to the campaign goal before the final frame.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "risk" && (
            <>
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Risk Flag
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-700">
                  {result.riskFlag}
                </div>
                <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                  Suggested fix: make the value clearer in the opening and
                  reduce any missing details that could block action.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <MessageSquareReply className="h-4 w-4" />
                  Suggested Replies
                </div>
                <div className="mt-3 space-y-3">
                  {result.replies.map((reply) => (
                    <div
                      key={reply}
                      className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"
                    >
                      {reply}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreatorCopilotLandingPage() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_32%),linear-gradient(180deg,#ffffff_0%,#f8fafc_46%,#f1f5f9_100%)] text-slate-950">
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-400">
                AI Product Demo
              </div>
              <div className="text-xl font-semibold tracking-tight">
                Creator Copilot
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            <a href="#features" className="transition hover:text-slate-950">
              Features
            </a>
            <a href="#use-cases" className="transition hover:text-slate-950">
              Use Cases
            </a>
            <a href="#how-it-works" className="transition hover:text-slate-950">
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#how-it-works">
              <Button
                variant="ghost"
                className="hidden rounded-2xl px-5 text-slate-700 md:inline-flex"
              >
                See How It Works
              </Button>
            </a>
            <a href="#demo">
              <Button className="rounded-2xl bg-slate-950 px-5 hover:bg-slate-800">
                Try Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-6 pb-14 pt-16 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                <Sparkles className="h-4 w-4" />
                AI pre-publish optimization for short-form content
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="mt-8 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 lg:text-[4.4rem] lg:leading-[1.05]"
              >
                Optimize short-form content before you publish.
              </motion.h1>

              <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-600">
                Creator Copilot helps creators and small businesses improve
                hooks, captions, calls-to-action, and launch readiness with
                AI-powered suggestions.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#demo">
                  <Button className="rounded-2xl bg-slate-950 px-6 py-6 text-base hover:bg-slate-800">
                    Try the Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-slate-200 px-6 py-6 text-base"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    See How It Works
                  </Button>
                </a>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Pre-publish quality control for short-form content",
                  "Business-focused guidance, not just text generation",
                  "Supports creators, local brands, and small businesses",
                  "Designed for hooks, captions, risks, and replies",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.35rem] border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-700 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ProductPreviewCard onContact={() => setContactOpen(true)} />
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Features
            </div>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Built to improve content quality before launch
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {features.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm"
                >
                  <CardContent className="p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="use-cases" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Use Cases
            </div>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Made for creators and growth-minded brands
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {useCases.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="rounded-[1.75rem] border-slate-200 shadow-sm"
                >
                  <CardContent className="p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              How it works
            </div>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              From draft to launch-ready in three steps
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <Card
                key={step}
                className="relative rounded-[1.5rem] border-slate-200 shadow-sm"
              >
                <CardContent className="p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-lg font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="mt-5 text-base leading-7 text-slate-700">
                    {step}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="demo" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <DemoWorkspace />
          </div>
        </section>

        <section className="px-6 pb-20 pt-20 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-8 py-14 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Ready to try it?
                </div>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                  Create with more confidence before you hit publish.
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                  Try Creator Copilot to improve short-form content with clearer
                  hooks, smarter engagement prompts, and better launch-readiness
                  signals.
                </p>
              </div>
              <div className="flex max-w-md flex-col items-start gap-4">
                <div className="flex flex-wrap gap-4">
                  <a href="/free-trial" target="_blank" rel="noreferrer">
                    <Button
                      size="lg"
                      className="rounded-2xl !bg-emerald-400 px-6 !text-slate-950 hover:!bg-emerald-300"
                    >
                      Start Free Trial
                    </Button>
                  </a>
                  <a href="#demo">
                    <Button
                      size="lg"
                      className="rounded-2xl !bg-white px-6 !text-slate-950 hover:!bg-slate-100"
                    >
                      Try the Demo
                    </Button>
                  </a>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-2xl !border-white/80 !bg-white px-6 !text-slate-950 hover:!bg-slate-100"
                    onClick={() => setContactOpen(true)}
                  >
                    Contact Us
                  </Button>
                </div>

                <p className="min-h-6 text-sm leading-6 text-slate-300">
                  Launch the full Streamlit trial in a new tab directly from
                  this landing page.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
