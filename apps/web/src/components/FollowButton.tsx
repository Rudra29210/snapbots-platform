import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { auth, db } from '../lib/firebaseCompat';
import {
  setFollowing,
} from "../services/followService";

type FollowButtonProps = {
  creatorId: string;
  creatorName?: string;
};

export default function FollowButton({
  creatorId,
  creatorName = "creator",
}: FollowButtonProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    auth.currentUser?.uid ?? null,
  );

  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid ?? null);
    });
  }, []);

  useEffect(() => {
    setError("");

    if (!currentUserId || !creatorId || currentUserId === creatorId) {
      setIsFollowing(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const followingRef = doc(
      db,
      "users",
      currentUserId,
      "following",
      creatorId,
    );

    const unsubscribe = onSnapshot(
      followingRef,
      (snapshot) => {
        setIsFollowing(snapshot.exists());
        setLoading(false);
      },
      (err) => {
        console.error("Could not load follow status:", err);
        setError("Couldn't load follow status.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [currentUserId, creatorId]);

  async function handleFollowToggle() {
    setError("");

    if (!currentUserId) {
      setError("Please sign in to follow creators.");
      return;
    }

    if (currentUserId === creatorId) {
      return;
    }

    setSaving(true);

    try {
      const result = await setFollowing(
        db,
        currentUserId,
        creatorId,
        !isFollowing,
      );

      setIsFollowing(result.following);
    } catch (err) {
      console.error("Follow action failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't update follow status. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (currentUserId === creatorId) {
    return null;
  }

  return (
    <div className="follow-control">
      <button
        type="button"
        onClick={handleFollowToggle}
        disabled={loading || saving || !creatorId}
        aria-pressed={isFollowing}
      >
        {loading
          ? "Loading..."
          : saving
            ? "Please wait..."
            : isFollowing
              ? "Following"
              : "Follow"}
      </button>

      {error && (
        <p role="alert" className="follow-control__error">
          {error}
        </p>
      )}

      <span className="sr-only">
        {isFollowing
          ? `You are following ${creatorName}.`
          : `You are not following ${creatorName}.`}
      </span>
    </div>
  );
}