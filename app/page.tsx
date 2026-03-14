"use client";

import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
type Step = "send" | "analyzing" | "risk" | "verify" | "blocked" | "sent";

interface FraudResult {
  fraud_risk_score: number;
  risk_level: string;
  explanation: string;
  signals: string[];
  recommendation: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (score: number) =>
  score >= 70 ? "#e53e3e" : score >= 40 ? "#dd6b20" : "#48bb78";

const scoreLabel = (score: number) =>
  score >= 70 ? "High Risk" : score >= 40 ? "Medium Risk" : "Low Risk";

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep] = useState<Step>("send");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FraudResult | null>(null);
  const [contactResponse, setContactResponse] = useState<string | null>(null);
  const [scoreAnimated, setScoreAnimated] = useState(false);

  // Transaction details (hardcoded for POC)
  const tx = {
    amount: "5,000",
    amountNum: 5000,
    recipient: "Marcus (Son)",
    isNewContact: true,
    message: "School penalty fee — pay today or expelled",
    userHistory: "usually sends <$300, mostly to grocery and utility vendors",
  };

  const handleSend = async () => {
    setLoading(true);
    setStep("analyzing");

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: tx.amountNum,
        recipient: tx.recipient,
        message: tx.message,
        isNewContact: tx.isNewContact,
        userHistory: tx.userHistory,
      }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
    setScoreAnimated(false);
    setStep("risk");
    setTimeout(() => setScoreAnimated(true), 100);
  };

  const handleVerify = () => setStep("verify");

  const handleContactChoice = (choice: string) => {
    setContactResponse(choice);
    if (choice === "scam") {
      setTimeout(() => setStep("blocked"), 600);
    } else if (choice === "legit") {
      setTimeout(() => setStep("sent"), 600);
    }
  };

  const reset = () => {
    setStep("send");
    setResult(null);
    setContactResponse(null);
    setScoreAnimated(false);
  };

  // ── Views ───────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 16px 32px",
      }}
    >
      {/* Header */}
      <header
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "20px 0 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid #e2e8f0",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            background: "#00a850",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          🏦
        </div>
        <div>
          <div
            style={{ fontWeight: 700, fontSize: 16, color: "#1a202c", lineHeight: 1.2 }}
          >
            TD NorthStar
          </div>
          <div style={{ fontSize: 12, color: "#718096" }}>
            AI Fraud Protection
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            background: "#e6f7ee",
            color: "#00a850",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 99,
            border: "1px solid #b2dfcc",
          }}
        >
          🛡️ AI ACTIVE
        </div>
      </header>

      {/* Content */}
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* ── STEP 1: Send Money ─── */}
        {step === "send" && <SendStep tx={tx} onSend={handleSend} />}

        {/* ── STEP 2: Analyzing ─── */}
        {step === "analyzing" && <AnalyzingStep />}

        {/* ── STEP 3: Risk Result ─── */}
        {step === "risk" && result && (
          <RiskStep
            result={result}
            tx={tx}
            scoreAnimated={scoreAnimated}
            onVerify={handleVerify}
            onProceed={() => setStep("sent")}
          />
        )}

        {/* ── STEP 4: Verify Contact ─── */}
        {step === "verify" && result && (
          <VerifyStep
            tx={tx}
            contactResponse={contactResponse}
            onChoice={handleContactChoice}
          />
        )}

        {/* ── STEP 5: Blocked ─── */}
        {step === "blocked" && <BlockedStep onReset={reset} />}

        {/* ── STEP 5b: Sent ─── */}
        {step === "sent" && <SentStep tx={tx} onReset={reset} />}
      </div>
    </div>
  );
}

// ── Sub-Components ────────────────────────────────────────────────────────────

