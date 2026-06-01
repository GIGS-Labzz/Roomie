// Typing indicator — three pulsing dots
// chat-typing.json Lottie wired in Phase 9

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="bg-white rounded-3xl rounded-bl-lg px-4 py-3 shadow-sm flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
          />
        ))}
      </div>
    </div>
  );
}
