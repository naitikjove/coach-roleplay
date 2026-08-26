import { Link } from "react-router-dom";
import { EXP7_MICROCOURSE_TITLE, EXP7_PRE_POST_SUBJECT_TITLE } from "../data/content";

/**
 * Stands in for production:
 *   ArenaExp7Shell → SidebarLayout
 *   MicroCourseChapterVideosClient (entry)
 *   MicrocourseDesktopBreadcrumbBar (session)
 *
 * Purpose: show developers how chrome wraps the PRE card / session shell
 * without pulling the full JoVE app.
 */
export default function MockCoachShell({
  mode = "entry",
  breadcrumbItems = [],
  children,
}) {
  return (
    <div className="shellApp">
      <aside className="shellRail" aria-label="Mock coach sidebar">
        <div className="shellBrand">
          JoVE <span>Coach</span>
        </div>
        <p className="shellRailNote">
          Dev mock of <code>SidebarLayout</code> / <code>ArenaExp7Shell</code>.
          Production blocks standard nav during practice.
        </p>
        <ul className="shellNav">
          <li>Home</li>
          <li>Chats</li>
          <li className="active">Micro-courses</li>
          <li>Ask Coach</li>
          <li>Favorites</li>
        </ul>
      </aside>

      <div className="shellMain">
        <div className="devBanner">
          <span>
            Exp7 PRE v2 · developer copy · UI/shell walkthrough (voice is mocked)
          </span>
          <a
            href="https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post"
            target="_blank"
            rel="noreferrer"
          >
            Open live Vercel →
          </a>
        </div>

        <header className="shellTop">
          <p className="shellTopTitle">
            {EXP7_PRE_POST_SUBJECT_TITLE} · {EXP7_MICROCOURSE_TITLE}
          </p>
          <span className="shellBadge">
            {mode === "entry" ? "Chapter shell" : "Session shell"}
          </span>
        </header>

        {mode === "session" && breadcrumbItems.length > 0 ? (
          <nav className="breadcrumbBar" aria-label="Breadcrumb">
            {breadcrumbItems.map((item, i) => (
              <span key={`${item.label}-${i}`} style={{ display: "contents" }}>
                {i > 0 ? <span className="sep">/</span> : null}
                {item.href ? (
                  <Link to={item.href}>{item.label}</Link>
                ) : (
                  <span className="current">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        <div className="shellContent">{children}</div>
      </div>
    </div>
  );
}
