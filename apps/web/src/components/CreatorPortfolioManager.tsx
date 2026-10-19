import { useCallback, useEffect, useState, type FormEvent } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  addCreatorPortfolioProject,
  deleteCreatorPortfolioProject,
  listCreatorPortfolioProjects,
  updateCreatorPortfolioProject,
  type CreatorPortfolioProject,
  type CreatorPortfolioProjectInput,
} from "../services/creatorPortfolioService";
import { getFirebase } from "../lib/firebase";

const EMPTY_FORM: CreatorPortfolioProjectInput = {
  title: "",
  description: "",
  imageURL: "",
  projectURL: "",
  technologies: [],
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function formatDate(value: unknown): string {
  if (!value || typeof value !== "object") return "";

  const timestamp = value as {
    toDate?: () => Date;
    seconds?: number;
  };

  let date: Date | null = null;

  if (typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (typeof timestamp.seconds === "number") {
    date = new Date(timestamp.seconds * 1000);
  }

  if (!date || Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CreatorPortfolioManager() {
  const [creatorId, setCreatorId] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [projects, setProjects] = useState<CreatorPortfolioProject[]>([]);
  const [form, setForm] =
    useState<CreatorPortfolioProjectInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [technologyInput, setTechnologyInput] = useState("");

  useEffect(() => {
    const firebase = getFirebase();

    if (!firebase) {
      setError(
        "Firebase is not configured. Check your VITE_FIREBASE_* environment variables.",
      );
      setAuthReady(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      firebase.auth,
      (user) => {
        setCreatorId(user?.uid ?? "");
        setAuthReady(true);

        if (!user) {
          setProjects([]);
          setLoading(false);
        }
      },
      (authError) => {
        setError(authError.message || "Unable to verify your sign-in.");
        setAuthReady(true);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const loadProjects = useCallback(async () => {
    if (!creatorId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await listCreatorPortfolioProjects(creatorId);
      setProjects(result);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    if (authReady && creatorId) {
      void loadProjects();
    }
  }, [authReady, creatorId, loadProjects]);

  function updateField<K extends keyof CreatorPortfolioProjectInput>(
    field: K,
    value: CreatorPortfolioProjectInput[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setTechnologyInput("");
    setEditingId(null);
    setError("");
    setNotice("");
  }

  function startEditing(project: CreatorPortfolioProject) {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      imageURL: project.imageURL,
      projectURL: project.projectURL,
      technologies: project.technologies,
    });
    setTechnologyInput(project.technologies.join(", "));
    setError("");
    setNotice("");

    document
      .getElementById("creator-portfolio-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!creatorId) {
      setError("Please sign in to manage your portfolio.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const input: CreatorPortfolioProjectInput = {
      ...form,
      title: form.title.trim(),
      description: form.description?.trim() ?? "",
      imageURL: form.imageURL?.trim() ?? "",
      projectURL: form.projectURL?.trim() ?? "",
      technologies: technologyInput
        .split(",")
        .map((technology) => technology.trim())
        .filter(Boolean)
        .slice(0, 12),
    };

    try {
      if (editingId) {
        await updateCreatorPortfolioProject(
          creatorId,
          editingId,
          input,
        );
        setNotice("Project updated successfully.");
      } else {
        await addCreatorPortfolioProject(creatorId, input);
        setNotice("Project added to your portfolio.");
      }

      setForm(EMPTY_FORM);
      setTechnologyInput("");
      setEditingId(null);
      await loadProjects();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: CreatorPortfolioProject) {
    if (!creatorId) {
      setError("Please sign in to manage your portfolio.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${project.title}" from your portfolio? This cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(project.id);
    setError("");
    setNotice("");

    try {
      await deleteCreatorPortfolioProject(creatorId, project.id);

      setProjects((current) =>
        current.filter((item) => item.id !== project.id),
      );

      if (editingId === project.id) resetForm();

      setNotice("Project deleted successfully.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setDeletingId(null);
    }
  }

  if (!authReady || loading) {
    return (
      <section className="w-full py-8 text-center text-sm text-neutral-500">
        Loading your portfolio…
      </section>
    );
  }

  if (!creatorId) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
        <h2 className="text-xl font-bold">Your project portfolio</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Sign in to add, edit, and manage your projects.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full space-y-8 text-neutral-900 dark:text-white">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-600">
            Creator studio
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Your project portfolio
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Showcase your builds, products, experiments, and innovations.
          </p>
        </div>

        <span className="w-fit rounded-full border border-neutral-200 px-3 py-1.5 text-sm dark:border-neutral-800">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </span>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-lime-300 bg-lime-50 p-4 text-sm text-lime-900 dark:border-lime-900 dark:bg-lime-950/30 dark:text-lime-300"
        >
          {notice}
        </div>
      )}

      <form
        id="creator-portfolio-form"
        onSubmit={handleSubmit}
        className="scroll-mt-6 space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">
              {editingId ? "Edit project" : "Add a project"}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Fields marked * are required.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Project title *
            </span>
            <input
              required
              minLength={2}
              maxLength={100}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="e.g. EcoRegulate"
              className="w-full rounded-xl border border-neutral-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-neutral-700"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Description
            </span>
            <textarea
              rows={5}
              maxLength={2000}
              value={form.description ?? ""}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="What does this project do? What problem does it solve?"
              className="w-full resize-y rounded-xl border border-neutral-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-neutral-700"
            />
            <span className="mt-1 block text-right text-xs text-neutral-500">
              {(form.description ?? "").length}/2000
            </span>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Project image URL
            </span>
            <input
              type="url"
              value={form.imageURL ?? ""}
              onChange={(event) => updateField("imageURL", event.target.value)}
              placeholder="https://example.com/project-image.jpg"
              className="w-full rounded-xl border border-neutral-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-neutral-700"
            />
            <span className="mt-1 block text-xs text-neutral-500">
              Use a public image URL beginning with https:// or http://.
            </span>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Live project or demo URL
            </span>
            <input
              type="url"
              value={form.projectURL ?? ""}
              onChange={(event) =>
                updateField("projectURL", event.target.value)
              }
              placeholder="https://your-project.example"
              className="w-full rounded-xl border border-neutral-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-neutral-700"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Technologies and tools
            </span>
            <input
              value={technologyInput}
              onChange={(event) => {
                setTechnologyInput(event.target.value);
                updateField(
                  "technologies",
                  event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .slice(0, 12),
                );
              }}
              placeholder="ESP32, React, Firebase, Python"
              className="w-full rounded-xl border border-neutral-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-neutral-700"
            />
            <span className="mt-1 block text-xs text-neutral-500">
              Separate each technology with a comma. Maximum 12.
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row dark:border-neutral-800">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-lime-400 px-6 py-3 text-sm font-bold text-neutral-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving…"
              : editingId
                ? "Save changes"
                : "Add project"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-xl border border-neutral-300 px-6 py-3 text-sm font-semibold transition hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              Discard changes
            </button>
          )}
        </div>
      </form>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold">Published projects</h3>
          <button
            type="button"
            onClick={() => void loadProjects()}
            disabled={loading}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium transition hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Refresh
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-5 py-12 text-center dark:border-neutral-700">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400/15 text-2xl">
              ✳
            </div>
            <h4 className="mt-4 font-bold">Your portfolio starts here</h4>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
              Add your first project using the form above. Your saved projects
              can then be displayed on your public creator profile.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
              >
                {project.imageURL ? (
                  <img
                    src={project.imageURL}
                    alt={`${project.title} preview`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="aspect-video w-full bg-neutral-100 object-cover dark:bg-neutral-900"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-neutral-100 text-4xl text-neutral-400 dark:bg-neutral-900">
                    <span aria-hidden="true">⌘</span>
                  </div>
                )}

                <div className="space-y-4 p-5">
                  <div>
                    <h4 className="break-words text-lg font-bold">
                      {project.title}
                    </h4>
                    {formatDate(project.createdAt) && (
                      <p className="mt-1 text-xs text-neutral-500">
                        Added {formatDate(project.createdAt)}
                      </p>
                    )}
                    {project.description && (
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((technology) => (
                        <span
                          key={technology}
                          className="rounded-full bg-lime-400/15 px-2.5 py-1 text-xs font-medium text-lime-800 dark:text-lime-300"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  )}

                  {project.projectURL && (
                    <a
                      href={project.projectURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-sm font-bold text-lime-700 underline-offset-4 hover:underline dark:text-lime-400"
                    >
                      View project ↗
                    </a>
                  )}

                  <div className="flex gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => startEditing(project)}
                      className="flex-1 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(project)}
                      disabled={deletingId === project.id}
                      className="flex-1 rounded-lg border border-red-300 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      {deletingId === project.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}