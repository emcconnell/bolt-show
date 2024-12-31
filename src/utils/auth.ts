export async function hashPassword(password: string): Promise<string> {
  // Simple but secure mock hashing for development
  const salt = crypto.getRandomValues(new Uint8Array(16))
    .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');
  
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(password + salt)
  );
  
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${salt}:${hashHex}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedHash] = hash.split(':');
  
  if (!salt || !storedHash) {
    throw new Error('Invalid hash format');
  }
  
  const newHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(password + salt)
  );
  
  const newHashHex = Array.from(new Uint8Array(newHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return storedHash === newHashHex;
}