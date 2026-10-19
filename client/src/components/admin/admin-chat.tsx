import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, ApiError } from "@/lib/api";
import { readEventStream } from "@/lib/event-stream";

type ChatMessage = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  sender: "customer" | "admin";
  senderName: string;
  text: string;
  createdAt: string;
};
type Conversation = {
  customerId: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastSender: "customer" | "admin";
  updatedAt: string;
};

function mergeMessage(current: ChatMessage[], incoming: ChatMessage) {
  if (current.some((message) => message.id === incoming.id)) return current;
  return [...current, incoming].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

export function AdminChat({ token }: { token: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let stopped = false;
    const controller = new AbortController();
    apiRequest<{ conversations: Conversation[] }>("/admin/chat", {}, token)
      .then(({ conversations: rows }) => {
        if (stopped) return;
        setConversations(rows);
        setSelectedCustomerId(
          (current) => current || rows[0]?.customerId || "",
        );
      })
      .catch((requestError: unknown) => {
        if (!stopped)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load customer conversations.",
          );
      });

    async function connect() {
      while (!stopped) {
        try {
          await readEventStream(
            "/admin/chat/stream",
            token,
            (event: unknown) => {
              if (
                typeof event !== "object" ||
                event === null ||
                !("message" in event)
              )
                return;
              const incoming = (event as { message: ChatMessage }).message;
              setConversations((current) => {
                const previous = current.find(
                  (conversation) =>
                    conversation.customerId === incoming.customerId,
                );
                const updated: Conversation = {
                  customerId: incoming.customerId,
                  customerName:
                    incoming.customerName ||
                    previous?.customerName ||
                    "Customer",
                  customerEmail:
                    incoming.customerEmail || previous?.customerEmail || "",
                  lastMessage: incoming.text,
                  lastSender: incoming.sender,
                  updatedAt: incoming.createdAt,
                };
                return [
                  updated,
                  ...current.filter(
                    (conversation) =>
                      conversation.customerId !== incoming.customerId,
                  ),
                ];
              });
              if (incoming.customerId === selectedCustomerId)
                setMessages((current) => mergeMessage(current, incoming));
            },
            controller.signal,
          );
          if (!stopped) throw new Error("The chat connection was closed.");
        } catch (streamError) {
          if (stopped || controller.signal.aborted) return;
          if (streamError instanceof ApiError && streamError.status === 401) {
            setError(streamError.message);
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }
    void connect();
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [selectedCustomerId, token]);

  useEffect(() => {
    if (!selectedCustomerId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    apiRequest<{ messages: ChatMessage[] }>(
      `/admin/chat/${selectedCustomerId}/messages`,
      {},
      token,
    )
      .then(({ messages: rows }) => {
        if (!cancelled) setMessages(rows);
      })
      .catch((requestError: unknown) => {
        if (!cancelled)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load this conversation.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCustomerId, token]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCustomerId || !text.trim()) return;
    setSending(true);
    setError("");
    try {
      const result = await apiRequest<{ message: ChatMessage }>(
        `/admin/chat/${selectedCustomerId}/messages`,
        { method: "POST", body: JSON.stringify({ text }) },
        token,
      );
      setMessages((current) => mergeMessage(current, result.message));
      setText("");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Could not send your reply.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="grid min-h-[min(70vh,720px)] overflow-hidden rounded-3xl bg-card shadow-soft md:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b p-3 md:border-b-0 md:border-r">
        <h2 className="px-2 pb-3 pt-1 text-sm font-semibold">
          Customer conversations
        </h2>
        <div className="max-h-60 space-y-1 overflow-y-auto md:max-h-[calc(70vh-5rem)]">
          {conversations.map((conversation) => (
            <button
              key={conversation.customerId}
              type="button"
              onClick={() => setSelectedCustomerId(conversation.customerId)}
              aria-current={
                selectedCustomerId === conversation.customerId
                  ? "true"
                  : undefined
              }
              className={`w-full rounded-xl p-3 text-left ${
                selectedCustomerId === conversation.customerId
                  ? "bg-accent"
                  : "hover:bg-muted"
              }`}
            >
              <span className="block truncate text-sm font-semibold">
                {conversation.customerName}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {conversation.customerEmail}
              </span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">
                {conversation.lastSender === "customer"
                  ? "Customer: "
                  : "You: "}
                {conversation.lastMessage}
              </span>
            </button>
          ))}
          {!conversations.length && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No customer messages yet.
            </p>
          )}
        </div>
      </aside>
      <div className="flex min-h-[420px] min-w-0 flex-col">
        <div className="border-b px-5 py-4">
          <h2 className="truncate font-semibold">
            {conversations.find(
              (conversation) => conversation.customerId === selectedCustomerId,
            )?.customerName ?? "Select a conversation"}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {conversations.find(
              (conversation) => conversation.customerId === selectedCustomerId,
            )?.customerEmail ?? "Customer support inbox"}
          </p>
        </div>
        <div
          aria-live="polite"
          className="flex flex-1 flex-col gap-3 overflow-y-auto p-5"
        >
          {loading && !messages.length ? (
            <p className="m-auto text-sm text-muted-foreground">
              Loading conversation…
            </p>
          ) : !selectedCustomerId ? (
            <p className="m-auto text-sm text-muted-foreground">
              New customer messages will appear here in real time.
            </p>
          ) : (
            messages.map((message) => (
              <article
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  message.sender === "admin"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-muted"
                }`}
              >
                <p className="mb-1 text-xs font-semibold opacity-75">
                  {message.sender === "admin" ? "You" : message.customerName}
                </p>
                <p className="whitespace-pre-wrap break-words">
                  {message.text}
                </p>
                <time className="mt-2 block text-right text-[10px] opacity-70">
                  {new Date(message.createdAt).toLocaleString()}
                </time>
              </article>
            ))
          )}
        </div>
        {error && (
          <p role="alert" className="px-5 pb-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <form
          onSubmit={sendMessage}
          className="flex items-end gap-3 border-t p-4"
        >
          <textarea
            aria-label="Admin reply"
            required
            maxLength={2000}
            rows={2}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Write a reply…"
            disabled={!selectedCustomerId}
            className="min-h-11 flex-1 resize-y rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={sending || !selectedCustomerId || !text.trim()}
            className="rounded-xl"
            aria-label="Send reply"
          >
            {sending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
