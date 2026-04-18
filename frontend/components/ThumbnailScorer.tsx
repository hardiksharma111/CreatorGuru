export function ThumbnailScorer() {
  return (
    <section className="card stack">
      <h3>Thumbnail & Caption Scorer</h3>
      <p className="muted">Upload a thumbnail and paste a caption to get actionable recommendations.</p>
      <input className="input" type="file" accept="image/*" />
      <textarea
        className="textarea"
        placeholder="Paste caption text to score emotional hook, keywords, CTA, and clarity."
      />
      <div className="grid-3" style={{ marginTop: 0 }}>
        <div className="stat-pill">
          <p>Visual Clarity</p>
          <p>81</p>
        </div>
        <div className="stat-pill">
          <p>Hook Strength</p>
          <p>74</p>
        </div>
        <div className="stat-pill">
          <p>CTA Impact</p>
          <p>69</p>
        </div>
      </div>
      <div className="row">
        <button className="btn btn-primary" type="button">Score Asset</button>
        <button className="btn btn-secondary" type="button">Use Sample</button>
      </div>
    </section>
  );
}

