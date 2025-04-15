
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, History, Send, Settings, FileUp, Code, ImageDown } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const features = [
    {
      title: "Create Content",
      description: "Generate blog posts with AI assistance",
      icon: FileText,
      to: "/editor",
      color: "bg-blue-500",
    },
    {
      title: "Paraphrase Articles",
      description: "Rewrite content in different styles",
      icon: FileText,
      to: "/article-paraphraser",
      color: "bg-indigo-500",
    },
    {
      title: "Generate Images",
      description: "Create images for your blog posts",
      icon: Image,
      to: "/image-generator",
      color: "bg-purple-500",
    },
    {
      title: "Extract Text from Images",
      description: "Convert image text to editable content",
      icon: ImageDown,
      to: "/image-text-extractor",
      color: "bg-pink-500",
    },
    {
      title: "Analyze Files",
      description: "Extract insights from your documents",
      icon: FileUp,
      to: "/file-analyzer",
      color: "bg-orange-500",
    },
    {
      title: "Review Code",
      description: "Get AI feedback on your code",
      icon: Code,
      to: "/code-reviewer",
      color: "bg-yellow-500",
    },
    {
      title: "View History",
      description: "See your past generated content",
      icon: History,
      to: "/history",
      color: "bg-amber-500",
    },
    {
      title: "Publish to Blogger",
      description: "Send your content directly to Blogger",
      icon: Send,
      to: "/blogger",
      color: "bg-green-500",
    },
    {
      title: "Settings",
      description: "Configure your API keys and preferences",
      icon: Settings,
      to: "/settings",
      color: "bg-gray-500",
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">
          Generate content, create images, and publish to your blog all in one place.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={feature.to}>Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
