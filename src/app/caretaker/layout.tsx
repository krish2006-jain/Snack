export default function CaretakerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // AppLayout is used per-page for the caretaker section
    // so this layout is just a passthrough
    return <>{children}</>;
}
