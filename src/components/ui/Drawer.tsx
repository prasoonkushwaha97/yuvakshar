"use client";

import React, { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={cn(
          "fixed right-0 top-0 bottom-0 z-[60] flex w-full max-w-md flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
        )}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
            <div className="flex flex-col space-y-1 text-left">
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100 font-serif">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
              <X className="h-5 w-5" />
              <span className="sr-only">Close drawer</span>
            </Dialog.Close>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
