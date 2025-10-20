"use client";

/**
 * VideoPlayer: Renders a generated video with playback and download options.
 */
export default function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const filename = videoUrl.split("/").pop() || "video.mp4";
  return (
    <div className="card p-4">
      <video
        className="w-full rounded-lg shadow-soft"
        controls
        playsInline
        src={videoUrl}
      />
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{filename}</span>
        <a className="btn-primary" href={videoUrl} download>
          Download
        </a>
      </div>
    </div>
  );
}
