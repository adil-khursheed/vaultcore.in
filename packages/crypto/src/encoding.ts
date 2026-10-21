/**
 * Safe Base64 encoding/decoding utilities.
 *
 * Replaces the unsafe `btoa(String.fromCharCode(...new Uint8Array(data)))` pattern
 * which can cause stack overflow on large buffers due to the spread operator hitting
 * the maximum call stack size limit.
 */

/**
 * Encode a Uint8Array to a Base64 string using chunked processing
 * to avoid stack overflow on large buffers.
 */
export function toBase64(buffer: Uint8Array): string {
  const CHUNK_SIZE = 0x8000; // 32KB chunks
  const chunks: string[] = [];

  for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
    const chunk = buffer.subarray(i, i + CHUNK_SIZE);
    chunks.push(String.fromCharCode(...chunk));
  }

  return btoa(chunks.join(""));
}

/**
 * Decode a Base64 string to a Uint8Array.
 */
export function fromBase64(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
