import { useState, type FormEvent } from "react";
import { Check, Copy, KeyRound, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginProps = {
  loading: boolean;
  error: string | null;
  notice: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function AdminLoginView({ loading, error, notice, onSubmit }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) return;
    await onSubmit(email.trim(), password);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 border border-border bg-background p-6 sm:p-8">
      <div>
        <p className="section-label text-muted-foreground">Acesso restrito</p>
        <h1 className="mt-2 font-display text-3xl leading-tight">Entrar no painel</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Acesso exclusivo para contas previamente autorizadas do escritório, com verificação em duas etapas (TOTP).
        </p>
      </div>
      {notice && (
        <div role="status" className="border border-gold bg-secondary px-4 py-3 text-sm text-foreground">
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="admin-email">E-mail</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={loading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="admin-password">Senha</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={loading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="action-link justify-center bg-primary text-primary-foreground disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
        {loading ? "Verificando..." : "Continuar"}
      </button>
    </form>
  );
}

type SetPasswordProps = {
  email: string | null;
  loading: boolean;
  error: string | null;
  onSubmit: (password: string) => Promise<void>;
  onSignOut: () => Promise<void>;
};

export function AdminSetPasswordView({ email, loading, error, onSubmit, onSignOut }: SetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 10) {
      setLocalError("Use uma senha com pelo menos 10 caracteres.");
      return;
    }
    if (password !== confirm) {
      setLocalError("As senhas informadas não coincidem.");
      return;
    }
    setLocalError(null);
    await onSubmit(password);
  }

  const displayError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 border border-border bg-background p-6 sm:p-8">
      <div>
        <p className="section-label text-muted-foreground">Primeiro acesso</p>
        <h1 className="mt-2 font-display text-3xl leading-tight">Definir senha da conta</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {email ? `Conta autorizada: ${email}. ` : ""}
          Defina sua senha antes de configurar o Google Authenticator.
        </p>
      </div>
      {displayError && (
        <div role="alert" className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {displayError}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="admin-new-password">Nova senha (mínimo 10 caracteres)</Label>
        <Input
          id="admin-new-password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          disabled={loading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="admin-confirm-password">Confirmar senha</Label>
        <Input
          id="admin-confirm-password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          disabled={loading}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={loading}
          className="action-link bg-primary text-primary-foreground disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? "Salvando..." : "Salvar senha e prosseguir"}
        </button>
        <button
          type="button"
          onClick={onSignOut}
          disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut size={15} /> Sair
        </button>
      </div>
    </form>
  );
}

type EnrollProps = {
  email: string | null;
  qrCode: string;
  secret: string;
  loading: boolean;
  error: string | null;
  onVerify: (code: string) => Promise<void>;
  onSignOut: () => Promise<void>;
};

export function AdminTotpEnrollView({
  email,
  qrCode,
  secret,
  loading,
  error,
  onVerify,
  onSignOut,
}: EnrollProps) {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCopySecret() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable.
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = code.replace(/\D/g, "");
    if (cleaned.length !== 6) return;
    await onVerify(cleaned);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 border border-border bg-background p-6 sm:p-8">
      <div>
        <p className="section-label text-muted-foreground">Primeiro acesso — 2FA obrigatório</p>
        <h1 className="mt-2 font-display text-3xl leading-tight">Configurar Google Authenticator</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {email ? `Conta autorizada: ${email}. ` : ""}
          Escaneie o QR Code no aplicativo Google Authenticator (ou outro app TOTP) e digite o primeiro código de 6 dígitos para concluir.
        </p>
      </div>
      {error && (
        <div role="alert" className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex flex-col items-center gap-4 border border-border bg-secondary p-5">
        <div className="border border-border bg-card p-3">
          <img src={qrCode} alt="QR Code para cadastrar no Google Authenticator" className="h-48 w-48" />
        </div>
        <div className="w-full max-w-sm text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Ou insira a chave manualmente
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <code className="break-all border border-border bg-background px-3 py-1.5 font-mono text-xs">
              {secret}
            </code>
            <button
              type="button"
              onClick={handleCopySecret}
              aria-label="Copiar chave manual"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-background hover:bg-muted"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="totp-enroll-code">Código de 6 dígitos</Label>
        <Input
          id="totp-enroll-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          required
          disabled={loading}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="font-mono text-lg tracking-[0.35em]"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="action-link bg-primary text-primary-foreground disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          {loading ? "Validando..." : "Ativar verificação e entrar"}
        </button>
        <button
          type="button"
          onClick={onSignOut}
          disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut size={15} /> Sair
        </button>
      </div>
    </form>
  );
}

type ChallengeProps = {
  email: string | null;
  loading: boolean;
  error: string | null;
  onVerify: (code: string) => Promise<void>;
  onSignOut: () => Promise<void>;
};

export function AdminTotpChallengeView({
  email,
  loading,
  error,
  onVerify,
  onSignOut,
}: ChallengeProps) {
  const [code, setCode] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = code.replace(/\D/g, "");
    if (cleaned.length !== 6) return;
    await onVerify(cleaned);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 border border-border bg-background p-6 sm:p-8">
      <div>
        <p className="section-label text-muted-foreground">Verificação em duas etapas</p>
        <h1 className="mt-2 font-display text-3xl leading-tight">Código do autenticador</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {email ? `Conta: ${email}. ` : ""}
          Informe o código atual de 6 dígitos exibido no Google Authenticator para liberar o painel.
        </p>
      </div>
      {error && (
        <div role="alert" className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="totp-challenge-code">Código TOTP (6 dígitos)</Label>
        <Input
          id="totp-challenge-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          required
          autoFocus
          disabled={loading}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="font-mono text-lg tracking-[0.35em]"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="action-link bg-primary text-primary-foreground disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          {loading ? "Validando..." : "Confirmar código"}
        </button>
        <button
          type="button"
          onClick={onSignOut}
          disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut size={15} /> Sair
        </button>
      </div>
    </form>
  );
}