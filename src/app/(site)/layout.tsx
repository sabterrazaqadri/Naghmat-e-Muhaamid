import { AmbientBlobs } from "@/components/AmbientBlobs";
import { CommandPaletteProvider } from "@/components/CommandPalette";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

/** Chrome for the public reading experience. The admin group opts out of it. */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CommandPaletteProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:rounded-xl focus:bg-gold focus:px-4 focus:py-2 focus:text-gold-contrast focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* `grain` on the shell, not on body: it needs a positioned ancestor to
          pin its ::after to, and this keeps the noise behind the sticky
          header's backdrop-filter rather than on top of it. */}
      <div className="grain relative flex min-h-svh flex-col">
        <AmbientBlobs />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>

      <InstallPrompt />
    </CommandPaletteProvider>
  );
}
