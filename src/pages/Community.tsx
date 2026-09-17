import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Avatar,
  Empty,
  ErrorState,
  Loading,
  Modal,
  PageHeading,
  SectionHeading,
  Tags,
} from "../components";
import { useAuth, useData, useToast } from "../context";
import { send } from "../api";
import type { Group, Post } from "../types";

export function Community() {
  const posts = useData<Post[]>("/posts");
  const groups = useData<Group[]>("/groups");
  const [tab, setTab] = useState("Discussions");
  const [creating, setCreating] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="YOU BELONG HERE"
        title={
          <>
            A whole community of curious minds
            <span className="heading-sprout">✦</span>
          </>
        }
        description="Swap ideas, share your wins, and find people who get excited about the same things."
        action={
          <button className="btn" onClick={() => setCreating(true)}>
            <Plus size={16} />
            Start a conversation
          </button>
        }
      />
      <div className="community-banner">
        <div className="community-banner-icon">
          <Users size={29} />
        </div>
        <div>
          <h2>Great things happen between people.</h2>
          <p>
            A question, a resource, a little encouragement. What will you share
            today?
          </p>
        </div>
        <span>✦</span>
      </div>
      <div className="tabs">
        <button
          className={tab === "Discussions" ? "active" : ""}
          onClick={() => setTab("Discussions")}
        >
          Discussions
        </button>
        <button
          className={tab === "Groups" ? "active" : ""}
          onClick={() => setTab("Groups")}
        >
          Groups
        </button>
        <Link to="/resources">
          Resources <ArrowRight size={14} />
        </Link>
      </div>
      <div className="community-layout">
        <section>
          {tab === "Discussions" ? (
            posts.error ? (
              <ErrorState message={posts.error} retry={posts.reload} />
            ) : posts.loading ? (
              <Loading />
            ) : posts.data?.length ? (
              <div className="posts-list">
                {posts.data.map((p) => (
                  <PostCard post={p} key={p._id} />
                ))}
              </div>
            ) : (
              <Empty title="Be the first to say hello">
                Start a conversation and help this community grow.
              </Empty>
            )
          ) : groups.error ? (
            <ErrorState message={groups.error} retry={groups.reload} />
          ) : (
            <div className="group-grid">
              {groups.data?.map((g) => (
                <GroupCard group={g} key={g._id} />
              ))}
            </div>
          )}
        </section>
        <aside>
          <div className="card popular-groups">
            <SectionHeading title="Find your circle" />
            {groups.data?.slice(0, 4).map((g) => (
              <GroupCard key={g._id} group={g} compact />
            ))}
          </div>
          <div className="community-note">
            <Sparkles size={22} />
            <h3>A kind word can go a long way.</h3>
            <p>Be curious. Be generous. Every expert was once a beginner.</p>
            <span>That’s the SkillBridge way. ♡</span>
          </div>
        </aside>
      </div>
      {creating && (
        <CreatePost close={() => setCreating(false)} done={posts.reload} />
      )}
    </>
  );
}
function GroupCard({
  group,
  compact = false,
}: {
  group: Group;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const [members, setMembers] = useState(group.members);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const joined = members.includes(user!._id);
  async function toggle() {
    setBusy(true);
    try {
      const updated = await send<Group>(`/groups/${group._id}/join`);
      setMembers(updated.members);
      toast(joined ? "You left the group." : `Welcome to ${group.name}!`);
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className={`group-card ${compact ? "compact" : "card"}`}>
      <span
        className={`group-icon ${group.category === "Design" ? "pink" : "purple"}`}
      >
        <Users size={20} />
      </span>
      <div>
        <h3>{group.name}</h3>
        <p>{members.length} curious minds</p>
        {!compact && <p className="group-description">{group.description}</p>}
      </div>
      <button
        className={`btn small ${joined ? "subtle" : "secondary"}`}
        onClick={toggle}
        disabled={busy}
      >
        {joined ? "Joined ✓" : "Join"}
      </button>
    </article>
  );
}
function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  async function like() {
    setBusy(true);
    try {
      const result = await send<{ likes: string[] }>(`/posts/${post._id}/like`);
      setLikes(result.likes);
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  async function comment(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await send<Post>(`/posts/${post._id}/comments`, { body });
      setComments(result.comments);
      setBody("");
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="post-card card">
      <div className="post-author">
        <Link to={`/profile/${post.author._id}`}>
          <Avatar person={post.author} />
        </Link>
        <div>
          <Link to={`/profile/${post.author._id}`} className="name">
            {post.author.name}
          </Link>
          <p>
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}{" "}
            <span>·</span> {post.author.major}
          </p>
        </div>
      </div>
      <h2>{post.title}</h2>
      <p className="post-body">{post.body}</p>
      <Tags items={post.tags} />
      <div className="post-footer">
        <button
          className={likes.includes(user!._id) ? "liked" : ""}
          onClick={like}
          disabled={busy}
        >
          <Heart
            size={17}
            fill={likes.includes(user!._id) ? "currentColor" : "none"}
          />
          {likes.length}
          <span>A little love</span>
        </button>
        <button onClick={() => setExpanded((v) => !v)}>
          <MessageCircle size={16} />
          {comments.length} comments
        </button>
      </div>
      {expanded && (
        <div className="comments">
          {comments.map((c) => (
            <div className="comment" key={c._id}>
              <Avatar person={c.author} size="small" />
              <div>
                <strong>{c.author.name}</strong>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
          <form onSubmit={comment}>
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a little to the conversation…"
              aria-label="Write a comment"
              required
              maxLength={1000}
            />
            <button
              className="btn small"
              disabled={busy}
              aria-label="Post comment"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
function CreatePost({ close, done }: { close: () => void; done: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await send("/posts", {
        title: form.get("title"),
        body: form.get("body"),
        tags: String(form.get("tags"))
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast("Your conversation is out in the world.");
      done();
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="What’s on your curious mind?" close={close}>
      <p className="muted">
        A question, an idea, a little win. This is your space.
      </p>
      <form onSubmit={submit} className="form">
        <label>
          Give it a title
          <input
            name="title"
            placeholder="Start with something worth sharing…"
            required
            maxLength={140}
          />
        </label>
        <label>
          Your story
          <textarea
            name="body"
            placeholder="Tell us a little more."
            required
            rows={5}
            maxLength={3000}
          />
        </label>
        <label>
          Tags <span className="label-hint">Up to 4, separated by commas</span>
          <input name="tags" placeholder="React, Study Tips" />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="btn" disabled={busy}>
          {busy ? "Sharing…" : "Share with the community"}
          <ArrowRight size={16} />
        </button>
      </form>
    </Modal>
  );
}
