import { Navigate, Route, Routes } from "react-router-dom";
import EntryPage from "./pages/EntryPage";
import VoiceSamplesPage from "./pages/VoiceSamplesPage";

/**
 * Routes mirror production:
 *   /arena/exp7/pre-post         → chapter shell + entry meta card
 *   /arena/exp7/pre-post/session → brief → live (mock) → debrief (mock)
 *
 * Live Vercel: https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post
 */
export default function App() {
  return (
    <Routes>
      <Route path="/arena/exp7/pre-post" element={<EntryPage />} />
      <Route path="/arena/exp7/pre-post/voices" element={<VoiceSamplesPage />} />
      <Route path="/arena/exp7/pre-post/session" element={<SessionPage />} />
      <Route path="/" element={<Navigate to="/arena/exp7/pre-post" replace />} />
      <Route path="*" element={<Navigate to="/arena/exp7/pre-post" replace />} />
    </Routes>
  );
}
