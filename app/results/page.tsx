"use client"

import { useEffect, useState } from "react"
import { WaveBackground } from "@/components/common/Wave-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// ─── Types ────────────────────────────────────────────────────────────────────
type WHOGrade = {
  grade: number
  label: string
  colorClass: string
  borderClass: string
  bgClass: string
}

type RiskInfo = {
  label: string
  colorClass: string
  bgClass: string
  borderClass: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getWHOGrade = (db: number): WHOGrade => {
  const n = parseFloat(String(db))
  if (n <= 25) return { grade: 0, label: "Normal",        colorClass: "text-green-600",  bgClass: "bg-green-500/10",  borderClass: "border-green-500/20"  }
  if (n <= 40) return { grade: 1, label: "Mild Loss",     colorClass: "text-yellow-600", bgClass: "bg-yellow-500/10", borderClass: "border-yellow-500/20" }
  if (n <= 60) return { grade: 2, label: "Moderate Loss", colorClass: "text-orange-600", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" }
  if (n <= 80) return { grade: 3, label: "Severe Loss",   colorClass: "text-red-600",    bgClass: "bg-red-500/10",    borderClass: "border-red-500/30"    }
  return              { grade: 4, label: "Profound Loss", colorClass: "text-red-800",    bgClass: "bg-red-900/20",    borderClass: "border-red-800/40"    }
}

const RISK_MAP: Record<string, RiskInfo> = {
  GREEN:  { label: "Low Risk",      colorClass: "text-green-600",  bgClass: "bg-green-500/10",  borderClass: "border-green-500/20"  },
  YELLOW: { label: "Moderate Risk", colorClass: "text-yellow-600", bgClass: "bg-yellow-500/10", borderClass: "border-yellow-500/20" },
  ORANGE: { label: "Elevated Risk", colorClass: "text-orange-600", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
  RED:    { label: "High Risk",     colorClass: "text-red-600",    bgClass: "bg-red-500/10",    borderClass: "border-red-500/30"    },
}

const RECOMMENDATIONS: Record<string, string[]> = {
  GREEN: [
    "Your hearing is within normal limits — excellent result!",
    "Retest every 6–12 months to track any changes over time.",
    "Use hearing protection (earplugs) at concerts or loud environments.",
    "Follow the 60/60 rule: max 60% volume for max 60 minutes at a time.",
    "Cardiovascular health is closely linked to hearing — stay active.",
  ],
  YELLOW: [
    "Mild changes detected — early action can prevent further loss.",
    "Reduce daily headphone usage to under 1 hour at moderate volume.",
    "Schedule a professional audiogram with a licensed audiologist within 3 months.",
    "Avoid occupational noise without certified hearing protection (NRR 25+).",
    "Monitor your hearing quarterly with this test.",
  ],
  ORANGE: [
    "Moderate hearing loss detected — professional evaluation is strongly advised.",
    "Schedule an ENT or audiologist appointment as soon as possible.",
    "Avoid all loud environments without proper hearing protection.",
    "Consider communication strategies: face-to-face conversation, captioned calls.",
    "Discuss hearing aid assessment with your audiologist if loss is confirmed.",
  ],
  RED: [
    "Significant hearing loss detected — immediate consultation is essential.",
    "Visit an ENT specialist or audiologist urgently — do not delay.",
    "A full clinical evaluation including bone conduction testing is recommended.",
    "Hearing aids or assistive listening devices may significantly improve quality of life.",
    "Discuss potential medical or surgical options with your specialist.",
  ],
}

const FREQ_LABELS = ["250", "500", "1k", "2k", "3k", "4k", "6k", "8k"]
const FREQUENCIES  = [250, 500, 1000, 2000, 3000, 4000, 6000, 8000]

// ─── Audiogram SVG ────────────────────────────────────────────────────────────
function Audiogram({
  leftThresholds,
  rightThresholds,
}: {
  leftThresholds: number[]
  rightThresholds: number[]
}) {
  const W = 560, H = 280
  const PAD = { top: 24, right: 24, bottom: 44, left: 56 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const DB_MIN = 0, DB_MAX = 100
  const N = FREQUENCIES.length

  const xOf = (i: number) => PAD.left + (i / (N - 1)) * plotW
  const yOf = (db: number) => PAD.top + ((db - DB_MIN) / (DB_MAX - DB_MIN)) * plotH

  const makePath = (pts: number[]) =>
    pts.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ")

  const gridDBs = [0, 25, 40, 60, 80, 100]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(34,197,94)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="rgb(34,197,94)" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Normal zone shading */}
      <rect
        x={PAD.left} y={yOf(0)}
        width={plotW} height={yOf(25) - yOf(0)}
        fill="url(#normalGrad)"
      />
      <text x={PAD.left + 6} y={yOf(12)} fill="rgb(22,163,74)" fontSize="9" opacity="0.8">
        Normal zone (≤25 dB)
      </text>

      {/* Horizontal grid */}
      {gridDBs.map(db => (
        <g key={db}>
          <line
            x1={PAD.left} y1={yOf(db)} x2={W - PAD.right} y2={yOf(db)}
            stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"
            strokeDasharray={db === 0 || db === 100 ? "0" : "4 4"}
          />
          <text x={PAD.left - 8} y={yOf(db) + 4} textAnchor="end"
            fill="currentColor" fillOpacity="0.4" fontSize="10">{db}</text>
        </g>
      ))}

      {/* Vertical grid + labels */}
      {FREQ_LABELS.map((lbl, i) => (
        <g key={i}>
          <line
            x1={xOf(i)} y1={PAD.top} x2={xOf(i)} y2={H - PAD.bottom}
            stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"
          />
          <text x={xOf(i)} y={H - PAD.bottom + 16} textAnchor="middle"
            fill="currentColor" fillOpacity="0.5" fontSize="10">{lbl}</text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={W / 2} y={H - 2} textAnchor="middle"
        fill="currentColor" fillOpacity="0.4" fontSize="9">Frequency (Hz)</text>
      <text x={10} y={PAD.top + plotH / 2} textAnchor="middle"
        fill="currentColor" fillOpacity="0.4" fontSize="9"
        transform={`rotate(-90, 10, ${PAD.top + plotH / 2})`}>dB HL</text>

      {/* Right ear line (purple, dashed, × marks) */}
      {rightThresholds.length >= 2 && (
        <path d={makePath(rightThresholds)}
          fill="none" stroke="rgb(168,85,247)" strokeWidth="2.5"
          strokeDasharray="6 3" opacity="0.85" strokeLinecap="round" />
      )}
      {rightThresholds.map((v, i) => (
        <text key={i} x={xOf(i)} y={yOf(v) + 5} textAnchor="middle"
          fill="rgb(168,85,247)" fontSize="16" fontWeight="bold">×</text>
      ))}

      {/* Left ear line (blue, solid, ○ marks) */}
      {leftThresholds.length >= 2 && (
        <path d={makePath(leftThresholds)}
          fill="none" stroke="rgb(59,130,246)" strokeWidth="2.5"
          opacity="0.9" strokeLinecap="round" />
      )}
      {leftThresholds.map((v, i) => (
        <circle key={i} cx={xOf(i)} cy={yOf(v)} r={6}
          fill="none" stroke="rgb(59,130,246)" strokeWidth="2.5" />
      ))}
    </svg>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("analysisResult")
    if (stored) setData(JSON.parse(stored))
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <WaveBackground />
        <p className="text-muted-foreground relative z-10">Loading results…</p>
      </div>
    )
  }

  // ─── Derived values ────────────────────────────────────────────────────────
  const leftT  = (data.left_thresholds  as number[]) || []
  const rightT = (data.right_thresholds as number[]) || []

  const ptaLeft  = parseFloat(data.pta_left  ?? String([1,2,3].reduce((s,i) => s + (leftT[i]  ?? 0), 0) / 3))
  const ptaRight = parseFloat(data.pta_right ?? String([1,2,3].reduce((s,i) => s + (rightT[i] ?? 0), 0) / 3))

  const whoLeft  = (data.who_grade_left  as WHOGrade) || getWHOGrade(ptaLeft)
  const whoRight = (data.who_grade_right as WHOGrade) || getWHOGrade(ptaRight)

  const riskLevel = (data.risk || data.risk_level || "GREEN") as string
  const risk = RISK_MAP[riskLevel] || RISK_MAP.GREEN

  const score = data.overall_score ?? Math.max(0, Math.round(100 - (ptaLeft + ptaRight) / 2))
  const testDate = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })

  const showSpecialist = riskLevel === "ORANGE" || riskLevel === "RED" || whoLeft.grade >= 2 || whoRight.grade >= 2

  return (
    <div className="min-h-screen">
      <WaveBackground />
      <div className="relative z-10 max-w-4xl mx-auto p-6">

        {/* ── Header ── */}
        <div className="text-center mb-10 mt-10">
          <h1 className="text-4xl font-bold mb-2">Your Audiometry Report</h1>
          <p className="text-muted-foreground">
            Pure Tone Audiometry (PTA) · Generated {testDate}
          </p>
        </div>

        {/* ── Score + WHO Cards ── */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Hearing Score */}
          <Card className="p-6 text-center flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40"
                  fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="10" />
                <circle cx="50" cy="50" r="40"
                  fill="none"
                  stroke={score >= 75 ? "rgb(34,197,94)" : score >= 50 ? "rgb(234,179,8)" : score >= 25 ? "rgb(249,115,22)" : "rgb(239,68,68)"}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 251.2} 251.2`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{score}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Hearing Score</p>
          </Card>

          {/* Left Ear WHO */}
          <Card className={`p-6 border ${whoLeft.borderClass} ${whoLeft.bgClass}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-blue-500">hearing</span>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Left Ear · PTA
              </p>
            </div>
            <p className={`text-4xl font-bold ${whoLeft.colorClass} mb-1`}>
              {ptaLeft.toFixed(0)} <span className="text-xl font-normal">dB</span>
            </p>
            <p className={`font-semibold ${whoLeft.colorClass}`}>{whoLeft.label}</p>
            <p className="text-xs text-muted-foreground mt-1">WHO Grade {whoLeft.grade}</p>
          </Card>

          {/* Right Ear WHO */}
          <Card className={`p-6 border ${whoRight.borderClass} ${whoRight.bgClass}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-purple-500">hearing</span>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Right Ear · PTA
              </p>
            </div>
            <p className={`text-4xl font-bold ${whoRight.colorClass} mb-1`}>
              {ptaRight.toFixed(0)} <span className="text-xl font-normal">dB</span>
            </p>
            <p className={`font-semibold ${whoRight.colorClass}`}>{whoRight.label}</p>
            <p className="text-xs text-muted-foreground mt-1">WHO Grade {whoRight.grade}</p>
          </Card>
        </div>

        {/* ── Audiogram ── */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Pure Tone Audiogram</h2>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-sm text-blue-500">
                <svg width="28" height="14">
                  <line x1="0" y1="7" x2="28" y2="7" stroke="rgb(59,130,246)" strokeWidth="2.5"/>
                  <circle cx="14" cy="7" r="5" fill="none" stroke="rgb(59,130,246)" strokeWidth="2.5"/>
                </svg>
                Left Ear
              </span>
              <span className="flex items-center gap-2 text-sm text-purple-500">
                <svg width="28" height="14">
                  <line x1="0" y1="7" x2="28" y2="7" stroke="rgb(168,85,247)" strokeWidth="2.5" strokeDasharray="5 3"/>
                  <text x="14" y="12" textAnchor="middle" fill="rgb(168,85,247)" fontSize="14" fontWeight="bold">×</text>
                </svg>
                Right Ear
              </span>
            </div>
          </div>
          <Audiogram leftThresholds={leftT} rightThresholds={rightT} />
        </Card>

        {/* ── Threshold Table ── */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Hearing Thresholds by Frequency</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Ear</th>
                  {FREQ_LABELS.map(f => (
                    <th key={f} className="text-center py-2 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                      {f} Hz
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([["Left", leftT, "text-blue-500"], ["Right", rightT, "text-purple-500"]] as const).map(([ear, vals, earColor]) => (
                  <tr key={ear} className="border-b border-border/50">
                    <td className={`py-3 px-3 font-semibold ${earColor}`}>{ear}</td>
                    {FREQ_LABELS.map((_, i) => {
                      const v = (vals as number[])[i]
                      const g = v != null ? getWHOGrade(v) : null
                      return (
                        <td key={i} className={`py-3 px-3 text-center font-medium ${g ? g.colorClass : "text-muted-foreground"}`}>
                          {v != null ? `${v} dB` : "—"}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── AI Clinical Metrics (if from backend) ── */}
        {(data.cli != null || data.hf_shift_index != null) && (
          <Card className="p-6 mb-6 border border-primary/20 bg-primary/5">
            <h2 className="text-2xl font-semibold mb-4">AI Clinical Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["Risk Level",           data.risk || riskLevel, risk.colorClass],
                ["Cochlear Load Index",  data.cli,               "text-blue-500" ],
                ["High Frequency Shift", data.hf_shift_index,    "text-purple-500"],
                ["EHFA Mean",            data.ehfa_mean,         "text-primary"  ],
              ].filter(([, v]) => v != null).map(([label, val, color]) => (
                <div key={String(label)} className="p-4 rounded-lg bg-background/60 border border-border">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  <p className={`text-xl font-bold ${color}`}>{val}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── WHO Reference Scale ── */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">WHO Hearing Classification</h2>
          <div className="space-y-2">
            {[
              { grade: 0, range: "0–25 dB",  label: "Normal",        colorClass: "text-green-600",  bgClass: "bg-green-500/10",  borderClass: "border-green-500/20"  },
              { grade: 1, range: "26–40 dB", label: "Mild Loss",     colorClass: "text-yellow-600", bgClass: "bg-yellow-500/10", borderClass: "border-yellow-500/20" },
              { grade: 2, range: "41–60 dB", label: "Moderate Loss", colorClass: "text-orange-600", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
              { grade: 3, range: "61–80 dB", label: "Severe Loss",   colorClass: "text-red-600",    bgClass: "bg-red-500/10",    borderClass: "border-red-500/30"    },
              { grade: 4, range: "81+ dB",   label: "Profound Loss", colorClass: "text-red-800",    bgClass: "bg-red-900/20",    borderClass: "border-red-800/40"    },
            ].map(row => {
              const isLeft  = whoLeft.grade  === row.grade
              const isRight = whoRight.grade === row.grade
              const active  = isLeft || isRight
              return (
                <div
                  key={row.grade}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                    active ? `${row.bgClass} ${row.borderClass}` : "border-transparent"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${row.colorClass.replace("text-", "bg-")}`} />
                  <span className={`font-bold text-sm ${row.colorClass} w-8`}>G{row.grade}</span>
                  <span className="text-muted-foreground text-sm w-24">{row.range}</span>
                  <span className="text-sm flex-1">{row.label}</span>
                  <div className="flex gap-2">
                    {isLeft  && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-medium">L</span>}
                    {isRight && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 font-medium">R</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* ── Recommendations ── */}
        <Card className={`p-6 mb-6 border ${risk.borderClass} ${risk.bgClass}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-background/60`}>
              <span className={`material-symbols-outlined ${risk.colorClass}`}>
                {riskLevel === "GREEN" ? "check_circle" : riskLevel === "RED" ? "emergency" : "warning"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{risk.label}</h2>
              <p className="text-sm text-muted-foreground">Personalised Recommendations</p>
            </div>
          </div>
          <ul className="space-y-3">
            {RECOMMENDATIONS[riskLevel]?.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="material-symbols-outlined text-base mt-0.5 text-muted-foreground flex-shrink-0">arrow_right</span>
                {rec}
              </li>
            ))}
          </ul>
        </Card>

        {/* ── Find Specialist ── */}
        {showSpecialist && (
          <Card className="p-6 mb-6 border-2 border-orange-200 bg-orange-500/5">
            <div className="flex items-start gap-3 mb-4">
              <span className="material-symbols-outlined text-orange-500 flex-shrink-0">local_hospital</span>
              <div>
                <h2 className="text-xl font-semibold mb-1">Consult a Specialist</h2>
                <p className="text-sm text-muted-foreground">
                  Based on your results, we recommend consulting a qualified audiologist or ENT specialist.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => window.open("https://www.google.com/maps/search/audiologist+near+me", "_blank")}
              >
                <span className="material-symbols-outlined text-base mr-2">search</span>
                Find Audiologist
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("https://www.google.com/maps/search/ENT+doctor+near+me", "_blank")}
              >
                <span className="material-symbols-outlined text-base mr-2">local_hospital</span>
                Find ENT Doctor
              </Button>
            </div>
          </Card>
        )}

        {/* ── Medical Disclaimer ── */}
        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-8 flex gap-3">
          <span className="material-symbols-outlined text-orange-500 flex-shrink-0">info</span>
          <p className="text-sm text-orange-700">
            <strong>Medical Disclaimer:</strong> This is a screening tool only and does not constitute a clinical
            diagnosis. Please consult a licensed audiologist or ENT specialist for a comprehensive evaluation.
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <Button className="w-full" onClick={() => window.print()}>
            <span className="material-symbols-outlined text-base mr-2">download</span>
            Download PDF Report
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push("/test")}>
            <span className="material-symbols-outlined text-base mr-2">refresh</span>
            Retake Test
          </Button>
        </div>

      </div>
    </div>
  )
}