import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Gauge,
  Layers3,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

import PageShell from "../components/common/PageShell";
import DisclaimerBox from "../components/common/DisclaimerBox";
import { publicApi } from "../services/api";
import { useQuestionnaire } from "../context/QuestionnaireContext";

// ─────────────────────────────────────────────
// Data / label maps
// ─────────────────────────────────────────────
const chakraLabels = {
  mooladhara: "Mooladhara Chakra",
  swadhisthana: "Swadhisthana Chakra",
  nabhi: "Nabhi Chakra",
  void: "Void",
  heart: "Heart Chakra",
  vishuddhi: "Vishuddhi Chakra",
  agnya: "Agnya Chakra",
  sahasrara: "Sahasrara Chakra",
};

const nadiLabels = {
  leftNadi: "Left Channel / Ida Nadi",
  rightNadi: "Right Channel / Pingala Nadi",
  centerNadi: "Center Channel / Sushumna Nadi",
};

const chakraOrder = [
  "mooladhara","swadhisthana","nabhi","void","heart","vishuddhi","agnya","sahasrara",
];
const nadiOrder = ["leftNadi", "rightNadi", "centerNadi"];
const defaultUserForm = { name: "", phone: "", email: "" };
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone = (p) => p.replace(/[^\d+]/g, "").length >= 8;

const getContentSafely = async (key, fallback = "") => {
  try {
    const block = await publicApi.getContent(key);
    return block?.content || fallback;
  } catch {
    return fallback;
  }
};

const formatLabel = (key = "") =>
  String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

const getVisualStatus = (score = 0) => {
  const n = Number(score || 0);
  if (n <= 0)
    return { label: "Good", level: 0, height: 14, barClass: "sr-bar-good", badgeClass: "sr-badge-good" };
  if (n <= 1)
    return { label: "Balanced", level: 1, height: 30, barClass: "sr-bar-balanced", badgeClass: "sr-badge-balanced" };
  if (n <= 2)
    return { label: "Mild Attention", level: 2, height: 50, barClass: "sr-bar-mild", badgeClass: "sr-badge-mild" };
  if (n <= 5)
    return { label: "Need to Work", level: 3, height: 70, barClass: "sr-bar-work", badgeClass: "sr-badge-work" };
  return { label: "Strong Attention", level: 4, height: 90, barClass: "sr-bar-strong", badgeClass: "sr-badge-strong" };
};

const getScoreEntries = (scores = {}, labelMap = {}) =>
  Object.entries(scores || {})
    .map(([key, value]) => ({ key, label: labelMap[key] || formatLabel(key), score: Number(value || 0), ...getVisualStatus(Number(value || 0)) }))
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score);

const getChakraGraphData = (result = {}) =>
  chakraOrder.map((key) => {
    const score = Number((result.chakraScores || {})[key] || 0);
    const status = getVisualStatus(score);
    const areaLabel = chakraLabels[key] || formatLabel(key);
    return { key, areaLabel, shortLabel: areaLabel.replace(" Chakra", ""), score, ...status };
  });

const getNadiGraphData = (result = {}) =>
  nadiOrder.map((key) => {
    const score = Number((result.nadiScores || {})[key] || 0);
    const status = getVisualStatus(score);
    const areaLabel = nadiLabels[key] || formatLabel(key);
    return {
      key, areaLabel,
      shortLabel: key === "leftNadi" ? "Left" : key === "rightNadi" ? "Right" : "Center",
      score, ...status,
    };
  });

const getDetailedAnswers = (result = {}) => {
  const lists = [result.answersDetailed, result.answerDetails, result.detailedAnswers, result.populatedAnswers];
  const found = lists.find((l) => Array.isArray(l) && l.length);
  if (found) return found;
  if (Array.isArray(result.answers) && result.answers.length) return result.answers;
  return [];
};

const getSelectedOptionText = (answer = {}) => {
  const fromArr = (arr) => arr?.map((o) => o?.label || o?.value).filter(Boolean).join(", ");
  if (Array.isArray(answer.selectedOptions) && answer.selectedOptions.length) return fromArr(answer.selectedOptions);
  if (Array.isArray(answer.options) && answer.options.length) return fromArr(answer.options);
  if (Array.isArray(answer.selectedOptionLabels) && answer.selectedOptionLabels.length) return answer.selectedOptionLabels.join(", ");
  if (answer.selectedOptionLabel) return answer.selectedOptionLabel;
  if (answer.intensityLevel) return `Intensity level ${answer.intensityLevel}`;
  return "Selected response recorded";
};

const getQuestionText = (answer = {}, index) =>
  answer.questionText ||
  answer.question?.questionText ||
  answer.question?.text ||
  answer.questionId?.questionText ||
  `Question ${index + 1}`;

const collectScoresFromAnswer = (answer = {}) => {
  const opts = [...(Array.isArray(answer.selectedOptions) ? answer.selectedOptions : []), ...(Array.isArray(answer.options) ? answer.options : [])];
  const chakraScores = {};
  const nadiScores = {};
  opts.forEach((o) => {
    Object.entries(o?.chakraScores || {}).forEach(([k, v]) => { chakraScores[k] = (chakraScores[k] || 0) + Number(v || 0); });
    Object.entries(o?.nadiScores || {}).forEach(([k, v]) => { nadiScores[k] = (nadiScores[k] || 0) + Number(v || 0); });
  });
  return { chakraScores, nadiScores };
};

const getReflectionText = (answer = {}) => {
  const opts = [...(Array.isArray(answer.selectedOptions) ? answer.selectedOptions : []), ...(Array.isArray(answer.options) ? answer.options : [])];
  const explanations = opts.map((o) => o?.explanation || o?.reflection || o?.description).filter(Boolean);
  if (explanations.length) return explanations.join(" ");
  const { chakraScores, nadiScores } = collectScoresFromAnswer(answer);
  const chakraAreas = getScoreEntries(chakraScores, chakraLabels).slice(0, 2).map((i) => i.label);
  const nadiAreas = getScoreEntries(nadiScores, nadiLabels).slice(0, 2).map((i) => i.label);
  if (chakraAreas.length || nadiAreas.length) {
    const parts = [];
    if (chakraAreas.length) parts.push(chakraAreas.join(" and "));
    if (nadiAreas.length) parts.push(nadiAreas.join(" and "));
    return `This answer may point toward ${parts.join(", ")}. Treat this as a gentle observation, not a final conclusion.`;
  }
  return "This answer may reflect a present inner tendency. Observe it gently through meditation, vibrations, and honest self-introspection.";
};