function SendStep({
  tx,
  onSend,
}: {
  tx: { amount: string; recipient: string; isNewContact: boolean; message: string };
  onSend: () => void;
}) {
  return (
    <div className="animate-slide-up">
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 20,
          color: "#1a202c",
        }}
      >
        Send Money
      </h1>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        {/* Recipient */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{ fontSize: 12, fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Recipient
          </label>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              background: "#f7f8fa",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              S
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{tx.recipient}</div>
              <div
                style={{
                  fontSize: 12,
                  color: "#e53e3e",
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                ⚡ NEW CONTACT · Never sent before
              </div>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{ fontSize: 12, fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Amount
          </label>
          <div
            style={{
              marginTop: 8,
              padding: "16px",
              background: "#f7f8fa",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 28,
              fontWeight: 800,
              color: "#1a202c",
            }}
          >
            ${tx.amount}
          </div>
        </div>

        {/* Message */}
        <div>
          <label
            style={{ fontSize: 12, fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Message
          </label>
          <div
            style={{
              marginTop: 8,
              padding: "14px 16px",
              background: "#f7f8fa",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 15,
              color: "#4a5568",
              fontStyle: "italic",
            }}
          >
            &ldquo;{tx.message}&rdquo;
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={onSend}>
        Send $5,000
      </button>

      <div
        style={{
          marginTop: 12,
          textAlign: "center",
          fontSize: 12,
          color: "#718096",
        }}
      >
        🛡️ TD NorthStar AI will review this transaction
      </div>
    </div>
  );
}

function AnalyzingStep() {
  return (
    <div
      className="animate-fade-in"
      style={{ textAlign: "center", padding: "60px 0" }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          margin: "0 auto 24px",
          background: "#00a850",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          position: "relative",
        }}
      >
        🤖
        <div
          style={{
            position: "absolute",
            inset: -8,
            border: "3px solid #00a85044",
            borderRadius: "50%",
            animation: "pulse-ring 1.5s ease-out infinite",
          }}
        />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#1a202c" }}>
        AI Analyzing Transaction...
      </div>
      <div style={{ fontSize: 14, color: "#718096", marginBottom: 32 }}>
        Checking for fraud signals
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          "🔍 Scanning recipient history",
          "📊 Comparing transaction patterns",
          "⚡ Detecting urgency signals",
        ].map((text, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: 44,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              fontSize: 14,
              color: "#4a5568",
              fontWeight: 500,
              background: "linear-gradient(90deg, #e2e8f0 25%, #eef2f7 50%, #e2e8f0 75%)",
              backgroundSize: "200% 100%",
              animation: `shimmer 1.5s ${i * 0.3}s infinite`,
            }}
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskStep({
  result,
  tx,
  scoreAnimated,
  onVerify,
  onProceed,
}: {
  result: FraudResult;
  tx: { amount: string; recipient: string };
  scoreAnimated: boolean;
  onVerify: () => void;
  onProceed: () => void;
}) {
  const score = result.fraud_risk_score;
  const color = scoreColor(score);
  const isHigh = score >= 70;

  return (
    <div className="animate-slide-up">
      {/* Alert banner */}
      <div
        style={{
          background: isHigh ? "#e53e3e" : "#dd6b20",
          color: "white",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 36, flexShrink: 0 }}>
          {isHigh ? "⚠️" : "🔔"}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>
            {isHigh ? "Transaction Risk Detected" : "Review Recommended"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
            AI flagged your ${tx.amount} transfer to {tx.recipient}
          </div>
        </div>
      </div>

      {/* Score card */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#718096",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            AI Fraud Risk Score
          </div>
          <div
            className={scoreAnimated ? "animate-score" : ""}
            style={{
              fontSize: 64,
              fontWeight: 900,
              color,
              lineHeight: 1,
              opacity: scoreAnimated ? 1 : 0,
            }}
          >
            {score}
            <span style={{ fontSize: 28, fontWeight: 600 }}>%</span>
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: 8,
              padding: "4px 14px",
              borderRadius: 99,
              background: color + "22",
              color,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {scoreLabel(score)}
          </div>
        </div>

        {/* Meter */}
        <div style={{ marginBottom: 8 }}>
          <div className="risk-meter-track">
            <div
              className="risk-meter-needle"
              style={{ left: scoreAnimated ? `${score}%` : "0%" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              fontSize: 11,
              color: "#718096",
            }}
          >
            <span>Safe</span>
            <span>Suspicious</span>
            <span>Dangerous</span>
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 18 }}>🤖</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Why AI flagged this</span>
        </div>

        <p style={{ fontSize: 14, color: "#4a5568", lineHeight: 1.6, marginBottom: 16 }}>
          {result.explanation}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {result.signals.map((signal, i) => (
            <div key={i} className="signal-chip">
              <span style={{ flexShrink: 0, marginTop: 1 }}>⚑</span>
              <span>{signal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #f6e05e",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 20,
          fontSize: 14,
          color: "#744210",
        }}
      >
        <strong>AI Recommendation:</strong> {result.recommendation}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn-primary" onClick={onVerify}>
          Verify With Trusted Contact
        </button>
        <button
          className="btn-ghost"
          style={{ borderColor: "#e53e3e", color: "#e53e3e" }}
          onClick={onProceed}
        >
          Proceed Anyway (Ignore Warning)
        </button>
      </div>
    </div>
  );
}

function VerifyStep({
  tx,
  contactResponse,
  onChoice,
}: {
  tx: { amount: string; recipient: string };
  contactResponse: string | null;
  onChoice: (choice: string) => void;
}) {
  return (
    <div className="animate-slide-up">
      {/* Notification preview */}
      <div
        style={{
          background: "linear-gradient(135deg, #2d3748, #1a202c)",
          color: "white",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            opacity: 0.6,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          📱 Notification sent to trusted contact
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f093fb, #f5576c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            👩
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Spouse (Linda)</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Trusted Contact</div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              width: 10,
              height: 10,
              background: "#48bb78",
              borderRadius: "50%",
            }}
          />
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "14px 16px",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          Your partner is about to send{" "}
          <strong>${tx.amount}</strong> to{" "}
          <strong>{tx.recipient}</strong> for a{" "}
          <em>&ldquo;school penalty fee.&rdquo;</em>
          <br />
          <br />
          Did you arrange this with Marcus?

        </div>
      </div>

      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: "#1a202c" }}>
        Linda&apos;s Response:
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          className={`contact-option ${contactResponse === "legit" ? "selected-legit" : ""}`}
          onClick={() => onChoice("legit")}
          disabled={!!contactResponse}
        >
          <strong>Looks Good</strong> — Yes, I know about this
        </button>
        <button
          className={`contact-option ${contactResponse === "unsure" ? "selected-unsure" : ""}`}
          onClick={() => onChoice("unsure")}
          disabled={!!contactResponse}
        >
          <strong>Not Sure</strong> — I&apos;m not certain about this
        </button>
        <button
          className={`contact-option ${contactResponse === "scam" ? "selected-scam" : ""}`}
          onClick={() => onChoice("scam")}
          disabled={!!contactResponse}
        >
          <strong>Possible Scam</strong> — Don&apos;t send this!
        </button>
      </div>

      {contactResponse && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: 16,
            padding: "14px 16px",
            background: "#e6f7ee",
            borderRadius: 12,
            fontSize: 14,
            color: "#276749",
            fontWeight: 500,
          }}
        >
          {contactResponse === "scam"
            ? "🚨 Linda flagged this as a possible scam! Blocking transaction..."
            : "✅ Response recorded. Processing..."}
        </div>
      )}
    </div>
  );
}

function BlockedStep({ onReset }: { onReset: () => void }) {
  return (
    <div className="animate-slide-up" style={{ textAlign: "center" }}>
      <div
        style={{
          width: 80,
          height: 80,
          margin: "0 auto 20px",
          background: "#fff5f5",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          border: "3px solid #feb2b2",
        }}
      >
        🛑
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#c53030", marginBottom: 8 }}>
        Transaction Paused
      </h2>
      <p style={{ fontSize: 15, color: "#718096", marginBottom: 28, lineHeight: 1.6 }}>
        TD NorthStar AI detected a possible scam.
        <br />
        Your trusted contact flagged this transaction.
      </p>

      <div className="card" style={{ padding: 20, marginBottom: 24, textAlign: "left" }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: "#c53030" }}>
          🛡️ What happened:
        </div>
        <ul
          style={{
            paddingLeft: 20,
            fontSize: 14,
            color: "#4a5568",
            lineHeight: 2,
          }}
        >
          <li>AI detected high-risk signals (82% score)</li>
          <li>Trusted contact (Mom) flagged the transfer</li>
          <li>Transaction automatically paused for your safety</li>
        </ul>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          className="btn-danger"
          onClick={() =>
            alert(
              "Connecting you to TD Fraud Protection...\n\nIn a real scenario, this would open a secure line to a TD fraud specialist."
            )
          }
        >
          Contact TD Fraud Protection
        </button>
        <button className="btn-ghost" onClick={onReset}>
          Start Over (Demo)
        </button>
      </div>
    </div>
  );
}

function SentStep({
  tx,
  onReset,
}: {
  tx: { amount: string; recipient: string };
  onReset: () => void;
}) {
  return (
    <div className="animate-slide-up" style={{ textAlign: "center" }}>
      <div
        style={{
          width: 80,
          height: 80,
          margin: "0 auto 20px",
          background: "#e6f7ee",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          border: "3px solid #9ae6b4",
        }}
      >
        ✅
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#276749", marginBottom: 8 }}>
        Money Sent
      </h2>
      <p style={{ fontSize: 15, color: "#718096", marginBottom: 24 }}>
        ${tx.amount} sent to {tx.recipient}
      </p>

      <button className="btn-ghost" onClick={onReset}>
        ← Start Over (Demo)
      </button>
    </div>
  );
}
