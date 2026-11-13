import { describe, expect, it } from 'vitest';
import { youtubeId } from './video';

describe('youtubeId', () => {
  const id = 'dQw4w9WgXcQ';
  it('reads the common link shapes', () => {
    for (const u of [`https://www.youtube.com/watch?v=${id}`, `https://youtu.be/${id}?si=abc`, `https://www.youtube.com/watch?feature=share&v=${id}`,
      `https://www.youtube.com/shorts/${id}`, `https://www.youtube.com/embed/${id}`, `https://m.youtube.com/watch?v=${id}&t=10s`]) expect(youtubeId(u)).toBe(id);
  });
  it('ignores direct video files', () => expect(youtubeId('https://example.com/demo.mp4')).toBeUndefined());
});
