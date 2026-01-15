export function Footer(): React.ReactElement {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col items-center justify-center py-3">
        <div className="text-lg font-semibold">Real Estate Management System</div>
        <div className="text-sm">
          <a
            href="https://github.com/eevan7a9/real-estate-management"
            className="text-blue-600 hover:text-blue-800 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/eevan7a9/real-estate-management
          </a>
        </div>
      </div>
    </footer>
  );
}
