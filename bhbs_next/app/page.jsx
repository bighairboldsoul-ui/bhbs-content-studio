'use client';

import { useState, useRef, useEffect } from "react";

const MODES = [
  {
    id: "observer",
    name: "The Observer",
    tagline: "I'm seeing this happen again.",
    description: "Name a pattern in the beauty or stylist world. Cultural observations, industry habits, things nobody is saying out loud.",
    face: "No face needed",
  },
  {
    id: "translator",
    name: "The Translator",
    tagline: "Here's what this is really about.",
    description: "Break down what a trend, conversation, or moment actually means underneath the surface.",
    face: "No face needed",
  },
  {
    id: "designer",
    name: "The Designer",
    tagline: "Here's the cleaner way to hold this.",
    description: "Show a system, script, or tool. Product demos, shortcut previews, communication tips.",
    face: "No face — product is the star",
  },
  {
    id: "reprogrammer",
    name: "The Reprogrammer",
    tagline: "That belief was inherited, not natural.",
    description: "Interrupt an inherited belief about Black hair, beauty, or identity. Intimate, emotional, human.",
    face: "Show your face",
  },
  {
    id: "dreamer",
    name: "The Dreamer",
    tagline: "Now what do we want to build instead?",
    description: "Dream the future of Black beauty out loud. Ownership, ecosystem, the store, the brand, the world.",
    face: "Show your face — your most powerful lane",
  },
];

const IDEA_BANK_KEY = "bhbs_idea_bank";

