"use client";

import * as React from "react";

interface VariantColorSelectProps {
  names: Array<{
    name: string;
    available: boolean;
  }>;
  selectedName: string | null;
  onSelect: (name: string | null) => void;
  title: string;
}

export function VariantColorSelect({
  names,
  selectedName,
  onSelect,
  title,
}: VariantColorSelectProps) {
  const handleSelect = (name: string) => {
    if (selectedName === name) {
      onSelect(null);
    } else {
      onSelect(name);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex">
        <span className="w-28 text-gray-500">{title}</span>
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-3">
            {names.map(({ name, available }) => (
              <button
                key={name}
                onClick={() => available && handleSelect(name)}
                disabled={!available}
                className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200
                  ${
                    selectedName === name
                      ? "border-2 border-blue-500 bg-blue-50 shadow-sm"
                      : !available
                      ? "border-2 border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                      : "border-2 border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                  }
                `}
              >
                <span
                  className={`${
                    !available ? "text-gray-400" : "text-gray-700"
                  } text-sm font-medium`}
                >
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
