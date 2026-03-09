import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Globe,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Trend | Signal crypto moves earlier',
  description:
    'Landing page for Trend — the fastest way to discover, signal, and monetize emerging crypto narratives.',
}

const heroStats = [
  { label: 'Signals shared', value: '12k+', helper: 'Community insights posted this quarter' },
  { label: 'Capital tracked', value: '$58M', helper: 'Connected across wallets & CEX accounts' },
  { label: 'Average lead time', value: '47 min', helper: 'Before major price action begins' },
]

const features = [
  {
    title: 'Narrative-grade data',
    description: 'Pull structured intel from on-chain flow, social sentiment, and derivatives prints in one feed.',
    icon: BarChart3,
  },
  {
    title: 'Signal-to-earn loops',
    description: 'Stake your reputation, publish theses, and earn rewards when the community follows your call.',
    icon: Sparkles,
  },
  {
    title: 'Institution-ready controls',
    description: 'Granular workspaces, compliance exports, and programmable access so teams can move with confidence.',
    icon: ShieldCheck,
  },
]

const steps = [
  {
    title: 'Listen',
    description: 'Pipe live market structure, DEX prints, and governance chatter into curated watchboards.',
    icon: Globe,
  },
  {
    title: 'Signal',
    description: 'Translate conviction into public or private signals with on-chain attestation baked in.',
    icon: LineChart,
  },
  {
    title: 'Act',
    description: 'Mirror signals into automated orders, risk checks, or payouts without leaving Trend.',
    icon: Zap,
  },
]

const testimonials = [
  {
    quote:
      'Trend compressed our research loop from hours to minutes. The shared conviction feed is table stakes for every desk now.',
    name: 'Maya Chen',
    title: 'Head of Crypto, Aurora Capital',
  },
  {
    quote:
      'Signals on Trend consistently beat our internal alerts. It is the fastest lens into what the smartest wallets care about.',
    name: 'Noah Alvarez',
    title: 'Co-founder, Drift Labs',
  },
]

const trustedBy = ['Aurora Capital', 'Volt Labs', 'Helios Research', 'Drift Collective', 'Prism Flow']

const studioPillars = [
  {
    title: 'Pulse canvases',
    description: 'Assemble research-grade dashboards by layering DEX flows, governance chatter, mempool prints, and custom notes.',
  },
  {
    title: 'Intent-aware automations',
    description: 'Mirror any public or private signal into executable actions, risk checks, or payouts without leaving the workspace.',
  },
  {
    title: 'Immutable receipts',
    description: 'Every call is signed, timestamped, and shareable so teams can reference a permanent record of conviction.',
  },
]

const signalMetrics = [
  {
    title: 'Conviction score',
    value: '86',
    helper: 'Median across public signals (rolling 7d)',
  },
  {
    title: 'Signals verified',
    value: '1,482',
    helper: 'On-chain receipts shared last week',
  },
  {
    title: 'Capital mirrored',
    value: '$18.2M',
    helper: 'Automations triggered every 7 days',
  },
]

const dataMoments = [
  {
    title: 'On-chain flow radar',
    description: 'Detect block-by-block capital rotations through Solana, Base, and Ethereum without leaving the canvas.',
    stat: '+214 bps',
    tone: 'text-emerald-600',
  },
  {
    title: 'Narrative heatmap',
    description: 'Track social + dev velocity across 120 narratives with drift detection and triggerable alerts.',
    stat: '1.8× velocity',
    tone: 'text-indigo-600',
  },
  {
    title: 'Execution receipts',
    description: 'Autograph every call with wallet signatures and distribute to LPs or community in two clicks.',
    stat: '28 signed',
    tone: 'text-blue-600',
  },
]

