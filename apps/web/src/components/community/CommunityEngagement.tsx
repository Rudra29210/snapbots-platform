import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  Flag,
  Heart,
  LoaderCircle,
  MessageCircle,
  Send,
} from 'lucide-react';
import { getFirebase } from '@/lib/firebase';

type CommentRecord = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  parentId: string | null;
  status: 'visible' | 'hidden';
  createdAt?: { toDate?: () => Date } | null;
};

type Props = {
  projectId: string;
  projectAuthorId?: string;
};

const PAGE_SIZE = 10;
const MAX_COMMENT_LENGTH = 2000;
const MAX_REPORT_LENGTH = 1000;

function dateLabel(value?: CommentRecord['createdAt']): string {
  try {
    const date = value?.toDate?.();

    if (!date || Number.isNaN(date.getTime())) {
      return 'Just now';
    }

    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Just now';
  }
}

function toCommentRecord(
  item: QueryDocumentSnapshot<DocumentData>,
): CommentRecord {
  const data = item.data();

  return {
    id: item.id,
    authorId: typeof data.authorId === 'string' ? data.authorId : '',
    authorName:
      typeof data.authorName === 'string'
        ? data.authorName
        : 'Community member',
    text: typeof data.text === 'string' ? data.text : '',
    parentId: typeof data.parentId === 'string' ? data.parentId : null,
    status: data.status === 'hidden' ? 'hidden' : 'visible',
    createdAt: data.createdAt ?? null,
  };
}

