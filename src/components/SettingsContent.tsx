"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SERVER_KEY_TURN_LIMIT, calcMixedCost } from "@/lib/config";
import { trackEvent } from "@/lib/analytics";
import { authClient } from "@/lib/auth/client";
import { validatePassword } from "@/lib/auth/password-validation";

export function SettingsContent() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [turnsLimit, setTurnsLimit] = useState(SERVER_KEY_TURN_LIMIT);
  const [totalInputTokens, setTotalInputTokens] = useState(0);
  const [totalOutputTokens, setTotalOutputTokens] = useState(0);
  const [totalCacheWriteTokens, setTotalCacheWriteTokens] = useState(0);
  const [totalCacheReadTokens, setTotalCacheReadTokens] = useState(0);
  const [haikuInputTokens, setHaikuInputTokens] = useState(0);
  const [haikuOutputTokens, setHaikuOutputTokens] = useState(0);
  const [haikuCacheWriteTokens, setHaikuCacheWriteTokens] = useState(0);
  const [haikuCacheReadTokens, setHaikuCacheReadTokens] = useState(0);
  const [inputKey, setInputKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Name
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sign out all sessions
  const [revokingSessions, setRevokingSessions] = useState(false);
  const [revokeSuccess, setRevokeSuccess] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/api-key")
      .then((r) => r.json())
      .then((data) => {
        setHasKey(data.hasKey);
        setMaskedKey(data.maskedKey);
        setTurnsUsed(data.turnsUsed ?? 0);
        setTurnsLimit(data.turnsLimit ?? SERVER_KEY_TURN_LIMIT);
        setTotalInputTokens(data.totalInputTokens ?? 0);
        setTotalOutputTokens(data.totalOutputTokens ?? 0);
        setTotalCacheWriteTokens(data.totalCacheWriteTokens ?? 0);
        setTotalCacheReadTokens(data.totalCacheReadTokens ?? 0);
        setHaikuInputTokens(data.haikuInputTokens ?? 0);
        setHaikuOutputTokens(data.haikuOutputTokens ?? 0);
        setHaikuCacheWriteTokens(data.haikuCacheWriteTokens ?? 0);
        setHaikuCacheReadTokens(data.haikuCacheReadTokens ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (session?.user.name) setNameValue(session.user.name);
  }, [session]);

  async function handleSave() {
    setError(null);
    setSuccess(false);

    const key = inputKey.trim();
    if (key && !key.startsWith("sk-ant-")) {
      setError("Key must start with sk-ant-");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
      } else {
        if (key) trackEvent({ name: "api_key_added" });
        setHasKey(!!data.maskedKey);
        setMaskedKey(data.maskedKey);
        setInputKey("");
        setIsEditing(false);
        setSuccess(true);
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: "" }),
      });
      if (res.ok) {
        setHasKey(false);
        setMaskedKey(null);
        setIsEditing(false);
        setSuccess(true);
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  async function handleNameSave() {
    setNameError(null);
    setNameSuccess(false);
    const name = nameValue.trim();
    if (!name) { setNameError("Name cannot be empty"); return; }
    setNameSaving(true);
    const { error } = await authClient.updateUser({ name });
    if (error) {
      setNameError(error.message ?? "Failed to update name");
    } else {
      setNameSuccess(true);
    }
    setNameSaving(false);
  }

  async function handleEmailChange() {
    setEmailError(null);
    setEmailSuccess(false);
    const email = newEmail.trim();
    if (!email) { setEmailError("Email cannot be empty"); return; }
    setEmailSaving(true);
    const { error } = await authClient.changeEmail({ newEmail: email, callbackURL: "/account" });
    if (error) {
      setEmailError(error.message ?? "Failed to change email");
    } else {
      setEmailSuccess(true);
      setNewEmail("");
    }
    setEmailSaving(false);
  }

  async function handlePasswordChange() {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!currentPassword) { setPasswordError("Enter your current password"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("New passwords do not match"); return; }
    if (newPassword === currentPassword) { setPasswordError("New password must differ from current"); return; }
    setPasswordSaving(true);
    const validation = await validatePassword(newPassword);
    if (!validation.ok) {
      setPasswordError(validation.error ?? "Invalid password.");
      setPasswordSaving(false);
      return;
    }
    const { error } = await authClient.changePassword({ currentPassword, newPassword });
    if (error) {
      setPasswordError(error.message ?? "Failed to change password");
    } else {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  }

  async function handleDeleteAccount() {
    setDeleteError(null);
    if (deleteConfirm !== "DELETE") { setDeleteError('Type "DELETE" to confirm'); return; }
    setDeleting(true);
    const { error } = await authClient.deleteUser();
    if (error) {
      setDeleteError(error.message ?? "Failed to delete account");
      setDeleting(false);
    } else {
      router.push("/");
    }
  }

  async function handleRevokeOtherSessions() {
    setRevokeError(null);
    setRevokeSuccess(false);
    setRevokingSessions(true);
    const { error } = await authClient.revokeOtherSessions();
    if (error) {
      setRevokeError(error.message ?? "Failed to revoke sessions");
    } else {
      setRevokeSuccess(true);
    }
    setRevokingSessions(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* API Key section */}
      <div>
        <h2 className="mb-1 text-sm font-semibold text-stone-200">Your API Key</h2>
        <p className="mb-2 text-xs text-stone-400">
          Anthropic API key used for all AI gameplay.{" "}
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-white underline underline-offset-2"
          >
            Get yours at console.anthropic.com
          </a>
        </p>
        <p className="mb-2 text-xs text-stone-500">
          Note: API keys use prepaid credits purchased separately at console.anthropic.com — a Claude.ai subscription does not cover API usage. It may take a few minutes for newly added credits to become active.
        </p>
        <p className="mb-4 text-xs text-stone-500">
          Your key is encrypted at rest (AES-256-GCM) and only decrypted in server memory at the moment it&apos;s needed to make an API call. It is never exposed to the browser or logged.
        </p>

        {loading ? (
          <div className="text-xs text-stone-600">Loading…</div>
        ) : hasKey && !isEditing ? (
          <div className="flex items-center gap-2">
            <span className="flex-1 rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-400 font-mono truncate">
              {maskedKey}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              disabled={saving}
              className="rounded border border-stone-600 px-3 py-2 text-xs text-stone-400 hover:border-stone-400 hover:text-stone-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Change
            </button>
            <button
              onClick={handleRemove}
              disabled={saving}
              className="rounded border border-red-900 px-3 py-2 text-xs text-red-500 hover:border-red-600 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              id="api-key-input"
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              aria-label="Anthropic API key"
              aria-describedby={error ? "api-key-error" : undefined}
              className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 font-mono focus:border-stone-500 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !inputKey.trim()}
                className="flex-1 rounded border border-[var(--color-gold)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)] hover:text-stone-950 disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving…" : "Save Key"}
              </button>
              {isEditing && (
                <button
                  onClick={() => { setIsEditing(false); setInputKey(""); setError(null); }}
                  disabled={saving}
                  className="rounded border border-stone-700 px-4 py-2 text-sm text-stone-400 hover:text-stone-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <p id="api-key-error" role="alert" className="mt-3 rounded border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="mt-3 text-xs text-green-500">Saved.</p>
        )}
      </div>

      {/* Turn counter */}
      {!hasKey && (
        <div className="border-t border-stone-800 pt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-stone-400">Free turns used</span>
            <span className="text-xs font-mono text-stone-300">
              {turnsUsed} / {turnsLimit}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-stone-800">
            <div
              className="h-1.5 rounded-full bg-[var(--color-gold)] transition-all"
              style={{ width: `${Math.min(100, (turnsUsed / turnsLimit) * 100)}%` }}
            />
          </div>
          {turnsUsed >= turnsLimit && (
            <p className="mt-2 text-xs text-amber-500">
              Free turns exhausted. Add your own API key above to continue playing.
            </p>
          )}
        </div>
      )}

      {/* Token usage */}
      {(totalInputTokens > 0 || totalOutputTokens > 0) && (
        <div className="border-t border-stone-800 pt-4">
          <h2 className="mb-3 text-sm font-semibold text-stone-200">Your token usage</h2>
          <div className="flex flex-col gap-1.5 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Input tokens</span>
              <span className="font-mono text-stone-300">{totalInputTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Output tokens</span>
              <span className="font-mono text-stone-300">{totalOutputTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-stone-800 pt-1.5 mt-0.5">
              <span className="text-stone-400">Est. cost (own key)</span>
              <span className="font-mono text-[var(--color-gold)]">
                ${calcMixedCost(totalInputTokens, totalOutputTokens, totalCacheWriteTokens, totalCacheReadTokens, haikuInputTokens, haikuOutputTokens, haikuCacheWriteTokens, haikuCacheReadTokens).toFixed(4)}
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-600">
            Estimate only — based on Anthropic list pricing. Actual charges may differ.
          </p>
        </div>
      )}

      {/* Cost explainer */}
      <div className="border-t border-stone-800 pt-4 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-stone-200">How costs work</h2>
        <p className="text-xs text-stone-400 leading-relaxed">
          Every turn sends your action plus the full game context — character sheet, active
          rules, session history, GM persona — to the API. Each GM response costs roughly{" "}
          <span className="text-stone-300">5–7 cents</span>, so a 20-turn session runs about $1.
        </p>
        <p className="text-xs text-stone-400 leading-relaxed">
          When using your own key, usage is billed{" "}
          <span className="text-stone-300">directly by Anthropic</span> — not by me.
          By Bitter Flame never sees your charges and takes no payment. Your key, your
          Anthropic account, their billing. You can set spend limits and review exact
          charges at{" "}
          <a
            href="https://console.anthropic.com/settings/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-white underline underline-offset-2"
          >
            console.anthropic.com
          </a>
          , and their{" "}
          <a
            href="https://www.anthropic.com/legal/consumer-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-white underline underline-offset-2"
          >
            Terms of Service
          </a>
          {" "}apply to API usage.
        </p>
      </div>

      {/* Display name */}
      <div className="border-t border-stone-800 pt-4">
        <h2 className="mb-1 text-sm font-semibold text-stone-200">Display Name</h2>
        <p className="mb-4 text-xs text-stone-400">How you appear in the game.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={nameValue}
            onChange={(e) => { setNameValue(e.target.value); setNameSuccess(false); setNameError(null); }}
            aria-label="Display name"
            aria-describedby={nameError ? "name-error" : undefined}
            className="flex-1 rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
            placeholder="Your name"
          />
          <button
            onClick={handleNameSave}
            disabled={nameSaving}
            className="rounded border border-[var(--color-gold)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)] hover:text-stone-950 disabled:opacity-50 cursor-pointer"
          >
            {nameSaving ? "Saving…" : "Save"}
          </button>
        </div>
        {nameError && <p id="name-error" role="alert" className="mt-3 rounded border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-400">{nameError}</p>}
        {nameSuccess && <p role="status" className="mt-3 text-xs text-green-500">Name updated.</p>}
      </div>

      {/* Email */}
      <div className="border-t border-stone-800 pt-4">
        <h2 className="mb-1 text-sm font-semibold text-stone-200">Change Email</h2>
        <p className="mb-4 text-xs text-stone-400">
          Current:{" "}
          <span className="text-stone-300 font-mono">{session?.user.email ?? "—"}</span>
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => { setNewEmail(e.target.value); setEmailSuccess(false); setEmailError(null); }}
            aria-label="New email address"
            aria-describedby={emailError ? "email-error" : undefined}
            className="flex-1 rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
            placeholder="new@example.com"
            autoComplete="email"
          />
          <button
            onClick={handleEmailChange}
            disabled={emailSaving || !newEmail.trim()}
            className="rounded border border-[var(--color-gold)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)] hover:text-stone-950 disabled:opacity-50 cursor-pointer"
          >
            {emailSaving ? "Saving…" : "Update"}
          </button>
        </div>
        {emailError && <p id="email-error" role="alert" className="mt-3 rounded border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-400">{emailError}</p>}
        {emailSuccess && <p role="status" className="mt-3 text-xs text-green-500">Check your new inbox for a verification link.</p>}
      </div>

      {/* Password */}
      <div className="border-t border-stone-800 pt-4">
        <h2 className="mb-4 text-sm font-semibold text-stone-200">Change Password</h2>
        <div className="flex flex-col gap-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setPasswordSuccess(false); setPasswordError(null); }}
            aria-label="Current password"
            aria-describedby={passwordError ? "password-error" : undefined}
            className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
            placeholder="Current password"
            autoComplete="current-password"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setPasswordSuccess(false); setPasswordError(null); }}
            aria-label="New password"
            className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
            placeholder="New password (min 12 characters)"
            autoComplete="new-password"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordSuccess(false); setPasswordError(null); }}
            aria-label="Confirm new password"
            className="w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 focus:outline-none"
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
          <button
            onClick={handlePasswordChange}
            disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
            className="rounded border border-[var(--color-gold)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)] hover:text-stone-950 disabled:opacity-50 cursor-pointer"
          >
            {passwordSaving ? "Saving…" : "Change Password"}
          </button>
        </div>
        {passwordError && <p id="password-error" role="alert" className="mt-3 rounded border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-400">{passwordError}</p>}
        {passwordSuccess && <p role="status" className="mt-3 text-xs text-green-500">Password changed.</p>}
      </div>

      {/* Danger zone */}
      <div className="border-t border-stone-800 pt-4">
        <h2 className="mb-4 text-sm font-semibold text-red-400">Danger Zone</h2>

        {/* Sign out all sessions */}
        <div className="mb-6">
          <p className="mb-3 text-xs text-stone-400">Sign out of all other active sessions on other devices.</p>
          <button
            onClick={handleRevokeOtherSessions}
            disabled={revokingSessions}
            className="rounded border border-stone-600 px-4 py-2 text-xs text-stone-400 hover:border-stone-400 hover:text-stone-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {revokingSessions ? "Revoking…" : "Sign Out All Other Sessions"}
          </button>
          {revokeError && <p role="alert" className="mt-3 rounded border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-400">{revokeError}</p>}
          {revokeSuccess && <p role="status" className="mt-3 text-xs text-green-500">All other sessions revoked.</p>}
        </div>

        {/* Delete account */}
        <div>
          <p className="mb-3 text-xs text-stone-400">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => { setDeleteConfirm(e.target.value); setDeleteError(null); }}
              aria-label='Type DELETE to confirm account deletion'
              aria-describedby={deleteError ? "delete-error" : undefined}
              className="flex-1 rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-red-900 focus:outline-none"
              placeholder='Type "DELETE" to confirm'
              autoComplete="off"
            />
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirm !== "DELETE"}
              className="rounded border border-red-900 px-4 py-2 text-xs text-red-500 hover:border-red-600 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete Account"}
            </button>
          </div>
          {deleteError && <p id="delete-error" role="alert" className="mt-3 rounded border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-400">{deleteError}</p>}
        </div>
      </div>
    </div>
  );
}
