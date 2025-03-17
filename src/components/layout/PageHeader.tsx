interface PageHeaderProps {
  pageName: string;
  rightContent?: React.ReactNode;
}

export default function PageHeader({ pageName, rightContent }: PageHeaderProps) {
  return (
    <div className="sticky top-0 bg-white z-10">
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <h1 className="text-xl font-bold">{pageName}</h1>
        {rightContent}
      </div>
    </div>
  );
}