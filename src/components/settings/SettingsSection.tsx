import { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="py-4">
      <h2 className="text-lg font-semibold mb-4 px-4">{title}</h2>
      {children}
    </div>
  );
}