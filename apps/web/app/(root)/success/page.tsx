import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ChevronRight, LayoutDashboard } from "lucide-react";
import * as motion from "motion/react-client";

import { Button } from "@repo/ui/components/button";

const SuccessPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-3xl text-center">
        {/* Success Illustration with Motion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0, 0.71, 0.2, 1.01],
          }}
          className="relative mb-8 flex justify-center"
        >
          <div className="from-primary/20 to-primary/5 absolute inset-0 -z-10 rounded-full bg-linear-to-b blur-3xl" />
          <Image
            src="/images/success.png"
            alt="Checkout Success"
            width={250}
            height={250}
            className="drop-shadow-2xl"
            priority
          />
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="bg-primary/10 text-primary mx-auto mb-6 flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
            <CheckCircle2 className="size-4" />
            <span>Successfully Upgraded</span>
          </div>

          <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-6xl">
            Congratulations on your
            <br />
            <span className="text-primary italic">Upgrade</span>
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-lg text-lg leading-relaxed">
            Your subscription has been upgraded successfully! Experience the
            full power of VaultCore with advanced security and seamless
            collaboration.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-base transition-all hover:scale-105 active:scale-95"
          >
            <Link href="/" className="flex items-center gap-2">
              <LayoutDashboard className="size-5" />
              Go to Dashboard
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Secondary Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 text-sm text-zinc-500"
        >
          A confirmation email has been sent to your inbox. <br />
          Need help?{" "}
          <Link
            href="/support"
            className="text-primary underline-offset-4 hover:underline"
          >
            Contact Support
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default SuccessPage;
