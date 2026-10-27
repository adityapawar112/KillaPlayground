# Security & Input Shielding Standards

## Core Directive
Treat all external data—whether from network requests, user canvas inputs, shared URLs, or AI model prompts—as untrusted. Eliminate attack surfaces by strict schema parsing, rate limiting, and zero-secret exposure.

## 1. Network Ingress & Zod Guarding
Every API route handler (e.g., `POST /api/killa`) must enforce defensive schema boundaries:
- **Strict Size Ceilings:** Raw request bodies must be rejected if exceeding 100 KB. Compressed `fflate` binary payloads must be validated to $\le 35\text{ KB}$.
- **Entity Limits:** Placed props array must be strictly bounded (`props.length <= 250`). Reject any payload exceeding this count.
- **Coordinate Sanitization:** Coordinate floats ($x, y, z$, rotation, scale) must be checked for `Number.isFinite()`, rejecting `NaN`, `Infinity`, or values outside the terrain boundary $[-10.0, 10.0]$.
- **String Sanitization:** Fort titles, builder names, and greetings must be stripped of HTML tags, control characters, and truncated to safe lengths (e.g., title $\le 60$ chars, name $\le 40$ chars).

```typescript
// Example Zod Guard
export const KillaPayloadSchema = z.object({
  title: z.string().trim().min(1).max(60).regex(/^[^<>]+$/, "Invalid characters in title"),
  builderName: z.string().trim().min(1).max(40).regex(/^[^<>]+$/, "Invalid characters in name"),
  templateId: z.enum(['raigad', 'janjira', 'pratapgad', 'sinhagad', 'vijaydurg', 'scratch']),
  propsCount: z.number().int().min(0).max(250),
  binaryState: z.instanceof(Uint8Array).refine(buf => buf.byteLength <= 35_000, "Payload exceeds 35KB ceiling")
});
```

## 2. Supabase & Database Row-Level Security (RLS)
- **Zero Public Mutation:** Never grant public update or delete permissions on `public.killas`.
- **Public Read, Isolated Insert:** Enable RLS with:
  ```sql
  ALTER TABLE public.killas ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public read killas" ON public.killas FOR SELECT USING (true);
  -- Inserts permitted only via validated Next.js Route Handler using service role or scoped token
  ```
- **Storage Bucket Sandboxing:** Public storage bucket `killa-blobs` must enforce MIME type `application/octet-stream` or `image/jpeg` with maximum upload size 50 KB.

## 3. Secret Leakage & Credential Shielding
- **No Hardcoded Credentials:** Never hardcode Supabase service keys, database passwords, or auth tokens in source files.
- **Git Shielding:** `.gitignore` must strictly block `.env*`, `.pem`, `.key`, and credential files.
- **Sanitized Errors:** Catch-all error handlers in API routes must never return raw database error messages, stack traces, or internal file paths to clients.

## 4. Prompt Injection & AI Tooling Shielding
- When using LLM agents or skills for automated generation (e.g., fort description or title generation), encapsulate user inputs within strict delimiters.
- Disallow model instructions embedded in user-supplied title strings from overriding system prompts.
