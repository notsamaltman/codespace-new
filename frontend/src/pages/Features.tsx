import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Zap,
  Users,
  Shield,
  Palette,
  Terminal,
  Globe,
  Layers,
  GitBranch,
  Cloud,
  Lock,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainFeatures = [
  {
    icon: Zap,
    title: "Instant Code Execution",
    description:
      "Run your code instantly in isolated containers. Support for Python, JavaScript, C++, Java, and more. No configuration needed.",
    gradient: "from-warning to-warning/30",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "See your teammate's cursors, edits, and selections in real-time. Built-in voice chat and screen sharing coming soon.",
    image: "collaboration",
    gradient: "from-primary to-primary/30",
  },
  {
    icon: Terminal,
    title: "Full IDE in Your Browser",
    description:
      "Monaco editor with syntax highlighting, IntelliSense, and a professional developer experience.",
    gradient: "from-success to-success/30",
  },
];

const additionalFeatures = [
  { icon: Shield, title: "Enterprise Security", description: "Isolated execution and secure sessions." },
  { icon: Palette, title: "Custom Themes", description: "Dark mode by default, light mode optional." },
  { icon: Globe, title: "Access Anywhere", description: "Runs entirely in the browser." },
  { icon: GitBranch, title: "Git Ready", description: "Designed for modern workflows." },
  { icon: Cloud, title: "Cloud Sync", description: "Your work, always saved." },
  { icon: Lock, title: "Access Control", description: "Invite-only rooms and permissions." },
  { icon: Layers, title: "Multi-file Support", description: "Work beyond single files." },
  { icon: Cpu, title: "High Performance", description: "Optimized for speed and scale." },
];

const Features = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-section-id");
          if (entry.isIntersecting && id) {
            setVisibleSections((prev) => new Set([...prev, id]));
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionRefs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  const setSectionRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) sectionRefs.current.set(id, el);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden noise-overlay">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Powerful features for{" "}
            <span className="gradient-text">modern developers</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to write, run, and collaborate on code — in one place.
          </p>
        </div>
      </section>

      {/* MAIN FEATURES */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {mainFeatures.map((feature, index) => (
            <div
              key={feature.title}
              ref={setSectionRef(`main-${index}`)}
              data-section-id={`main-${index}`}
              className={cn(
                "grid lg:grid-cols-2 gap-12 items-center py-20 opacity-0 translate-y-12 transition-all duration-700",
                visibleSections.has(`main-${index}`) && "opacity-100 translate-y-0"
              )}
            >
              <div>
                <div className={cn("inline-flex p-4 rounded-2xl mb-6 bg-gradient-to-br", feature.gradient)}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold mb-4">{feature.title}</h2>
                <p className="text-lg text-muted-foreground">{feature.description}</p>

                {/* CTA intentionally disabled to enforce auth-first flow */}
              </div>

              <div className="glass-strong rounded-2xl p-8 bg-editor" />
            </div>
          ))}
        </div>
      </section>

      {/* ADDITIONAL FEATURES */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalFeatures.map((feature, index) => (
            <div
              key={feature.title}
              ref={setSectionRef(`add-${index}`)}
              data-section-id={`add-${index}`}
              className={cn(
                "p-6 rounded-xl glass opacity-0 translate-y-6 transition-all duration-500",
                visibleSections.has(`add-${index}`) && "opacity-100 translate-y-0"
              )}
            >
              <feature.icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to start building?</h2>
        <p className="text-muted-foreground mb-8">
          Create your free account and start coding in seconds.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/auth?mode=signup">
            <Button size="lg" className="glow-button">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth?mode=login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
