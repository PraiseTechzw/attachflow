'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SidebarNav } from './sidebar-nav';
import { Logo } from '@/components/icons/logo';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="w-80 p-0 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 border-r border-sidebar-border/50"
      >
        <SheetHeader className="flex h-16 items-center justify-between border-b border-sidebar-border/50 px-6 bg-gradient-to-r from-sidebar-primary/10 to-transparent">
          <SheetTitle className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
          </SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <SidebarNav onItemClick={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}