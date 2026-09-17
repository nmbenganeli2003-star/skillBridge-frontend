import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  FileText,
  Plus,
  Search,
  Sparkles,
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
import { API, send } from "../api";
import type { Resource } from "../types";

export function Resources() {
  const resources = useData<Resource[]>("/resources");
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All resources");
  const [creating, setCreating] = useState(false);
  const items = (resources.data || []).filter(
    (r) =>
      (!q ||
        `${r.title} ${r.description} ${r.tags.join(" ")}`
          .toLowerCase()
          .includes(q.toLowerCase())) &&
      (category === "All resources" || category === "Saved"
        ? category !== "Saved" || user?.savedResources?.includes(r._id)
        : r.category === category),
  );
  return (
    <>
      <PageHeading
        eyebrow="GOOD KNOWLEDGE IS BETTER SHARED"
        title="A little help for your next big step."
        description="Notes, guides, and useful discoveries. Shared by learners, for learners."
        action={
          <button className="btn" onClick={() => setCreating(true)}>
            <Plus size={16} />
            Share a resource
          </button>
        }
      />
      <div className="resource-search">
        <Search size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find your next useful discovery…"
          aria-label="Search resources"
        />
      </div>
      <div className="tabs">
        {["All resources", "Programming", "Design", "Saved"].map((c) => (
          <button
            className={category === c ? "active" : ""}
            onClick={() => setCategory(c)}
            key={c}
          >
            {c === "Saved" && <Bookmark size={14} />} {c}
          </button>
        ))}
      </div>
      {resources.error ? (
        <ErrorState message={resources.error} retry={resources.reload} />
      ) : resources.loading ? (
        <Loading />
      ) : items.length ? (
        <div className="resources-grid">
          {items.map((r) => (
            <Link
              className="resource-card card"
              key={r._id}
              to={`/resources/${r._id}`}
            >
              <div
                className={`resource-preview ${r.category === "Design" ? "design-preview" : ""}`}
              >
                <span className="resource-preview-label">
                  SKILLBRIDGE / SHARED KNOWLEDGE
                </span>
                <span className="resource-preview-icon">
                  {r.category === "Design" ? (
                    <Sparkles size={42} />
                  ) : (
                    <FileText size={42} />
                  )}
                </span>
                <h2>{r.title}</h2>
                <span className="resource-preview-bottom">
                  A little knowledge goes a long way. <span>↗</span>
                </span>
              </div>
              <div className="resource-card-body">
                <Tags items={r.tags} />
                <h3>{r.title}</h3>
                <p>{r.description}</p>
                <div className="resource-card-footer">
                  <Avatar person={r.author} size="small" />
                  <span>{r.author.name}</span>
                  <span>
                    <ArrowDownToLine size={13} />
                    {r.downloads}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty title="No resources found">
          Try a different search, or share something useful with the community.
        </Empty>
      )}
      {creating && (
        <CreateResource
          close={() => setCreating(false)}
          done={resources.reload}
        />
      )}
    </>
  );
}
export function ResourceDetail() {
  const { id } = useParams();
  const resource = useData<Resource>(`/resources/${id}`);
  const related = useData<Resource[]>("/resources");
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const r = resource.data;
  const saved = user?.savedResources?.includes(id!);
  async function save() {
    setBusy(true);
    try {
      const result = await send<{ saved: boolean }>(`/resources/${id}/save`);
      if (user)
        setUser({
          ...user,
          savedResources: result.saved
            ? [...(user.savedResources || []), id!]
            : user.savedResources?.filter((r) => r !== id),
        });
      toast(
        result.saved
          ? "Saved for a little later."
          : "Removed from saved resources.",
      );
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    setBusy(true);
    try {
      const response = await fetch(`${API}/api/resources/${id}/download`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Download failed. Please try again.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${r!.title.replace(/[^a-z0-9]/gi, "-")}.md`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resource.reload();
      toast("Your resource is ready. Happy learning!");
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  if (resource.error)
    return <ErrorState message={resource.error} retry={resource.reload} />;
  if (resource.loading || !r) return <Loading />;
  return (
    <>
      <Link className="back-link" to="/resources">
        <ArrowLeft size={15} />
        Back to your discoveries
      </Link>
      <div className="resource-detail-layout">
        <section className="card resource-detail">
          <div className="resource-title">
            <span className="resource-icon orange">
              <FileText size={31} />
            </span>
            <div>
              <h1>{r.title}</h1>
              <p>
                Shared by{" "}
                <Link to={`/profile/${r.author._id}`}>{r.author.name}</Link>
                <span> · </span>
                {new Date(r.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <Tags items={r.tags} />
            </div>
          </div>
          <div className="resource-actions">
            <button className="btn" disabled={busy} onClick={download}>
              <ArrowDownToLine size={16} />
              Download notes
            </button>
            <button
              className={`btn secondary ${saved ? "saved" : ""}`}
              disabled={busy}
              onClick={save}
            >
              {saved ? <Check size={16} /> : <Bookmark size={16} />}{" "}
              {saved ? "Saved" : "Save for later"}
            </button>
            <span>{r.downloads} downloads · Markdown</span>
          </div>
          <div className="document-preview">
            <div className="document-heading">
              <LogoMark />
              <span>THE SHARED KNOWLEDGE SERIES</span>
            </div>
            <h2>{r.title}</h2>
            <p className="document-subtitle">
              Your next “I get it” moment starts here.
            </p>
            <pre>{r.content}</pre>
            <div className="document-footer">
              Learn together. Grow together. <span>skillbridge</span>
            </div>
          </div>
          <h3>About this resource</h3>
          <p className="resource-description">{r.description}</p>
        </section>
        <aside>
          <div className="card related-resources">
            <SectionHeading title="Keep exploring" />
            {related.data
              ?.filter((v) => v._id !== id)
              .slice(0, 4)
              .map((v) => (
                <Link key={v._id} to={`/resources/${v._id}`}>
                  <span className="tiny-icon purple">
                    <FileText size={19} />
                  </span>
                  <div>
                    <strong>{v.title}</strong>
                    <p>{v.category}</p>
                  </div>
                  <ArrowRight size={14} />
                </Link>
              ))}
          </div>
          <div className="card shared-by">
            <span className="eyebrow">A LITTLE THANKS TO</span>
            <Avatar person={r.author} size="large" />
            <h3>{r.author.name}</h3>
            <p>{r.author.major}</p>
            <Link
              className="btn secondary small"
              to={`/profile/${r.author._id}`}
            >
              Meet the learner <ArrowRight size={14} />
            </Link>
          </div>
          <div className="resource-tip">
            <BookOpen size={23} />
            <p>Found something useful? Pass a little knowledge on.</p>
            <Link to="/resources">Explore the library →</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
function LogoMark() {
  return <img src="/favicon.svg" alt="SkillBridge" width="24" height="24" />;
}
function CreateResource({
  close,
  done,
}: {
  close: () => void;
  done: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    try {
      await send("/resources", {
        ...data,
        tags: String(data.tags)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      done();
      toast("Thanks for sharing a little knowledge!");
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Share something worth knowing" close={close}>
      <form className="form" onSubmit={submit}>
        <label>
          Resource title
          <input
            name="title"
            required
            maxLength={120}
            placeholder="e.g. My Python study notes"
          />
        </label>
        <label>
          A short description
          <textarea
            name="description"
            required
            maxLength={1000}
            placeholder="What will someone learn?"
          />
        </label>
        <label>
          Category
          <select name="category">
            {[
              "Programming",
              "Design",
              "Languages",
              "Sciences",
              "Business",
              "Arts & Others",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Tags <span className="label-hint">Up to 4, separated by commas</span>
          <input name="tags" placeholder="Python, Study Notes" />
        </label>
        <label>
          Your notes <span className="label-hint">Plain text or Markdown</span>
          <textarea
            name="content"
            rows={7}
            required
            maxLength={30000}
            placeholder="Share your notes, examples, and discoveries…"
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" disabled={busy}>
          {busy ? "Sharing…" : "Share resource"}
          <ArrowRight size={16} />
        </button>
      </form>
    </Modal>
  );
}
