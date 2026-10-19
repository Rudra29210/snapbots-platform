import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircuitBoard,
  Cpu,
  Gauge,
  GitBranch,
  MoveUpRight,
  ScanLine,
  Sprout,
  Wrench,
} from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { company, services, projects, innovation } from '@/content/site';
import { Seo } from '@/components/layout/Seo';
import { CtaBand, Reveal, Section, StatusBadge } from '@/components/sections';
import { Card } from '@/components/ui';

const process = [
  {
    number: '01',
    title: 'Find the real problem.',
    kicker: 'DISCOVERY',
    body: 'Before choosing a sensor, model or motor, we define what needs to change, who it is for and what success should look like.',
    points: [
      'Requirements that can be tested',
      'Constraints made visible',
      'A clear definition of done',
    ],
    icon: GitBranch,
    visual: 'brief',
  },
  {
    number: '02',
    title: 'Make it tangible.',
    kicker: 'PROTOTYPE',
    body: 'We turn the brief into a physical or digital proof of concept. The goal is to learn quickly, not to hide uncertainty behind a polished render.',
    points: [
      'Real components and code',
      'Fast iteration loops',
      'Trade-offs documented',
    ],
    icon: Wrench,
    visual: 'bench',
  },
  {
    number: '03',
    title: 'Test what matters.',
    kicker: 'VALIDATION',
    body: 'A prototype is a question, not a conclusion. We measure the behaviour that matters, find the weak points and improve the design.',
    points: [
      'Repeatable checks',
      'Failures treated as data',
      'Performance before claims',
    ],
    icon: Gauge,
    visual: 'test',
  },
  {
    number: '04',
    title: 'Hand over something useful.',
    kicker: 'DELIVERY',
    body: 'The outcome should be understandable and maintainable: documented, demonstrated and ready for its next stage.',
    points: [
      'Build notes and source',
      'Practical handover',
      'A realistic next-step plan',
    ],
    icon: CircuitBoard,
    visual: 'deliver',
  },
] as const;

function BuildVisual({ active }: { active: number }) {
  return (
    <div
      className={`build-visual build-visual-${active}`}
      aria-label={`Engineering process stage ${active + 1}`}
      role="img"
    >
      <div className="build-visual-top">
        <span>SNAPBOTS / FIELD NOTES</span>
        <span>FIG. 0{active + 1}</span>
      </div>

      {active === 0 && (
        <div className="brief-board">
          <div className="brief-line wide" />
          <div className="brief-line" />
          <div className="brief-box">
            <span>PROBLEM</span>
            <b>Define</b>
          </div>
          <div className="brief-connector">↓</div>
          <div className="brief-box brief-box-lime">
            <span>OUTCOME</span>
            <b>Measure</b>
          </div>
          <div className="brief-line short" />
        </div>
      )}

      {active === 1 && (
        <div className="bench-board">
          <div className="bench-grid" />
          <div className="bench-chip">
            <Cpu size={48} strokeWidth={1.2} />
            <span>MCU</span>
          </div>
          <div className="bench-wire wire-a" />
          <div className="bench-wire wire-b" />
          <div className="bench-part part-a" />
          <div className="bench-part part-b" />
          <div className="bench-label label-a">INPUT</div>
          <div className="bench-label label-b">OUTPUT</div>
          <div className="bench-screw screw-a" />
          <div className="bench-screw screw-b" />
          <div className="bench-screw screw-c" />
          <div className="bench-screw screw-d" />
        </div>
      )}

      {active === 2 && (
        <div className="test-board">
          <div className="test-gauge">
            <div className="gauge-arc" />
            <div className="gauge-needle" />
            <span>LIVE TEST</span>
            <b>CHECK</b>
          </div>
          <div className="test-readings">
            <div>
              <span>POWER</span>
              <i>
                <b style={{ width: '72%' }} />
              </i>
            </div>
            <div>
              <span>SIGNAL</span>
              <i>
                <b style={{ width: '88%' }} />
              </i>
            </div>
            <div>
              <span>STABILITY</span>
              <i>
                <b style={{ width: '64%' }} />
              </i>
            </div>
            <small>Illustrative test interface</small>
          </div>
        </div>
      )}

      {active === 3 && (
        <div className="deliver-board">
          <div className="deliver-doc">
            <div className="doc-mark">SB.</div>
            <div className="doc-line" />
            <div className="doc-line short" />
            <div className="doc-line" />
            <div className="doc-line medium" />
            <div className="doc-check">
              <Check size={16} />
              <span>BUILD NOTES</span>
            </div>
          </div>
          <div className="deliver-stamp">
            READY
            <br />
            FOR NEXT
          </div>
          <div className="deliver-arrow">
            <ArrowUpRight size={32} />
          </div>
        </div>
      )}

      <div className="build-visual-bottom">
        <span>ENGINEERING IS A PROCESS</span>
        <span>{String(active + 1).padStart(2, '0')} — 04</span>
      </div>
    </div>
  );
}

