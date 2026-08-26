export function cloudinaryImage(url, width) {
  if (!url) return ''

  if (!url.includes('/upload/')) {
    return url
  }

  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`)
}

export function cloudinarySrcSet(url, widths = [320, 480, 640, 960]) {
  if (!url?.includes('/upload/')) return ''

  return widths.map((width) => `${cloudinaryImage(url, width)} ${width}w`).join(', ')
}
