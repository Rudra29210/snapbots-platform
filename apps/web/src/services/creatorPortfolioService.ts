import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";

import { getFirebase } from "../lib/firebase";

export type CreatorPortfolioProject = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  imageURL: string;
  projectURL: string;
  technologies: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type CreatorPortfolioProjectInput = {
  title: string;
  description: string;
  imageURL?: string;
  projectURL?: string;
  technologies?: string[];
};

function getDatabase() {
  const firebase = getFirebase();

  if (!firebase) {
    throw new Error(
      "Firebase is not configured. Check your VITE_FIREBASE_* environment variables.",
    );
  }

  return firebase.db;
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeURL(value: string, fieldName: string): string {
  const trimmed = value.trim();

  if (!trimmed) return "";

  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`${fieldName} must be a valid URL.`);
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${fieldName} must start with http:// or https://.`);
  }

  return parsed.toString();
}

function validateProject(input: CreatorPortfolioProjectInput) {
  const title = cleanText(input.title);
  const description = cleanText(input.description);
  const imageURL = normalizeURL(input.imageURL || "", "Image URL");
  const projectURL = normalizeURL(input.projectURL || "", "Project URL");

  const technologies = Array.from(
    new Set(
      (input.technologies || [])
        .map((item) => cleanText(item))
        .filter(Boolean),
    ),
  ).slice(0, 12);

  if (title.length < 2 || title.length > 100) {
    throw new Error("Project title must be between 2 and 100 characters.");
  }

  if (description.length > 2000) {
    throw new Error("Project description must be 2,000 characters or fewer.");
  }

  if (technologies.some((item) => item.length > 40)) {
    throw new Error("Each technology name must be 40 characters or fewer.");
  }

  return {
    title,
    description,
    imageURL,
    projectURL,
    technologies,
  };
}

function mapProject(
  id: string,
  data: DocumentData,
  creatorId: string,
): CreatorPortfolioProject {
  return {
    id,
    creatorId,
    title: cleanText(data.title),
    description: cleanText(data.description),
    imageURL: cleanText(data.imageURL),
    projectURL: cleanText(data.projectURL),
    technologies: Array.isArray(data.technologies)
      ? data.technologies.filter(
          (item: unknown): item is string => typeof item === "string",
        )
      : [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function projectCollection(creatorId: string) {
  if (!creatorId.trim()) {
    throw new Error("A creator account is required.");
  }

  return collection(getDatabase(), "users", creatorId, "portfolioProjects");
}

export async function listCreatorPortfolioProjects(
  creatorId: string,
): Promise<CreatorPortfolioProject[]> {
  const projectsRef = projectCollection(creatorId);

  try {
    const projectsQuery = query(projectsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(projectsQuery);

    return snapshot.docs.map((item) =>
      mapProject(item.id, item.data(), creatorId),
    );
  } catch (error) {
    // Support older portfolio documents that do not have createdAt yet.
    console.warn(
      "Portfolio ordering was unavailable; loading projects without ordering.",
      error,
    );

    const snapshot = await getDocs(projectsRef);

    return snapshot.docs
      .map((item) => mapProject(item.id, item.data(), creatorId))
      .sort((a, b) => {
        const timeA =
          typeof a.createdAt === "object" &&
          a.createdAt !== null &&
          "seconds" in a.createdAt
            ? Number(a.createdAt.seconds)
            : 0;

        const timeB =
          typeof b.createdAt === "object" &&
          b.createdAt !== null &&
          "seconds" in b.createdAt
            ? Number(b.createdAt.seconds)
            : 0;

        return timeB - timeA;
      });
  }
}

export async function addCreatorPortfolioProject(
  creatorId: string,
  input: CreatorPortfolioProjectInput,
): Promise<string> {
  const projectsRef = projectCollection(creatorId);
  const project = validateProject(input);

  const created = await addDoc(projectsRef, {
    ...project,
    creatorId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return created.id;
}

export async function updateCreatorPortfolioProject(
  creatorId: string,
  projectId: string,
  input: CreatorPortfolioProjectInput,
): Promise<void> {
  if (!projectId.trim()) {
    throw new Error("A project ID is required.");
  }

  const project = validateProject(input);

  await updateDoc(
    doc(getDatabase(), "users", creatorId, "portfolioProjects", projectId),
    {
      ...project,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function deleteCreatorPortfolioProject(
  creatorId: string,
  projectId: string,
): Promise<void> {
  if (!creatorId.trim() || !projectId.trim()) {
    throw new Error("A creator ID and project ID are required.");
  }

  await deleteDoc(
    doc(getDatabase(), "users", creatorId, "portfolioProjects", projectId),
  );
}