/**
 * Redis REST (Upstash / Vercel KV–compatible) client.
 * Set KV_REST_API_URL + KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 */

const URL =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL;
const TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN;

export function isKvConfigured(): boolean {
  return Boolean(URL && TOKEN);
}

async function rest<T = string>(command: string, ...args: (string | number)[]): Promise<T> {
  const res = await fetch(URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify([command, ...args]),
  });
  const json = (await res.json()) as { result?: T; error?: string };
  if (json.error) throw new Error(json.error);
  return json.result as T;
}

export async function kvGet(key: string): Promise<string | null> {
  const result = await rest<string | null>("GET", key);
  return result ?? null;
}

export async function kvSet(key: string, value: string): Promise<void> {
  await rest("SET", key, value);
}
