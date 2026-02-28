// Route-level override: SOS page uses its own fullscreen layout
// (inherit parent route group layout - patient layout will wrap this)
export default function SOSLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
