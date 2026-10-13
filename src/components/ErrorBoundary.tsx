import { Component, type ReactNode, type ErrorInfo } from "react";
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Practice screen failed", error, info); }
  render() {
    if (this.state.failed) return <main className="error-screen"><h1>Let’s reset the practice desk.</h1><p>Something went wrong. Reload to return to the menu; your saved scores will stay intact.</p><button className="desk-button" onClick={() => window.location.reload()}>Reload app</button></main>;
    return this.props.children;
  }
}
