'use client';

import * as React from 'react';
import { useRef, useState } from 'react';
import { ModalDialog } from '@/playground/ModalDialog';
import { Tabs as CustomTabs } from '@/playground/Tabs';
import { Disclosure as CustomDisclosure } from '@/playground/Disclosure';
import {
  Dialog as ShadcnDialog,
  DialogTrigger as ShadcnDialogTrigger,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
  DialogClose as ShadcnDialogClose,
} from '@/components/ui/dialog';
import {
  Tabs as ShadcnTabs,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
  TabsContent as ShadcnTabsContent,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-4 border-b pb-2">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <div className="p-4 rounded-lg border border-border bg-card">{children}</div>
    </div>
  );
}

export default function PlaygroundPage() {
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const customDialogTriggerRef = useRef<HTMLButtonElement>(null);

  const customTabsItems = [
    {
      value: 'account',
      label: 'Account',
      content: (
        <div>
          <h4 className="font-medium mb-2">Account Settings</h4>
          <p className="text-muted-foreground text-sm">
            Make changes to your account here. Click save when you are done.
          </p>
          <div className="mt-3 space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="custom-name">
                Name
              </label>
              <input
                id="custom-name"
                defaultValue="Pedro Duarte"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="custom-username">
                Username
              </label>
              <input
                id="custom-username"
                defaultValue="@peduarte"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      value: 'password',
      label: 'Password',
      content: (
        <div>
          <h4 className="font-medium mb-2">Password</h4>
          <p className="text-muted-foreground text-sm">Change your password here.</p>
          <div className="mt-3 space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="custom-pw-current">
                Current
              </label>
              <input
                id="custom-pw-current"
                type="password"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="custom-pw-new">
                New
              </label>
              <input
                id="custom-pw-new"
                type="password"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      value: 'advanced',
      label: 'Advanced',
      content: (
        <div>
          <h4 className="font-medium mb-2">Advanced Settings</h4>
          <p className="text-muted-foreground text-sm">
            Advanced account options. Proceed with caution.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input id="custom-delete" type="checkbox" />
            <label htmlFor="custom-delete" className="text-sm">
              I want to delete my account
            </label>
          </div>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Accessibility Playground</h1>
          <p className="text-muted-foreground">
            Custom-built WAI-ARIA components vs shadcn/ui reference implementations.
            Test keyboard-only: Tab, Shift+Tab, Escape, Arrow keys, Enter, Space.
          </p>
        </header>

        <Section title="1. Modal Dialog">
          <SubSection title="Custom ModalDialog (hand-built)">
            <Button
              ref={customDialogTriggerRef}
              onClick={() => setCustomDialogOpen(true)}
            >
              Open custom dialog
            </Button>
            <ModalDialog
              open={customDialogOpen}
              onOpenChange={setCustomDialogOpen}
              triggerRef={customDialogTriggerRef}
              title="Edit profile"
              description="Make changes to your profile here. Click save when you are done."
            >
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="custom-dialog-name"
                    className="block text-sm font-medium mb-1"
                  >
                    Name
                  </label>
                  <input
                    id="custom-dialog-name"
                    defaultValue="Pedro Duarte"
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label
                    htmlFor="custom-dialog-username"
                    className="block text-sm font-medium mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="custom-dialog-username"
                    defaultValue="@peduarte"
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCustomDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setCustomDialogOpen(false)}>Save changes</Button>
              </div>
            </ModalDialog>
            <p className="mt-3 text-xs text-muted-foreground">
              Expected: Escape closes, Tab cycles inside, focus returns to trigger, click outside closes.
            </p>
          </SubSection>

          <SubSection title="shadcn/ui Dialog (Radix-powered)">
            <ShadcnDialog>
              <ShadcnDialogTrigger asChild>
                <Button>Open shadcn dialog</Button>
              </ShadcnDialogTrigger>
              <ShadcnDialogContent>
                <ShadcnDialogHeader>
                  <ShadcnDialogTitle>Edit profile</ShadcnDialogTitle>
                  <ShadcnDialogDescription>
                    Make changes to your profile here. Click save when you are done.
                  </ShadcnDialogDescription>
                </ShadcnDialogHeader>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="shadcn-dialog-name"
                      className="block text-sm font-medium mb-1"
                    >
                      Name
                    </label>
                    <input
                      id="shadcn-dialog-name"
                      defaultValue="Pedro Duarte"
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="shadcn-dialog-username"
                      className="block text-sm font-medium mb-1"
                    >
                      Username
                    </label>
                    <input
                      id="shadcn-dialog-username"
                      defaultValue="@peduarte"
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                <ShadcnDialogFooter className="sm:justify-end">
                  <ShadcnDialogClose asChild>
                    <Button type="button" variant="outline">
                      Close
                    </Button>
                  </ShadcnDialogClose>
                  <ShadcnDialogClose asChild>
                    <Button type="button">Save changes</Button>
                  </ShadcnDialogClose>
                </ShadcnDialogFooter>
              </ShadcnDialogContent>
            </ShadcnDialog>
          </SubSection>
        </Section>

        <Section title="2. Tabs">
          <SubSection title="Custom Tabs (hand-built)">
            <CustomTabs items={customTabsItems} defaultValue="account" />
            <p className="mt-3 text-xs text-muted-foreground">
              Expected: ArrowLeft / ArrowRight navigate tabs, Home/End jump, Enter/Space activate.
            </p>
          </SubSection>

          <SubSection title="shadcn/ui Tabs (Radix-powered)">
            <ShadcnTabs defaultValue="account">
              <ShadcnTabsList>
                <ShadcnTabsTrigger value="account">Account</ShadcnTabsTrigger>
                <ShadcnTabsTrigger value="password">Password</ShadcnTabsTrigger>
                <ShadcnTabsTrigger value="advanced">Advanced</ShadcnTabsTrigger>
              </ShadcnTabsList>
              <ShadcnTabsContent value="account" className="border p-4 rounded-md">
                <h4 className="font-medium mb-2">Account Settings</h4>
                <p className="text-muted-foreground text-sm">
                  Make changes to your account here. Click save when you are done.
                </p>
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="shadcn-name">
                      Name
                    </label>
                    <input
                      id="shadcn-name"
                      defaultValue="Pedro Duarte"
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="shadcn-username">
                      Username
                    </label>
                    <input
                      id="shadcn-username"
                      defaultValue="@peduarte"
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </ShadcnTabsContent>
              <ShadcnTabsContent value="password" className="border p-4 rounded-md">
                <h4 className="font-medium mb-2">Password</h4>
                <p className="text-muted-foreground text-sm">Change your password here.</p>
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="shadcn-pw-current">
                      Current
                    </label>
                    <input
                      id="shadcn-pw-current"
                      type="password"
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="shadcn-pw-new">
                      New
                    </label>
                    <input
                      id="shadcn-pw-new"
                      type="password"
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </ShadcnTabsContent>
              <ShadcnTabsContent value="advanced" className="border p-4 rounded-md">
                <h4 className="font-medium mb-2">Advanced Settings</h4>
                <p className="text-muted-foreground text-sm">
                  Advanced account options. Proceed with caution.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input id="shadcn-delete" type="checkbox" />
                  <label htmlFor="shadcn-delete" className="text-sm">
                    I want to delete my account
                  </label>
                </div>
              </ShadcnTabsContent>
            </ShadcnTabs>
          </SubSection>
        </Section>

        <Section title="3. Disclosure (Accordion)">
          <SubSection title="Custom Disclosure (hand-built)">
            <div className="space-y-2">
              <CustomDisclosure summary="What is SpatialStager AI?">
                <p className="text-muted-foreground">
                  SpatialStager AI helps you stage a 3D room with AI-assisted furniture
                  placement, mood selection, and paint suggestions based on an uploaded
                  photo of your space.
                </p>
              </CustomDisclosure>
              <CustomDisclosure summary="How does the AI chat work?">
                <p className="text-muted-foreground">
                  Type a mood like &ldquo;cozy&rdquo; or &ldquo;bright&rdquo; into the
                  chat box. The AI maps your request to a lighting mood, wall color, and
                  floor material from a fixed, safe set of options — no arbitrary values
                  are applied.
                </p>
              </CustomDisclosure>
              <CustomDisclosure summary="Can I move furniture?">
                <p className="text-muted-foreground">
                  Yes. Click any piece to select it, then drag the TransformControls
                  gizmo in the 3D scene. Orbit the camera by dragging empty space.
                </p>
              </CustomDisclosure>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Expected: Enter / Space toggle, ArrowDown opens focused, ArrowUp closes focused.
            </p>
          </SubSection>
        </Section>

        <footer className="pt-8 text-xs text-muted-foreground border-t">
          <p>
            Keyboard test checklist:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>Tab through the whole page — order should be logical.</li>
            <li>Open the custom dialog, press Tab repeatedly — focus must NOT leave the dialog.</li>
            <li>Press Escape inside the dialog — it closes and focus returns to the trigger button.</li>
            <li>Inside Tabs: ArrowRight / ArrowLeft, Home, End should navigate and activate.</li>
            <li>Disclosure summary receives focus; Enter/Space toggles it.</li>
          </ul>
        </footer>
      </div>
    </main>
  );
}
