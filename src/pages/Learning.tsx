import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Code2,
  Flame,
  GraduationCap,
  Palette,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import {
  Empty,
  ErrorState,
  Loading,
  PageHeading,
  PeerCard,
  SectionHeading,
  SessionCard,
  Tags,
} from "../components";
import { useAuth, useData } from "../context";
import type { Person, Resource, Session } from "../types";

export function Dashboard() {
  const { user } = useAuth();
  const peers = useData<Person[]>("/users");
  const sessions = useData<Session[]>("/sessions");
  const resources = useData<Resource[]>("/resources");
  const upcoming =
    sessions.data?.filter(
      (s) =>
        ["Confirmed", "Pending"].includes(s.status) &&
        new Date(s.startsAt) > new Date(),
    ) || [];
  const completed =
    sessions.data?.filter((s) => s.status === "Completed") || [];
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <>
      <PageHeading
        eyebrow={today}
        title={
          <>
            Hello, {user?.name.split(" ")[0]} <span className="wave">👋</span>
          </>
        }
        description="A new day, a new chance to learn something wonderful."
        action={
          <Link className="btn" to="/explore">
            <Sparkles size={16} />
            Find a learning partner
          </Link>
        }
      />
      <section className="welcome-banner">
        <div>
          <span className="banner-eyebrow">BETTER, TOGETHER</span>
          <h2>
            Your next “aha!” moment
            <br />
            could start with a hello.
          </h2>
          <p>There’s someone here who can help you grow.</p>
          <Link to="/explore">
            Explore your community <ArrowRight size={16} />
          </Link>
        </div>
        <div className="banner-art">
          <div className="banner-orbit" />
          <div className="banner-bubble bubble-code">
            <Code2 size={34} />
          </div>
          <div className="banner-bubble bubble-design">
            <Palette size={31} />
          </div>
          <div className="banner-bubble bubble-book">
            <BookOpen size={25} />
          </div>
          <span className="banner-star">✦</span>
          <span className="banner-star second">✧</span>
          <div className="banner-note">
            A little exchange.
            <br />
            <strong>A lot of possibility.</strong>
          </div>
        </div>
      </section>
      <section className="stats-grid">
        {[
          {
            label: "Upcoming sessions",
            value: upcoming.length,
            icon: CalendarDays,
            color: "purple",
            note: "Good things on the calendar",
            to: "/sessions",
          },
          {
            label: "Sessions completed",
            value: completed.length,
            icon: CheckCheck,
            color: "green",
            note: "Every session is a step forward",
            to: "/sessions?tab=Completed",
          },
          {
            label: "Your connections",
            value: user?.connections?.length || 0,
            icon: Users,
            color: "blue",
            note: "A growing circle of possibility",
            to: "/explore",
          },
          {
            label: "Community rating",
            value: user?.rating || "New",
            icon: Star,
            color: "orange",
            note: `${user?.reviewCount || 0} shared learning experiences`,
            to: "/profile",
          },
        ].map(({ label, value, icon: Icon, color, note, to }) => (
          <Link to={to} key={label} className="stat-card">
            <div>
              <span className={`stat-icon ${color}`}>
                <Icon size={17} />
              </span>
              <span>{label}</span>
            </div>
            <strong>
              {value}
              {label === "Community rating" && (
                <Star size={17} fill="currentColor" />
              )}
            </strong>
            <p>{note}</p>
          </Link>
        ))}
      </section>
      <div className="dashboard-columns">
        <section>
          <SectionHeading
            title="Your kind of people"
            to="/explore"
            label="Explore all"
          />
          <p className="section-subtitle">
            A few learning partners we think you’ll click with.
          </p>
          {peers.error ? (
            <ErrorState message={peers.error} retry={peers.reload} />
          ) : peers.loading ? (
            <Loading />
          ) : (
            <div className="peer-list">
              {peers.data?.slice(0, 3).map((p) => (
                <PeerCard person={p} compact key={p._id} />
              ))}
            </div>
          )}
          <SectionHeading title="A little inspiration" to="/resources" />
          <div className="resource-mini-grid">
            {resources.data?.slice(0, 2).map((r) => (
              <Link
                className="resource-mini"
                to={`/resources/${r._id}`}
                key={r._id}
              >
                <span
                  className={`resource-icon ${r.category === "Design" ? "pink" : "orange"}`}
                >
                  <BookOpen size={22} />
                </span>
                <div>
                  <h3>{r.title}</h3>
                  <p>Shared by {r.author.name}</p>
                  <Tags items={r.tags.slice(0, 2)} />
                </div>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </section>
        <aside>
          <SectionHeading title="Coming up next" to="/sessions" />
          {sessions.error ? (
            <ErrorState message={sessions.error} retry={sessions.reload} />
          ) : sessions.loading ? (
            <Loading />
          ) : upcoming.length ? (
            <div className="upcoming-list">
              {upcoming.slice(0, 3).map((s) => (
                <SessionCard key={s._id} session={s} />
              ))}
            </div>
          ) : (
            <Empty title="Room for something new">
              Find a learning partner and book your first session.
            </Empty>
          )}
          <div className="growth-card">
            <span className="growth-icon">
              <Flame size={24} />
            </span>
            <h3>Keep that spark alive.</h3>
            <p>
              Big things start with small, consistent steps. What will you learn
              this week?
            </p>
            <Link to="/community">
              Find some inspiration <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
const categories = [
  "All Categories",
  "Programming",
  "Design",
  "Languages",
  "Sciences",
  "Business",
  "Arts & Others",
];
export function Explore() {
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [connectionsOnly, setConnectionsOnly] = useState(false);
  const q = params.get("q") || "";
  const peers = useData<Person[]>(
    `/users?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}`,
  );
  const results = (peers.data || []).filter(
    (p) => !connectionsOnly || p.connected,
  );
  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setParams({ q: String(new FormData(e.currentTarget).get("search") || "") });
  }
  return (
    <>
      <PageHeading
        eyebrow="GOOD PEOPLE. GREAT POSSIBILITIES."
        title={
          <>
            Find your learning partner<span className="heading-sprout">🌱</span>
          </>
        }
        description="Someone knows what you want to learn. Someone wants to learn what you know."
      />
      <section className="explore-search">
        <form onSubmit={search}>
          <Search size={20} />
          <input
            key={q}
            name="search"
            defaultValue={q}
            placeholder="Try a skill, a name, or something you’re curious about…"
            aria-label="Search for learning partners"
          />
          <button className="btn">
            Search <ArrowRight size={15} />
          </button>
        </form>
        <div className="filter-row">
          <span>
            <SlidersHorizontal size={15} />
            Find your fit
          </span>
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c, i) => (
              <option key={c} value={i ? c : ""}>
                {c}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All locations</option>
            <option>Yaoundé, Cameroon</option>
          </select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={connectionsOnly}
              onChange={(e) => setConnectionsOnly(e.target.checked)}
            />
            My connections
          </label>
          {(category || location || q || connectionsOnly) && (
            <button
              className="text-link"
              onClick={() => {
                setCategory("");
                setLocation("");
                setParams({});
                setConnectionsOnly(false);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </section>
      <div className="explore-layout">
        <aside className="category-panel">
          <h3>Explore by interest</h3>
          {categories.map((c, i) => (
            <button
              key={c}
              className={category === (i ? c : "") ? "selected" : ""}
              onClick={() => setCategory(i ? c : "")}
            >
              <span className={`category-icon category-${i}`}>
                {["✦", "⌘", "◈", "文", "⚗", "▦", "♫"][i]}
              </span>
              {i ? c : "All skills"}
              {category === (i ? c : "") && <span className="category-dot" />}
            </button>
          ))}
          <div className="category-tip">
            <GraduationCap size={25} />
            <h4>Your curiosity belongs here.</h4>
            <p>Try something new. The best discoveries are often unexpected.</p>
          </div>
        </aside>
        <section className="peer-results">
          <div className="section-heading">
            <h2>
              {connectionsOnly
                ? "Your connections"
                : q
                  ? `Results for “${q}”`
                  : "Meet your next collaborator"}
            </h2>
            <span className="result-count">{results.length} learners</span>
          </div>
          {peers.error ? (
            <ErrorState message={peers.error} retry={peers.reload} />
          ) : peers.loading ? (
            <Loading />
          ) : results.length ? (
            <div className="peers-grid">
              {results.map((p) => (
                <PeerCard key={p._id} person={p} />
              ))}
            </div>
          ) : (
            <Empty title="No matches just yet">
              Try another skill or clear your filters to meet more learners.
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
export function Sessions() {
  const { data, error, loading, reload } = useData<Session[]>("/sessions");
  const [params, setParams] = useSearchParams();
  const [month, setMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const tab = params.get("tab") || "Upcoming";
  const tabs = ["Upcoming", "Pending", "Completed", "Cancelled"];
  const filter = (s: Session, t: string) =>
    t === "Upcoming" ? s.status === "Confirmed" : s.status === t;
  const matchesDay = (s: Session) =>
    !selectedDay ||
    (new Date(s.startsAt).getDate() === selectedDay &&
      new Date(s.startsAt).getMonth() === month.getMonth() &&
      new Date(s.startsAt).getFullYear() === month.getFullYear());
  const sessions = (data || []).filter((s) => filter(s, tab) && matchesDay(s));
  const totalDays = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const offset = (month.getDay() + 6) % 7;
  const sessionDays = new Set(
    (data || [])
      .filter(
        (s) =>
          new Date(s.startsAt).getMonth() === month.getMonth() &&
          new Date(s.startsAt).getFullYear() === month.getFullYear() &&
          !["Cancelled", "Completed"].includes(s.status),
      )
      .map((s) => new Date(s.startsAt).getDate()),
  );
  return (
    <>
      <PageHeading
        eyebrow="MAKE TIME FOR WHAT’S NEXT"
        title="Your learning, in motion."
        description="A little planning. A lot of progress. Keep your shared learning on track."
        action={
          <Link className="btn" to="/explore">
            <CalendarDays size={16} />
            Plan a new session
          </Link>
        }
      />
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setParams({ tab: t })}
          >
            {t}
            <span>{data?.filter((s) => filter(s, t)).length || 0}</span>
          </button>
        ))}
      </div>
      <div className="sessions-layout">
        <aside>
          <div className="calendar card">
            <div className="calendar-heading">
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() => {
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  );
                  setSelectedDay(null);
                }}
              >
                <ChevronLeft size={17} />
              </button>
              <strong>
                {month.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </strong>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() => {
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  );
                  setSelectedDay(null);
                }}
              >
                <ChevronRight size={17} />
              </button>
            </div>
            <div className="calendar-grid">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span className="calendar-weekday" key={`d${i}`}>
                  {d}
                </span>
              ))}
              {Array.from({ length: offset }, (_, i) => (
                <span key={`empty${i}`} />
              ))}
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  className={`${selectedDay === d ? "selected" : ""} ${sessionDays.has(d) ? "has-session" : ""} ${new Date().toDateString() === new Date(month.getFullYear(), month.getMonth(), d).toDateString() ? "today" : ""}`}
                  onClick={() => setSelectedDay(selectedDay === d ? null : d)}
                  aria-label={`Filter sessions on ${month.toLocaleDateString(undefined, { month: "long" })} ${d}`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="calendar-legend">
              <span />A little learning on the calendar
            </p>
            {selectedDay && (
              <button
                className="text-link"
                onClick={() => setSelectedDay(null)}
              >
                Show all dates
              </button>
            )}
          </div>
          <div className="session-tip">
            <span>✦</span>
            <h3>
              Good sessions start
              <br />
              with a little preparation.
            </h3>
            <p>
              Bring your questions, share your goals, and leave room for
              discovery.
            </p>
          </div>
        </aside>
        <section>
          <SectionHeading
            title={`${tab} sessions${selectedDay ? ` · ${month.toLocaleDateString(undefined, { month: "short" })} ${selectedDay}` : ""}`}
          />
          {error ? (
            <ErrorState message={error} retry={reload} />
          ) : loading ? (
            <Loading />
          ) : sessions.length ? (
            <div className="sessions-list">
              {sessions.map((s) => (
                <SessionCard key={s._id} session={s} actions refresh={reload} />
              ))}
            </div>
          ) : (
            <Empty title={`No ${tab.toLowerCase()} sessions`}>
              Your next learning moment is waiting.{" "}
              <Link to="/explore">Find a partner</Link> to get started.
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
