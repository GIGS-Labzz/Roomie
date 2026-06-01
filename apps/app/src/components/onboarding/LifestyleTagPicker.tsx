"use client";

const TAGS = [
  "studious", "social", "athletic", "religious", "gamer",
  "foodie", "early-riser", "homebody", "traveler", "vegetarian",
  "night-owl", "music-lover", "minimalist", "pet-friendly",
];

interface LifestyleTagPickerProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function LifestyleTagPicker({ selected, onChange }: LifestyleTagPickerProps) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
            selected.includes(tag)
              ? "bg-brand-500 text-white border-brand-500"
              : "bg-white text-slate-700 border-slate-200 hover:border-brand-300"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
