// Keep project-relative URLs portable between a domain root and GitHub Pages.
export const basePath = import.meta.env?.BASE_URL || '/';
export const isStaticHosting = import.meta.env?.VITE_STATIC_MODE === 'true';

export function sitePath(value = '/') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return value;
  if (basePath === '/' || value.startsWith(basePath)) return value;
  return basePath + value.slice(1);
}

export function routePath(pathname = window.location.pathname) {
  const path = basePath !== '/' && pathname.startsWith(basePath)
    ? '/' + pathname.slice(basePath.length)
    : pathname;
  return path.replace(/\/+$/, '') || '/';
}
