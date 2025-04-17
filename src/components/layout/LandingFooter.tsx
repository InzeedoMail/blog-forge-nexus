
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin, Github, Send } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const year = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Roadmap', href: '#roadmap' },
        { name: 'Beta Program', href: '#beta' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '#about' },
        { name: 'Blog', href: '#blog' },
        { name: 'Careers', href: '#careers' },
        { name: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '#docs' },
        { name: 'Tutorials', href: '#tutorials' },
        { name: 'Support', href: '#support' },
        { name: 'API Reference', href: '#api' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '#privacy' },
        { name: 'Terms', href: '#terms' },
        { name: 'Cookie Policy', href: '#cookies' },
        { name: 'Licenses', href: '#licenses' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'GitHub', icon: Github, href: '#' },
  ];

  return (
    <footer className="bg-accent/5 border-t border-border">
      <div className="container mx-auto py-12 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                BF
              </div>
              <span className="font-semibold text-xl">Blog Forge</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              An all-in-one AI platform for creators, developers, and businesses to generate and enhance content.
            </p>
          </div>
          
          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title} className="md:col-span-1">
              <h3 className="text-sm font-semibold mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter and Social */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* Newsletter */}
          <div className="max-w-md mb-8 md:mb-0">
            <h3 className="text-sm font-semibold mb-3">Subscribe to our newsletter</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-card"
                />
              </div>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {year} Blog Forge. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
