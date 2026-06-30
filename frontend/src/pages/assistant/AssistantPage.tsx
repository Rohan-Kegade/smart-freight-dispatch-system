import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }

const SUGGESTIONS = [
  'What cargo types require a refrigerated truck?',
  'What is the maximum working hours for a driver per week?',
  'Which routes have weight restrictions?',
  'What documentation is needed for hazardous materials?',
];

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0', isUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className={cn('max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed', isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
        {msg.content}
        <div className={cn('text-[10px] mt-1.5 opacity-60', isUser ? 'text-right' : '')}>
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hi! I\'m your FreightDispatch AI assistant. I can answer questions about your company\'s policies, route restrictions, and compliance requirements. Ask me anything!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: q, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    // Stub response — RAG backend coming in Step 10
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

  function useSuggestion(s: string) { setInput(s); }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="p-6 pb-0">
        <PageHeader title="AI Assistant" description="Ask questions about policies, routes, and compliance rules." />
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 pb-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => useSuggestion(s)} className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full text-foreground transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Ask about policies, routes, or compliance…"
            className="resize-none min-h-[44px] max-h-32"
            rows={1}
          />
          <Button size="icon" onClick={send} disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          Answers are grounded in uploaded company documents. RAG backend coming in Step 10.
        </p>
      </div>
    </div>
  );
}
