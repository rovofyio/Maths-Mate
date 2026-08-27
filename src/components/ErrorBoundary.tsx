import { Component, type ComponentChildren } from "preact";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ComponentChildren }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("Recovered from render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crash-screen">
          <div className="crash-bubble">🫧</div>
          <h1>Something popped!</h1>
          <p>Don't worry — your progress is safe. Let's jump back in.</p>
          <button className="btn-primary big" onClick={() => this.setState({ error: null })}>
            ↻ Try again
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
