
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, MoveRight, LucideIcon, Code, Image, Newspaper, FileText, Globe, Zap } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';

// Feature definition
type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

const features: Feature[] = [
  {
    title: "AI Content Creator",
    description: "Generate engaging blogs, articles, and marketing copy tailored to your brand's voice.",
    icon: FileText,
    color: "from-indigo-500 to-purple-500"
  },
  {
    title: "Image Generator",
    description: "Create stunning visuals, illustrations, and graphics with just a text prompt.",
    icon: Image,
    color: "from-pink-500 to-orange-400"
  },
  {
    title: "OCR Extraction",
    description: "Extract text from images and documents with high accuracy and speed.",
    icon: FileText,
    color: "from-green-400 to-cyan-500"
  },
  {
    title: "Code Analyzer",
    description: "Analyze, explain, and optimize code with our advanced AI assistant.",
    icon: Code,
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "Real-Time News",
    description: "Stay updated with categorized news that matters to you, with translation support.",
    icon: Newspaper,
    color: "from-amber-500 to-red-500"
  },
  {
    title: "Advanced Paraphraser",
    description: "Transform and enhance your content while maintaining the original meaning.",
    icon: Zap,
    color: "from-purple-500 to-blue-500"
  },
  {
    title: "Translation Tools",
    description: "Break language barriers with our powerful translation capabilities.",
    icon: Globe,
    color: "from-teal-400 to-emerald-500"
  }
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* About Us Section */}
      <AboutSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

