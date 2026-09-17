import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  Pencil,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import {
  Avatar,
  Empty,
  ErrorState,
  Loading,
  Modal,
  PageHeading,
  RequestSession,
  Tags,
} from "../components";
import { useAuth, useData, useToast } from "../context";
import { send } from "../api";
import type { Message, Person, Review } from "../types";

export function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const profile = useData<Person>(`/users/${id || user?._id}`);
  const reviews = useData<Review[]>(`/users/${id || user?._id}/reviews`);
  const [tab, setTab] = useState("About");
  const [request, setRequest] = useState(false);
  const [messaging, setMessaging] = useState(params.has("message"));
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const person = profile.data;
  const own = person?._id === user?._id;
  async function connect() {
    if (!person) return;
    setBusy(true);
    try {
      await send(`/users/${person._id}/connect`);
      profile.reload();
      toast("A new connection. A new possibility.");
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  if (profile.error)
    return <ErrorState message={profile.error} retry={profile.reload} />;
  if (profile.loading || !person) return <Loading />;
  return (
    <>
      <div className="profile-breadcrumb">
        <Link to="/explore">Community</Link>
        <span>/</span>
        {own ? "Your profile" : person.name}
      </div>
      <section className="profile-hero card">
        <div className="profile-cover">
          <div className="mountain m1" />
          <div className="mountain m2" />
          <div className="mountain m3" />
          <div className="mountain m4" />
          <span className="cover-star">✦</span>
          <span className="cover-caption">ALWAYS A LITTLE FURTHER.</span>
        </div>
        <div className="profile-identity">
          <Avatar person={person} size="xl" />
          <div className="profile-heading">
            <div>
              <h1>
                {person.name}{" "}
                <span className="profile-status">
                  <span className="online-dot" />
                  Open to learning
                </span>
              </h1>
              <p>
                {person.major} <span>·</span> {person.year} <span>·</span>{" "}
                {person.university}
              </p>
              <div className="profile-rating">
                <Star size={16} fill="currentColor" />
                <strong>{person.rating || "New learner"}</strong>
                <span>({person.reviewCount} reviews)</span>
                <span className="profile-verified">
                  <ShieldCheck size={14} />
                  Community member
                </span>
              </div>
            </div>
            <div className="profile-actions">
              {own ? (
                <Link className="btn" to="/settings">
                  <Pencil size={15} />
                  Edit profile
                </Link>
              ) : (
                <>
                  <button className="btn" onClick={() => setRequest(true)}>
                    <CalendarDays size={15} />
                    Request a session
                  </button>
                  <button
                    className="btn secondary"
                    onClick={() => setMessaging(true)}
                  >
                    <MessageCircle size={16} />
                    Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="tabs profile-tabs">
        {[
          "About",
          "Skills offered",
          "Skills wanted",
          "Availability",
          "Reviews",
        ].map((t) => (
          <button
            className={tab === t ? "active" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="profile-columns">
        <section className="card profile-about">
          {tab === "Reviews" ? (
            <>
              <h2>Learning, in their words</h2>
              {reviews.error ? (
                <ErrorState message={reviews.error} retry={reviews.reload} />
              ) : reviews.data?.length ? (
                <div className="reviews-list">
                  {reviews.data.map((r) => (
                    <article className="review" key={r._id}>
                      <div>
                        <Avatar person={r.author} size="small" />
                        <strong>{r.author.name}</strong>
                        <span>
                          <Star size={12} fill="currentColor" />
                          {r.rating}
                        </span>
                      </div>
                      <p>{r.body}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <Empty title="A new learning story">
                  Reviews from completed sessions will appear here.
                </Empty>
              )}
            </>
          ) : tab === "About" ? (
            <>
              <span className="eyebrow">A LITTLE ABOUT ME</span>
              <h2>
                Hi, I’m {person.name.split(" ")[0]} <span>👋</span>
              </h2>
              <p className="bio">{person.bio}</p>
              <div className="profile-facts">
                <div>
                  <MapPin size={19} />
                  <div>
                    <strong>Based in</strong>
                    <p>{person.location}</p>
                  </div>
                </div>
                <div>
                  <Clock3 size={19} />
                  <div>
                    <strong>Let’s find a time</strong>
                    <p>{person.availability}</p>
                  </div>
                </div>
              </div>
              <div className="profile-quote">
                <Sparkles size={20} />
                <p>“The best part of learning is sharing what you discover.”</p>
              </div>
            </>
          ) : tab === "Availability" ? (
            <>
              <h2>Make time to learn</h2>
              <p className="bio">{person.availability}</p>
              <p className="muted">
                Session times are shown in your device’s local time zone. Send a
                request to agree on a time together.
              </p>
              {!own && (
                <button className="btn" onClick={() => setRequest(true)}>
                  Suggest a time <ArrowRight size={16} />
                </button>
              )}
            </>
          ) : (
            <>
              <h2>
                {tab === "Skills offered"
                  ? "Here’s what I can share"
                  : "Here’s what I’d love to learn"}
              </h2>
              <p className="bio">
                {tab === "Skills offered"
                  ? "Let’s turn what I know into something you can use."
                  : "Always curious. Always room to grow."}
              </p>
              <Tags
                items={
                  tab === "Skills offered"
                    ? person.skillsOffered
                    : person.skillsWanted
                }
              />
              {!(
                tab === "Skills offered"
                  ? person.skillsOffered
                  : person.skillsWanted
              ).length && <p className="muted">No skills added yet.</p>}
            </>
          )}
        </section>
        <aside>
          <div className="card profile-skills">
            <h3>
              <span className="tiny-icon purple">
                <Sparkles size={16} />
              </span>
              I can help with
            </h3>
            <Tags items={person.skillsOffered} />
            {!person.skillsOffered.length && (
              <p className="muted">Still exploring.</p>
            )}
            <hr />
            <h3>
              <span className="tiny-icon pink">
                <Star size={16} />
              </span>
              I’d love to learn
            </h3>
            <Tags items={person.skillsWanted} />
            {!person.skillsWanted.length && (
              <p className="muted">Still exploring.</p>
            )}
          </div>
          {!own && (
            <div className="connect-card">
              <h3>A good connection starts here.</h3>
              <p>Keep {person.name.split(" ")[0]} in your learning circle.</p>
              <button
                className="btn full"
                disabled={person.connected || busy}
                onClick={connect}
              >
                {person.connected ? (
                  <>
                    <Check size={15} />
                    Connected
                  </>
                ) : busy ? (
                  "Connecting…"
                ) : (
                  "Let’s connect"
                )}
              </button>
            </div>
          )}
        </aside>
      </div>
      {request && (
        <RequestSession peer={person} close={() => setRequest(false)} />
      )}{" "}
      {messaging && !own && (
        <MessageDialog person={person} close={() => setMessaging(false)} />
      )}
    </>
  );
}
function MessageDialog({
  person,
  close,
}: {
  person: Person;
  close: () => void;
}) {
  const { user } = useAuth();
  const messages = useData<Message[]>(`/messages/${person._id}`);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  useEffect(() => {
    const timer = setInterval(messages.reload, 10000);
    return () => clearInterval(timer);
  }, [person._id]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      await send(`/messages/${person._id}`, { body });
      setBody("");
      messages.reload();
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={`Chat with ${person.name.split(" ")[0]}`} close={close}>
      <div className="message-list">
        {messages.error ? (
          <ErrorState message={messages.error} retry={messages.reload} />
        ) : messages.data?.length ? (
          messages.data.map((m) => (
            <div
              className={`message ${m.sender === user?._id ? "own" : ""}`}
              key={m._id}
            >
              <p>{m.body}</p>
              <small>
                {new Date(m.createdAt).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </small>
            </div>
          ))
        ) : (
          <Empty title="Start with a hello">
            Share what you’d like to learn together.
          </Empty>
        )}
      </div>
      <form onSubmit={submit} className="message-form">
        <input
          aria-label="Your message"
          placeholder="A good conversation starts here…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          maxLength={2000}
        />
        <button
          className="btn"
          disabled={busy || !body.trim()}
          aria-label="Send message"
        >
          <Send size={17} />
        </button>
      </form>
      <p className="small-note">Messages refresh every 10 seconds.</p>
    </Modal>
  );
}
export function Settings() {
  const { user, setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    try {
      const updated = await send<Person>(
        "/users/me",
        {
          ...data,
          skillsOffered: String(data.skillsOffered)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          skillsWanted: String(data.skillsWanted)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        "PATCH",
      );
      setUser(updated);
      toast("Your profile is looking good. Changes saved!");
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  if (!user) return null;
  return (
    <>
      <PageHeading
        eyebrow="MAKE YOURSELF AT HOME"
        title="A little more about you."
        description="Help your future learning partners find you. Your story starts here."
      />
      <div className="settings-layout">
        <section className="card settings-card">
          <div className="settings-intro">
            <Avatar person={user} size="large" />
            <div>
              <h2>Your profile</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <form className="form" onSubmit={submit}>
            <div className="form-row">
              <label>
                Full name
                <input
                  name="name"
                  defaultValue={user.name}
                  required
                  maxLength={80}
                />
              </label>
              <label>
                Major
                <input
                  name="major"
                  defaultValue={user.major}
                  required
                  maxLength={100}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                University
                <input
                  name="university"
                  defaultValue={user.university}
                  required
                  maxLength={120}
                />
              </label>
              <label>
                Year
                <select name="year" defaultValue={user.year}>
                  {[
                    "1st Year",
                    "2nd Year",
                    "3rd Year",
                    "4th Year",
                    "Graduate",
                    "Alumni",
                  ].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              About you
              <textarea
                name="bio"
                defaultValue={user.bio}
                rows={4}
                maxLength={1000}
              />
            </label>
            <div className="form-row">
              <label>
                Location
                <input
                  name="location"
                  defaultValue={user.location}
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Main area of interest
                <select name="category" defaultValue={user.category}>
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
            </div>
            <label>
              Skills you can share{" "}
              <span className="label-hint">
                Separate with commas · up to 12
              </span>
              <input
                name="skillsOffered"
                defaultValue={user.skillsOffered.join(", ")}
                placeholder="React, Python, Figma"
              />
            </label>
            <label>
              Skills you’d love to learn{" "}
              <span className="label-hint">
                Separate with commas · up to 12
              </span>
              <input
                name="skillsWanted"
                defaultValue={user.skillsWanted.join(", ")}
                placeholder="UI/UX Design, Public Speaking"
              />
            </label>
            <label>
              When do you usually have time?
              <input
                name="availability"
                defaultValue={user.availability}
                placeholder="Weekdays, 4:00 PM – 7:00 PM"
                required
                maxLength={200}
              />
            </label>
            <button className="btn" disabled={busy}>
              {busy ? "Saving…" : "Save your profile"}
              <Check size={16} />
            </button>
          </form>
        </section>
        <aside className="settings-tip">
          <Sparkles size={26} />
          <h2>
            A little detail
            <br />
            goes a long way.
          </h2>
          <p>
            The more you share about your interests, the easier it is to find a
            great learning partner.
          </p>
          <p>
            Don’t worry about being an expert. If you know a little more than
            someone else, you have something to offer.
          </p>
          <Link to="/profile">
            Preview your profile <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
    </>
  );
}
