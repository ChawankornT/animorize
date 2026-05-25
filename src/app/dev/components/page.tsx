'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-medium text-primary">{title}</h2>
      <div className="border-[0.5px] border-default rounded-card p-6 bg-page space-y-6">
        {children}
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-tertiary">{label}</p>
      <div className="flex flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  );
}

export default function ComponentsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface p-8 space-y-10 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-4xl font-medium text-primary">Component preview</h1>
        <p className="text-md text-secondary">All base UI components from the design system.</p>
      </div>

      {/* Button */}
      <Section title="Button">
        <Row label="Primary">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </Row>
        <Row label="Secondary">
          <Button variant="secondary" size="sm">Small</Button>
          <Button variant="secondary" size="md">Medium</Button>
          <Button variant="secondary" size="lg">Large</Button>
          <Button variant="secondary" disabled>Disabled</Button>
        </Row>
        <Row label="Ghost">
          <Button variant="ghost" size="sm">Small</Button>
          <Button variant="ghost" size="md">Medium</Button>
          <Button variant="ghost" size="lg">Large</Button>
          <Button variant="ghost" disabled>Disabled</Button>
        </Row>
        <Row label="Destructive">
          <Button variant="destructive" size="sm">Remove</Button>
          <Button variant="destructive" size="md">Delete</Button>
          <Button variant="destructive" size="lg">Remove all</Button>
          <Button variant="destructive" disabled>Disabled</Button>
        </Row>
      </Section>

      {/* Input */}
      <Section title="Input">
        <div className="grid grid-cols-2 gap-4 max-w-xl">
          <Input label="Name" placeholder="Enter your name" />
          <Input label="Email" placeholder="you@example.com" hint="We won't share your email." />
          <Input label="Username" placeholder="username" error="Username is already taken" />
          <Input label="Disabled" placeholder="Can't edit" disabled />
        </div>
      </Section>

      {/* Textarea */}
      <Section title="Textarea">
        <div className="max-w-xl space-y-4">
          <Textarea label="Synopsis" placeholder="Write a description..." />
          <Textarea label="Notes" placeholder="Add notes..." error="Required field" />
          <Textarea label="Read only" placeholder="..." disabled />
        </div>
      </Section>

      {/* Select */}
      <Section title="Select">
        <div className="grid grid-cols-2 gap-4 max-w-xl">
          <Select label="Media type">
            <option value="">Choose...</option>
            <option value="anime">Anime</option>
            <option value="series">Series</option>
            <option value="movie">Movie</option>
          </Select>
          <Select label="Status" hint="Current watch status">
            <option value="watching">Watching</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </Select>
          <Select label="Season" error="Please select a season">
            <option value="">Choose...</option>
          </Select>
          <Select label="Disabled" disabled>
            <option>N/A</option>
          </Select>
        </div>
      </Section>

      {/* Card */}
      <Section title="Card">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <Card.Title>Default card</Card.Title>
            <Card.Body>This is the default card variant with page background.</Card.Body>
            <Card.Actions>
              <Button size="sm">Action</Button>
              <Button variant="ghost" size="sm">Cancel</Button>
            </Card.Actions>
          </Card>
          <Card variant="surface">
            <Card.Title>Surface card</Card.Title>
            <Card.Body>This card uses the surface background for contrast.</Card.Body>
            <Card.Actions>
              <Button size="sm">Save</Button>
            </Card.Actions>
          </Card>
          <Card interactive>
            <Card.Title>Interactive card</Card.Title>
            <Card.Body>Hover to see the border change.</Card.Body>
          </Card>
          <Card variant="surface" interactive>
            <Card.Title>Surface + interactive</Card.Title>
            <Card.Body>Combined variant with hover state.</Card.Body>
          </Card>
        </div>
      </Section>

      {/* Badge */}
      <Section title="Badge">
        <Row label="Variants">
          <Badge>Default</Badge>
          <Badge variant="success">Watching</Badge>
          <Badge variant="warning">On hold</Badge>
          <Badge variant="error">Dropped</Badge>
          <Badge variant="info">Planned</Badge>
          <Badge variant="count">12</Badge>
        </Row>
        <Row label="With dot">
          <Badge dot>Default</Badge>
          <Badge variant="success" dot>Airing</Badge>
          <Badge variant="warning" dot>Pending</Badge>
          <Badge variant="error" dot>Failed</Badge>
          <Badge variant="info" dot>Syncing</Badge>
        </Row>
      </Section>

      {/* Modal */}
      <Section title="Modal">
        <Row label="Trigger">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        </Row>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Remove from library"
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => setModalOpen(false)}>Remove</Button>
            </>
          }
        >
          <p>Are you sure you want to remove this title from your library? Your watch progress will be lost.</p>
        </Modal>
      </Section>

      {/* Toast */}
      <Section title="Toast">
        <div className="space-y-3">
          <Toast variant="success" title="Episode recorded" description="Kimetsu no Yaiba S4 — episode 7 of 11" onClose={() => {}} />
          <Toast variant="warning" title="Sync delayed" description="AniList rate limit reached, retrying in 60s" onClose={() => {}} />
          <Toast variant="error" title="Import failed" description="Could not fetch data from AniList" onClose={() => {}} />
          <Toast variant="info" title="Sync complete" description="3 titles updated" onClose={() => {}} />
        </div>
      </Section>

      {/* Skeleton */}
      <Section title="Skeleton">
        <Row label="Variants">
          <div className="w-full space-y-3">
            <Skeleton variant="title" />
            <Skeleton variant="text" />
            <Skeleton variant="text" className="w-4/5" />
            <Skeleton variant="text" className="w-3/5" />
          </div>
        </Row>
        <Row label="Circle & card">
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" />
            <div className="space-y-2 flex-1">
              <Skeleton variant="title" className="w-32" />
              <Skeleton variant="text" className="w-48" />
            </div>
          </div>
        </Row>
        <Row label="Card skeleton">
          <Skeleton variant="card" />
        </Row>
      </Section>
    </div>
  );
}
