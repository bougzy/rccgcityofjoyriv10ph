export function parseYouTubeUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function parseFacebookUrl(url: string): string | null {
  const patterns = [
    /facebook\.com\/.*\/videos\/(\d+)/,
    /facebook\.com\/watch\/?\?v=(\d+)/,
    /fb\.watch\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function parseStreamUrl(url: string): { platform: string; videoId: string } | null {
  const ytId = parseYouTubeUrl(url);
  if (ytId) return { platform: 'youtube', videoId: ytId };

  const fbId = parseFacebookUrl(url);
  if (fbId) return { platform: 'facebook', videoId: fbId };

  return null;
}

export function generateEmbedUrl(platform: string, videoId: string): string {
  if (platform === 'youtube') {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (platform === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=${videoId}&show_text=false&autoplay=true`;
  }
  return '';
}