const HeroSection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center px-4 py-20 overflow-hidden pt-32">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[40%] w-[80%] h-[80%] rounded-full bg-gradient-to-r from-purple-700/20 to-blue-700/20 blur-[100px]" />
        <div className="absolute -bottom-[40%] -right-[40%] w-[80%] h-[80%] rounded-full bg-gradient-to-r from-pink-700/20 to-orange-700/20 blur-[100px]" />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={stagger}
          className="flex flex-col items-center text-center space-y-8"
        >
          <motion.div variants={fadeInUp} className="space-y-2">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
              Introducing Blog Forge
            </span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp} 
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            <span className="block">Create Anything with</span>
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Magic
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp} 
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl"
          >
            Transform your content creation with our all-in-one AI platform. 
            Write, generate images, analyze code, and more - all powered by cutting-edge AI.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8">
                Try Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="group">
              Explore Features 
              <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp}
            className="mt-12 w-full max-w-5xl bg-black/10 backdrop-blur-sm rounded-xl border border-white/10 aspect-video flex items-center justify-center"
          >
            <div className="text-lg font-medium text-muted-foreground">
              Product Demo Video Coming Soon
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-8 w-16 h-16 border border-primary/20 rounded-full" />
        <div className="absolute bottom-1/4 right-8 w-24 h-24 border border-primary/20 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-primary/10 rounded-full" />
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <section id="features" className="py-20 px-4 bg-accent/5 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore the Power Suite</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive toolkit empowers you to create, transform, and innovate with AI.
          </p>
        </div>
        
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.5,
            delay: index * 0.1
          }
        }
      }}
      className="group relative bg-card backdrop-blur-sm border border-border rounded-xl p-6 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Gradient accent */}
      <div className={`absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`}></div>
      
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${feature.color} mb-6 text-white`}>
          <feature.icon className="w-6 h-6" />
        </div>
        
        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
        <p className="text-muted-foreground mb-6">{feature.description}</p>
        
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-primary">
          Learn more <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};

const PricingSection = () => {
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('monthly');
  
  const pricingPlans = [
    {
      name: 'Free',
      description: 'Basic features for personal projects',
      price: { monthly: '$0', yearly: '$0' },
      features: [
        'Content generation (500 words/mo)',
        'Basic image generation (5/mo)',
        'News access with basic filters',
        'Community support'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      description: 'Everything you need for serious content creators',
      price: { monthly: '$19', yearly: '$190' },
      features: [
        'Content generation (10,000 words/mo)',
        'Advanced image generation (50/mo)',
        'OCR text extraction',
        'Full news access with all filters',
        'Code analysis and explanation',
        'Email support',
        'API access'
      ],
      cta: 'Start Pro Plan',
      popular: true
    },
    {
      name: 'Business',
      description: 'Advanced features for teams and businesses',
      price: { monthly: '$49', yearly: '$490' },
      features: [
        'Content generation (Unlimited)',
        'Advanced image generation (200/mo)',
        'OCR text extraction (Unlimited)',
        'Full news access with all filters',
        'Code analysis and explanation',
        'Priority support',
        'API access with higher rate limits',
        'Team collaboration',
        'Custom integrations'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];
  
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Plans, Big Possibilities</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs. No hidden fees.
          </p>
          
          <div className="mt-6 inline-flex items-center p-1 bg-muted/20 rounded-lg">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingInterval === 'monthly' 
                  ? 'bg-card shadow-sm' 
                  : 'hover:bg-muted/30'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingInterval === 'yearly' 
                  ? 'bg-card shadow-sm' 
                  : 'hover:bg-muted/30'
              }`}
            >
              Yearly <span className="text-xs text-primary">Save 20%</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`relative overflow-hidden rounded-xl border ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105 md:scale-110 z-10' 
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 left-0 bg-primary text-primary-foreground text-xs font-medium py-1 text-center">
                  Most Popular
                </div>
              )}
              
              <div className={`p-6 ${plan.popular ? 'pt-8' : ''}`}>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
                
                <div className="mt-5 mb-5">
                  <span className="text-4xl font-bold">
                    {plan.price[billingInterval]}
                  </span>
                  <span className="text-muted-foreground">
                    {billingInterval === 'monthly' ? '/month' : '/year'}
                  </span>
                </div>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white' 
                      : ''
                  }`} 
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  const milestones = [
    {
      year: '2023',
      title: 'The Beginning',
      description: 'Blog Forge was founded with the mission to democratize AI tools for content creators.'
    },
    {
      year: '2023',
      title: 'First 1,000 Users',
      description: 'Reached our first milestone of 1,000 active users within three months of launch.'
    },
    {
      year: '2024',
      title: 'Expanding Features',
      description: 'Launched image generation, OCR tools, and code analysis features.'
    },
    {
      year: '2024',
      title: 'Global Reach',
      description: 'Now serving users across 50+ countries with multilingual support.'
    },
  ];
  
  return (
    <section id="about" className="py-20 px-4 bg-accent/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Creators by Creators</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our journey to empowering content creators around the world
          </p>
        </div>
        
        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto mt-20">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border"></div>
          
          {/* Milestones */}
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col md:flex-row gap-8 md:gap-0 mb-12 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Milestone dot */}
              <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-card border-4 border-primary flex items-center justify-center transform -translate-y-1/2 md:-translate-x-1/2 z-10">
                <span className="text-xs font-bold">{milestone.year}</span>
              </div>
              
              <div className={`pl-16 md:pl-0 ${index % 2 === 0 ? 'md:pr-16 md:text-right md:w-1/2' : 'md:pl-16 md:w-1/2'}`}>
                <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                <p className="text-muted-foreground">{milestone.description}</p>
              </div>
              
              {index % 2 === 0 ? <div className="md:w-1/2"></div> : <div className="md:w-1/2"></div>}
            </motion.div>
          ))}
        </div>
        
        {/* Team stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '15+', label: 'Team Members' },
            { value: '10K+', label: 'Active Users' },
            { value: '3M+', label: 'Content Generated' },
            { value: '50+', label: 'Countries Reached' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's Build Together</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? Reach out to our team and we'll get back to you shortly.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Send us a message</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full bg-card border border-border rounded-md px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full bg-card border border-border rounded-md px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  className="w-full bg-card border border-border rounded-md px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="How can we help?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                <textarea 
                  id="message" 
                  rows={5}
                  className="w-full bg-card border border-border rounded-md px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Your message..."
                />
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Send Message
              </Button>
            </div>
          </motion.div>
          
          {/* Contact Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Contact information</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                <p className="text-lg">contact@blogforge.ai</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Office</h4>
                <p className="text-lg">123 Innovation Way, San Francisco, CA 94107</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                <p className="text-lg">+1 (555) 123-4567</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Working Hours</h4>
                <p className="text-lg">Monday to Friday, 9AM - 6PM PST</p>
              </div>
            </div>
            
            <div className="h-60 bg-muted rounded-lg flex items-center justify-center border border-border">
              <p className="text-muted-foreground">Map will be displayed here</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Index;
