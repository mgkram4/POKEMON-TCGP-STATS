interface CustomCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const CustomCard = ({ title, children, className, icon }: CustomCardProps) => (
  <div className={`p-4 rounded-xl shadow-md ${className}`}>
    {title && (
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-semibold text-gray-700">{title}</h3>
      </div>
    )}
    {children}
  </div>
);



