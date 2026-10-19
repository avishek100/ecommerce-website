import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/components/shop/shop-context";
import { apiRequest, ApiError } from "@/lib/api";
import { readEventStream } from "@/lib/event-stream";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Chat with Support — NovaShop" }] }),
  component: SupportChat,
});

type ChatMessage = {
  id: string;
  customerId: string;
  sender: "customer" | "admin";
  senderName: string;
  text: string;
  createdAt: string;
};

function mergeMessage(current: ChatMessage[], incoming: ChatMessage) {
  if (current.some((message) => message.id === incoming.id)) return current;
  return [...current, incoming].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function SupportChat() {
  const { user, authToken, authLoading } = useShop();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authToken) return;
    let stopped = false;
    const controller = new AbortController();
    setLoading(true);
    apiRequest<{ messages: ChatMessage[] }>("/chat/messages", {}, authToken)
      .then(({ messages: storedMessages }) => {
        if (!stopped) setMessages(storedMessages);
      })
      .catch((requestError: unknown) => {
        if (!stopped)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load your support conversation.",
          );
      })
      .finally(() => {
        if (!stopped) setLoading(false);
      });

    async function connect() {
      while (!stopped) {
        try {
          await readEventStream(
            "/chat/stream",
            authToken,
            (event: unknown) => {
              if (
                typeof event === "object" &&
                event !== null &&
                "message" in event
              ) {
                const incoming = (event as { message: ChatMessage }).message;
                setMessages((current) => mergeMessage(current, incoming));
              }
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
  }, [authToken]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authToken || !text.trim()) return;
    setSending(true);
    setError("");
    try {
      const result = await apiRequest<{ message: ChatMessage }>(
        "/chat/messages",
        { method: "POST", body: JSON.stringify({ text }) },
        authToken,
      );
      setMessages((current) => mergeMessage(current, result.message));
      setText("");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Could not send your message.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-5">
      <header className="rounded-3xl bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary">
            <MessageCircle />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              NovaShop support
            </p>
            <h1 className="text-2xl font-bold">Chat with our team</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Send us a message and an administrator will reply here.
        </p>
      </header>
      {authLoading ? (
        <div className="grid min-h-56 place-items-center rounded-3xl bg-card text-muted-foreground shadow-soft">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
      ) : !user || !authToken ? (
        <section className="space-y-4 rounded-3xl bg-card p-6 text-center shadow-soft">
          <p className="font-medium">
            Please register or sign in to send messages to support.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-xl">
              <Link to="/login" search={{ returnTo: "/support" }}>
                Sign in
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/register" search={{ returnTo: "/support" }}>
                Create an account
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl bg-card shadow-soft">
          <div
            aria-live="polite"
            className="flex h-[min(55vh,520px)] flex-col gap-3 overflow-y-auto p-5"
          >
            {loading && !messages.length ? (
              <p className="m-auto text-sm text-muted-foreground">
                Loading conversation…
              </p>
            ) : !messages.length ? (
              <p className="m-auto text-center text-sm text-muted-foreground">
                No messages yet. How can we help?
              </p>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    message.sender === "customer"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-muted"
                  }`}
                >
                  <p className="mb-1 text-xs font-semibold opacity-75">
                    {message.sender === "customer" ? "You" : "NovaShop support"}
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
            <p role="alert" className="mx-5 mb-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <form
            onSubmit={sendMessage}
            className="flex items-end gap-3 border-t p-4"
          >
            <textarea
              aria-label="Your message"
              required
              maxLength={2000}
              rows={2}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Write a message…"
              className="min-h-11 flex-1 resize-y rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              type="submit"
              disabled={sending || !text.trim()}
              className="rounded-xl"
              aria-label="Send message"
            >
              {sending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </section>
      )}
    </main>
  );
}
