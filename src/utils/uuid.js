/**
 * Simple UUID v7 generator
 * Format: xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx (36 chars)
 */
function uuidv7() {
  const timestamp = Date.now();
  const rand = new Uint8Array(16);
  crypto.getRandomValues(rand);

  // UUID v7 layout (big-endian timestamp)
  // Bytes 0-5: unix timestamp in milliseconds (48 bits, big-endian)
  // Byte 6: version = 7 (high nibble)
  // Byte 7: random + variant (10xx)
  // Bytes 8-15: random

  rand[0] = (timestamp / 0x10000000000) & 0xFF;
  rand[1] = (timestamp / 0x100000000) & 0xFF;
  rand[2] = (timestamp / 0x1000000) & 0xFF;
  rand[3] = (timestamp / 0x10000) & 0xFF;
  rand[4] = (timestamp / 0x100) & 0xFF;
  rand[5] = timestamp & 0xFF;

  // Version 7
  rand[6] = 0x70 | (rand[6] & 0x0F);

  // Variant 10 (RFC 4122)
  rand[7] = 0x80 | (rand[7] & 0x3F);

  // Convert to hex string
  const hex = Array.from(rand).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

module.exports = { uuidv7 };
