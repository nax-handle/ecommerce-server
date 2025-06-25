"use client";

interface VariantSizeSelectProps {
  values: Array<{
    value: string;
    available: boolean;
  }>;
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  title: string;
}

export function VariantSizeSelect({
  values,
  selectedValue,
  onSelect,
  title,
}: VariantSizeSelectProps) {
  const handleSelect = (value: string) => {
    if (selectedValue === value) {
      onSelect(null);
    } else {
      onSelect(value);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex">
        <span className="w-28 text-gray-500">{title}</span>
        <div className="flex-1">
          <div className="grid grid-cols-6 gap-2">
            {values.map(({ value, available }) => (
              <button
                key={value}
                onClick={() => available && handleSelect(value)}
                disabled={!available}
                className={`relative p-2.5 rounded-md transition-all duration-200 ${
                  selectedValue === value
                    ? "border-2 border-blue-500 bg-blue-50 shadow-sm"
                    : !available
                    ? "border-2 border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                    : "border-2 border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    !available ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  {value}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
