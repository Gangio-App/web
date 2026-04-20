import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { Text } from "../../design";
import { ProfileCard } from "./ProfileCard";

export const SpotifyNowPlaying = (props: { userId: string }) => {
  const [track, setTrack] = createSignal<any>(null);
  const [progress, setProgress] = createSignal(0);
  const [status, setStatus] = createSignal<
    "loading" | "playing" | "idle" | "unlinked" | "error"
  >("loading");

  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(`/api/spotify/nowplaying/${props.userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setStatus("unlinked");
          setTrack(null);
          return;
        }

        setStatus("error");
        setTrack(null);
        return;
      }
      const data = await response.json();
      if (data.isPlaying) {
        setTrack(data);
        setProgress(data.progress_ms);
        setStatus("playing");
      } else {
        setTrack(null);
        setStatus("idle");
      }
    } catch (err) {
      console.error("Spotify fetch error:", err);
      setStatus("error");
      setTrack(null);
    }
  };

  onMount(() => {
    fetchNowPlaying();
    const fetchInterval = setInterval(fetchNowPlaying, 10000);
    
    // Smooth progress bar update
    const progressInterval = setInterval(() => {
      const t = track();
      if (t && t.isPlaying) {
        setProgress(prev => Math.min(prev + 1000, t.duration_ms));
      }
    }, 1000);

    onCleanup(() => {
      clearInterval(fetchInterval);
      clearInterval(progressInterval);
    });
  });

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <ProfileCard>
      <Text class="title" size="large">
        Activity
      </Text>

      <Show when={track()} fallback={
        <div class="mt-1 text-sm opacity-60">
          <Show when={status() === "loading"}>Loading</Show>
          <Show when={status() === "idle"}>Not playing anything right now.</Show>
          <Show when={status() === "unlinked"}>No activity yet.</Show>
          <Show when={status() === "error"}>Unable to load Spotify activity.</Show>
        </div>
      }>
        {(t) => (
          <Show
            when={status() === "playing"}
            fallback={
              <div class="mt-1 text-sm opacity-60">Not playing anything right now.</div>
            }
          >
            <div class="flex items-center gap-4 mt-1">
              <img
                src={t().albumArt}
                alt={t().album}
                class="w-16 h-16 rounded-md shadow-sm border border-white/10"
              />
              <div class="flex-1 min-w-0 flex flex-col justify-center">
                <div class="text-[#1DB954] text-[10px] font-bold flex items-center gap-1 uppercase tracking-[0.1em] mb-1">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.215.353-.674.464-1.027.249-2.846-1.738-6.429-2.13-10.648-1.168-.403.093-.813-.16-.905-.562-.092-.403.16-.814.562-.905 4.616-1.055 8.577-.61 11.768 1.34.353.215.464.674.25 1.027zm1.467-3.26c-.27.439-.844.58-1.282.31-3.256-2-8.22-2.584-12.07-1.415-.494.15-.1.15-.494-.15-.41-.58-.15-1.28-.41-1.28.31 4.394-1.334 9.878-.667 13.593 1.62.439.27.58.844.31 1.282zm.126-3.37c-3.903-2.318-10.334-2.532-14.072-1.397-.6.182-.1.15-.494-.15-.41-.58-.15-1.28-.41-1.28.31 4.394-1.334 9.878-.667 13.593 1.62.439.27.58.844.31 1.282zm.126-3.37c-3.903-2.318-10.334-2.532-14.072-1.397-.6.182-1.242-.164-1.424-.764-.182-.6.164-1.242.764-1.424 4.29-1.303 11.394-1.053 15.89 1.617.54.32.714 1.018.394 1.558-.32.54-1.018.714-1.558.394z" />
                  </svg>
                  Spotify
                </div>
                <a
                  href={t().url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block text-sm font-bold truncate hover:underline underline-offset-2 decoration-[#1DB954]"
                >
                  {t().title}
                </a>
                <div class="text-[13px] opacity-60 truncate">by {t().artist}</div>
                <div class="mt-2 space-y-1">
                  <div class="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-[#1DB954] transition-all duration-1000 ease-linear"
                      style={{
                        width: `${t().duration_ms ? (progress() / t().duration_ms) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div class="flex justify-between text-[10px] opacity-40 font-medium">
                    <span>{formatTime(progress())}</span>
                    <span>{formatTime(t().duration_ms)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Show>
        )}
      </Show>
    </ProfileCard>
  );
};