function ProcessIcon({ active }: { active: number }) {
  const step = process[active] ?? process[0];
  const Icon = step.icon;

  return <Icon size={21} strokeWidth={1.7} />;
}

function ScrollProcess() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const activeProcess = process[active] ?? process[0];

  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const progressScale = useTransform(scrollYProgress, [0, 1], [0.08, 1]);
  const visualY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [24, -24],
  );

  useEffect(() => {
    const nodes = process
      .map((_, index) => document.getElementById(`process-step-${index}`))
      .filter((node): node is HTMLElement => node !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          const index = Number(
            visible.target.id.replace('process-step-', ''),
          );

          if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < process.length
          ) {
            setActive(index);
          }
        }
      },
      {
        rootMargin: '-25% 0px -25% 0px',
        threshold: [0.05, 0.25, 0.5],
      },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="scroll-process" id="process">
      <div className="scroll-process-intro container-x">
        <p className="eyebrow">How we work / the process</p>
        <h2>
          Good work doesn’t
          <br />
          <span>happen in one prompt.</span>
        </h2>
        <p>
          Scroll through the way we take an idea from a rough brief to a
          working, tested build.
        </p>
        <div className="process-scroll-hint">
          <ArrowDownRight size={16} />
          KEEP SCROLLING TO MOVE THROUGH THE PROCESS
        </div>
      </div>

      <div className="process-stages">
        <div className="process-sticky">
          <div className="process-copy">
            <div className="process-progress">
              <motion.div
                style={{ scaleY: progressScale, transformOrigin: 'top' }}
              />
            </div>

            <div
              className="process-tabs"
              aria-label="Engineering process steps"
            >
              {process.map((step, index) => (
                <button
                  key={step.number}
                  type="button"
                  className={
                    active === index ? 'process-tab active' : 'process-tab'
                  }
                  aria-current={active === index ? 'step' : undefined}
                  onClick={() => {
                    setActive(index);
                    document
                      .getElementById(`process-step-${index}`)
                      ?.scrollIntoView({
                        behavior: reduce ? 'auto' : 'smooth',
                        block: 'center',
                      });
                  }}
                >
                  <span>{step.number}</span>
                  <span>{step.kicker}</span>
                </button>
              ))}
            </div>

            <motion.div
              key={active}
              className="process-detail"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="process-detail-icon">
                <ProcessIcon active={active} />
              </div>
              <p className="eyebrow">{activeProcess.kicker}</p>
              <h3>{activeProcess.title}</h3>
              <p className="process-body">{activeProcess.body}</p>
              <ul>
                {activeProcess.points.map((point) => (
                  <li key={point}>
                    <Check size={15} />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="process-visual-wrap"
            style={{ y: visualY }}
          >
            <motion.div
              key={`visual-${active}`}
              initial={reduce ? false : { opacity: 0, scale: 0.97, x: 12 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <BuildVisual active={active} />
            </motion.div>
            <div className="visual-caption">
              <span>FIG. 0{active + 1}</span>
              <span>{activeProcess.kicker} / SNAPBOTS STUDIO</span>
            </div>
          </motion.div>
        </div>

        <div className="process-triggers">
          {process.map((step, index) => (
            <div
              key={step.number}
              id={`process-step-${index}`}
              className="process-trigger"
              tabIndex={0}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <span>{step.number}</span>
              <p>{step.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const reduce = useReducedMotion();

  return (
    <>
      <Seo
        path="/"
        description="SNAPBOTS builds robotics, embedded systems, IoT and AI engineering services, products and research prototypes."
      />

      <section className="editorial-hero">
        <div className="hero-grain" aria-hidden="true" />
        <div className="container-x editorial-hero-inner">
          <div className="hero-meta">
            <span>
              <i /> INDEPENDENT ENGINEERING STUDIO
            </span>
            <span>SITAMARHI · INDIA</span>
          </div>

          <div className="hero-main">
            <div className="hero-words">
              <motion.p
                initial={reduce ? false : { opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hero-overline"
              >
                We make ideas work.
              </motion.p>
              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              >
                Less talk.
                <br />
                <span>More</span> <em>making.</em>
              </motion.h1>
              <motion.p
                className="hero-description"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.7 }}
              >
                {company.name} is a founder-led engineering studio building
                useful things with robotics, embedded systems, IoT and
                practical AI.
              </motion.p>
              <div className="hero-actions">
                <Link to="/contact" className="hero-primary">
                  Have a project? <ArrowUpRight size={18} />
                </Link>
                <Link to="/projects" className="hero-secondary">
                  See what we build <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <motion.div
              className="hero-workbench"
              initial={
                reduce ? false : { opacity: 0, y: 25, rotate: 1.5 }
              }
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <div className="workbench-header">
                <span>WORKBENCH / 001</span>
                <span className="workbench-status">
                  IN PROGRESS <i />
                </span>
              </div>
              <div className="workbench-object">
                <div className="workbench-board">
                  <div className="board-trace trace-1" />
                  <div className="board-trace trace-2" />
                  <div className="board-trace trace-3" />
                  <div className="board-chip">
                    <Cpu size={42} strokeWidth={1.1} />
                    <span>SB—01</span>
                  </div>
                  <div className="board-port port-1" />
                  <div className="board-port port-2" />
                  <div className="board-port port-3" />
                  <div className="board-pin pin-1" />
                  <div className="board-pin pin-2" />
                  <div className="board-pin pin-3" />
                  <div className="board-pin pin-4" />
                </div>
                <div className="workbench-sticker">
                  BUILT
                  <br />
                  NOT
                  <br />
                  GENERATED<span>✳</span>
                </div>
                <div className="workbench-tape" />
              </div>
              <div className="workbench-footer">
                <span>IDEA → PROTOTYPE → REALITY</span>
                <span>EST. THROUGH ITERATION</span>
              </div>
            </motion.div>
          </div>

          <div className="hero-bottomline">
            <span>ROBOTICS / EMBEDDED / IOT / AI</span>
            <a href="#process">
              THE WAY WE WORK <ArrowDownRight size={15} />
            </a>
            <span>SCROLL TO EXPLORE ↓</span>
          </div>
        </div>
      </section>

      <div className="ticker" aria-label="Our disciplines">
        <div className="ticker-track">
          {Array.from({ length: 2 }, (_, i) => (
            <span key={i}>
              ROBOTICS <b>✳</b> EMBEDDED SYSTEMS <b>✳</b> IOT & CONNECTED
              DEVICES <b>✳</b> PROTOTYPING <b>✳</b> PRACTICAL AI <b>✳</b>{' '}
            </span>
          ))}
        </div>
      </div>

      <section className="agiai-launch" id="agiai" aria-labelledby="agiai-title">
        <div className="agiai-topline">
          <span>
            <i /> SNAPBOTS PRODUCT / 001
          </span>
          <span>AGRICULTURE · COMPUTER VISION</span>
        </div>

        <div className="agiai-grid">
          <motion.div
            className="agiai-copy"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65 }}
          >
            <p className="agiai-kicker">
              <Sprout size={15} /> SOMETHING GROWING AT SNAPBOTS
            </p>
            <p className="agiai-pretitle">NEW LAUNCH / COMING SOON</p>
            <h2 id="agiai-title">
              Meet <em>AgiAI.</em>
              <br />
              See your plant
              <br />
              <span>differently.</span>
            </h2>
            <p className="agiai-description">
              An AI-powered plant health platform, built by a student from
              Bihar. Upload a photo of an affected plant and get an AI-generated
              analysis to help you understand what may be happening.
            </p>
            <div className="agiai-facts">
              <div>
                <span>01</span>
                <p>Upload a plant image</p>
              </div>
              <div>
                <span>02</span>
                <p>AI-powered analysis</p>
              </div>
              <div>
                <span>03</span>
                <p>Understand possible next steps</p>
              </div>
            </div>
            <div className="agiai-actions">
              <Link to="/contact" className="agiai-cta">
                Get launch updates <ArrowUpRight size={18} />
              </Link>
              <span className="agiai-launch-date">
                LAUNCHING THIS DUSSEHRA <b>·</b> 2026
              </span>
            </div>
            <p className="agiai-note">
              AI analysis is a starting point, not a substitute for professional
              agricultural advice.
            </p>
          </motion.div>

          <motion.div
            className="agiai-product"
            initial={reduce ? false : { opacity: 0, x: 28, rotate: 1 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, delay: 0.08 }}
          >
            <div className="agiai-product-head">
              <span>
                <span className="agiai-live-dot" /> AGIAI / PLANT HEALTH
              </span>
              <span>PREVIEW 001</span>
            </div>
            <div className="agiai-specimen">
              <div className="agiai-specimen-label label-left">
                IMAGE INPUT
                <br />
                <b>PLANT / LEAF</b>
              </div>
              <div className="agiai-leaf-art" aria-hidden="true">
                <div className="agiai-leaf-shadow" />
                <div className="agiai-leaf-main">
                  <i className="leaf-vein vein-one" />
                  <i className="leaf-vein vein-two" />
                  <i className="leaf-vein vein-three" />
                  <i className="leaf-vein vein-four" />
                  <i className="leaf-stem" />
                  <b className="leaf-spot spot-one" />
                  <b className="leaf-spot spot-two" />
                  <b className="leaf-spot spot-three" />
                </div>
                <div className="agiai-scanline" />
              </div>
              <div className="agiai-specimen-label label-right">
                VISUAL
                <br />
                <b>SCAN AREA</b>
              </div>
              <div className="agiai-corner corner-a" />
              <div className="agiai-corner corner-b" />
              <div className="agiai-corner corner-c" />
              <div className="agiai-corner corner-d" />
              <span className="agiai-image-caption">
                ILLUSTRATIVE VISUAL · NOT A DIAGNOSTIC RESULT
              </span>
            </div>
            <div className="agiai-analysis">
              <div className="agiai-analysis-icon">
                <ScanLine size={19} />
              </div>
              <div className="agiai-analysis-text">
                <span>THE IDEA</span>
                <b>A photo becomes a place to start.</b>
                <p>
                  Image-led plant health insights, designed to make the first
                  step simpler.
                </p>
              </div>
              <span className="agiai-analysis-index">01—03</span>
            </div>
            <div className="agiai-product-foot">
              <span>BUILT IN BIHAR, FOR THE FIELD</span>
              <span>AGIAI × SNAPBOTS</span>
            </div>
          </motion.div>
        </div>

        <div className="agiai-bottomline">
          <span>LESS GUESSWORK. MORE UNDERSTANDING.</span>
          <a href="#services">
            EXPLORE THE SNAPBOTS STUDIO <ArrowRight size={14} />
          </a>
        </div>
      </section>

      <ScrollProcess />

      <Section
        id="services"
        eyebrow="What we can do / 01"
        title="A small studio for ambitious builds."
        lead="Bring a problem, an early idea or a prototype that isn’t behaving. We work from the constraints up. The right tool comes after the problem."
      >
        <div className="services-editorial">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.04}>
              <Link to={`/services#${s.id}`} className="service-row">
                <span className="service-number">0{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.summary}</p>
                </div>
                <span className="service-arrow">
                  <MoveUpRight size={21} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="selected-work">
        <div className="container-x">
          <div className="selected-work-heading">
            <div>
              <p className="eyebrow">A few things on the bench / 02</p>
              <h2>
                Work in progress.
                <br />
                <span>And work that teaches us.</span>
              </h2>
            </div>
            <Link to="/projects">
              All projects <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="work-grid">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.07}>
                <Link
                  to={`/projects/${p.id}`}
                  className={`work-card work-card-${i}`}
                >
                  <div className="work-card-art">
                    <span className="work-art-index">PROJECT / 0{i + 1}</span>
                    <div
                      className={`work-art-graphic graphic-${i}`}
                      aria-hidden="true"
                    >
                      {i === 0 ? (
                        <div className="linebot">
                          <div className="linebot-top" />
                          <div className="linebot-body" />
                          <div className="linebot-wheel left" />
                          <div className="linebot-wheel right" />
                          <div className="linebot-sensor" />
                        </div>
                      ) : i === 1 ? (
                        <div className="sensor-rings">
                          <div />
                          <div />
                          <div />
                          <span>
                            FIELD
                            <br />
                            NODE
                          </span>
                        </div>
                      ) : (
                        <div className="sorter-shape">
                          <div />
                          <i />
                          <b />
                        </div>
                      )}
                    </div>
                    <span className="work-card-index">0{i + 1} / 03</span>
                  </div>
                  <div className="work-card-content">
                    <div className="work-card-meta">
                      <StatusBadge status={p.status} />
                      <ArrowUpRight size={18} />
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.summary}</p>
                    <div className="work-tags">
                      {p.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="work-disclaimer">
            Project statuses are labelled transparently. Demonstration entries
            are not represented as verified deployments.
          </p>
        </div>
      </section>

      <Section
        id="ecosystem"
        eyebrow="Beyond one-off builds / 03"
        title="Build a little. Learn a lot. Keep going."
        lead="SNAPBOTS is growing into an ecosystem around engineering: useful services, experiments, learning and collaboration."
      >
        <div className="ecosystem-editorial">
          {innovation.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.06}>
              <Card className="ecosystem-card h-full">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[.2em] text-paper/35">
                      Initiative / 0{i + 1}
                    </span>
                    <h3 className="mt-2 text-xl font-bold">{item.name}</h3>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-4 text-sm leading-6 text-paper/65">
                  {item.purpose}
                </p>
                <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-paper/40">
                  {item.maturity}
                </p>
              </Card>
            </Reveal>
          ))}

          <Reveal>
            <div className="ecosystem-note">
              <p className="eyebrow">Open doors</p>
              <h3>Good projects rarely happen alone.</h3>
              <p>
                Interested in workshops, a partnership or contributing to a
                build? Start a conversation.
              </p>
              <div>
                <Link to="/learn">
                  Learning <ArrowUpRight size={15} />
                </Link>
                <Link to="/partnerships">
                  Partnerships <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <section className="founder-section">
        <div className="container-x founder-inner">
          <div>
            <p className="eyebrow">Founder-led engineering</p>
            <h2>
              Curiosity gets
              <br />
              you started.
              <br />
              <em>Building gets you there.</em>
            </h2>
          </div>
          <div className="founder-copy">
            <span className="founder-initials">
              SB<span>.</span>
            </span>
            <p>
              SNAPBOTS was founded by {company.founder} to close the gap between
              an interesting idea and something you can actually test, use and
              improve.
            </p>
            <Link to="/about">
              Meet the studio <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Got something you want to make real?"
        body="Tell us what you are trying to solve. We will start with the problem, talk through the constraints and figure out a practical next step."
        label="Tell us about it"
      />
    </>
  );
}