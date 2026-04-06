import { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (signUpError) setError(signUpError.message);
      else setMessage('Check your email for a confirmation link!');
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (oauthError) setError(oauthError.message);
    console.log(data);
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1480px] items-stretch gap-6 lg:grid-cols-[minmax(0,1.1fr)_460px]">
        <section className="bento-panel bento-panel--feature hero-surface flex flex-col justify-between p-6 md:p-8 lg:p-10">
          <div className="space-y-5">
            <span className="section-kicker">Private focus workspace</span>
            <div className="max-w-3xl space-y-4">
              <h1 className="font-display text-4xl leading-[0.95] text-foreground md:text-5xl xl:text-6xl">
                Plan slower. Live sharper.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Bring your tasks, habits, workouts, meals, and journal notes into one premium board designed to make daily planning feel calm again.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <ShieldCheck className="text-primary" size={20} />
              <h2 className="mt-4 text-lg font-semibold text-foreground">Private by design</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">A single protected planner for the details you revisit every day.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <Workflow className="text-warning" size={20} />
              <h2 className="mt-4 text-lg font-semibold text-foreground">One continuous flow</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Move between planning, tracking, and reflection without leaving the dashboard.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <Sparkles className="text-info" size={20} />
              <h2 className="mt-4 text-lg font-semibold text-foreground">Calm visual rhythm</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Subtle motion, richer hierarchy, and better spacing across every planner surface.</p>
            </div>
          </div>
        </section>

        <section className="bento-panel flex items-center p-5 md:p-7">
          <div className="w-full space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </p>
              <h2 className="font-display text-3xl text-foreground md:text-4xl">
                Life <span className="text-primary">Planner</span>
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {isSignUp ? 'Create your account and start planning with a calmer dashboard.' : 'Sign in to return to your daily command board.'}
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="interactive-button focus-glow w-full rounded-2xl border border-border/80 bg-secondary/55 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/20 hover:bg-secondary/70"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/80" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-muted-foreground">Or</span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-glow w-full rounded-2xl border border-border/80 bg-input/90 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-glow w-full rounded-2xl border border-border/80 bg-input/90 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                required
                minLength={6}
              />
              <button
                type="submit"
                disabled={loading}
                className="interactive-button focus-glow w-full rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground crimson-glow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            {message && <p className="text-center text-sm text-success">{message}</p>}

            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
                className="text-primary hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
