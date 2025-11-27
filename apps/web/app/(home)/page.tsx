import React from "react";

const Page = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-24 text-center lg:py-32 bg-[url(/hero-bg.png)] bg-cover bg-bottom bg-no-repeat min-h-screen">
        <div className="bg-primary/10 absolute inset-0 z-10 h-full w-full mask-[radial-gradient(ellipse_at_center,transparent_10%,black)]"></div>
        <h1 className="text-4xl max-w-4xl w-full font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-white">
          Secure Your Digital Assets with{" "}
          <span className="text-primary">VaultCore</span>
        </h1>
        <p className="mt-6 max-w-2xl w-full md:text-xl text-white/60">
          The next generation of secure storage for your most valuable data.
          Encrypted, decentralized, and accessible anywhere.
        </p>
        <div className="mt-8 flex gap-4">
          <button className="rounded-md bg-primary px-8 py-3 font-medium text-primary-foreground transition-transform hover:scale-105">
            Get Started
          </button>
          <button className="rounded-md border border-input bg-background px-8 py-3 font-medium hover:bg-accent hover:text-accent-foreground">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section (Bento Grid Style) */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
          Powerful Features
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 lg:gap-8">
          <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 md:col-span-2 md:row-span-2">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <h3 className="text-2xl font-bold">Advanced Encryption</h3>
            <p className="mt-2 text-muted-foreground">
              Military-grade AES-256 encryption ensures your data remains yours
              alone. We utilize zero-knowledge architecture.
            </p>
            <div className="mt-8 h-48 w-full rounded-lg bg-muted/50" />
          </div>
          <div className="group relative overflow-hidden rounded-2xl border bg-card p-6">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <h3 className="text-xl font-bold">Instant Sync</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Changes reflect across all your devices in milliseconds.
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-2xl border bg-card p-6">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <h3 className="text-xl font-bold">Team Collaboration</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Securely share vaults with granular permission controls.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Why Choose VaultCore?
              </h2>
              <ul className="space-y-4">
                {[
                  "Zero-knowledge privacy architecture",
                  "Cross-platform availability (iOS, Android, Web)",
                  "Biometric authentication support",
                  "Automated backups and version history",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                      ✓
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <div className="aspect-video w-full rounded-xl bg-linear-to-tr from-primary/20 via-background to-primary/10 shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t bg-background py-12">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
          <div>
            <h4 className="mb-4 font-bold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer">Features</li>
              <li className="hover:text-foreground cursor-pointer">Security</li>
              <li className="hover:text-foreground cursor-pointer">
                Enterprise
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer">About Us</li>
              <li className="hover:text-foreground cursor-pointer">Careers</li>
              <li className="hover:text-foreground cursor-pointer">Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer">
                Privacy Policy
              </li>
              <li className="hover:text-foreground cursor-pointer">
                Terms of Service
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold">VaultCore</h4>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} VaultCore Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
