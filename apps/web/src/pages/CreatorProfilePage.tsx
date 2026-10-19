import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebase } from "@/lib/firebase";
import CreatorProfileEditor from "@/components/CreatorProfileEditor";

export default function CreatorProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const firebase = getFirebase();

    if (!firebase) {
      setAuthReady(true);
      return;
    }

    return onAuthStateChanged(firebase.auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
  }, []);

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    padding: "40px 20px 64px",
    boxSizing: "border-box",
    background: "var(--background, #0b0b0b)",
    color: "var(--foreground, #f5f5f5)",
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "11px 15px",
    borderRadius: 10,
    border: "1px solid var(--border, #383838)",
    color: "inherit",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
  };

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 36,
          }}
        >
          <Link
            to="/"
            style={{
              color: "inherit",
              textDecoration: "none",
              fontSize: 23,
              fontWeight: 900,
              letterSpacing: "-0.8px",
            }}
          >
            SNAPBOTS<span style={{ color: "#b7ff38" }}>.</span>
          </Link>

          <Link to="/dashboard" style={buttonStyle}>
            ← Dashboard
          </Link>
        </header>

        <section
          style={{
            marginBottom: 30,
            padding: "28px 0",
            borderTop: "1px solid var(--border, #292929)",
            borderBottom: "1px solid var(--border, #292929)",
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              color: "#b7ff38",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Creator studio
          </p>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(32px, 5vw, 52px)",
              lineHeight: 1.08,
              letterSpacing: "-1.8px",
            }}
          >
            Your creator identity
          </h1>

          <p
            style={{
              maxWidth: 620,
              margin: 0,
              color: "var(--muted-foreground, #a1a1aa)",
              fontSize: 16,
              lineHeight: 1.8,
            }}
          >
            Manage your profile and give the Snapbots community
            a place to discover you and your work.
          </p>
        </section>

        {!authReady ? (
          <div role="status" style={{ padding: 24 }}>
            Loading your account…
          </div>
        ) : !user ? (
          <section
            style={{
              maxWidth: 620,
              margin: "0 auto",
              padding: 28,
              border: "1px solid var(--border, #303030)",
              borderRadius: 18,
              background: "var(--card, #151515)",
            }}
          >
            <h2>Sign in to continue</h2>
            <p style={{ color: "#a1a1aa", lineHeight: 1.8 }}>
              You need to sign in before managing your creator profile.
            </p>
            <Link
              to="/login"
              style={{
                ...buttonStyle,
                background: "#b7ff38",
                color: "#101010",
                borderColor: "#b7ff38",
              }}
            >
              Sign in
            </Link>
          </section>
        ) : (
          <>
            <CreatorProfileEditor />

            <section
              style={{
                maxWidth: 620,
                margin: "24px auto 0",
                padding: 22,
                border: "1px solid var(--border, #303030)",
                borderRadius: 18,
                background: "var(--card, #151515)",
              }}
            >
              <h2 style={{ margin: "0 0 8px", fontSize: 19 }}>
                Your public profile
              </h2>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "#a1a1aa",
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                Open your shareable creator page to see how your
                profile appears to visitors.
              </p>

              <Link
                to={`/creators/${encodeURIComponent(user.uid)}`}
                style={{
                  ...buttonStyle,
                  background: "#b7ff38",
                  color: "#101010",
                  borderColor: "#b7ff38",
                }}
              >
                View public profile ↗
              </Link>
            </section>
          </>
        )}

        <footer
          style={{
            maxWidth: 620,
            margin: "28px auto 0",
            color: "#888",
            fontSize: 12,
            lineHeight: 1.8,
          }}
        >
          Only share information you are comfortable making public.
        </footer>
      </div>
    </main>
  );
}