function getIdeas() {
  try {
    const stored = localStorage.getItem(IDEA_BANK_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveIdeas(ideas) {
  try { localStorage.setItem(IDEA_BANK_KEY, JSON.stringify(ideas)); } catch {}
}

export default function BHBSContentStudio() {
  const [screen, setScreen] = useState("home");
  const [selectedMode, setSelectedMode] = useState(null);
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [checkerIdea, setCheckerIdea] = useState("");
  const [checkerResult, setCheckerResult] = useState(null);
  const [checkerLoading, setCheckerLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    setIdeas(getIdeas());
  }, []);

  const mode = selectedMode ? MODES.find(m => m.id === selectedMode) : null;

  async function generateContent() {
    if (!idea.trim()) return;
    setLoading(true);
    setScreen("generating");

    const systemPrompt = `You are the BHBS content production assistant for Big Hair, Bold Soul — a Black beauty editorial and systems brand.

BRAND VOICE: Thoughtful, grounded, clear, warm, incisive. Never preachy, never scolding, never performatively harsh. Culturally fluent. Professional without being corporate.

BRAND RULES:
- Culture first, interpretation second, solutions optional
- Critique systems and patterns — never individuals
- Warmth does not require overexplaining
- Use descriptive, invitational language
- Never personal diary energy, never generic creator-coach language

THE FIVE MODES:
- Observer: Names patterns. "I'm seeing this happen again."
- Translator: Explains what patterns mean. "Here's what this is really about."
- Designer: Builds systems. "Here's the cleaner way to hold this."
- Reprogrammer: Repairs inherited beliefs. "That belief was inherited, not natural."
- Dreamer: Imagines futures. "Now what do we want to build instead?"

You will receive a mode and an idea. Return ONLY a JSON object with these exact keys:
{
  "script": "60-90 second TikTok voiceover script in BHBS voice — no stage directions, just the words she says",
  "caption": "TikTok caption — 2-3 sentences max, ends with a question or invitation, no hashtags",
  "graphic_text": "The text that appears on screen — one powerful line or short sequence, max 15 words total",
  "hook": "The first sentence alone — the one that stops the scroll",
  "cta": "The final call to action — one sentence",
  "fit_note": "One sentence confirming how this fits BHBS brand rules"
}

Return ONLY the JSON. No preamble. No markdown. No backticks.`;

    const userPrompt = `Mode: ${mode.name} — "${mode.tagline}"
Idea: ${idea}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setScreen("result");
    } catch (e) {
      setResult({ error: "Something went wrong. Try again." });
      setScreen("result");
    }
    setLoading(false);
  }

  async function checkFit() {
    if (!checkerIdea.trim()) return;
    setCheckerLoading(true);
    const systemPrompt = `You are the BHBS brand fit checker for Big Hair, Bold Soul.

BHBS RULES:
1. Must fit Hair Story (identity, confidence, natural hair) OR Stylist Systems (communication, boundaries, business)
2. Must lead with culture — not jump straight to instruction
3. Must critique systems/patterns, not individuals
4. Must avoid personal venting or trauma dumping
5. Must avoid moralizing or "y'all need to" energy
6. Must be something that could stand without the creator's name attached
7. Must NOT be reactive content posted in anger — must be reflective

Return ONLY a JSON object:
{
  "verdict": "FITS" or "ADJUST" or "NOT YET",
  "score": number 1-10,
  "reason": "One sentence explaining the verdict",
  "fix": "If ADJUST or NOT YET — one specific suggestion to make it fit",
  "mode": "Which BHBS mode this fits best: Observer, Translator, Designer, Reprogrammer, or Dreamer"
}

Return ONLY JSON. No preamble. No backticks.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          system: systemPrompt,
          messages: [{ role: "user", content: `Idea to check: ${checkerIdea}` }]
        })
      });
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setCheckerResult(JSON.parse(clean));
    } catch {
      setCheckerResult({ verdict: "ERROR", reason: "Something went wrong. Try again." });
    }
    setCheckerLoading(false);
  }

  function saveToBank() {
    const newIdea = {
      id: Date.now(),
      mode: mode?.name || "",
      idea,
      script: result?.script || "",
      caption: result?.caption || "",
      graphic: result?.graphic_text || "",
      hook: result?.hook || "",
      date: new Date().toLocaleDateString(),
      posted: false,
    };
    const updated = [newIdea, ...ideas];
    setIdeas(updated);
    saveIdeas(updated);
    setSavedMsg("Saved to Idea Bank ✦");
    setTimeout(() => setSavedMsg(""), 2000);
  }

  function togglePosted(id) {
    const updated = ideas.map(i => i.id === id ? { ...i, posted: !i.posted } : i);
    setIdeas(updated);
    saveIdeas(updated);
  }

  function deleteIdea(id) {
    const updated = ideas.filter(i => i.id !== id);
    setIdeas(updated);
    saveIdeas(updated);
  }

  const verdictColor = {
    "FITS": "#2D5A27",
    "ADJUST": "#8B6914",
    "NOT YET": "#8B1A1A",
    "ERROR": "#555"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#11100F",
      color: "#F4EFE7",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "0",
    }}>
      {/* NAV */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 32px",
        borderBottom: "1px solid #2A2520",
        position: "sticky",
        top: 0,
        background: "#11100F",
        zIndex: 100,
      }}>
        <div
          onClick={() => { setScreen("home"); setResult(null); setIdea(""); setSelectedMode(null); }}
          style={{ cursor: "pointer" }}
        >
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8B7355", fontFamily: "Georgia, serif" }}>BIG HAIR BOLD SOUL</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "1px" }}>Content Studio</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { label: "Create", sc: "mode" },
            { label: "Check Fit", sc: "checker" },
            { label: `Bank (${ideas.length})`, sc: "bank" },
          ].map(btn => (
            <button
              key={btn.sc}
              onClick={() => { setScreen(btn.sc); setResult(null); setCheckerResult(null); }}
              style={{
                background: screen === btn.sc ? "#F4EFE7" : "transparent",
                color: screen === btn.sc ? "#11100F" : "#F4EFE7",
                border: "1px solid #3A3530",
                padding: "8px 16px",
                borderRadius: "2px",
                cursor: "pointer",
                fontSize: "13px",
                letterSpacing: "1px",
                fontFamily: "Georgia, serif",
                transition: "all 0.2s",
              }}
            >{btn.label}</button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "40px 24px" }}>

        {/* HOME */}
        {screen === "home" && (
          <div>
            <div style={{ textAlign: "center", padding: "60px 0 40px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#8B7355", marginBottom: "16px" }}>✦ YOUR PRODUCTION SYSTEM ✦</div>
              <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: "normal", lineHeight: 1.1, marginBottom: "24px" }}>
                Bring an idea.<br />
                <em>Leave with content.</em>
              </h1>
              <p style={{ color: "#B0A898", fontSize: "17px", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 40px" }}>
                Pick your mode, describe your idea, and get a ready-to-use TikTok script, caption, and graphic text — built in the BHBS voice.
              </p>
              <button
                onClick={() => setScreen("mode")}
                style={{
                  background: "#F4EFE7",
                  color: "#11100F",
                  border: "none",
                  padding: "16px 40px",
                  fontSize: "15px",
                  letterSpacing: "2px",
                  cursor: "pointer",
                  fontFamily: "Georgia, serif",
                  borderRadius: "2px",
                }}
              >START CREATING</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "40px" }}>
              {[
                { icon: "✦", title: "5 Brand Modes", desc: "Observer · Translator · Designer · Reprogrammer · Dreamer" },
                { icon: "◈", title: "Brand Fit Checker", desc: "Run any idea through 7 BHBS rules before you post" },
                { icon: "◉", title: "Idea Bank", desc: "Save scripts, track what you've posted, never lose an idea" },
              ].map(card => (
                <div key={card.title} style={{
                  border: "1px solid #2A2520",
                  padding: "24px",
                  borderRadius: "4px",
                  background: "#1A1510",
                }}>
                  <div style={{ fontSize: "20px", color: "#8B7355", marginBottom: "10px" }}>{card.icon}</div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "6px" }}>{card.title}</div>
                  <div style={{ fontSize: "12px", color: "#8A8078", lineHeight: 1.5 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE SELECT */}
        {screen === "mode" && !result && (
          <div>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8B7355", marginBottom: "8px" }}>STEP 01</div>
              <h2 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "8px" }}>What mode are you in?</h2>
              <p style={{ color: "#8A8078", fontSize: "14px" }}>Each mode has a different job. Pick the one that matches your idea.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "40px" }}>
              {MODES.map(m => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  style={{
                    border: `1px solid ${selectedMode === m.id ? "#F4EFE7" : "#2A2520"}`,
                    padding: "20px 24px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    background: selectedMode === m.id ? "#1E1C18" : "transparent",
                    transition: "all 0.2s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "4px" }}>{m.name}</div>
                    <div style={{ color: "#8B7355", fontSize: "13px", fontStyle: "italic", marginBottom: "6px" }}>"{m.tagline}"</div>
                    <div style={{ color: "#8A8078", fontSize: "13px" }}>{m.description}</div>
                  </div>
                  <div style={{
                    width: "22px", height: "22px", border: `2px solid ${selectedMode === m.id ? "#F4EFE7" : "#3A3530"}`,
                    borderRadius: "50%", flexShrink: 0, marginLeft: "20px",
                    background: selectedMode === m.id ? "#F4EFE7" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {selectedMode === m.id && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#11100F" }} />}
                  </div>
                </div>
              ))}
            </div>

            {selectedMode && (
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8B7355", marginBottom: "8px" }}>STEP 02</div>
                  <h2 style={{ fontSize: "24px", fontWeight: "normal", marginBottom: "8px" }}>Describe your idea</h2>
                  <p style={{ color: "#8A8078", fontSize: "13px", marginBottom: "4px" }}>
                    Face for this mode: <span style={{ color: "#F4EFE7" }}>{mode?.face}</span>
                  </p>
                  <p style={{ color: "#8A8078", fontSize: "13px" }}>Don't overthink it. A sentence or two. A pattern you noticed. A scenario. A feeling you want to name.</p>
                </div>
                <textarea
                  ref={textareaRef}
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                  placeholder={`e.g. "${mode?.tagline}"`}
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    background: "#1A1510",
                    border: "1px solid #3A3530",
                    color: "#F4EFE7",
                    padding: "16px",
                    fontSize: "15px",
                    fontFamily: "Georgia, serif",
                    borderRadius: "4px",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                    lineHeight: 1.6,
                  }}
                />
                <button
                  onClick={generateContent}
                  disabled={!idea.trim()}
                  style={{
                    marginTop: "16px",
                    background: idea.trim() ? "#F4EFE7" : "#2A2520",
                    color: idea.trim() ? "#11100F" : "#555",
                    border: "none",
                    padding: "14px 36px",
                    fontSize: "14px",
                    letterSpacing: "2px",
                    cursor: idea.trim() ? "pointer" : "not-allowed",
                    fontFamily: "Georgia, serif",
                    borderRadius: "2px",
                    width: "100%",
                  }}
                >GENERATE CONTENT ✦</button>
              </div>
            )}
          </div>
        )}

        {/* GENERATING */}
        {screen === "generating" && (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "24px", animation: "pulse 1.5s infinite" }}>✦</div>
            <div style={{ fontSize: "18px", color: "#8B7355", fontStyle: "italic" }}>Writing in your voice...</div>
            <div style={{ fontSize: "13px", color: "#555", marginTop: "12px" }}>Mode: {mode?.name}</div>
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
          </div>
        )}

        {/* RESULT */}
        {screen === "result" && result && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <div>
                <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8B7355", marginBottom: "4px" }}>CONTENT READY</div>
                <h2 style={{ fontSize: "24px", fontWeight: "normal" }}>{mode?.name}</h2>
              </div>
              <button
                onClick={() => { setScreen("mode"); setResult(null); setIdea(""); }}
                style={{ background: "transparent", border: "1px solid #3A3530", color: "#F4EFE7", padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontFamily: "Georgia, serif", borderRadius: "2px" }}
              >New Idea</button>
            </div>

            {result.error ? (
              <div style={{ color: "#E88", padding: "20px", border: "1px solid #8B1A1A", borderRadius: "4px" }}>{result.error}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Hook */}
                <div style={{ border: "1px solid #2A2520", padding: "24px", borderRadius: "4px", background: "#1A1510" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#8B7355", marginBottom: "12px" }}>✦ THE HOOK — FIRST LINE</div>
                  <div style={{ fontSize: "20px", lineHeight: 1.4, fontStyle: "italic" }}>"{result.hook}"</div>
                </div>

                {/* Script */}
                <div style={{ border: "1px solid #2A2520", padding: "24px", borderRadius: "4px", background: "#1A1510" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#8B7355", marginBottom: "12px" }}>✦ TIKTOK SCRIPT — SAY THIS</div>
                  <div style={{ fontSize: "15px", lineHeight: 1.8, color: "#E8E0D4", whiteSpace: "pre-wrap" }}>{result.script}</div>
                </div>

                {/* Graphic */}
                <div style={{ border: "1px solid #2A2520", padding: "24px", borderRadius: "4px", background: "#1E1C18" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#8B7355", marginBottom: "12px" }}>✦ ON-SCREEN TEXT — PUT THIS IN CANVA</div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", lineHeight: 1.4 }}>{result.graphic_text}</div>
                </div>

                {/* Caption */}
                <div style={{ border: "1px solid #2A2520", padding: "24px", borderRadius: "4px", background: "#1A1510" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#8B7355", marginBottom: "12px" }}>✦ CAPTION</div>
                  <div style={{ fontSize: "15px", lineHeight: 1.7, color: "#E8E0D4" }}>{result.caption}</div>
                </div>

                {/* CTA */}
                <div style={{ border: "1px solid #2A2520", padding: "20px 24px", borderRadius: "4px", background: "#1A1510", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#8B7355", marginBottom: "6px" }}>✦ CALL TO ACTION</div>
                    <div style={{ fontSize: "15px" }}>{result.cta}</div>
                  </div>
                </div>

                {/* Fit note */}
                <div style={{ padding: "16px 20px", borderLeft: "3px solid #8B7355", background: "#181510", borderRadius: "0 4px 4px 0" }}>
                  <div style={{ fontSize: "12px", color: "#8B7355", marginBottom: "4px" }}>BRAND FIT</div>
                  <div style={{ fontSize: "13px", color: "#A89880", fontStyle: "italic" }}>{result.fit_note}</div>
                </div>

                <button
                  onClick={saveToBank}
                  style={{
                    background: "#F4EFE7",
                    color: "#11100F",
                    border: "none",
                    padding: "14px",
                    fontSize: "14px",
                    letterSpacing: "2px",
                    cursor: "pointer",
                    fontFamily: "Georgia, serif",
                    borderRadius: "2px",
                    width: "100%",
                    marginTop: "8px",
                  }}
                >{savedMsg || "SAVE TO IDEA BANK ✦"}</button>
              </div>
            )}
          </div>
        )}

        {/* CHECKER */}
        {screen === "checker" && (
          <div>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8B7355", marginBottom: "8px" }}>BRAND FIT CHECKER</div>
              <h2 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "8px" }}>Does this fit BHBS?</h2>
              <p style={{ color: "#8A8078", fontSize: "14px" }}>Paste an idea, topic, or draft before you post. BHBS will check it against the brand rules.</p>
            </div>
            <textarea
              value={checkerIdea}
              onChange={e => setCheckerIdea(e.target.value)}
              placeholder="Paste your idea, topic, caption, or draft here..."
              style={{
                width: "100%",
                minHeight: "140px",
                background: "#1A1510",
                border: "1px solid #3A3530",
                color: "#F4EFE7",
                padding: "16px",
                fontSize: "15px",
                fontFamily: "Georgia, serif",
                borderRadius: "4px",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                lineHeight: 1.6,
              }}
            />
            <button
              onClick={checkFit}
              disabled={!checkerIdea.trim() || checkerLoading}
              style={{
                marginTop: "16px",
                background: checkerIdea.trim() ? "#F4EFE7" : "#2A2520",
                color: checkerIdea.trim() ? "#11100F" : "#555",
                border: "none",
                padding: "14px 36px",
                fontSize: "14px",
                letterSpacing: "2px",
                cursor: checkerIdea.trim() ? "pointer" : "not-allowed",
                fontFamily: "Georgia, serif",
                borderRadius: "2px",
                width: "100%",
              }}
            >{checkerLoading ? "Checking..." : "CHECK THIS IDEA ✦"}</button>

            {checkerResult && (
              <div style={{ marginTop: "24px", border: "1px solid #2A2520", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{
                  background: verdictColor[checkerResult.verdict] || "#333",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#FFF" }}>{checkerResult.verdict}</div>
                  <div style={{ fontSize: "28px", color: "#FFF", fontWeight: "bold" }}>{checkerResult.score}/10</div>
                </div>
                <div style={{ padding: "24px", background: "#1A1510" }}>
                  <p style={{ fontSize: "16px", lineHeight: 1.6, marginBottom: "16px" }}>{checkerResult.reason}</p>
                  {checkerResult.fix && (
                    <div style={{ padding: "14px 16px", background: "#11100F", borderLeft: "3px solid #8B7355", marginBottom: "16px", borderRadius: "0 4px 4px 0" }}>
                      <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#8B7355", marginBottom: "6px" }}>SUGGESTION</div>
                      <div style={{ fontSize: "14px", color: "#C8BFB0" }}>{checkerResult.fix}</div>
                    </div>
                  )}
                  {checkerResult.mode && (
                    <div style={{ fontSize: "13px", color: "#8B7355" }}>Best mode: <span style={{ color: "#F4EFE7" }}>{checkerResult.mode}</span></div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BANK */}
        {screen === "bank" && (
          <div>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8B7355", marginBottom: "8px" }}>IDEA BANK</div>
              <h2 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "8px" }}>Your saved content</h2>
              <p style={{ color: "#8A8078", fontSize: "14px" }}>{ideas.length} ideas saved. Mark them posted as you publish.</p>
            </div>

            {ideas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}>
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>◉</div>
                <div>No ideas saved yet. Generate content and save it here.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {ideas.map(item => (
                  <div key={item.id} style={{
                    border: `1px solid ${item.posted ? "#2A3520" : "#2A2520"}`,
                    borderRadius: "4px",
                    overflow: "hidden",
                    opacity: item.posted ? 0.6 : 1,
                  }}>
                    <div style={{
                      padding: "16px 20px",
                      background: item.posted ? "#141A12" : "#1A1510",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}>
                      <div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                          <span style={{ fontSize: "11px", letterSpacing: "2px", color: "#8B7355" }}>{item.mode}</span>
                          <span style={{ fontSize: "11px", color: "#444" }}>·</span>
                          <span style={{ fontSize: "11px", color: "#555" }}>{item.date}</span>
                          {item.posted && <span style={{ fontSize: "11px", color: "#6A9A5A", letterSpacing: "1px" }}>POSTED</span>}
                        </div>
                        <div style={{ fontSize: "15px", fontStyle: "italic", color: "#C8BFB0" }}>"{item.idea}"</div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0, marginLeft: "16px" }}>
                        <button
                          onClick={() => togglePosted(item.id)}
                          style={{ background: "transparent", border: "1px solid #3A3530", color: item.posted ? "#6A9A5A" : "#F4EFE7", padding: "6px 12px", cursor: "pointer", fontSize: "11px", fontFamily: "Georgia, serif", borderRadius: "2px" }}
                        >{item.posted ? "✓ Posted" : "Mark Posted"}</button>
                        <button
                          onClick={() => deleteIdea(item.id)}
                          style={{ background: "transparent", border: "1px solid #3A3530", color: "#8A8078", padding: "6px 10px", cursor: "pointer", fontSize: "11px", borderRadius: "2px" }}
                        >✕</button>
                      </div>
                    </div>
                    {item.hook && (
                      <div style={{ padding: "12px 20px", borderTop: "1px solid #1E1C18", background: "#111009" }}>
                        <div style={{ fontSize: "12px", color: "#8B7355", marginBottom: "4px" }}>HOOK</div>
                        <div style={{ fontSize: "14px", color: "#A89880", fontStyle: "italic" }}>"{item.hook}"</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
