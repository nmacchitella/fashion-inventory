"use client"

interface DetailsItem {
  label: string;
  value: string | number | React.ReactNode;
}

interface DetailsViewProps {
  title: string;
  items: DetailsItem[];
}

export function DetailsView({ title, items }: DetailsViewProps) {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
            <dd className="text-sm text-gray-900">{item.value}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}
