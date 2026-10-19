import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { getFirebase } from '@/lib/firebase';

const categories = [
  'Robotics',
  'AI / Machine Learning',
  'IoT / Embedded Systems',
  'Environmental Technology',
  'Electronics',
  'Software / Web Apps',
  'Science Research',
  'Drones and Automation',
  'Other',
];

const inputClass =
  'w-full rounded-xl border border-white/10 bg-[#101410] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-lime-400';

const labelClass = 'mb-2 block text-sm font-medium text-white/80';

async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be 5 MB or smaller.');
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Could not read image.'));
    });

    const maxDimension = 1000;
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
    );

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is unavailable.');

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const result = canvas.toDataURL('image/webp', 0.72);

    if (result.length > 500_000) {
      throw new Error(
        'This image is still too large for Firestore. Choose a simpler or smaller image.',
      );
    }

    return result;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function CommunitySubmit() {
  const navigate = useNavigate();
  const firebase = getFirebase();

  const [user, setUser] = useState<{
    uid: string;
    email: string | null;
  } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [creatorName, setCreatorName] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [imageData, setImageData] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useState(() => {
    if (!firebase) {
      setAuthReady(true);
      return undefined;
    }

    return onAuthStateChanged(firebase.auth, (currentUser) => {
      setUser(
        currentUser
          ? { uid: currentUser.uid, email: currentUser.email }
          : null,
      );
      setAuthReady(true);
    });
  });

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    try {
      const compressed = await compressImage(file);
      setImageData(compressed);
      setImageName(file.name);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not process image.',
      );
      setImageData('');
      setImageName('');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (!firebase) {
      setError('Firebase is not configured. Check your app environment.');
      return;
    }

    if (!user) {
      setError('Please sign in before submitting a project.');
      return;
    }

    if (title.trim().length < 4) {
      setError('Project title must contain at least 4 characters.');
      return;
    }

    if (summary.trim().length < 20) {
      setError('Write a summary of at least 20 characters.');
      return;
    }

    if (description.trim().length < 50) {
      setError('Project documentation must contain at least 50 characters.');
      return;
    }

    const validUrl = (value: string) => {
      if (!value.trim()) return true;
      try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
      } catch {
        return false;
      }
    };

    if (!validUrl(sourceUrl) || !validUrl(demoUrl)) {
      setError('Source and demo links must be valid HTTP or HTTPS URLs.');
      return;
    }

    setBusy(true);

    try {
      const project = {
        title: title.trim(),
        category,
        summary: summary.trim(),
        description: description.trim(),
        technologies: technologies
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 20),
        authorId: user.uid,
        authorEmail: user.email ?? '',
        creatorName: creatorName.trim() || 'Community Creator',
        imageData: imageData || '',
        sourceUrl: sourceUrl.trim(),
        demoUrl: demoUrl.trim(),
        status: 'pending_review',
        visibility: 'public',
        featured: false,
        schemaVersion: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // The existing Firestore rules permit signed-in users to create
      // their own pending-review project documents.
      await addDoc(collection(firebase.db, 'projects'), project);

      setSuccess(true);
      setTitle('');
      setSummary('');
      setDescription('');
      setTechnologies('');
      setImageData('');
      setImageName('');
      setSourceUrl('');
      setDemoUrl('');
      setCreatorName('');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Submission failed. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (!authReady) {
    return (
      <main className="min-h-[70vh] bg-[#080b08] px-6 py-24 text-center text-white">
        <LoaderCircle className="mx-auto animate-spin" />
        <p className="mt-4 text-white/60">Checking your sign-in…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[70vh] bg-[#080b08] px-6 py-24 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-lime-400" />
          <h1 className="mt-5 text-3xl font-semibold">Share your project</h1>
          <p className="mt-3 text-white/60">
            Sign in to submit your robotics, AI, IoT, environmental technology,
            electronics, or science project to the Snapbots community.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-xl bg-lime-400 px-6 py-3 font-semibold text-black hover:bg-lime-300"
          >
            Sign in to continue
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080b08] px-4 py-10 text-white sm:px-6 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-lime-400"
        >
          <ArrowLeft size={16} /> Back to projects
        </Link>

        <div className="mt-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lime-400">
            Snapbots Community
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Build something.
            <span className="block text-lime-400">Share it with the world.</span>
          </h1>
          <p className="mt-4 leading-7 text-white/60">
            Publish your work, document your process, and connect with people
            building the future. Every submission is reviewed before publication.
          </p>
        </div>

        {success ? (
          <section className="mt-10 rounded-3xl border border-lime-400/30 bg-lime-400/[0.06] p-8">
            <CheckCircle2 className="h-10 w-10 text-lime-400" />
            <h2 className="mt-4 text-2xl font-semibold">
              Project submitted for review
            </h2>
            <p className="mt-3 leading-7 text-white/65">
              Your submission has been saved. It will not appear publicly until
              an authorized moderator approves it.
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="mt-6 rounded-xl bg-lime-400 px-5 py-3 font-semibold text-black"
            >
              Return to projects
            </button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-8">
              <div>
                <h2 className="text-xl font-semibold">Project details</h2>
                <p className="mt-1 text-sm text-white/50">
                  Start with the idea and the problem you are solving.
                </p>
              </div>

              <div>
                <label className={labelClass}>Project title *</label>
                <input
                  className={inputClass}
                  required
                  minLength={4}
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous waste sorting robot"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    className={inputClass}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Public creator name</label>
                  <input
                    className={inputClass}
                    maxLength={80}
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="Your name, brand, or team"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Short summary *</label>
                <textarea
                  className={inputClass}
                  required
                  minLength={20}
                  maxLength={300}
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="What does it do, and why does it matter?"
                />
                <p className="mt-1 text-right text-xs text-white/40">
                  {summary.length}/300
                </p>
              </div>

              <div>
                <label className={labelClass}>Full documentation *</label>
                <textarea
                  className={inputClass}
                  required
                  minLength={50}
                  maxLength={15000}
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the problem, your solution, how it works, materials, experiments, results, limitations, and future improvements."
                />
              </div>

              <div>
                <label className={labelClass}>Technologies and components</label>
                <input
                  className={inputClass}
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="ESP32, Python, Arduino, machine learning"
                />
                <p className="mt-1 text-xs text-white/40">
                  Separate items with commas.
                </p>
              </div>
            </section>

            <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-8">
              <div>
                <h2 className="text-xl font-semibold">Media and links</h2>
                <p className="mt-1 text-sm text-white/50">
                  Images are compressed and stored directly in Firestore.
                  No Firebase Storage is used.
                </p>
              </div>

              <div>
                <label className={labelClass}>Project image</label>
                <label className="flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-white/20 px-5 py-8 text-center hover:border-lime-400/60">
                  {imageData ? (
                    <img
                      src={imageData}
                      alt="Project preview"
                      className="mb-4 max-h-56 rounded-xl object-contain"
                    />
                  ) : (
                    <ImagePlus className="mb-3 h-8 w-8 text-lime-400" />
                  )}
                  <span className="font-medium">
                    {imageName || 'Choose a project image'}
                  </span>
                  <span className="mt-1 text-xs text-white/45">
                    Image only · Original file up to 5 MB
                  </span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                  />
                </label>
              </div>

              <div>
                <label className={labelClass}>Source code URL</label>
                <input
                  className={inputClass}
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://github.com/yourname/project"
                />
              </div>

              <div>
                <label className={labelClass}>Demo or video URL</label>
                <input
                  className={inputClass}
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..."
                />
                <p className="mt-1 text-xs text-white/40">
                  Videos and large files must be hosted externally.
                </p>
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
              >
                {error}
              </div>
            )}

            <div className="flex items-start gap-3 rounded-2xl border border-white/10 p-4 text-sm leading-6 text-white/60">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-lime-400" />
              Your project is submitted for moderation. It is not automatically
              published, and you should only share material you have permission
              to make public.
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-6 py-4 font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {busy ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              {busy ? 'Submitting…' : 'Submit for review'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}