const getOverallStatus = (chakraData = [], nadiData = []) => {
  const maxLevel = Math.max(...[...chakraData, ...nadiData].map((i) => Number(i.level || 0)), 0);
  const score = maxLevel === 0 ? 0 : maxLevel === 1 ? 1 : maxLevel === 2 ? 2 : maxLevel === 3 ? 3 : 6;
  const status = getVisualStatus(score);
  const labels = ["Good", "Balanced", "Mild Attention", "Need to Work", "Strong Attention"];
  return { ...status, label: labels[Math.min(maxLevel, 4)] };
};

// ─────────────────────────────────────────────
// Global styles + font injection
// ─────────────────────────────────────────────
function InjectStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, []);

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      .sr-root * { box-sizing: border-box; }
      .sr-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      .sr-body { font-family: 'DM Sans', system-ui, sans-serif; }

      .sr-card {
        background: #FFFFFF;
        border: 1px solid rgba(180,145,100,0.14);
        border-radius: 20px;
        box-shadow: 0 2px 12px rgba(120,80,30,0.06), 0 1px 3px rgba(120,80,30,0.04);
        transition: transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease;
      }
      .sr-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 16px 48px rgba(120,80,30,0.13), 0 6px 18px rgba(120,80,30,0.07);
      }
      .sr-stat-card {
        background: #FFFFFF;
        border-radius: 20px;
        border-top: 3px solid transparent;
        border-image: linear-gradient(90deg,#C45918,#B8922A) 1;
        border-left: 1px solid rgba(180,145,100,0.14);
        border-right: 1px solid rgba(180,145,100,0.14);
        border-bottom: 1px solid rgba(180,145,100,0.14);
        box-shadow: 0 2px 16px rgba(120,80,30,0.07);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        overflow: hidden;
      }
      .sr-stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 56px rgba(120,80,30,0.14);
      }

      /* Badge styles */
      .sr-badge-good    { background:#EDFAF3; color:#136B3A; border:1px solid #B8E8CE; }
      .sr-badge-balanced{ background:#EAF2FD; color:#1A558A; border:1px solid #B8D8F5; }
      .sr-badge-mild    { background:#FBF5E0; color:#8A650A; border:1px solid #E8D588; }
      .sr-badge-work    { background:#FDF0E6; color:#A84010; border:1px solid #F0B898; }
      .sr-badge-strong  { background:#FDF0EE; color:#AA1F1F; border:1px solid #EEB8B8; }

      /* Bar styles */
      .sr-bar-good    { background:linear-gradient(180deg,#6EE8A4 0%,#159A52 100%); box-shadow:0 6px 20px rgba(21,154,82,0.32); }
      .sr-bar-balanced{ background:linear-gradient(180deg,#64B8EE 0%,#1664A8 100%); box-shadow:0 6px 20px rgba(22,100,168,0.30); }
      .sr-bar-mild    { background:linear-gradient(180deg,#F4CC5A 0%,#C8960A 100%); box-shadow:0 6px 20px rgba(200,150,10,0.32); }
      .sr-bar-work    { background:linear-gradient(180deg,#F29050 0%,#C84010 100%); box-shadow:0 6px 20px rgba(200,64,16,0.32); }
      .sr-bar-strong  { background:linear-gradient(180deg,#EE6060 0%,#AA1F1F 100%); box-shadow:0 6px 20px rgba(170,31,31,0.32); }

      /* Animations */
      @keyframes sr-fade-up {
        from { opacity:0; transform:translateY(20px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes sr-scale-in {
        from { opacity:0; transform:scale(0.96); }
        to   { opacity:1; transform:scale(1); }
      }
      @keyframes sr-mandala-spin {
        from { transform:rotate(0deg); }
        to   { transform:rotate(360deg); }
      }
      .sr-fade-up   { animation:sr-fade-up 0.55s cubic-bezier(.22,.68,0,1.2) both; }
      .sr-scale-in  { animation:sr-scale-in 0.45s ease both; }
      .sr-d1 { animation-delay:0.05s; }
      .sr-d2 { animation-delay:0.12s; }
      .sr-d3 { animation-delay:0.18s; }
      .sr-d4 { animation-delay:0.24s; }
      .sr-mandala { animation:sr-mandala-spin 60s linear infinite; transform-origin:center; }

      /* Graph container */
      .sr-graph-bg {
        background:linear-gradient(180deg,#F8F2EA 0%,#FEFBF3 100%);
        border:1px solid rgba(180,145,100,0.14);
        border-radius:20px;
      }

      /* Divider ornament */
      .sr-ornament {
        display:flex; align-items:center; gap:12px;
        color:rgba(196,89,24,0.4); font-size:18px; font-family:'Cormorant Garamond',serif;
      }
      .sr-ornament::before,.sr-ornament::after {
        content:''; flex:1; height:1px;
        background:linear-gradient(90deg,transparent,rgba(196,89,24,0.25),transparent);
      }

      /* Input focus */
      .sr-input:focus { outline:none; border-color:#C45918; box-shadow:0 0 0 3px rgba(196,89,24,0.10); }

      /* Smooth modal drawer */
      @keyframes sr-slide-up {
        from { transform:translateY(100%); }
        to   { transform:translateY(0); }
      }
      @keyframes sr-fade-in {
        from { opacity:0; }
        to   { opacity:1; }
      }
      .sr-modal-backdrop { animation:sr-fade-in 0.25s ease both; }
      .sr-modal-drawer   { animation:sr-slide-up 0.35s cubic-bezier(.22,.68,0,1.2) both; }
      @media(min-width:640px) {
        .sr-modal-drawer { animation:sr-scale-in 0.3s ease both; }
      }

      /* Section number decoration */
      .sr-section-num {
        font-family:'Cormorant Garamond',serif;
        font-size:96px; font-weight:700; line-height:1;
        color:rgba(196,89,24,0.07);
        position:absolute; right:24px; top:-8px;
        pointer-events:none; user-select:none;
      }
    `}}
    />
  );
}

// ─────────────────────────────────────────────
// Decorative SVG mandala for header
// ─────────────────────────────────────────────
function MandalaSVG({ size = 320, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" fill="none" className={className}>
      <g className="sr-mandala" opacity="0.18">
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <g key={i} transform={`rotate(${deg} 160 160)`}>
            <ellipse cx="160" cy="90" rx="6" ry="28" fill="#C45918" />
            <ellipse cx="160" cy="58" rx="4" ry="14" fill="#B8922A" />
          </g>
        ))}
        <circle cx="160" cy="160" r="52" stroke="#C45918" strokeWidth="1" fill="none" />
        <circle cx="160" cy="160" r="72" stroke="#B8922A" strokeWidth="0.7" strokeDasharray="4 6" fill="none" />
        <circle cx="160" cy="160" r="96" stroke="#C45918" strokeWidth="0.5" strokeDasharray="2 8" fill="none" />
        {[0,60,120,180,240,300].map((deg, i) => (
          <circle
            key={i}
            cx={160 + 52 * Math.cos((deg * Math.PI) / 180)}
            cy={160 + 52 * Math.sin((deg * Math.PI) / 180)}
            r="5" fill="#C45918" opacity="0.6"
          />
        ))}
        <circle cx="160" cy="160" r="18" stroke="#C45918" strokeWidth="1.5" fill="#FDF0E6" opacity="0.8" />
        <circle cx="160" cy="160" r="6" fill="#C45918" opacity="0.5" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────
function SectionHeader({ eyebrow, title, subtitle, number }) {
  return (
    <div className="mb-6 relative">
      {number && <span className="sr-section-num sr-body">{number}</span>}
      {eyebrow && (
        <p className="sr-body" style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.24em",
          textTransform: "uppercase", color: "#C45918", marginBottom: "8px",
        }}>
          {eyebrow}
        </p>
      )}
      <h2 className="sr-display" style={{
        fontSize: "clamp(26px,3.5vw,36px)", fontWeight: 600,
        color: "#1C1209", lineHeight: 1.15, letterSpacing: "-0.01em",
      }}>
        {title}
      </h2>
      {subtitle && (
        <p className="sr-body" style={{
          fontSize: "14px", lineHeight: "1.8", color: "#7A6252",
          marginTop: "10px", maxWidth: "680px",
        }}>
          {subtitle}
        </p>
      )}
      <div style={{ marginTop: "16px", height: "2px", width: "48px",
        background: "linear-gradient(90deg,#C45918,#B8922A)", borderRadius: "2px" }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="sr-stat-card sr-fade-up" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: "linear-gradient(135deg,#FDF0E6 0%,#FBF5E0 100%)",
          border: "1px solid rgba(196,89,24,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#C45918",
        }}>
          <Icon size={20} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="sr-body" style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#A89880",
          }}>
            {label}
          </p>
          <p className="sr-display" style={{
            fontSize: "clamp(18px,2vw,22px)", fontWeight: 600,
            color: "#1C1209", marginTop: "4px", lineHeight: 1.2,
            wordBreak: "break-word",
          }}>
            {value || "—"}
          </p>
          {helper && (
            <p className="sr-body" style={{ fontSize: "11px", color: "#A89880", marginTop: "6px", lineHeight: 1.5 }}>
              {helper}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Overall Analysis Panel
// ─────────────────────────────────────────────
function OverallAnalysisPanel({ result, chakraData, nadiData }) {
  const topChakra = [...chakraData].sort((a, b) => b.score - a.score)[0];
  const topNadi = [...nadiData].sort((a, b) => b.score - a.score)[0];
  const overall = getOverallStatus(chakraData, nadiData);
  const isMixed = String(result?.confidence || "").toLowerCase() === "inconclusive";

  return (
    <section style={{ borderBottom: "1px solid rgba(196,89,24,0.1)", padding: "36px 28px" }}>
      <SectionHeader
        eyebrow="Analysis snapshot"
        title="Overall Balance Summary"
        subtitle="This section summarizes the strongest tendencies from your selected answers before the detailed graphs."
        number="01"
      />

      {isMixed && (
        <div className="sr-body" style={{
          marginBottom: "20px", borderRadius: "14px",
          border: "1px solid rgba(200,150,10,0.25)", background: "#FBF5E0",
          padding: "16px 20px", fontSize: "13px", lineHeight: "1.8", color: "#7A5A0A",
        }}>
          Your answers show a mixed pattern. General meditation, footsoak, and guidance from experienced Sahajayogis may be more suitable.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px" }}>
        <StatCard icon={Gauge} label="Overall Pattern" value={overall.label} helper="Highest visual status from the report" />
        <StatCard icon={Sparkles} label="Main Chakra Area" value={topChakra?.score ? topChakra.areaLabel : "No strong area"} helper={topChakra?.score ? `Score signal: ${topChakra.score}` : "No clear chakra signal"} />
        <StatCard icon={TrendingUp} label="Main Nadi Tendency" value={topNadi?.score ? topNadi.areaLabel : "No strong tendency"} helper={topNadi?.score ? `Score signal: ${topNadi.score}` : "No clear nadi signal"} />
        <StatCard icon={ClipboardList} label="Clarity" value={result?.confidence || "—"} helper="Based on answer consistency" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Top Attention Areas
// ─────────────────────────────────────────────
function TopAttentionAreas({ chakraData = [], nadiData = [] }) {
  const topAreas = [...chakraData, ...nadiData]
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <section style={{ borderBottom: "1px solid rgba(196,89,24,0.1)", padding: "36px 28px" }}>
      <SectionHeader
        eyebrow="Priority view"
        title="Top Attention Areas"
        subtitle="These areas are calculated only from the actual score pattern returned by the server."
        number="03"
      />

      {topAreas.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "16px" }}>
          {topAreas.map((item, index) => (
            <div key={item.key} className="sr-card sr-fade-up" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "12px",
                  background: "linear-gradient(135deg,#FDF0E6,#FBF5E0)",
                  border: "1px solid rgba(196,89,24,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Cormorant Garamond',serif", fontSize: "16px",
                  fontWeight: 700, color: "#C45918",
                }}>
                  {index + 1}
                </div>
                <span className={`sr-badge-${item.badgeClass?.replace("sr-badge-","") || "work"} sr-body`} style={{
                  padding: "4px 12px", borderRadius: "999px",
                  fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                }}>
                  {item.label}
                </span>
              </div>
              <h3 className="sr-display" style={{ fontSize: "20px", fontWeight: 600, color: "#1C1209", marginBottom: "8px" }}>
                {item.areaLabel || item.shortLabel}
              </h3>
              <p className="sr-body" style={{ fontSize: "12px", lineHeight: "1.7", color: "#7A6252", marginBottom: "14px" }}>
                This area appeared in your answer pattern and can be used as a gentle point for observation.
              </p>
              <div style={{ height: "4px", borderRadius: "4px", background: "rgba(180,145,100,0.12)", overflow: "hidden" }}>
                <div className={item.barClass} style={{
                  height: "100%", borderRadius: "4px",
                  width: `${Math.min(100, Math.max(10, item.height))}%`,
                  transition: "width 1s cubic-bezier(.22,.68,0,1.2)",
                }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="sr-body" style={{
          borderRadius: "14px", border: "1px solid rgba(21,154,82,0.2)",
          background: "#EDFAF3", padding: "16px 20px", fontSize: "13px",
          lineHeight: "1.8", color: "#136B3A",
        }}>
          No strong attention area was detected from the selected answers.
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// Balance Graph
// ─────────────────────────────────────────────
function BalanceGraph({ eyebrow = "Visual overview", title, subtitle, data = [], number }) {
  const legendItems = [
    { label: "Good", cls: "sr-badge-good" },
    { label: "Balanced", cls: "sr-badge-balanced" },
    { label: "Mild", cls: "sr-badge-mild" },
    { label: "Work", cls: "sr-badge-work" },
    { label: "Strong", cls: "sr-badge-strong" },
  ];

  return (
    <section style={{ borderBottom: "1px solid rgba(196,89,24,0.1)", padding: "36px 28px" }}>
      <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} number={number} />

      <div className="sr-graph-bg" style={{ padding: "24px 20px 12px" }}>
        <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
          <div style={{ display: "flex", gap: "16px", minWidth: "600px", alignItems: "flex-end" }}>
            {/* Y-axis labels */}
            <div className="sr-body" style={{
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              width: "56px", paddingBottom: "56px", paddingTop: "4px",
              fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "#A89880", textAlign: "right",
              height: "200px", flexShrink: 0,
            }}>
              <span>Strong</span>
              <span>Work</span>
              <span>Mild</span>
              <span>Balanced</span>
              <span>Good</span>
            </div>

            {/* Bars */}
            <div style={{
              flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "space-between",
              gap: "10px", position: "relative",
              background: "linear-gradient(180deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.6) 100%)",
              borderRadius: "14px", padding: "8px 16px 0", minHeight: "200px",
            }}>
              {/* Grid lines */}
              {[20, 40, 60, 80].map((pct) => (
                <div key={pct} style={{
                  position: "absolute", left: 0, right: 0,
                  bottom: `${pct * 1.8}px`,
                  borderTop: "1px dashed rgba(180,145,100,0.18)", pointerEvents: "none",
                }} />
              ))}

              {data.map((item) => (
                <div key={item.key} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  flex: 1, minWidth: "56px",
                }}>
                  {/* Badge */}
                  <span className={`${item.badgeClass} sr-body`} style={{
                    padding: "3px 8px", borderRadius: "999px", marginBottom: "10px",
                    fontSize: "8px", fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>
                    {item.label === "Need to Work" ? "Work" : item.label === "Mild Attention" ? "Mild" : item.label === "Strong Attention" ? "Strong" : item.label}
                  </span>

                  {/* Bar */}
                  <div style={{ width: "100%", height: "180px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <div className={item.barClass} style={{
                      width: "clamp(28px,60%,48px)",
                      height: `${item.height}%`,
                      borderRadius: "8px 8px 4px 4px",
                      transition: "height 1.2s cubic-bezier(.22,.68,0,1.2)",
                    }} />
                  </div>

                  {/* Label */}
                  <p className="sr-body" style={{
                    marginTop: "10px", textAlign: "center", fontSize: "10px",
                    fontWeight: 600, color: "#5C4C3A", lineHeight: 1.3,
                    maxWidth: "72px",
                  }}>
                    {item.shortLabel}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
        {legendItems.map((l) => (
          <span key={l.label} className={`${l.cls} sr-body`} style={{
            padding: "5px 14px", borderRadius: "999px",
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            {l.label}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Graph Explanation
// ─────────────────────────────────────────────
function GraphExplanation({ title, points = [] }) {
  return (
    <div className="sr-card" style={{ padding: "24px 26px" }}>
      <h3 className="sr-display" style={{ fontSize: "20px", fontWeight: 600, color: "#1C1209", marginBottom: "16px" }}>
        {title}
      </h3>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
        {points.map((p) => (
          <li key={p} className="sr-body" style={{ display: "flex", gap: "12px", fontSize: "13px", lineHeight: "1.75", color: "#5C4C3A" }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: "9px",
              background: "linear-gradient(135deg,#C45918,#B8922A)",
            }} />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────
// Reflection Item
// ─────────────────────────────────────────────
function ReflectionItem({ answer, index }) {
  const questionText = getQuestionText(answer, index);
  const selectedText = getSelectedOptionText(answer);
  const reflectionText = getReflectionText(answer);

  return (
    <div className="sr-card" style={{ padding: "22px 24px" }}>
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        {/* Number */}
        <div style={{
          width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
          background: "linear-gradient(135deg,#FDF0E6,#FBF5E0)",
          border: "1px solid rgba(196,89,24,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Cormorant Garamond',serif", fontSize: "15px",
          fontWeight: 700, color: "#C45918",
        }}>
          {index + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="sr-body" style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#C45918", marginBottom: "6px",
          }}>
            Reflection
          </p>
          <h3 className="sr-display" style={{ fontSize: "18px", fontWeight: 600, color: "#1C1209", lineHeight: 1.25, marginBottom: "14px" }}>
            {questionText}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "10px" }}>
            <div style={{
              borderRadius: "12px", background: "#FDF0E6",
              border: "1px solid rgba(196,89,24,0.15)", padding: "14px 16px",
            }}>
              <p className="sr-body" style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C45918", marginBottom: "6px" }}>
                Selected answer
              </p>
              <p className="sr-body" style={{ fontSize: "13px", fontWeight: 500, lineHeight: "1.65", color: "#3C2A1A" }}>
                {selectedText}
              </p>
            </div>

            <div style={{
              borderRadius: "12px", background: "#F8F4EE",
              border: "1px solid rgba(180,145,100,0.18)", padding: "14px 16px",
            }}>
              <p className="sr-body" style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A89880", marginBottom: "6px" }}>
                Reflection note
              </p>
              <p className="sr-body" style={{ fontSize: "13px", lineHeight: "1.65", color: "#5C4C3A" }}>
                {reflectionText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Ornament Divider
// ─────────────────────────────────────────────
function OrnamentDivider({ label = "✦" }) {
  return (
    <div className="sr-ornament sr-body" style={{ padding: "0 28px", fontSize: "14px" }}>
      <span style={{ color: "rgba(196,89,24,0.35)" }}>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main ResultPage
// ─────────────────────────────────────────────
export default function ResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { resetAnswers } = useQuestionnaire();

  const [result, setResult] = useState(null);
  const [disclaimer, setDisclaimer] = useState("");
  const [finalGuidance, setFinalGuidance] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showUserForm, setShowUserForm] = useState(false);
  const [savingUserInfo, setSavingUserInfo] = useState(false);
  const [userForm, setUserForm] = useState(defaultUserForm);
  const [userFormError, setUserFormError] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setError("");
        const resultData = await publicApi.getResult(sessionId);
        const [shortDisclaimer, finalBlock] = await Promise.all([
          getContentSafely("shortDisclaimer", "This report is based only on your selected answers and may not always be fully accurate. For deeper clarity, please connect with experienced Sahajayogis."),
          getContentSafely("finalGuidance", "Please use this as gentle self-reflection only. Regular Sahajayoga meditation, thoughtless awareness, and connection with experienced Sahajayogis may help you observe your inner state more clearly."),
        ]);
        setResult(resultData);
        setDisclaimer(shortDisclaimer);
        setFinalGuidance(finalBlock);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Unable to load your report.");
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) loadResult();
  }, [sessionId]);

  const detailedAnswers = useMemo(() => getDetailedAnswers(result || {}), [result]);
  const chakraGraphData = useMemo(() => getChakraGraphData(result || {}), [result]);
  const nadiGraphData   = useMemo(() => getNadiGraphData(result || {}), [result]);

  const validateUserForm = () => {
    const { name, phone, email } = userForm;
    if (!name.trim() || name.trim().length < 2) return "Please enter a valid full name.";
    if (!phone.trim() || !isValidPhone(phone.trim())) return "Please enter a valid phone number.";
    if (!email.trim() || !isValidEmail(email.trim())) return "Please enter a valid email ID.";
    return "";
  };

  const openGuidanceFlow = () => {
    setUserFormError("");
    setUserForm({ name: result?.userInfo?.name || "", phone: result?.userInfo?.phone || "", email: result?.userInfo?.email || "" });
    setShowUserForm(true);
  };

  const handleSaveUserInfo = async () => {
    const err = validateUserForm();
    if (err) { setUserFormError(err); return; }
    try {
      setSavingUserInfo(true);
      setUserFormError("");
      const payload = { userInfo: { name: userForm.name.trim(), phone: userForm.phone.trim(), email: userForm.email.trim().toLowerCase() } };
      const response = await publicApi.updateResultUserInfo(sessionId, payload);
      setResult((prev) => ({ ...prev, userInfo: response?.userInfo || payload.userInfo, hasUserInfo: true }));
      setShowUserForm(false);
      navigate(`/result/${sessionId}/guidance`);
    } catch (e) {
      setUserFormError(e?.response?.data?.message || e?.message || "Unable to save your details. Please try again.");
    } finally {
      setSavingUserInfo(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <PageShell title="Preparing your report">
        <InjectStyles />
        <div className="sr-root" style={{ maxWidth: 540, margin: "0 auto" }}>
          <div className="sr-card" style={{ padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "linear-gradient(135deg,#FDF0E6,#FBF5E0)",
                border: "1px solid rgba(196,89,24,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#C45918",
              }}>
                <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
              </div>
              <div>
                <p className="sr-display" style={{ fontSize: "18px", fontWeight: 600, color: "#1C1209" }}>
                  Preparing report…
                </p>
                <p className="sr-body" style={{ fontSize: "13px", color: "#7A6252", marginTop: "4px" }}>
                  Generating your self-introspection summary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Error ──
  if (error || !result) {
    return (
      <PageShell title="Report not available">
        <InjectStyles />
        <div className="sr-root" style={{ maxWidth: 600, margin: "0 auto" }}>
          <div className="sr-card" style={{ padding: "28px 32px", borderTop: "3px solid #AA1F1F" }}>
            <p className="sr-body" style={{ fontSize: "14px", lineHeight: "1.75", color: "#AA1F1F" }}>
              {error || "No report was found for this session."}
            </p>
            <div style={{ marginTop: "20px" }}>
              <Link
                to="/questionnaire"
                onClick={resetAnswers}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "12px 24px", borderRadius: "999px",
                  background: "linear-gradient(135deg,#C45918,#B8922A)",
                  color: "#FFF", fontSize: "13px", fontWeight: 600,
                  textDecoration: "none", fontFamily: "'DM Sans',sans-serif",
                  boxShadow: "0 6px 20px rgba(196,89,24,0.28)",
                }}
              >
                <RotateCcw size={16} />
                Retake questionnaire
              </Link>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Action buttons ──
  const actions = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
      <button
        type="button"
        onClick={openGuidanceFlow}
        className="sr-body"
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "11px 22px", borderRadius: "999px",
          background: "linear-gradient(135deg,#C45918,#B8922A)",
          color: "#FFF", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer",
          boxShadow: "0 6px 20px rgba(196,89,24,0.28)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(196,89,24,0.36)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 6px 20px rgba(196,89,24,0.28)"; }}
      >
        View Guidance <ArrowRight size={16} />
      </button>
      <Link
        to="/questionnaire"
        onClick={resetAnswers}
        className="sr-body"
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "11px 22px", borderRadius: "999px",
          border: "1px solid rgba(196,89,24,0.25)",
          background: "#FFFFFF", color: "#C45918",
          fontSize: "13px", fontWeight: 600, textDecoration: "none",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#FDF0E6"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}
      >
        <RotateCcw size={15} /> Retake
      </Link>
    </div>
  );

  return (
    <PageShell
      title="Self Introspection Analysis"
      subtitle="A full-screen, mobile-responsive analysis report based on your selected answers."
      actions={actions}
    >
      <InjectStyles />

      <article className="sr-root" style={{
        maxWidth: 1280, margin: "0 auto",
        background: "#FEFBF3",
        borderRadius: "28px",
        border: "1px solid rgba(180,145,100,0.16)",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(120,80,30,0.10), 0 4px 16px rgba(120,80,30,0.06)",
      }}>

        {/* ── HEADER ── */}
        <header style={{
          position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg,#FDF0E6 0%,#FEFBF3 50%,#EAF5F0 100%)",
          borderBottom: "1px solid rgba(196,89,24,0.1)",
          padding: "clamp(24px,4vw,48px) clamp(20px,4vw,48px)",
        }}>
          {/* Mandala decoration */}
          <div style={{ position: "absolute", right: "-40px", top: "-40px", pointerEvents: "none" }}>
            <MandalaSVG size={280} />
          </div>

          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "28px", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ minWidth: 0, flex: "1 1 320px" }}>
              {/* Eyebrow pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "8px 16px", borderRadius: "999px",
                background: "rgba(255,255,255,0.85)", border: "1px solid rgba(196,89,24,0.2)",
                backdropFilter: "blur(8px)", marginBottom: "20px",
              }}>
                <BarChart3 size={14} style={{ color: "#C45918", flexShrink: 0 }} />
                <span className="sr-body" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C45918" }}>
                  Sahajayoga Analysis Report
                </span>
              </div>

              <h1 className="sr-display" style={{
                fontSize: "clamp(32px,5vw,58px)", fontWeight: 600,
                color: "#1C1209", lineHeight: 1.1, letterSpacing: "-0.015em",
                maxWidth: "640px",
              }}>
                Answer-Based<br />
                <em style={{ fontStyle: "italic", color: "#C45918" }}>Imbalance Analysis</em>
              </h1>

              <p className="sr-body" style={{
                fontSize: "14px", lineHeight: "1.8", color: "#7A6252",
                maxWidth: "520px", marginTop: "14px",
              }}>
                This report combines a simple summary, chakra and nadi visual graphs, and question-wise reflection. It is supportive guidance only and not a final spiritual assessment.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  padding: "7px 14px", borderRadius: "999px",
                  background: "rgba(255,255,255,0.8)", border: "1px solid rgba(196,89,24,0.18)",
                }}>
                  <ShieldCheck size={13} style={{ color: "#C45918" }} />
                  <span className="sr-body" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C45918" }}>
                    Supportive reflection
                  </span>
                </span>
              </div>
            </div>

            {/* Meta panel */}
            <div style={{
              background: "rgba(255,255,255,0.88)", border: "1px solid rgba(180,145,100,0.18)",
              borderRadius: "18px", padding: "20px 24px", minWidth: "200px",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 20px rgba(120,80,30,0.08)",
              flex: "0 1 260px",
            }}>
              {[
                ["Clarity", result.confidence || "—"],
                ["Chakras", `${chakraGraphData.length} areas`],
                ["Nadis", `${nadiGraphData.length} channels`],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: "grid", gridTemplateColumns: "80px 1fr",
                  gap: "8px", borderBottom: "1px solid rgba(180,145,100,0.12)",
                  paddingBottom: "10px", marginBottom: "10px",
                }}>
                  <p className="sr-body" style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#A89880", paddingTop: "3px" }}>
                    {label}
                  </p>
                  <p className="sr-display" style={{ fontSize: "16px", fontWeight: 600, color: "#1C1209" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── EXECUTIVE SUMMARY ── */}
        <section style={{ borderBottom: "1px solid rgba(196,89,24,0.1)", padding: "36px 28px" }}>
          <div style={{
            background: "#FFFFFF", border: "1px solid rgba(180,145,100,0.14)",
            borderRadius: "20px", padding: "24px 28px",
            boxShadow: "0 2px 16px rgba(120,80,30,0.06)",
            display: "flex", gap: "20px", alignItems: "flex-start",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: "linear-gradient(135deg,#FDF0E6,#FBF5E0)",
              border: "1px solid rgba(196,89,24,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#C45918",
            }}>
              <Layers3 size={22} />
            </div>
            <div>
              <h2 className="sr-display" style={{ fontSize: "24px", fontWeight: 600, color: "#1C1209", marginBottom: "10px" }}>
                Executive Summary
              </h2>
              <p className="sr-body" style={{ fontSize: "14px", lineHeight: "1.8", color: "#5C4C3A" }}>
                Your answers may reflect patterns connected with attention, emotions, thoughts, habits, or inner sensitivity. In Sahajayoga, these patterns are best observed calmly through meditation, vibrations, and self-awareness.
              </p>
            </div>
          </div>
        </section>

        {/* ── OVERALL ANALYSIS ── */}
        <OverallAnalysisPanel result={result} chakraData={chakraGraphData} nadiData={nadiGraphData} />

        {/* ── GRAPHS ── */}
        <BalanceGraph
          eyebrow="Visual overview"
          title="Chakra Balance Graph"
          subtitle="This graph gives a simple visual overview of possible chakra attention areas based on your selected answers. Higher bars mean that area may need more gentle observation."
          data={chakraGraphData}
          number="02"
        />

        <BalanceGraph
          eyebrow="Channel overview"
          title="Nadi Balance Graph"
          subtitle="This graph shows whether your answers lean more toward left channel, right channel, or center channel patterns."
          data={nadiGraphData}
          number="02b"
        />

        {/* ── TOP AREAS ── */}
        <TopAttentionAreas chakraData={chakraGraphData} nadiData={nadiGraphData} />

        {/* ── SIMPLE MEANING ── */}
        <OrnamentDivider label="✦" />
        <section style={{ padding: "36px 28px", borderBottom: "1px solid rgba(196,89,24,0.1)" }}>
          <div style={{
            borderRadius: "20px", overflow: "hidden",
            background: "linear-gradient(135deg,#FDF0E6 0%,#FEFBF3 60%,#EAF5F0 100%)",
            border: "1px solid rgba(196,89,24,0.15)",
            padding: "28px",
          }}>
            <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: "#FFFFFF", border: "1px solid rgba(196,89,24,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#C45918", boxShadow: "0 2px 8px rgba(196,89,24,0.10)",
              }}>
                <Sparkles size={22} />
              </div>
              <div>
                <h2 className="sr-display" style={{ fontSize: "clamp(20px,2.5vw,28px)", fontWeight: 600, color: "#1C1209", marginBottom: "10px" }}>
                  What this means in simple words
                </h2>
                <p className="sr-body" style={{ fontSize: "14px", lineHeight: "1.8", color: "#5C4C3A" }}>
                  Your answers may show where your attention, emotions, thoughts, or energy are currently asking for gentle observation. This does not mean anything is wrong. It only gives you a direction for meditation, self-awareness, and practical Sahajayoga guidance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── GRAPH EXPLANATIONS ── */}
        <section style={{ padding: "36px 28px", borderBottom: "1px solid rgba(196,89,24,0.1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px" }}>
            <GraphExplanation
              title="Understanding the Chakra Graph"
              points={[
                "Good or Balanced means your selected answers did not strongly point toward that chakra area.",
                "Mild Attention means there may be a light pattern to observe gently during meditation.",
                "Need to Work means multiple answers may be pointing toward that chakra area.",
                "Strong Attention means this area appeared more strongly in your answer pattern.",
                "This graph is supportive reflection only, not a final spiritual diagnosis.",
              ]}
            />
            <GraphExplanation
              title="Understanding the Nadi Graph"
              points={[
                "Left channel tendency may reflect emotional heaviness, past-oriented attention, or low energy.",
                "Right channel tendency may reflect overactivity, too much planning, heat, or mental pressure.",
                "Center channel balance may reflect steadiness, present attention, and meditation depth.",
                "A higher bar does not mean something is wrong. It only shows where your selected answers created more signal.",
                "For deeper clarity, observe vibrations during meditation and connect with experienced Sahajayogis.",
              ]}
            />
          </div>
        </section>

        {/* ── REFLECTION ── */}
        <section style={{ padding: "36px 28px" }}>
          <SectionHeader
            eyebrow="Question-wise report"
            title="Selected Answers & Reflection"
            number="04"
          />

          {detailedAnswers.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "14px" }}>
              {detailedAnswers.map((answer, index) => (
                <ReflectionItem
                  key={answer._id || answer.questionId || index}
                  answer={answer}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="sr-body" style={{
              borderRadius: "14px", border: "1px solid rgba(21,154,82,0.2)",
              background: "#EDFAF3", padding: "18px 22px",
              display: "flex", gap: "12px", alignItems: "flex-start",
            }}>
              <CheckCircle2 size={20} style={{ color: "#1A7A4A", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="sr-display" style={{ fontSize: "18px", fontWeight: 600, color: "#1C1209", marginBottom: "6px" }}>
                  Detailed reflection is not available
                </p>
                <p style={{ fontSize: "13px", lineHeight: "1.7", color: "#5C4C3A" }}>
                  Your report was generated successfully, but the server did not return question-wise answer details yet.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── FOOTER PANELS ── */}
        <OrnamentDivider label="✦ ✦ ✦" />
        <section style={{
          borderTop: "1px solid rgba(196,89,24,0.1)",
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: "20px", padding: "36px 28px",
        }}>
          <div className="sr-card" style={{ padding: "24px 26px" }}>
            <h2 className="sr-display" style={{ fontSize: "22px", fontWeight: 600, color: "#1C1209", marginBottom: "10px" }}>
              Meditation Support
            </h2>
            <p className="sr-body" style={{ fontSize: "13px", lineHeight: "1.8", color: "#5C4C3A" }}>
              Sahajayoga meditation may support deeper awareness through silence, thoughtless attention, and vibration-based observation.
            </p>
          </div>

          <div style={{
            borderRadius: "20px", border: "1px solid rgba(196,89,24,0.18)",
            background: "linear-gradient(135deg,#FDF0E6,#FBF5E0)",
            padding: "24px 26px",
          }}>
            <h2 className="sr-display" style={{ fontSize: "22px", fontWeight: 600, color: "#1C1209", marginBottom: "10px" }}>
              Next Step
            </h2>
            <p className="sr-body" style={{ fontSize: "13px", lineHeight: "1.8", color: "#5C4C3A", marginBottom: "16px" }}>
              Continue to the guidance page to view practical remedies and mantra suggestions based on this result.
            </p>
            <button
              type="button"
              onClick={openGuidanceFlow}
              className="sr-body"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "11px 22px", borderRadius: "999px",
                background: "linear-gradient(135deg,#C45918,#B8922A)",
                color: "#FFF", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: "pointer",
                boxShadow: "0 6px 20px rgba(196,89,24,0.28)",
                transition: "transform 0.25s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
            >
              View Guidance <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* ── FINAL NOTE ── */}
        <section style={{ borderTop: "1px solid rgba(196,89,24,0.1)", padding: "28px 28px 10px" }}>
          <h2 className="sr-display" style={{ fontSize: "22px", fontWeight: 600, color: "#1C1209", marginBottom: "10px" }}>
            Final Note
          </h2>
          <p className="sr-body" style={{ fontSize: "13px", lineHeight: "1.8", color: "#5C4C3A" }}>
            {finalGuidance}
          </p>
        </section>

        <div style={{ padding: "0 28px 28px" }}>
          <DisclaimerBox short content={disclaimer} />
        </div>
      </article>

      {/* ── USER FORM MODAL ── */}
      {showUserForm && (
        <div className="sr-modal-backdrop" style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "rgba(28,18,9,0.65)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}
          onClick={(e) => { if (e.target === e.currentTarget && !savingUserInfo) { setShowUserForm(false); setUserFormError(""); } }}
        >
          <div
            className="sr-modal-drawer sr-root"
            style={{
              width: "100%", maxWidth: "560px",
              background: "#FEFBF3",
              borderRadius: "28px 28px 0 0",
              boxShadow: "0 -24px 80px rgba(28,18,9,0.2)",
              display: "flex", flexDirection: "column",
              maxHeight: "92dvh", overflow: "hidden",
              margin: "0 auto",
            }}
          >
            {/* Modal Header */}
            <div style={{
              position: "relative",
              background: "linear-gradient(135deg,#FDF0E6 0%,#FEFBF3 100%)",
              borderBottom: "1px solid rgba(196,89,24,0.1)",
              padding: "24px 24px 20px",
              flexShrink: 0,
            }}>
              <button
                type="button"
                disabled={savingUserInfo}
                onClick={() => { setShowUserForm(false); setUserFormError(""); }}
                style={{
                  position: "absolute", top: "16px", right: "16px",
                  width: 38, height: 38, borderRadius: "50%",
                  background: "#FFFFFF", border: "1px solid rgba(180,145,100,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#7A6252", cursor: "pointer", boxShadow: "0 2px 8px rgba(120,80,30,0.08)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#F5EEE4"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}
              >
                <X size={17} />
              </button>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                padding: "6px 14px", borderRadius: "999px",
                background: "#FFFFFF", border: "1px solid rgba(196,89,24,0.18)",
                marginBottom: "14px",
              }}>
                <ClipboardList size={13} style={{ color: "#C45918" }} />
                <span className="sr-body" style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C45918" }}>
                  Before Guidance Page
                </span>
              </div>

              <h2 className="sr-display" style={{ fontSize: "26px", fontWeight: 600, color: "#1C1209", paddingRight: "40px" }}>
                Please fill your details
              </h2>
              <p className="sr-body" style={{ fontSize: "13px", lineHeight: "1.7", color: "#7A6252", marginTop: "6px" }}>
                Your report is ready. Share your details before opening the remedies and mantras guidance page.
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {userFormError && (
                <div className="sr-body" style={{
                  marginBottom: "14px", borderRadius: "12px",
                  border: "1px solid rgba(170,31,31,0.22)", background: "#FDF0EE",
                  padding: "12px 16px", fontSize: "13px", lineHeight: "1.6", color: "#AA1F1F",
                }}>
                  {userFormError}
                </div>
              )}

              <form
                id="guidance-user-details-form"
                onSubmit={(e) => { e.preventDefault(); handleSaveUserInfo(); }}
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                {[
                  { key: "name", label: "Full Name", type: "text", icon: UserRound, placeholder: "Enter your full name", inputMode: "text" },
                  { key: "phone", label: "Phone Number", type: "tel", icon: Phone, placeholder: "Enter your phone number", inputMode: "tel" },
                  { key: "email", label: "Email ID", type: "email", icon: Mail, placeholder: "Enter your email ID", inputMode: "email" },
                ].map(({ key, label, type, icon: Icon, placeholder, inputMode }) => (
                  <div key={key}>
                    <label className="sr-body" style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#3C2A1A", marginBottom: "8px" }}>
                      {label}
                    </label>
                    <div style={{ position: "relative" }}>
                      <Icon size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#A89880", pointerEvents: "none" }} />
                      <input
                        type={type}
                        inputMode={inputMode}
                        value={userForm[key]}
                        onChange={(e) => { setUserForm((p) => ({ ...p, [key]: e.target.value })); setUserFormError(""); }}
                        required
                        placeholder={placeholder}
                        className="sr-input sr-body"
                        style={{
                          width: "100%", height: "46px", paddingLeft: "42px", paddingRight: "14px",
                          borderRadius: "12px", border: "1px solid rgba(180,145,100,0.25)",
                          background: "#FFFFFF", fontSize: "14px", color: "#1C1209",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div className="sr-body" style={{
                  display: "flex", gap: "10px", padding: "12px 16px",
                  borderRadius: "12px", background: "#FDF0E6",
                  border: "1px solid rgba(196,89,24,0.18)",
                  fontSize: "12px", lineHeight: "1.7", color: "#7A3C10",
                }}>
                  <CircleDot size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p>Your details are used only for Sahajayoga follow-up guidance and are not shown publicly. The report remains supportive guidance, not a final spiritual assessment.</p>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div style={{
              borderTop: "1px solid rgba(196,89,24,0.1)",
              background: "#FFFFFF", padding: "14px 24px 20px",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
              flexShrink: 0,
            }}>
              <button
                type="button"
                disabled={savingUserInfo}
                onClick={() => { setShowUserForm(false); setUserFormError(""); }}
                className="sr-body"
                style={{
                  minHeight: 46, borderRadius: "999px", fontWeight: 600, fontSize: "14px",
                  border: "1px solid rgba(196,89,24,0.25)", background: "#FFFFFF",
                  color: "#C45918", cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#FDF0E6"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}
              >
                Back
              </button>

              <button
                type="submit"
                form="guidance-user-details-form"
                disabled={savingUserInfo}
                className="sr-body"
                style={{
                  minHeight: 46, borderRadius: "999px", fontWeight: 600, fontSize: "14px",
                  border: "none", cursor: savingUserInfo ? "not-allowed" : "pointer",
                  background: "linear-gradient(135deg,#1B6B52,#C45918)",
                  color: "#FFFFFF", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "8px",
                  boxShadow: "0 6px 20px rgba(27,107,82,0.25)",
                  opacity: savingUserInfo ? 0.7 : 1,
                  transition: "transform 0.25s ease, opacity 0.2s",
                }}
                onMouseEnter={(e) => { if (!savingUserInfo) e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
              >
                {savingUserInfo ? (
                  <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
                ) : (
                  <>Continue <ArrowRight size={17} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}