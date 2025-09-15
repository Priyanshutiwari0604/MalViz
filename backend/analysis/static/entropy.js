export function calculateEntropy(buffer) {
  const freq = new Array(256).fill(0);
  for (const byte of buffer) freq[byte]++;
  let entropy = 0;
  const len = buffer.length;
  for (const f of freq) {
    if (f === 0) continue;
    const p = f / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}