export function MockModeBanner() {
  return (
    <div className="alert alert-info rounded-box shadow-sm">
      <span className="text-sm">
        Mode <strong>démo</strong> actif — données mock locales. Passez{" "}
        <code className="rounded bg-base-200 px-1">MOCK_API=false</code> pour
        utiliser l&apos;API réelle.
      </span>
    </div>
  );
}
