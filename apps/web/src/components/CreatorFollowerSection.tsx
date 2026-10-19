import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,  onSnapshot,
} from "firebase/firestore";

import { auth, db } from '../lib/firebaseCompat';
import { setFollowing } from "../services/followService";

type CreatorFollowSectionProps = {
  creatorId: string;
  creatorName?: string;
  className?: string;
};

export default function CreatorFollowSection({
  creatorId,
  creatorName = "Creator",
  className = "",
}: CreatorFollowSectionProps) {
  const [viewerId, setViewerId] = useState<string | null>(
    auth.currentUser?.uid ?? null,
  );
  const [following, setFollowingState] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setViewerId(user?.uid ?? null);
    });
  }, []);

  useEffect(() => {
    if (!creatorId) {
      setFollowersCount(0);
      return;
    }

    const followersRef = collection(
      db,
      "users",
      creatorId,
      "followers",
    );

    return onSnapshot(
      followersRef,
      (snapshot) => setFollowersCount(snapshot.size),
      (err) => {
        console.error("Failed to load follower count:", err);
      },
    );
  }, [creatorId]);

  useEffect(() => {
    if (!creatorId || !viewerId || viewerId !== creatorId) {
      setFollowingCount(0);
      return;
    }

    const followingRef = collection(
      db,
      "users",
      creatorId,
      "following",
    );

    return onSnapshot(
      followingRef,
      (snapshot) => setFollowingCount(snapshot.size),
      (err) => {
        console.error("Failed to load following count:", err);
      },
    );
  }, [creatorId, viewerId]);

  useEffect(() => {
    if (!viewerId || !creatorId || viewerId === creatorId) {
      setFollowingState(false);
      setLoadingStatus(false);
      return;
    }

    setLoadingStatus(true);

    const relationshipRef = doc(
      db,
      "users",
      viewerId,
      "following",
      creatorId,
    );

    return onSnapshot(
      relationshipRef,
      (snapshot) => {
        setFollowingState(snapshot.exists());
        setLoadingStatus(false);
      },
      (err) => {
        console.error("Failed to load follow status:", err);
        setError("Unable to load follow status.");
        setLoadingStatus(false);
      },
    );
  }, [viewerId, creatorId]);

  async function handleToggleFollow() {
    setError("");

    if (!viewerId) {
      setError("Please sign in to follow creators.");
      return;
    }

    if (!creatorId || viewerId === creatorId) {
      return;
    }

    setSaving(true);

    try {
      const result = await setFollowing(
        db,
        viewerId,
        creatorId,
        !following,
      );

      setFollowingState(result.following);
    } catch (err) {
      console.error("Failed to update follow relationship:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const isOwnProfile = viewerId === creatorId;

  return (
    <section
      className={`creator-follow-section ${className}`.trim()}
      aria-label={`${creatorName} creator information`}
    >
      <div className="creator-follow-section__identity">
        <div
          className="creator-follow-section__avatar"
          aria-hidden="true"
        >
          {creatorName.trim().charAt(0).toUpperCase() || "C"}
        </div>

        <div className="creator-follow-section__details">
          <h3 className="creator-follow-section__name">
            {creatorName}
          </h3>

          <p className="creator-follow-section__subtitle">
            Snapbots Creator
          </p>
        </div>
      </div>

      <div className="creator-follow-section__stats">
        <div className="creator-follow-section__stat">
          <strong>{followersCount.toLocaleString()}</strong>
          <span>Followers</span>
        </div>

        <div className="creator-follow-section__stat">
          <strong>{followingCount.toLocaleString()}</strong>
          <span>Following</span>
        </div>
      </div>

      {!isOwnProfile && (
        <button
          type="button"
          className={
            following
              ? "creator-follow-section__button creator-follow-section__button--following"
              : "creator-follow-section__button"
          }
          onClick={handleToggleFollow}
          disabled={loadingStatus || saving || !creatorId}
          aria-pressed={following}
        >
          {loadingStatus
            ? "Loading..."
            : saving
              ? "Please wait..."
              : following
                ? "Following"
                : "Follow"}
        </button>
      )}

      {error && (
        <p
          className="creator-follow-section__error"
          role="alert"
        >
          {error}
        </p>
      )}

      <style>{`
        .creator-follow-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          padding: 20px;
          color: var(--text-primary, #f5f5f5);
          background: var(--surface, #111111);
          border: 1px solid var(--border, #2a2a2a);
          border-radius: 16px;
          box-sizing: border-box;
        }

        .creator-follow-section__identity {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .creator-follow-section__avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent, #b7ff3c);
          color: #111111;
          font-size: 20px;
          font-weight: 800;
        }

        .creator-follow-section__details {
          min-width: 0;
        }

        .creator-follow-section__name {
          margin: 0;
          overflow-wrap: anywhere;
          font-size: 16px;
          font-weight: 700;
        }

        .creator-follow-section__subtitle {
          margin: 4px 0 0;
          color: var(--text-secondary, #a3a3a3);
          font-size: 13px;
        }

        .creator-follow-section__stats {
          display: flex;
          gap: 28px;
        }

        .creator-follow-section__stat {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .creator-follow-section__stat strong {
          font-size: 18px;
          font-weight: 750;
        }

        .creator-follow-section__stat span {
          color: var(--text-secondary, #a3a3a3);
          font-size: 12px;
        }

        .creator-follow-section__button {
          width: 100%;
          min-height: 42px;
          padding: 10px 16px;
          border: 1px solid var(--accent, #b7ff3c);
          border-radius: 10px;
          background: var(--accent, #b7ff3c);
          color: #111111;
          font: inherit;
          font-weight: 750;
          cursor: pointer;
          transition: opacity 150ms ease;
        }

        .creator-follow-section__button--following {
          background: transparent;
          color: var(--text-primary, #f5f5f5);
          border-color: var(--border, #444444);
        }

        .creator-follow-section__button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .creator-follow-section__error {
          margin: 0;
          color: #ff7777;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        @media (prefers-reduced-motion: reduce) {
          .creator-follow-section__button {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}