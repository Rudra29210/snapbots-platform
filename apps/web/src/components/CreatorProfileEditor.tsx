import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { getFirebase } from "../lib/firebase";

import {
  loadCreatorProfile,
  saveCreatorProfile,
  uploadCreatorPhoto,
  type CreatorProfile,
} from "../services/creatorProfileServices";

const styles = {
  card: {
    width: "100%",
    maxWidth: 620,
    margin: "0 auto",
    padding: 24,
    border: "1px solid var(--border, #303030)",
    borderRadius: 18,
    background: "var(--card, #151515)",
    color: "var(--foreground, #f5f5f5)",
    boxSizing: "border-box" as const,
  },

  label: {
    display: "block",
    marginBottom: 7,
    fontSize: 13,
    fontWeight: 600,
  },

  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "12px 13px",
    borderRadius: 10,
    border: "1px solid var(--border, #383838)",
    background: "var(--input, #101010)",
    color: "inherit",
    font: "inherit",
    marginBottom: 18,
  },

  button: {
    padding: "11px 16px",
    border: 0,
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    background: "#b7ff38",
    color: "#101010",
  },

  secondary: {
    padding: "10px 14px",
    border: "1px solid var(--border, #383838)",
    borderRadius: 10,
    cursor: "pointer",
    background: "transparent",
    color: "inherit",
  },
};

export default function CreatorProfileEditor() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] =
    useState<CreatorProfile | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const firebase = getFirebase();

    if (!firebase) {
      setError(
        "Firebase is not configured. Check your environment variables.",
      );
      setLoading(false);
      return;
    }

    return onAuthStateChanged(
      firebase.auth,
      async (signedInUser) => {
        setUser(signedInUser);
        setError("");
        setMessage("");

        if (!signedInUser) {
          setProfile(null);
          setDisplayName("");
          setUsername("");
          setBio("");
          setPhotoURL("");
          setLoading(false);
          return;
        }

        setLoading(true);

        try {
          const result = await loadCreatorProfile(
            signedInUser.uid,
          );

          setProfile(result);
          setDisplayName(
            result?.displayName ||
              signedInUser.displayName ||
              "",
          );
          setUsername(result?.username || "");
          setBio(result?.bio || "");
          setPhotoURL(
            result?.photoURL ||
              signedInUser.photoURL ||
              "",
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load your profile.",
          );
        } finally {
          setLoading(false);
        }
      },
    );
  }, []);

  async function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!user) {
      setError("Sign in to save your profile.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveCreatorProfile(user.uid, {
        displayName,
        username,
        bio,
      });

      const updated = await loadCreatorProfile(user.uid);

      setProfile(updated);
      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !user) {
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const url = await uploadCreatorPhoto(
        user.uid,
        file,
      );

      setPhotoURL(url);

      const updated = await loadCreatorProfile(
        user.uid,
      );

      setProfile(updated);
      setMessage("Profile photo uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Photo upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div role="status" style={styles.card}>
        Loading creator profile…
      </div>
    );
  }

  if (!user) {
    return (
      <section style={styles.card}>
        <h2 style={{ marginTop: 0 }}>
          Creator profile
        </h2>

        <p>
          Sign in to create and manage your creator profile.
        </p>
      </section>
    );
  }

  return (
    <section
      style={styles.card}
      aria-labelledby="creator-profile-title"
    >
      <h2
        id="creator-profile-title"
        style={{ marginTop: 0, marginBottom: 6 }}
      >
        Your creator profile
      </h2>

      <p
        style={{
          opacity: 0.72,
          marginTop: 0,
          marginBottom: 22,
        }}
      >
        Set up the identity people will see when they
        discover your work.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt="Your profile"
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #b7ff38",
            }}
          />
        ) : (
          <div
            aria-label="No profile photo"
            style={{
              width: 88,
              height: 88,
              flexShrink: 0,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "#272727",
              color: "#b7ff38",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            {(
              displayName.trim()[0] ||
              user.email?.[0] ||
              "?"
            ).toUpperCase()}
          </div>
        )}

        <div>
          <strong
            style={{
              display: "block",
              marginBottom: 5,
            }}
          >
            Profile photo
          </strong>

          <p
            style={{
              margin: "0 0 10px",
              opacity: 0.7,
              fontSize: 13,
            }}
          >
            JPG, PNG, or WebP · up to 5 MB
          </p>

          <button
            type="button"
            style={styles.secondary}
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
          >
            {uploading
              ? "Uploading…"
              : photoURL
                ? "Change photo"
                : "Upload photo"}
          </button>

          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            hidden
          />
        </div>
      </div>

      <form onSubmit={handleSave}>
        <label
          style={styles.label}
          htmlFor="creator-display-name"
        >
          Display name
        </label>

        <input
          id="creator-display-name"
          style={styles.input}
          value={displayName}
          onChange={(event) =>
            setDisplayName(event.target.value)
          }
          maxLength={60}
          minLength={2}
          required
          placeholder="Your name"
        />

        <label
          style={styles.label}
          htmlFor="creator-username"
        >
          Username
        </label>

        <input
          id="creator-username"
          style={styles.input}
          value={username}
          onChange={(event) =>
            setUsername(
              event.target.value.replace(/^@/, ""),
            )
          }
          maxLength={24}
          minLength={3}
          required
          pattern="[A-Za-z0-9_.]{3,24}"
          placeholder="your.username"
          aria-describedby="creator-username-help"
        />

        <p
          id="creator-username-help"
          style={{
            marginTop: -12,
            marginBottom: 18,
            fontSize: 12,
            opacity: 0.65,
          }}
        >
          3–24 letters, numbers, underscores, or periods.
          Username uniqueness is not enforced yet.
        </p>

        <label
          style={styles.label}
          htmlFor="creator-bio"
        >
          Bio
        </label>

        <textarea
          id="creator-bio"
          style={{
            ...styles.input,
            minHeight: 110,
            resize: "vertical",
          }}
          value={bio}
          onChange={(event) =>
            setBio(event.target.value)
          }
          maxLength={300}
          placeholder="Tell people what you build, create, or care about."
        />

        <div
          style={{
            textAlign: "right",
            marginTop: -13,
            marginBottom: 18,
            fontSize: 12,
            opacity: 0.65,
          }}
        >
          {bio.length}/300
        </div>

        {error && (
          <p
            role="alert"
            style={{
              color: "#ff7b7b",
              fontSize: 14,
            }}
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            style={{
              color: "#b7ff38",
              fontSize: 14,
            }}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          style={styles.button}
          disabled={saving || uploading}
        >
          {saving
            ? "Saving…"
            : profile
              ? "Save profile"
              : "Create profile"}
        </button>
      </form>
    </section>
  );
}