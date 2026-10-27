// Fallback SVG placeholder data URI for posters when network/image fails
export const getMoviePosterPlaceholder = (title = 'Movie') => {
  const encodedTitle = encodeURIComponent(title.slice(0, 18));
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="300" height="450" fill="%23161922"/><circle cx="150" cy="180" r="50" fill="%23272b3b"/><polygon points="140,160 170,180 140,200" fill="%23e50914"/><text x="50%" y="270" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23f8fafc" text-anchor="middle">${encodedTitle}</text><text x="50%" y="300" font-family="sans-serif" font-size="12" fill="%2394a3b8" text-anchor="middle">IMovies Cinema</text></svg>`;
};
