import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

export type FollowResult = {
  following: boolean;
};

function followerRef(
  db: Firestore,
  creatorId: string,
  followerId: string,
) {
  return doc(db, "users", creatorId, "followers", followerId);
}

function followingRef(
  db: Firestore,
  followerId: string,
  creatorId: string,
) {
  return doc(db, "users", followerId, "following", creatorId);
}

/**
 * Follow or unfollow a creator.
 *
 * Both relationship records are changed atomically:
 * users/{creatorId}/followers/{followerId}
 * users/{followerId}/following/{creatorId}
 *
 * Firestore rules must permit the reciprocal writes.
 */
export async function setFollowing(
  db: Firestore,
  currentUserId: string | null | undefined,
  creatorId: string,
  shouldFollow: boolean,
): Promise<FollowResult> {
  if (!currentUserId) {
    throw new Error("Sign in to follow creators.");
  }

  if (!creatorId.trim()) {
    throw new Error("Creator ID is required.");
  }

  if (currentUserId === creatorId) {
    throw new Error("You cannot follow your own account.");
  }

  const follower = followerRef(db, creatorId, currentUserId);
  const following = followingRef(db, currentUserId, creatorId);

  return runTransaction(db, async (transaction) => {
    const [followerSnapshot, followingSnapshot] = await Promise.all([
      transaction.get(follower),
      transaction.get(following),
    ]);

    if (shouldFollow) {
      // Idempotent: repeated clicks won't create duplicate records.
      if (followerSnapshot.exists() && followingSnapshot.exists()) {
        return { following: true };
      }

      // A partial pair indicates inconsistent data. Do not silently
      // overwrite it; repair it through a trusted admin process.
      if (followerSnapshot.exists() !== followingSnapshot.exists()) {
        throw new Error(
          "Follow data is inconsistent. Please try again later.",
        );
      }

      transaction.set(follower, {
        userId: currentUserId,
        createdAt: serverTimestamp(),
      });

      transaction.set(following, {
        userId: creatorId,
        createdAt: serverTimestamp(),
      });

      return { following: true };
    }

    if (!followerSnapshot.exists() && !followingSnapshot.exists()) {
      return { following: false };
    }

    if (followerSnapshot.exists() !== followingSnapshot.exists()) {
      throw new Error(
        "Follow data is inconsistent. Please try again later.",
      );
    }

    transaction.delete(follower);
    transaction.delete(following);

    return { following: false };
  });
}

/** Check whether the current user follows a creator. */
export async function isFollowingCreator(
  db: Firestore,
  currentUserId: string | null | undefined,
  creatorId: string,
): Promise<boolean> {
  if (!currentUserId || !creatorId || currentUserId === creatorId) {
    return false;
  }

  const ref = followingRef(db, currentUserId, creatorId);
  const snapshot = await getDoc(ref);

  return snapshot.exists();
}

/** Count a creator's followers directly from relationship records. */
export async function getFollowerCount(
  db: Firestore,
  creatorId: string,
): Promise<number> {
  if (!creatorId) return 0;

  const ref = collection(db, "users", creatorId, "followers");
  const snapshot = await getCountFromServer(ref);

  return snapshot.data().count;
}

/** Count the creators a user follows. */
export async function getFollowingCount(
  db: Firestore,
  userId: string,
): Promise<number> {
  if (!userId) return 0;

  const ref = collection(db, "users", userId, "following");
  const snapshot = await getCountFromServer(ref);

  return snapshot.data().count;
}