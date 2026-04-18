import { AppShell } from "../components/AppShell";
import { ThumbnailScorer } from "../components/ThumbnailScorer";

export default function Page() {
  return (
    <AppShell
      title="Thumbnail & Caption Scorer"
      subtitle="Improve creative performance before you publish"
      currentPath="/thumbnail"
    >
      <ThumbnailScorer />
    </AppShell>
  );
}
