import { SettingsTheme, SettingsCoordDefault } from './components';

export default function SettingsPage(): React.ReactElement {
  return (
    <div className="container mx-auto max-w-screen-2xl px-3 py-3 xl:px-4 xl:py-5">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      <div className="flex flex-col gap-4">
        <SettingsTheme />
        <SettingsCoordDefault />
      </div>
    </div>
  );
}
