import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  HeartHandshake,
  LockKeyhole,
  Mail,
  Sparkles,
  Users,
} from "lucide-react";
import { LearningArt, Logo } from "../components";
import { useAuth } from "../context";
import { send } from "../api";
import type { Person } from "../types";

export function Landing() {
  return (
    <div className="landing">
      <div className="landing-dark">
        <header className="landing-nav">
          <Logo light />
          <nav>
            <a href="#why">Why SkillBridge</a>
            <a href="#how">How it works</a>
            <a href="#community">Our community</a>
          </nav>
          <div>
            <Link className="btn dark-button" to="/login">
              Log in
            </Link>
            <Link className="btn coral" to="/register">
              Get started <ArrowRight size={15} />
            </Link>
          </div>
        </header>
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-label">
              <span className="online-dot" />
              YOUR NEXT CHAPTER STARTS TOGETHER
            </div>
            <h1>
              Learn together.
              <br />
              Grow together.
              <br />
              <span>Go further.</span>
            </h1>
            <p>
              A skill you have could be someone else’s next big step. Connect
              with fellow students, exchange what you know, and discover what’s
              possible.
            </p>
            <div className="hero-actions">
              <Link className="btn coral large" to="/register">
                Find your learning partner <ArrowRight size={18} />
              </Link>
              <a className="btn outline-light large" href="#how">
                How it works
              </a>
            </div>
            <div className="hero-proof">
              <div className="mini-avatars">
                <span>AK</span>
                <span>JL</span>
                <span>SY</span>
                <span>DK</span>
              </div>
              <div>
                <div className="stars">★★★★★</div>
                <span>Good people. Great things to learn.</span>
              </div>
            </div>
          </div>
          <LearningArt />
        </section>
        <div className="hero-bottom">
          <span>A LITTLE CURIOSITY CAN TAKE YOU A LONG WAY</span>
          <span>↓</span>
        </div>
      </div>
      <section id="why" className="landing-section">
        <span className="eyebrow">EVERYONE HAS SOMETHING TO SHARE</span>
        <h2>
          Your skills. Their skills.
          <br />
          <span>A whole world of possibilities.</span>
        </h2>
        <div className="feature-grid">
          {[
            {
              icon: HeartHandshake,
              title: "Share what you know",
              text: "From your first line of code to your second language. Your skills matter.",
              color: "pink",
            },
            {
              icon: Users,
              title: "Find your people",
              text: "Meet curious students who want to learn what you love and share what they know.",
              color: "blue",
            },
            {
              icon: CalendarDays,
              title: "Make time to grow",
              text: "Online or in person, a quick chat or a deep dive. Learn on your own schedule.",
              color: "green",
            },
            {
              icon: Sparkles,
              title: "Build something bigger",
              text: "Turn a shared interest into a real connection. Grow your circle along the way.",
              color: "orange",
            },
          ].map(({ icon: Icon, title, text, color }) => (
            <article key={title}>
              <span className={`feature-icon ${color}`}>
                <Icon size={25} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="how" className="how-section">
        <div>
          <span className="eyebrow">SMALL STEPS. BIG POSSIBILITIES.</span>
          <h2>
            A better way
            <br />
            to learn starts here.
          </h2>
          <p>No fees. No pressure. Just students helping students.</p>
          <Link className="btn" to="/register">
            Let’s get you started <ArrowRight size={16} />
          </Link>
        </div>
        <div className="steps">
          {[
            [
              "01",
              "Bring your unique skills",
              "Create your profile. Share what you know and what you’d love to learn.",
            ],
            [
              "02",
              "Find your learning partner",
              "Explore your community and connect with someone who complements your skills.",
            ],
            [
              "03",
              "Share, learn, repeat",
              "Book a session, swap ideas, and celebrate the progress you make together.",
            ],
          ].map(([n, title, text]) => (
            <article key={n}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="community" className="landing-cta">
        <span className="eyebrow">YOUR PEOPLE ARE HERE</span>
        <h2>
          You don’t have to figure
          <br />
          it all out alone.
        </h2>
        <p>Bring your curiosity. We’ll help you find your community.</p>
        <Link className="btn coral large" to="/register">
          Join SkillBridge today <ArrowRight size={17} />
        </Link>
        <span className="cta-star">✦</span>
      </section>
      <footer className="landing-footer">
        <Logo />
        <p>A little knowledge. A world of possibility.</p>
        <span>© {new Date().getFullYear()} SkillBridge</span>
      </footer>
    </div>
  );
}
export function AuthPage({ register = false }: { register?: boolean }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (register && data.password !== data.confirm) {
      setError("Your passwords don’t match.");
      return;
    }
    setBusy(true);
    try {
      const person = await send<Person>(
        `/auth/${register ? "register" : "login"}`,
        data,
      );
      setUser(person);
      navigate(register ? "/settings" : "/dashboard");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Logo light />
        <div className="auth-aside-copy">
          <span className="eyebrow">LEARN. SHARE. GROW.</span>
          <h1>
            Good things
            <br />
            happen when
            <br />
            <span>we learn together.</span>
          </h1>
          <p>
            Your next skill. Your next collaborator.
            <br />
            Your next “I finally get it” moment.
          </p>
        </div>
        <LearningArt />
        <p className="auth-aside-footer">
          A community built on a simple idea: we all have something to offer.
        </p>
      </aside>
      <main className="auth-main">
        <Link className="back-home" to="/">
          ← Back to home
        </Link>
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo">
            <Logo />
          </div>
          <span className="auth-wave">{register ? "✦" : "👋"}</span>
          <h1>
            {register ? "Your next chapter starts here." : "Welcome back!"}
          </h1>
          <p>
            {register
              ? "Join a community as curious as you are."
              : "A little more learning. A little more growing."}
          </p>
          <form className="form" onSubmit={submit}>
            {register && (
              <label>
                Full name
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  required
                  maxLength={80}
                />
              </label>
            )}
            <label>
              University email
              <div className="input-icon">
                <Mail size={16} />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@university.edu"
                  required
                />
              </div>
            </label>
            <label>
              Password
              <div className="input-icon">
                <LockKeyhole size={16} />
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete={register ? "new-password" : "current-password"}
                  placeholder={
                    register
                      ? "Create a password (8+ characters)"
                      : "Enter your password"
                  }
                  minLength={register ? 8 : 1}
                  maxLength={128}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            {register && (
              <>
                <label>
                  Confirm password
                  <input
                    name="confirm"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="One more time"
                    required
                  />
                </label>
                <label>
                  What’s your major?
                  <select name="major">
                    <option>Computer Science</option>
                    <option>Software Engineering</option>
                    <option>Design</option>
                    <option>Mathematics</option>
                    <option>Business Administration</option>
                    <option>Modern Languages</option>
                    <option>Physics</option>
                    <option>Other</option>
                  </select>
                </label>
              </>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn gradient large" disabled={busy}>
              {busy
                ? "Just a moment…"
                : register
                  ? "Create your account"
                  : "Log in"}
              <ArrowRight size={17} />
            </button>
          </form>
          {!register && (
            <div className="demo-hint">
              <Sparkles size={16} />
              <div>
                <strong>Take a look around</strong>
                <p>
                  Demo: sarah@skillbridge.demo
                  <br />
                  Password: SkillBridge123!
                </p>
              </div>
            </div>
          )}
          <p className="auth-switch">
            {register
              ? "Already part of the community?"
              : "New to the community?"}{" "}
            <Link to={register ? "/login" : "/register"}>
              {register ? "Log in" : "Join SkillBridge"}
            </Link>
          </p>
          <div className="auth-bottom-note">
            <HeartHandshake size={16} />A space to connect, share, and become
            more.
          </div>
        </div>
      </main>
    </div>
  );
}
export function NotFound() {
  return (
    <div className="not-found">
      <Logo />
      <span>404</span>
      <h1>A little off the learning path.</h1>
      <p>We couldn’t find this page. Let’s get you back on track.</p>
      <Link className="btn" to="/">
        Back to home <ArrowRight size={16} />
      </Link>
    </div>
  );
}
