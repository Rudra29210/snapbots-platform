import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { getFirebase } from "../lib/firebase";

export type CreatorProfile = {
  uid: string;
  displayName: string;
  username: string;
  bio: string;
  photoURL: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function getServices() {
  const firebase = getFirebase();

  if (!firebase) {
    throw new Error(
      "Firebase is not configured. Check your VITE_FIREBASE_* environment variables.",
    );
  }

  return firebase;
}

function normalizeUsername(value: string): string {
  return value.trim().replace(/^@/, "").toLowerCase();
}

export async function loadCreatorProfile(
  uid: string,
): Promise<CreatorProfile | null> {
  if (!uid.trim()) {
    throw new Error("A creator ID is required.");
  }

  const { db } = getServices();
  const snapshot = await getDoc(doc(db, "creatorProfiles", uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    uid,
    displayName: String(data.displayName || ""),
    username: String(data.username || ""),
    bio: String(data.bio || ""),
    photoURL: String(data.photoURL || ""),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function saveCreatorProfile(
  uid: string,
  input: {
    displayName: string;
    username: string;
    bio: string;
  },
): Promise<void> {
  if (!uid.trim()) {
    throw new Error("Sign in to edit your creator profile.");
  }

  const displayName = input.displayName.trim();
  const username = normalizeUsername(input.username);
  const bio = input.bio.trim();

  if (displayName.length < 2 || displayName.length > 60) {
    throw new Error(
      "Display name must be between 2 and 60 characters.",
    );
  }

  if (!/^[a-z0-9_.]{3,24}$/.test(username)) {
    throw new Error(
      "Username must be 3–24 characters and contain only letters, numbers, underscores, or periods.",
    );
  }

  if (bio.length > 300) {
    throw new Error("Bio must be 300 characters or fewer.");
  }

  const { db } = getServices();
  const profileRef = doc(db, "creatorProfiles", uid);
  const existing = await getDoc(profileRef);
  const previous = existing.exists() ? existing.data() : {};

  await setDoc(
    profileRef,
    {
      uid,
      displayName,
      username,
      bio,
      photoURL: String(previous.photoURL || ""),
      createdAt: previous.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function uploadCreatorPhoto(
  uid: string,
  file: File,
): Promise<string> {
  if (!uid.trim()) {
    throw new Error("Sign in to upload a profile photo.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are supported.");
  }

  if (file.size === 0) {
    throw new Error("The selected image is empty.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Profile photos must be 5 MB or smaller.");
  }

  const { db, storage } = getServices();
  const profileRef = doc(db, "creatorProfiles", uid);
  const existing = await getDoc(profileRef);
  const previous = existing.exists() ? existing.data() : {};
  const oldPhotoURL = String(previous.photoURL || "");

  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const photoRef = ref(
    storage,
    `creatorProfiles/${uid}/avatar.${extension}`,
  );

  await uploadBytes(photoRef, file, {
    contentType: file.type,
  });

  const photoURL = await getDownloadURL(photoRef);

  await setDoc(
    profileRef,
    {
      uid,
      photoURL,
      createdAt: previous.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(existing.exists()
        ? {}
        : {
            displayName: "",
            username: "",
            bio: "",
          }),
    },
    { merge: true },
  );

  if (oldPhotoURL && oldPhotoURL !== photoURL) {
    try {
      const oldRef = ref(storage, oldPhotoURL);

      if (
        oldRef.fullPath.startsWith(`creatorProfiles/${uid}/`) &&
        oldRef.fullPath !== photoRef.fullPath
      ) {
        await deleteObject(oldRef);
      }
    } catch (error) {
      console.warn(
        "Previous profile photo cleanup was skipped:",
        error,
      );
    }
  }

  return photoURL;
}