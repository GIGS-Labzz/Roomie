interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base", xl: "w-20 h-20 text-xl" };

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={name ?? "Avatar"} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-brand-100 flex items-center justify-center">
          <span className="font-semibold text-brand-600">{initials}</span>
        </div>
      )}
    </div>
  );
}
