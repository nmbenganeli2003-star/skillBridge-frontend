import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Code2,
  MapPin,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { useAuth, useToast } from "./context";
import { send } from "./api";
import type { Person, Session } from "./types";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className={`logo ${light ? "light" : ""}`}
      aria-label="SkillBridge home"
    >
      <img src="/favicon.svg" alt="" />
      SkillBridge<span className="logo-dot">.</span>
    </Link>
  );
}
const avatarColors = [
  "#e8d8c9",
  "#d6e5d9",
  "#ead7e8",
  "#d6e4f0",
  "#f8ddc5",
  "#d9d7ed",
  "#c5e0e1",
  "#f1d6d8",
];
export function Avatar({
  person,
  size = "",
}: {
  person: Pick<Person, "name" | "avatar">;
  size?: string;
}) {
  return (
    <div
      className={`avatar ${size}`}
      style={{
        background: avatarColors[(person.avatar || 0) % avatarColors.length],
      }}
      aria-label={person.name}
    >
      {person.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </div>
  );
}
export function Tags({ items }: { items: string[] }) {
  return (
    <div className="tags">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}
export function Empty({
  title = "Nothing here yet",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <BookOpen size={30} />
      <h3>{title}</h3>
      <p>
        {children || "Your next learning adventure is just around the corner."}
      </p>
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      Finding your next opportunity…
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="error-panel" role="alert">
      <h3>We couldn’t load this just yet.</h3>
      <p>{message}</p>
      {retry && (
        <button className="btn" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function SectionHeading({
  title,
  to,
  label = "View all",
}: {
  title: string;
  to?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {to && (
        <Link to={to}>
          {label}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={close}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function PeerCard({
  person,
  compact = false,
}: {
  person: Person;
  compact?: boolean;
}) {
  const { user, setUser } = useAuth();
  const [connected, setConnected] = useState(person.connected);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  async function connect() {
    setBusy(true);
    try {
      await send(`/users/${person._id}/connect`);
      setConnected(true);
      if (user)
        setUser({
          ...user,
          connections: [...new Set([...(user.connections || []), person._id])],
        });
      toast(`You’re now connected with ${person.name.split(" ")[0]}.`);
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className={`peer-card ${compact ? "compact" : ""}`}>
      <div className="peer-top">
        <Link to={`/profile/${person._id}`}>
          <Avatar person={person} />
        </Link>
        <div className="peer-info">
          <Link className="name" to={`/profile/${person._id}`}>
            {person.name}
          </Link>
          <p>
            {person.major} <span>· {person.year}</span>
          </p>
          {compact && <p>Offers: {person.skillsOffered.join(", ")}</p>}
        </div>
        {!compact && (
          <span className="match">
            <Sparkles size={11} />
            {person.match}% match
          </span>
        )}
      </div>
      {!compact && (
        <>
          <p className="peer-bio">{person.bio}</p>
          <Tags items={person.skillsOffered.slice(0, 3)} />
          <div className="peer-meta">
            <span>
              <MapPin size={13} />
              {person.location}
            </span>
            <span>
              <Star size={13} />
              {person.rating || "New"}
            </span>
          </div>
        </>
      )}
      <div className="peer-bottom">
        {compact ? (
          <span className="match">{person.match}% match</span>
        ) : (
          <Link to={`/profile/${person._id}`} className="text-link">
            View profile <ArrowRight size={13} />
          </Link>
        )}
        <button
          className={`btn small ${connected ? "subtle" : compact ? "green" : ""}`}
          disabled={connected || busy}
          onClick={connect}
        >
          {connected ? (
            <>
              <Check size={13} />
              Connected
            </>
          ) : busy ? (
            "Connecting…"
          ) : (
            "Connect"
          )}
        </button>
      </div>
    </article>
  );
}
export function SessionCard({
  session,
  actions = false,
  refresh,
}: {
  session: Session;
  actions?: boolean;
  refresh?: () => void;
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const peer =
    session.requester._id === user?._id ? session.recipient : session.requester;
  async function update(status: string) {
    setBusy(true);
    try {
      await send(`/sessions/${session._id}`, { status }, "PATCH");
      toast(`Session ${status.toLowerCase()}.`);
      refresh?.();
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="session-card">
      <Avatar person={peer} />
      <div className="session-info">
        <h3>{session.title}</h3>
        <p>
          with <Link to={`/profile/${peer._id}`}>{peer.name}</Link>
        </p>
        <p className="session-time">
          <CalendarDays size={12} />
          {new Date(session.startsAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
          <span>·</span>
          {new Date(session.startsAt).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
          <span>·</span>
          {session.duration} min
        </p>
        <span className="format">
          <span /> {session.format}
        </span>
        {actions && !["Completed", "Cancelled"].includes(session.status) && (
          <div className="session-actions">
            {session.status === "Pending" &&
              session.recipient._id === user?._id && (
                <button
                  disabled={busy}
                  className="text-link"
                  onClick={() => update("Confirmed")}
                >
                  Accept request
                </button>
              )}
            {session.status === "Confirmed" &&
              new Date(session.startsAt) <= new Date() && (
                <button
                  disabled={busy}
                  className="text-link"
                  onClick={() => update("Completed")}
                >
                  Mark completed
                </button>
              )}
            <button
              disabled={busy}
              className="text-link muted"
              onClick={() => update("Cancelled")}
            >
              Cancel session
            </button>
          </div>
        )}
      </div>
      <span className={`status ${session.status.toLowerCase()}`}>
        {session.status}
      </span>
      {actions && session.status === "Completed" && (
        <button
          className="text-link review-link"
          onClick={() => setReviewing(true)}
        >
          <Star size={13} />
          Leave a review
        </button>
      )}
      {reviewing && (
        <ReviewSession session={session} close={() => setReviewing(false)} />
      )}
    </article>
  );
}
export function RequestSession({
  peer,
  close,
}: {
  peer: Person;
  close: () => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await send("/sessions", {
        recipient: peer._id,
        title: form.get("title"),
        startsAt: new Date(String(form.get("startsAt"))).toISOString(),
        duration: Number(form.get("duration")),
        format: form.get("format"),
        notes: form.get("notes"),
      });
      toast("Session request sent!");
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Let’s learn something together" close={close}>
      <p className="muted">Request a session with {peer.name}.</p>
      <form onSubmit={submit} className="form">
        <label>
          What would you like to learn?
          <input
            name="title"
            placeholder="e.g. Getting started with React"
            required
            maxLength={120}
          />
        </label>
        <label>
          Date and time
          <input type="datetime-local" name="startsAt" required />
        </label>
        <div className="form-row">
          <label>
            Duration
            <select name="duration">
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </label>
          <label>
            Meet
            <select name="format">
              <option>Online</option>
              <option>In person</option>
            </select>
          </label>
        </div>
        <label>
          A little more detail
          <textarea
            name="notes"
            placeholder="What would you like to work on?"
            maxLength={1000}
          />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="btn" disabled={busy}>
          {busy ? "Sending…" : "Send session request"}
          <ArrowRight size={16} />
        </button>
      </form>
    </Modal>
  );
}
export function LearningArt() {
  return (
    <div
      className="learning-art"
      aria-label="Illustration of students sharing skills"
    >
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="floating-icon code">
        <Code2 />
      </div>
      <div className="floating-icon book">
        <BookOpen />
      </div>
      <div className="floating-icon people">
        <Users />
      </div>
      <div className="art-spark spark-one">✦</div>
      <div className="art-spark spark-two">✧</div>
      <svg
        viewBox="0 0 580 400"
        role="img"
        aria-label="Three learners working together on their laptops"
      >
        <ellipse cx="292" cy="373" rx="250" ry="18" fill="#171b43" />
        <path
          d="M88 280Q83 197 145 185Q207 180 221 283L208 358H76Z"
          fill="#ffc65d"
        />
        <path
          d="M196 265Q201 159 270 159Q329 153 353 263L337 352H203Z"
          fill="#a678e5"
        />
        <path
          d="M347 285Q350 204 421 203Q481 207 502 299L491 367H344Z"
          fill="#35a38c"
        />
        <path
          d="M236 153Q217 82 264 74Q310 60 323 113L323 190L225 194Z"
          fill="#14172f"
        />
        <ellipse cx="273" cy="121" rx="32" ry="41" fill="#dba57b" />
        <path
          d="M243 103Q263 101 280 79Q286 105 307 108L302 82L267 69L243 87Z"
          fill="#14172f"
        />
        <rect x="257" y="151" width="30" height="27" rx="12" fill="#dba57b" />
        <ellipse cx="149" cy="152" rx="34" ry="43" fill="#b8764e" />
        <path
          d="M114 152Q96 116 116 105Q111 92 130 94Q140 76 155 92Q179 82 184 104Q197 112 178 137L163 128L148 134L133 123L124 151Z"
          fill="#14172f"
        />
        <path d="M139 189L158 186L164 210L139 218Z" fill="#b8764e" />
        <ellipse cx="417" cy="167" rx="34" ry="41" fill="#c78a62" />
        <path
          d="M383 165Q369 133 392 124Q402 110 425 121L450 140L451 164L438 156L423 142L398 146L394 166Z"
          fill="#14172f"
        />
        <path d="M405 203L431 202L436 221L414 232Z" fill="#c78a62" />
        <g fill="#14172f">
          <circle cx="140" cy="151" r="2.7" />
          <circle cx="163" cy="151" r="2.7" />
          <circle cx="264" cy="123" r="2.5" />
          <circle cx="286" cy="123" r="2.5" />
          <circle cx="406" cy="169" r="2.5" />
          <circle cx="428" cy="169" r="2.5" />
        </g>
        <g stroke="#7c493b" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M144 169Q152 176 160 168" />
          <path d="M266 140Q275 146 284 138" />
          <path d="M410 186Q419 191 425 184" />
        </g>
        <path
          d="M111 229L97 287Q99 311 137 314L194 319L197 302L139 285L146 235"
          fill="#ffc65d"
          stroke="#e8a447"
          strokeWidth="3"
        />
        <path
          d="M479 251L489 311L415 331L402 314L449 290L446 248"
          fill="#35a38c"
          stroke="#248576"
          strokeWidth="3"
        />
        <path
          d="M223 211L209 267L258 292L271 277L242 251L253 209"
          fill="#a678e5"
          stroke="#875bc7"
          strokeWidth="3"
        />
        <path d="M111 340L214 334L257 376H89Z" fill="#33517a" />
        <path d="M333 345L478 342L504 378H320Z" fill="#253951" />
        <path d="M194 234H302L283 298H210Z" fill="#272c52" />
        <path d="M186 296H292L306 304H193Z" fill="#454869" />
        <circle cx="250" cy="265" r="6" fill="#b8a4ea" />
        <path d="M129 282H263L287 355H149Z" fill="#3b4264" />
        <path d="M144 354H300V363H145Z" fill="#5b6282" />
        <circle cx="207" cy="319" r="7" fill="#acb2ce" />
        <path d="M319 292H442L424 363H301Z" fill="#b2bdcf" />
        <path d="M294 361H441V369H294Z" fill="#d0d7e3" />
        <circle cx="372" cy="327" r="7" fill="#f6f7ff" />
      </svg>
      <div className="art-caption">
        <span className="online-dot" />A little knowledge. A world of
        possibility.
      </div>
    </div>
  );
}

function ReviewSession({
  session,
  close,
}: {
  session: Session;
  close: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await send(`/sessions/${session._id}/review`, {
        rating: Number(data.get("rating")),
        body: data.get("body"),
      });
      toast("Thank you for sharing your experience!");
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="How was your learning session?" close={close}>
      <p className="muted">{session.title}</p>
      <form className="form" onSubmit={submit}>
        <label>
          Your rating
          <select name="rating" defaultValue="5">
            <option value="5">5 — Wonderful</option>
            <option value="4">4 — Great</option>
            <option value="3">3 — Good</option>
            <option value="2">2 — Could be better</option>
            <option value="1">1 — Disappointing</option>
          </select>
        </label>
        <label>
          A little about your experience
          <textarea
            name="body"
            required
            maxLength={1000}
            placeholder="What did you learn together?"
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" disabled={busy}>
          {busy ? "Sharing…" : "Share your review"}
        </button>
      </form>
    </Modal>
  );
}
