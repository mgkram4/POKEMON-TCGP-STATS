interface CustomCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function CustomCard({ title, children, className }: CustomCardProps) {
  return (
    <div className={`rounded-lg border bg-white shadow p-4 ${className || ''}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}



