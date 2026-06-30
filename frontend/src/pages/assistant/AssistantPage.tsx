import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }

const SUGGESTIONS = [
  { label: 'Refrigerated cargo', q: 'What cargo types require a refrigerated truck?' },
  { label: 'Driver hours limit', q: 'What is the maximum working hours for a driver per week?' },
  { label: 'Weight restrictions', q: 'Which routes have weight restrictions?' },
  { label: 'Hazmat docs', q: 'What documentation is needed for hazardous materials?' },
];

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content: 'Hi! I\'m your FreightDispatch AI assistant. I can answer questions about your company\'s policies, route restrictions, and compliance requirements. Ask me anything!',
  timestamp: new Date(),
};

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-3 items-end', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
      )}>
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <div className={cn(
        'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
        isUser
          ? 'bg-primary text-primary-foreground rounded-br-sm'
          : 'bg-muted text-foreground rounded-bl-sm',
      )}>
        {msg.content}
        <div className={cn('text-[10px] mt-1 opacity-50', isUser ? 'text-right' : '')}>
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasUserMessages = messages.some(m => m.role === 'user');

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: q, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'The RAG knowledge assistant is coming in Step 10. Once document uploads are wired up, I\'ll retrieve relevant sections from your uploaded policy documents and provide grounded answers here. For now, this is a UI preview of the chat interface.',
      timestamp: new Date(),
    };
    setMessages(m => [...m, assistantMsg]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* If no user messages yet: welcome state */}
      {!hasUserMessages ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">AI Assistant</h2>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-8">
            Ask questions about your company's freight policies, route restrictions, compliance rules, and more.
          </p>
          <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
            {SUGGESTIONS.map(s => (
              <button
                key={s.label}
                onClick={() => send(s.q)}
                className="text-left rounded-xl border bg-background hover:border-primary/50 hover:bg-primary/5 px-4 py-3 transition-all group"
              >
                <p className="text-sm font-medium group-hover:text-primary transition-colors">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">{s.q}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Chat messages */
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 max-w-3xl mx-auto w-full">
          {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
          {loading && (
            <div className="flex gap-3 items-end">
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input area — always at bottom */}
      <div className="border-t bg-background px-6 py-4 max-w-3xl mx-auto w-full">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Ask about policies, routes, or compliance…"
            className="resize-none min-h-[44px] max-h-32 text-sm"
            rows={1}
          />
          <Button size="icon" onClick={() => send()} disabled={!input.trim() || loading} className="h-[44px] w-[44px] shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground/60 mt-2">
          Answers are grounded in uploaded company documents. RAG backend coming in Step 10.
        </p>
      </div>
    </div>
  );
}
