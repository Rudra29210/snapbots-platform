import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ServiceError } from '@/pages/errors';

interface State { hasError: boolean }

/** Catches render errors so one failing widget does not blank the whole site. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Structured, sanitised log line. No user input or tokens are included.
    console.error(JSON.stringify({ level: 'error', msg: 'render_error', name: error.name, stack: info.componentStack?.slice(0, 500) }));
  }

  render() {
    if (this.state.hasError) return <ServiceError />;
    return this.props.children;
  }
}
