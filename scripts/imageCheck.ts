/** Shared image validation used by the fetch script and the data-integrity tests. */

export const MIN_IMAGE_BYTES = 5 * 1024

export function isJpeg(buf: Uint8Array): boolean {
  return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
}

export function isPng(buf: Uint8Array): boolean {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  return buf.length > 8 && sig.every((b, i) => buf[i] === b)
}

/** A real JPEG or PNG that is larger than 5 KB. */
export function isValidRasterImage(buf: Uint8Array): boolean {
  return buf.length > MIN_IMAGE_BYTES && (isJpeg(buf) || isPng(buf))
}

export function isValidSvg(text: string): boolean {
  return text.trimStart().startsWith('<svg') && text.includes('</svg>') && text.includes('viewBox')
}
