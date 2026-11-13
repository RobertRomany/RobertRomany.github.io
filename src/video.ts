/** Returns the 11-character YouTube id for watch, youtu.be, embed, shorts and live links; otherwise undefined. */
export const youtubeId = (url: string) =>
  url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/)?.[1];
