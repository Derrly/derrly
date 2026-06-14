import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyProfile, updateMyProfile } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/app/profile")({
  component: ProfilePage,
});

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "D";
}

function ProfilePage() {
  const getProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const [displayName, setDisplayName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile.data) return;
    setDisplayName(profile.data.display_name ?? "");
    setStudioName(profile.data.studio_name ?? "");
    setAvatarUrl(profile.data.avatar_url ?? "");
  }, [profile.data]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await saveProfile({ data: { displayName, studioName, avatarUrl } });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Account</p>
      <h1 className="mt-4 font-display text-5xl text-foreground">Your studio profile.</h1>
      <p className="mt-3 text-muted-foreground">Set the identity shown across your Derrly workspace.</p>

      <form onSubmit={onSubmit} className="mt-10 space-y-6 border-y hairline py-8">
        <div className="flex items-center gap-5">
          <Avatar className="size-20 border hairline">
            <AvatarImage src={avatarUrl} alt={displayName ? `${displayName}'s avatar` : "Profile avatar"} />
            <AvatarFallback className="font-display text-2xl">{initials(displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">Avatar preview</p>
            <p className="mt-1 text-sm text-muted-foreground">Use a secure image URL, or leave it blank for initials.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studio-name">Studio name</Label>
          <Input id="studio-name" value={studioName} onChange={(event) => setStudioName(event.target.value)} maxLength={100} placeholder="Your game studio" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar-url">Avatar image URL</Label>
          <Input id="avatar-url" type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} maxLength={2048} placeholder="https://…" />
        </div>
        {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}
        <Button type="submit" disabled={busy || !displayName.trim()} className="rounded-full px-5">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save profile
        </Button>
      </form>
    </section>
  );
}