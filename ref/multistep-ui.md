### Teaching Guide — AI SDK **Multi‑Step Interfaces** (React Server Components)

---

#### 1 | What Are “Multi‑Step Interfaces”?

A **sequence of server‑rendered React components** streamed to the browser, where each step can:

1. Ask the LLM what to show next.
2. Decide whether to call a back‑end **tool** (database, API, function).
3. Yield partial UI (“loading”, “verify”, “confirmation”) before the final answer.

This pattern unifies conversational agents, form‑wizards, and progressive‑disclosure UIs without client‑side state machines. *Everything lives on the server and streams down as HTML.*

---

#### 2 | Essential Building‑Blocks

| Block                     | Role                                                           | Core Helper                                                |
| ------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| **`streamUI()`**          | Tie LLM + prompt + tools to a JSX stream                       | `streamUI({ model, prompt, tools })`                       |
| **Async Generator Tool**  | Yields interim JSX, then returns a component for the next step | `tool(fn, { name, description, schema })`                  |
| **Server Action Wrapper** | Kicks off the stream from an RSC                               | `export async function action(formData){ …return stream }` |
| **`<StreamableUI>`**      | Client component that consumes the stream sent by the server   | `const ui = useUIStream(action)`                           |

---

#### 3 | Canonical Flow Diagram

```mermaid
graph LR
User-->SA(Server Action)-->|streamUI| LLM
LLM-->|tool_call JSON| Tool(fn) --> LLM
LLM -->|JSX chunk| RSC --> Browser
Browser --> Follow‑up form / action --> SA
```

*Each submit returns a **new** stream that continues the interaction, stateless on the edge but state‑full via `thread_id`.*

---

#### 4 | Reference Example (Two‑Step Order Wizard)

```ts
// 1 | Define React components
function Loading(){ return <p>⏳ Checking stock…</p>; }
function Confirm({ item, qty }){ /* JSX asking for confirmation */ }
function Receipt({ orderId }){ return <p>✅ Order #{orderId} placed!</p>; }

// 2 | Tool that needs async I/O
const checkInventory = tool(
  async function* ({ item, qty }) {
    yield <Loading />;
    const ok = await hasStock(item, qty);       // external call
    if (!ok) return <p>❌ Out of stock</p>;
    return <Confirm item={item} qty={qty} />;
  },
  {
    name: "check_inventory",
    description: "Verify item quantity",
    schema: z.object({ item: z.string(), qty: z.number().int() })
  }
);

// 3 | LLM prompt orchestrating steps
const prompt = `You are an order assistant. 
If quantity is available, call check_inventory; else apologise.`;

// 4 | Server action
export async function placeOrder(
  formData: FormData,
  { thread_id }: { thread_id: string }
){
  return streamUI({
    model: new ChatOpenAI({ temperature: 0 }),
    prompt,
    tools: { checkInventory },
    messages: [{ role: "user", content: formData.get("itemLine") }],
    config: { thread_id }         // keeps state between submits
  });
}
```

*Highlights*

* **First stream** delivers `<Loading>` then `<Confirm>`.
* User presses *“Yes”* → second server action stores order, returns `<Receipt>`.

---

#### 5 | Design Levers & Best Practices

| Lever            | Guidance                                                     |
| ---------------- | ------------------------------------------------------------ |
| **Granularity**  | Keep each tool focused on one domain call; chain via LLM.    |
| **Streaming UX** | Always yield a skeleton component before await‑ing I/O.      |
| **Schemas**      | Tight Zod schemas prevent malformed tool calls.              |
| **Thread IDs**   | Use cookies or session IDs to scope multi‑step flows.        |
| **Security**     | Sanitize any LLM‑supplied args before hitting back‑end APIs. |
| **Fallback**     | If tool throws, yield error UI and end stream gracefully.    |

---

#### 6 | Common Pitfalls & Fixes

| Symptom                  | Root Cause                                     | Fix                                           |
| ------------------------ | ---------------------------------------------- | --------------------------------------------- |
| Blank page after submit  | Not wrapping stream with `<Suspense>`          | Add `<Suspense fallback={<Loading/>}>`        |
| Tool loops forever       | LLM missing “stop when done” instruction       | Clarify prompt; enforce max loops server‑side |
| State lost between steps | Omitting `thread_id` or using new ID each time | Persist stable ID in cookie/localStorage      |

---

#### 7 | Classroom Implementation Plan

| Stage                  | Activity                                                   | Outcome               |
| ---------------------- | ---------------------------------------------------------- | --------------------- |
| **Concept (10 min)**   | Sketch multi‑step timeline (submit → stream → next submit) | Mental model          |
| **Lab 1 (25 min)**     | Implement single‑step weather UI (from previous lesson)    | Foundation            |
| **Lab 2 (30 min)**     | Extend to two‑step order wizard with `checkInventory` tool | Multi‑step mastery    |
| **Lab 3 (20 min)**     | Introduce `thread_id`; refresh page and resume flow        | Persistence insight   |
| **Challenge (15 min)** | Add a third step (payment) with retry on failure           | Real‑world complexity |
| **Debrief (10 min)**   | Inspect DevTools: see streamed chunks & SSE                | Performance awareness |

---

#### 8 | Key Takeaways

1. **Multi‑step interfaces = sequence of streamed RSCs directed by the LLM.**
2. **Tools encapsulate async work; generators let you interleave loading UI and data.**
3. **`thread_id` stitches stateless server calls into a coherent conversation.**
4. **Streaming improves UX, reduces TTI, and sidesteps client‑side state machines.**
5. Apply this pattern to any workflow—onboarding, checkout, data‑entry—where steps depend on live back‑end results.

---