export default function LandingPage() {
  return (
    <div className="relative space-y-16 bg-slate-50 text-slate-900 lg:space-y-24">
      <div className="pointer-events-none absolute -left-36 top-0 h-96 w-96 rounded-full bg-blue-200/50 blur-[140px]" aria-hidden />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[420px] w-[420px] rounded-full bg-fuchsia-200/35 blur-[170px]" aria-hidden />

      <section className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-white px-6 py-12 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:px-10 lg:px-16">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white" aria-hidden />
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100/60 blur-[140px]" aria-hidden />
        <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/4 rounded-full bg-fuchsia-100/60 blur-[160px]" aria-hidden />
        <div className="relative flex flex-col gap-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/trend-logo.svg" alt="Trend logo" width={56} height={56} priority />
              <div>
                <p className="text-lg font-semibold text-slate-900">Trend</p>
                <p className="text-sm text-slate-500">Signal sooner. Ship faster.</p>
              </div>
            </Link>
            <nav className="flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-500">
              <a href="#features" className="transition hover:text-slate-900">Platform</a>
              <a href="#workflow" className="transition hover:text-slate-900">Workflow</a>
              <a href="#proof" className="transition hover:text-slate-900">Proof</a>
              <a href="#cta" className="transition hover:text-slate-900">Get access</a>
            </nav>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="ghost" className="text-slate-600 hover:bg-slate-100" asChild>
                <Link href="/signin">Log in</Link>
              </Button>
              <Button className="bg-slate-900 text-white hover:bg-slate-800" asChild>
                <Link href="/">
                  Launch app
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold text-slate-700">
              Wave 02 access
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Spot crypto trends before they trend.
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              Trend fuses real-time market structure, community intelligence, and programmable execution so you can
              publish conviction, prove it on-chain, and capture upside faster.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-600">
              {[
                'Solana + Base native',
                '280+ research desks streaming signals',
                'On-chain receipts for every call',
              ].map((chip) => (
                <span key={chip} className="rounded-full border border-slate-200 px-3 py-1">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800" asChild>
              <Link href="/">
                Launch app
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-slate-200 text-slate-700 hover:bg-slate-100" asChild>
              <Link href="#workflow">
                See how it works
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500">
            No credit card required · Works with any Solana wallet · 2 min setup
          </p>

          <div className="grid gap-10 lg:grid-cols-[1fr,0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="text-3xl font-semibold text-slate-900">{stat.value}</div>
                    <p className="mt-1 text-sm font-medium text-slate-700">{stat.label}</p>
                    <p className="mt-2 text-xs text-slate-500">{stat.helper}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {signalMetrics.map((metric) => (
                  <div key={metric.title} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{metric.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
                    <p className="mt-1 text-slate-600">{metric.helper}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-5 right-6 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                Beta passes · 128 left
              </div>
              <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-900 p-8 text-white shadow-inner">
                <Image
                  src="/landing-illustration.svg"
                  alt="Trend signal orchestration illustration"
                  width={420}
                  height={420}
                  className="mx-auto h-auto w-full max-w-[380px]"
                  priority
                />
                <div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">Alpha lead</p>
                    <p className="text-2xl font-semibold text-white">+47 min</p>
                    <p className="text-white/70">Avg lead before CEX moves</p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">Signal quality</p>
                    <p className="text-2xl font-semibold text-emerald-200">92%</p>
                    <p className="text-white/70">Signals with positive EV</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <Users className="h-5 w-5 text-blue-600" />
                284 trendsetters online now
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            Trusted by teams shipping daily
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-primary-enhanced">
            {trustedBy.map((name) => (
              <span
                key={name}
                className="rounded-full border border-gray-200 bg-white/80 px-4 py-2 shadow-sm shadow-slate-100"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 grid gap-6 md:grid-cols-3">
        {dataMoments.map((moment) => (
          <div
            key={moment.title}
            className="flex h-full flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-lg shadow-slate-100"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Signal moment
            </div>
            <div>
              <p className="text-xl font-semibold text-primary-enhanced">{moment.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{moment.description}</p>
            </div>
            <p className={`text-lg font-semibold ${moment.tone}`}>{moment.stat}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 space-y-8">
        <div className="space-y-3 text-center">
          <Badge variant="secondary" className="mx-auto w-fit">
            Why teams pick Trend
          </Badge>
          <h2 className="text-3xl font-semibold text-primary-enhanced">Full-stack intelligence for crypto natives</h2>
          <p className="text-muted-enhanced mx-auto max-w-3xl">
            Replace five dashboards with one collaborative surface built for research leads, signalers, and execution
            teams.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full p-6 flex flex-col gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <feature.icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary-enhanced">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <div className="mt-auto">
                <Button variant="link" className="px-0">
                  Explore
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6 text-center lg:text-left">
          <Badge variant="secondary" className="mx-auto w-fit lg:mx-0">
            Signal Studio
          </Badge>
          <h2 className="text-3xl font-semibold text-primary-enhanced lg:text-left">
            Design the perfect signal workflow
          </h2>
          <p className="text-muted-enhanced lg:text-left">
            Drag, remix, and automate every part of your research stack — from raw data ingest to on-chain attestation —
            inside a single studio-grade surface.
          </p>
          <div className="space-y-4">
            {studioPillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg shadow-blue-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-base font-semibold text-primary-enhanced">{pillar.title}</p>
                  <p className="text-sm text-muted-foreground">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <p className="uppercase tracking-[0.4em]">Live canvas</p>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                  Real-time
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Narrative</p>
                  <p className="text-2xl font-semibold text-slate-900">AI x DePIN</p>
                  <p className="text-sm text-slate-500">14 desks aligned</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Capital flow</p>
                  <p className="text-2xl font-semibold text-emerald-600">$18.4M</p>
                  <p className="text-sm text-slate-500">Last 6 hours</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-900/10 bg-slate-900 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Automation</p>
                <p className="text-lg font-semibold">Mirror to vault + run slippage guard</p>
                <p className="text-sm text-white/80">Triggered automatically when conviction score &gt; 80</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Receipts</p>
                  <p className="text-lg font-semibold text-slate-900">28 signed</p>
                  <p className="text-sm text-slate-500">Shared with partners</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Lead time</p>
                  <p className="text-2xl font-semibold text-slate-900">+59 min</p>
                  <p className="text-sm text-slate-500">Before CEX acknowledgement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="relative z-10 space-y-8">
        <div className="space-y-3 text-center">
          <Badge variant="secondary" className="mx-auto w-fit">
            Workflow
          </Badge>
          <h2 className="text-3xl font-semibold text-primary-enhanced">From signal to settlement in three steps</h2>
          <p className="text-muted-enhanced mx-auto max-w-2xl">
            Trend keeps your alpha loop tight. Listen to what matters, publish conviction, and automate the follow
            through — all inside the same workspace.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="p-6 flex flex-col gap-4 border-dashed border-gray-200">
              <div className="inline-flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-50 text-primary-enhanced">
                  {index + 1}
                </span>
                {step.title}
              </div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="proof" className="relative z-10 space-y-8">
        <div className="space-y-3 text-center">
          <Badge variant="secondary" className="mx-auto w-fit">
            Proof
          </Badge>
          <h2 className="text-3xl font-semibold text-primary-enhanced">Trusted by desks shipping daily</h2>
          <p className="text-muted-enhanced mx-auto max-w-2xl">
            Traders, protocol teams, and researchers rely on Trend to crowdsource intelligence and back it with
            verifiable execution.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="p-6 flex flex-col gap-4">
              <p className="text-lg text-primary-enhanced">&ldquo;{testimonial.quote}&rdquo;</p>
              <div>
                <p className="font-semibold text-primary-enhanced">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.title}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="relative z-10 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto space-y-6 max-w-3xl">
          <Badge variant="secondary" className="mx-auto w-fit bg-white">
            Ready?
          </Badge>
          <h2 className="text-3xl font-semibold text-primary-enhanced">Spin up your Trend workspace today</h2>
          <p className="text-muted-enhanced">
            Bring your team, pipe in wallets, and start sharing signals in under two minutes. We&apos;ll migrate your
            saved dashboards for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800" asChild>
              <Link href="/trends">
                See live board
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-slate-200 text-slate-700 hover:bg-slate-100" asChild>
              <a href="mailto:team@trend.so?subject=Trend%20demo">
                Book a live demo
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

