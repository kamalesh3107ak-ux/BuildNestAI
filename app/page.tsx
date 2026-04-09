"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Home,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { label: "Active Users", value: "10K+" },
    { label: "Materials Listed", value: "50K+" },
    { label: "Projects Completed", value: "5K+" },
    { label: "Monthly Transactions", value: "$2M+" },
  ];

  const categories = [
    {
      icon: Briefcase,
      title: "Materials",
      description:
        "Browse and buy construction materials from verified vendors",
    },
    {
      icon: Home,
      title: "Rentals",
      description: "Find rental houses with instant broker contact",
    },
    {
      icon: Wrench,
      title: "Engineers",
      description: "Hire experienced engineers for your projects",
    },
  ];

  const benefits = [
    {
      title: "One Platform",
      description: "Everything you need for construction in one place",
    },
    {
      title: "AI Assistant",
      description: "Smart recommendations powered by AI",
    },
    {
      title: "Secure Payments",
      description: "Safe transactions with multiple payment options",
    },
    {
      title: "24/7 Support",
      description: "Round the clock customer support",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="text-lg font-bold gradient-text">BuildNest</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary-dark">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Background Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-primary/10 rounded-full blur-3xl"
          style={{ transform: `translate(-50%, ${scrollY * 0.4}px)` }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* TEXT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            {/* Heading */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Everything You Need to <br />
              <span className="gradient-text">Build Smarter</span>
            </h1>

            {/* Subtext */}
            <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              Buy materials, find rental properties, and hire engineers — all in
              one powerful platform. Save time, reduce costs, and make smarter
              decisions with AI.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-dark text-base h-12 px-8 flex items-center gap-2 cursor-pointer"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="text-base h-12 px-8 border-border hover:bg-secondary cursor-pointer"
                onClick={() => {
                  document
                    .getElementById("benefits")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See How It Works
              </Button>
            </div>
          </motion.div>

          {/* HERO VISUAL (Upgraded to feel like real product) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative glass rounded-2xl p-6 border border-primary/20 overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />

            <div className="grid md:grid-cols-3 gap-4 relative z-10">
              {/* Materials Card */}
              <div className="bg-background/60 backdrop-blur-md p-4 rounded-xl border border-border">
                <p className="text-sm font-semibold mb-1">Materials</p>
                <p className="text-xs text-muted-foreground">
                  Cement • Steel • Bricks
                </p>
                <div className="mt-3 h-2 bg-primary/30 rounded-full w-3/4" />
              </div>

              {/* Rentals Card */}
              <div className="bg-background/60 backdrop-blur-md p-4 rounded-xl border border-border">
                <p className="text-sm font-semibold mb-1">Rentals</p>
                <p className="text-xs text-muted-foreground">
                  Houses with direct broker contact
                </p>
                <div className="mt-3 h-2 bg-accent/30 rounded-full w-2/3" />
              </div>

              {/* Engineers Card */}
              <div className="bg-background/60 backdrop-blur-md p-4 rounded-xl border border-border">
                <p className="text-sm font-semibold mb-1">Engineers</p>
                <p className="text-xs text-muted-foreground">
                  Hire verified professionals
                </p>
                <div className="mt-3 flex gap-2">
                  <div className="w-8 h-8 bg-primary/30 rounded-full" />
                  <div className="w-8 h-8 bg-accent/30 rounded-full" />
                </div>
              </div>

              {/* AI Assistant Wide Card */}
              <div className="md:col-span-3 bg-background/60 backdrop-blur-md p-4 rounded-xl border border-border">
                <p className="text-sm font-semibold mb-1">AI Assistant</p>
                <p className="text-xs text-muted-foreground">
                  Get cost estimates, recommendations, and project insights
                  instantly
                </p>
                <div className="mt-3 h-2 bg-gradient-to-r from-primary to-accent rounded-full w-4/5" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">
              Find materials, properties, and professionals in one place
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            className="grid md:grid-cols-3 gap-8"
          >
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className="glass p-8 rounded-xl"
                >
                  <Icon className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                  <p className="text-muted-foreground">{cat.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="scroll-mt-24 py-20 px-4 relative">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* LEFT SIDE (unchanged) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6">Why Choose BuildNest?</h2>

              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT SIDE (NEW - Platform Preview) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="glass p-6 rounded-2xl border border-border space-y-4"
            >
              {/* Title */}
              <h3 className="text-xl font-semibold mb-2">
                How BuildNest Helps You
              </h3>

              {/* Use Case Cards */}
              {[
                {
                  title: "Find Materials Instantly",
                  desc: "Search cement, steel, bricks from verified vendors near you.",
                },
                {
                  title: "Connect with Professionals",
                  desc: "Hire engineers and contractors for your projects easily.",
                },
                {
                  title: "Discover Rental Properties",
                  desc: "Browse houses with direct broker contact — no middlemen.",
                },
                {
                  title: "AI-Powered Decisions",
                  desc: "Get smart recommendations and cost estimates in seconds.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-background/60 border border-border hover:border-accent/40 transition"
                >
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-accent/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-3xl rounded-full" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass p-12 rounded-3xl border border-accent/20 backdrop-blur-xl"
          >
            {/* Top Icon */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-linear-to-br from-accent to-primary flex items-center justify-center shadow-lg"
            >
              <Zap className="w-10 h-10 text-white" />
            </motion.div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Smarter Building with{" "}
              <span className="gradient-text">AI Intelligence</span>
            </h2>

            <p className="text-muted-foreground text-lg text-center mb-12 max-w-3xl mx-auto">
              From material selection to cost estimation, our AI helps you make
              faster, smarter, and more efficient decisions — saving time,
              money, and effort.
            </p>

            {/* AI Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "Smart Recommendations",
                  desc: "Get AI-based suggestions for materials, vendors, and services.",
                },
                {
                  title: "Instant Cost Estimation",
                  desc: "Predict project costs in seconds with high accuracy.",
                },
                {
                  title: "AI Project Assistant",
                  desc: "Chat with AI to plan, optimize, and manage your projects.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="p-6 rounded-xl bg-background/60 backdrop-blur-md border border-border hover:border-accent/40 transition-all"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mt-4">
                No technical knowledge required • Powered by advanced AI
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of users building amazing projects on BuildNest
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-dark text-lg h-12 px-8"
              >
                Create Your Account <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="font-semibold text-foreground">BuildNest</span>
          </div>

          {/* Copyright */}
          <p className="text-center md:text-right">
            © {new Date().getFullYear()} BuildNest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