export default function CommunityEngagement({
  projectId,
  projectAuthorId,
}: Props) {
  const firebase = getFirebase();

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [lastComment, setLastComment] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<CommentRecord | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const commentsRef = useMemo(
    () =>
      firebase
        ? collection(firebase.db, 'projects', projectId, 'comments')
        : null,
    [firebase, projectId],
  );

  useEffect(() => {
    if (!firebase) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      firebase.auth,
      (nextUser) => {
        setUser(nextUser);
        setAuthReady(true);
      },
      (authError) => {
        console.error('Authentication state error:', authError);
        setUser(null);
        setAuthReady(true);
      },
    );

    return unsubscribe;
  }, [firebase]);

  const refreshLikeCount = useCallback(async () => {
    if (!firebase) {
      setLikeCount(0);
      return;
    }

    try {
      const result = await getCountFromServer(
        collection(firebase.db, 'projects', projectId, 'likes'),
      );

      setLikeCount(result.data().count);
    } catch (countError) {
      console.error('Like count error:', countError);
      setError('Unable to load the like count. Check Firestore permissions.');
    }
  }, [firebase, projectId]);

  useEffect(() => {
    void refreshLikeCount();
  }, [refreshLikeCount]);

  useEffect(() => {
    if (!firebase || !user) {
      setLiked(false);
      return;
    }

    const likeRef = doc(
      firebase.db,
      'projects',
      projectId,
      'likes',
      user.uid,
    );

    return onSnapshot(
      likeRef,
      (snapshot) => setLiked(snapshot.exists()),
      (snapshotError) => {
        console.error('Like state error:', snapshotError);
        setError('Unable to load your like status.');
      },
    );
  }, [firebase, projectId, user]);

  const loadFirstPage = useCallback(async () => {
    if (!commentsRef) {
      setComments([]);
      setLastComment(null);
      setHasMore(false);
      setLoadingComments(false);
      return;
    }

    setLoadingComments(true);
    setError('');

    try {
      const firstQuery = query(
        commentsRef,
        where('status', '==', 'visible'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE),
      );

      const snapshot = await getDocs(firstQuery);
      const items = snapshot.docs.map(toCommentRecord);
      const docs = snapshot.docs;
      const lastDoc =
        docs.length > 0 ? docs[docs.length - 1] ?? null : null;

      setComments(items);
      setLastComment(lastDoc);
      setHasMore(docs.length === PAGE_SIZE);
    } catch (loadError) {
      console.error('Comment loading error:', loadError);
      setError(
        'Unable to load comments. Check Firestore permissions and indexes.',
      );
    } finally {
      setLoadingComments(false);
    }
  }, [commentsRef]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  async function loadMoreComments() {
    if (!commentsRef || !lastComment || loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);
    setError('');

    try {
      const nextQuery = query(
        commentsRef,
        where('status', '==', 'visible'),
        orderBy('createdAt', 'desc'),
        startAfter(lastComment),
        limit(PAGE_SIZE),
      );

      const snapshot = await getDocs(nextQuery);
      const items = snapshot.docs.map(toCommentRecord);
      const docs = snapshot.docs;
      const lastDoc = docs.length > 0 ? docs[docs.length - 1] : undefined;

      setComments((previous) => {
        const existingIds = new Set(
          previous.map((comment) => comment.id),
        );

        return [
          ...previous,
          ...items.filter((comment) => !existingIds.has(comment.id)),
        ];
      });

      if (lastDoc) {
        setLastComment(lastDoc);
      }

      setHasMore(docs.length === PAGE_SIZE);
    } catch (loadError) {
      console.error('Load more comments error:', loadError);
      setError('Unable to load more comments.');
    } finally {
      setLoadingMore(false);
    }
  }

  async function toggleLike() {
    if (!firebase || !user) {
      setError('Sign in to like this project.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const likeRef = doc(
        firebase.db,
        'projects',
        projectId,
        'likes',
        user.uid,
      );

      const existing = await getDoc(likeRef);

      if (existing.exists()) {
        await deleteDoc(likeRef);
        setLiked(false);
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        setLiked(true);
      }

      await refreshLikeCount();
    } catch (likeError) {
      console.error('Like update error:', likeError);
      setError('Could not update your like. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function submitComment() {
    if (!firebase || !user) {
      setError('Sign in to comment or reply.');
      return;
    }

    const text = draft.trim();

    if (!text) {
      setError('Write a comment before submitting.');
      return;
    }

    if (text.length > MAX_COMMENT_LENGTH) {
      setError(
        `Comments must be ${MAX_COMMENT_LENGTH} characters or fewer.`,
      );
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      await addDoc(
        collection(firebase.db, 'projects', projectId, 'comments'),
        {
          authorId: user.uid,
          authorName:
            user.displayName?.trim().slice(0, 80) ||
            user.email?.split('@')[0] ||
            'Community member',
          text,
          parentId: replyTo?.id ?? null,
          status: 'visible',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      );

      setDraft('');
      setReplyTo(null);
      setNotice('Your comment has been posted.');
      await loadFirstPage();
    } catch (commentError) {
      console.error('Comment submission error:', commentError);
      setError('Could not post your comment. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function reportContent(
    targetType: 'project' | 'comment',
    targetId: string,
  ) {
    if (!firebase || !user) {
      setError('Sign in to submit a report.');
      return;
    }

    const reason = window
      .prompt('Why are you reporting this content?')
      ?.trim();

    if (!reason) {
      return;
    }

    if (reason.length > MAX_REPORT_LENGTH) {
      setError(
        `Report reasons must be ${MAX_REPORT_LENGTH} characters or fewer.`,
      );
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      await addDoc(collection(firebase.db, 'communityReports'), {
        reporterId: user.uid,
        targetType,
        projectId,
        targetId,
        reason,
        status: 'open',
        createdAt: serverTimestamp(),
      });

      setNotice('Report submitted for moderator review.');
    } catch (reportError) {
      console.error('Report submission error:', reportError);
      setError('Could not submit the report. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const visibleComments = comments.filter(
    (comment) => comment.status === 'visible',
  );

  const topLevelComments = visibleComments.filter(
    (comment) => !comment.parentId,
  );

  function renderComment(comment: CommentRecord, depth = 0) {
    const replies = visibleComments.filter(
      (item) => item.parentId === comment.id,
    );

    const isCreator =
      Boolean(projectAuthorId) && user?.uid === projectAuthorId;

    const isOwnComment = user?.uid === comment.authorId;

    return (
      <article
        key={comment.id}
        className={`rounded-xl border border-white/10 bg-white/[0.025] p-4 ${
          depth > 0 ? 'ml-4 mt-3 sm:ml-8' : ''
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-sm font-semibold text-paper">
              {comment.authorName || 'Community member'}
            </span>

            {comment.authorId === projectAuthorId && (
              <span className="ml-2 rounded-full bg-lime/10 px-2 py-1 text-xs text-lime">
                Creator
              </span>
            )}

            <p className="mt-1 text-xs text-paper/40">
              {dateLabel(comment.createdAt)}
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void reportContent('comment', comment.id)}
            className="inline-flex items-center gap-1 text-xs text-paper/45 hover:text-red-300"
            aria-label="Report comment"
          >
            <Flag size={13} />
            Report
          </button>
        </div>

        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-paper/75">
          {comment.text}
        </p>

        {user && depth < 4 && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setReplyTo(comment);
                setDraft('');
                setError('');
              }}
              className="text-xs font-semibold text-lime hover:opacity-80"
            >
              Reply
            </button>

            {isCreator && !isOwnComment && (
              <span className="text-xs text-paper/40">
                You can reply as the project creator.
              </span>
            )}
          </div>
        )}

        {replies.map((reply) => renderComment(reply, depth + 1))}
      </article>
    );
  }

  return (
    <section className="mt-12 border-t border-white/10 pt-8 sm:mt-16 sm:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Community discussion
          </h2>
          <p className="mt-2 text-sm text-paper/50">
            Share feedback, ask questions, and help improve this project.
          </p>
        </div>

        <button
          type="button"
          disabled={busy || !authReady}
          onClick={() => void toggleLike()}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
            liked
              ? 'border-lime bg-lime text-ink'
              : 'border-white/15 text-paper hover:border-lime/50'
          } disabled:opacity-50`}
        >
          <Heart size={17} fill={liked ? 'currentColor' : 'none'} />
          {liked ? 'Liked' : 'Like'}
          <span>{likeCount}</span>
        </button>
      </div>

      <div className="mt-5">
        <button
          type="button"
          disabled={busy}
          onClick={() => void reportContent('project', projectId)}
          className="inline-flex items-center gap-2 text-xs text-paper/45 hover:text-red-300"
        >
          <Flag size={14} />
          Report this project
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-400/30 bg-red-400/5 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-lime/30 bg-lime/5 p-3 text-sm text-lime"
        >
          {notice}
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MessageCircle size={17} className="text-lime" />
          Add to the discussion
        </div>

        {!authReady ? (
          <p className="mt-3 text-sm text-paper/50">
            Checking sign-in status…
          </p>
        ) : !user ? (
          <p className="mt-3 text-sm text-paper/55">
            Sign in to like, comment, reply, or report.
          </p>
        ) : (
          <>
            {replyTo && (
              <div className="mt-3 flex items-start justify-between gap-3 rounded-lg bg-lime/5 p-3 text-sm">
                <p className="text-paper/70">
                  Replying to <strong>{replyTo.authorName}</strong>
                  <span className="mt-1 block text-xs text-paper/45">
                    {replyTo.text.slice(0, 120)}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-paper/50 hover:text-paper"
                >
                  Cancel
                </button>
              </div>
            )}

            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
              maxLength={MAX_COMMENT_LENGTH}
              placeholder={
                replyTo ? 'Write your reply…' : 'Write a comment…'
              }
              className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-ink p-3 text-sm text-paper outline-none placeholder:text-paper/35 focus:border-lime/50"
            />

            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-paper/40">
                {draft.length}/{MAX_COMMENT_LENGTH}
              </span>

              <button
                type="button"
                disabled={busy || !draft.trim()}
                onClick={() => void submitComment()}
                className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
              >
                {busy ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {replyTo ? 'Post reply' : 'Post comment'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-7 space-y-4">
        {loadingComments ? (
          <div className="flex items-center gap-2 py-8 text-sm text-paper/50">
            <LoaderCircle size={18} className="animate-spin" />
            Loading comments…
          </div>
        ) : topLevelComments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-7 text-center">
            <MessageCircle size={28} className="mx-auto text-paper/30" />
            <p className="mt-3 text-sm text-paper/55">
              No comments yet. Start the conversation.
            </p>
          </div>
        ) : (
          topLevelComments.map((comment) => renderComment(comment))
        )}

        {!loadingComments && hasMore && (
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void loadMoreComments()}
            className="w-full rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-paper/75 hover:border-lime/50 disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : 'Load more comments'}
          </button>
        )}
      </div>
    </section>
  );
}