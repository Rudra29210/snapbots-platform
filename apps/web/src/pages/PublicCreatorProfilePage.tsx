import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import FollowButton from "@/components/FollowButton";

import {
  loadCreatorProfile,
  type CreatorProfile,
} from "../services/creatorProfileServices";

export default function PublicCreatorProfilePage() {
  const { uid } = useParams<{ uid: string }>();

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!uid) {
        setProfile(null);
        setError("This creator profile link is invalid.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await loadCreatorProfile(uid);

        if (!active) return;

        if (!result) {
          setProfile(null);
          setError("This creator profile could not be found.");
        } else {
          setProfile(result);
        }
      } catch (err) {
        if (!active) return;

        setProfile(null);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this creator profile.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [uid]);

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    padding: "40px 20px 72px",
    boxSizing: "border-box",
    background: "var(--background, #0b0b0b)",
    color: "var(--foreground, #f5f5f5)",
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 42,
    padding: "10px 16px",
    border: "1px solid var(--border, #383838)",
    borderRadius: 10,
    color: "inherit",
    background: "transparent",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 750,
    cursor: "pointer",
    boxSizing: "border-box",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "#b7ff38",
    color: "#101010",
    borderColor: "#b7ff38",
  };

  function getProfileURL(): string {
    if (!uid) return window.location.href;

    return `${window.location.origin}/creators/${encodeURIComponent(uid)}`;
  }

  async function shareProfile() {
    if (!uid) return;

    const url = getProfileURL();
    const title = `${profile?.displayName || "Snapbots Creator"} | Snapbots`;
    const text = `Check out ${profile?.displayName || "this creator"} on Snapbots.`;

    setShareMessage("");
    setCopied(false);

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text, url });
        setShareMessage("Profile sharing opened.");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setShareMessage("Profile link copied. Share it anywhere!");
        return;
      }

      window.prompt("Copy your creator profile link:", url);
      setShareMessage("Copy the link from the box to share your profile.");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      try {
        window.prompt("Copy your creator profile link:", url);
        setShareMessage("Copy the link from the box to share your profile.");
      } catch {
        setShareMessage(
          "Unable to share automatically. Copy the page URL from your browser.",
        );
      }
    }
  }

  async function copyProfileLink() {
    if (!uid) return;

    const url = getProfileURL();

    try {
      if (!navigator.clipboard?.writeText) {
        window.prompt("Copy your creator profile link:", url);
        setShareMessage("Copy the link from the box.");
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      setShareMessage("Link copied successfully!");
    } catch {
      window.prompt("Copy your creator profile link:", url);
      setShareMessage("Copy the link from the box.");
    }
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 34,
          }}
        >
          <Link
            to="/"
            style={{
              color: "inherit",
              textDecoration: "none",
              fontSize: 23,
              fontWeight: 950,
              letterSpacing: "-0.8px",
            }}
          >
            SNAPBOTS<span style={{ color: "#b7ff38" }}>.</span>
          </Link>

          <Link to="/community" style={buttonStyle}>
            Explore community
          </Link>
        </header>

        {loading ? (
          <section
            role="status"
            style={{
              padding: 40,
              textAlign: "center",
              border: "1px solid var(--border, #303030)",
              borderRadius: 20,
            }}
          >
            Loading creator profile…
          </section>
        ) : error || !profile ? (
          <section
            style={{
              maxWidth: 620,
              margin: "50px auto",
              padding: 30,
              border: "1px solid var(--border, #303030)",
              borderRadius: 20,
              background: "var(--card, #151515)",
            }}
          >
            <p
              style={{
                color: "#b7ff38",
                fontSize: 12,
                fontWeight: 850,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Creator profile
            </p>

            <h1 style={{ fontSize: 30, marginBottom: 12 }}>
              Profile unavailable
            </h1>

            <p style={{ color: "#a1a1aa", lineHeight: 1.8 }}>
              {error || "This creator profile could not be found."}
            </p>

            <Link to="/community" style={primaryButtonStyle}>
              Browse the community
            </Link>
          </section>
        ) : (
          <>
            <section
              style={{
                position: "relative",
                overflow: "hidden",
                padding: "clamp(24px, 5vw, 52px)",
                border: "1px solid var(--border, #303030)",
                borderRadius: 24,
                background:
                  "radial-gradient(ellipse at top right, rgba(183,255,56,0.12), transparent 48%), var(--card, #151515)",
              }}
            >
              <div
                style={{
                  color: "#b7ff38",
                  fontSize: 12,
                  fontWeight: 850,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 24,
                }}
              >
                Snapbots Creator
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  flexWrap: "wrap",
                }}
              >
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={`${profile.displayName || "Creator"}'s profile`}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    style={{
                      width: 124,
                      height: 124,
                      flexShrink: 0,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #b7ff38",
                      background: "#222",
                    }}
                  />
                ) : (
                  <div
                    aria-label="Default creator avatar"
                    role="img"
                    style={{
                      width: 124,
                      height: 124,
                      flexShrink: 0,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: "#b7ff38",
                      color: "#101010",
                      fontSize: 48,
                      fontWeight: 950,
                    }}
                  >
                    {(profile.displayName || "C").charAt(0).toUpperCase()}
                  </div>
                )}

                <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                  <h1
                    style={{
                      margin: "0 0 8px",
                      fontSize: "clamp(30px, 5vw, 48px)",
                      lineHeight: 1.1,
                      letterSpacing: "-1.5px",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {profile.displayName || "Snapbots Creator"}
                  </h1>

                  {profile.username && (
                    <p
                      style={{
                        margin: "0 0 18px",
                        color: "#b7ff38",
                        fontSize: 16,
                      }}
                    >
                      @{profile.username.replace(/^@/, "")}
                    </p>
                  )}

                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted-foreground, #b0b0b0)",
                      lineHeight: 1.9,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {profile.bio || "This creator hasn't added a bio yet."}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 30,
                  paddingTop: 24,
                  borderTop: "1px solid var(--border, #303030)",
                }}
              >
                <FollowButton
                  creatorId={profile.uid}
                  creatorName={profile.displayName}
                />

                <button
                  type="button"
                  onClick={() => void shareProfile()}
                  style={primaryButtonStyle}
                >
                  {copied ? "✓ Link copied" : "↗ Share profile"}
                </button>

                <button
                  type="button"
                  onClick={() => void copyProfileLink()}
                  style={buttonStyle}
                >
                  Copy link
                </button>
              </div>

              {shareMessage && (
                <p
                  role="status"
                  aria-live="polite"
                  style={{
                    margin: "14px 0 0",
                    color: "#b7ff38",
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  {shareMessage}
                </p>
              )}
            </section>

            <section
              style={{
                marginTop: 24,
                padding: 24,
                border: "1px solid var(--border, #303030)",
                borderRadius: 18,
              }}
            >
              <h2 style={{ margin: "0 0 10px", fontSize: 21 }}>
                Discover the creator community
              </h2>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "#a1a1aa",
                  lineHeight: 1.8,
                }}
              >
                Explore projects, discover new ideas, and connect with
                creators building with technology.
              </p>

              <Link to="/community" style={buttonStyle}>
                Explore community projects →
              </Link>
            </section>
          </>
        )}

        <footer
          style={{
            marginTop: 40,
            color: "#777",
            fontSize: 12,
            lineHeight: 1.8,
          }}
        >
          Snapbots creator profiles are public. Only publish information
          you are comfortable sharing.
        </footer>
      </div>
    </main>
  );
}