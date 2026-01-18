import { cn } from "@/lib/utils";
import {
  Lock,
  ListFilter,
  Award,
  FileSignature,
  MessageSquare,
  Zap
} from "lucide-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Smart Job Matching",
      description: "Get matched with projects that fit your skills perfectly, making the 'Being Applied' phase effortless.",
      icon: <Zap className="w-6 h-6" />,
    },
    {
      title: "Swift Proposals",
      description: "Send detailed proposals and communicate directly with recruiters to get 'Selected' faster.",
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      title: "Instant Contracts",
      description: "Auto-generated contracts ensure you are legally secured the moment you are 'Selected'.",
      icon: <FileSignature className="w-6 h-6" />,
    },
    {
      title: "Secure Escrow",
      description: "Funds are locked in escrow upfront, guaranteeing payout when the work is 'Done'.",
      icon: <Lock className="w-6 h-6" />,
    },
    {
      title: "Task Roadmaps",
      description: "Work is broken into clear tasks and milestones, so everyone knows what is 'Being Done'.",
      icon: <ListFilter className="w-6 h-6" />,
    },
    {
      title: "Verified Completion",
      description: "Earn verified badges and reviews immediately after your work is marked 'Done' and approved.",
      icon: <Award className="w-6 h-6" />,
    },
  ];

  return (
    <div className="py-20 lg:py-32 max-w-7xl mx-auto px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-light-primary-text dark:text-dark-primary-text mb-4">
          Everything you need to <span className="text-light-primary dark:text-dark-primary">get hired</span>
        </h2>
        <p className="text-lg text-light-secondary-text dark:text-dark-secondary-text max-w-2xl mx-auto">
          From application to offer letter, SoHired provides an end-to-end toolkit to supercharge your career journey.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-black/5 dark:border-white/5",
        (index === 0 || index === 4) && "lg:border-l border-black/5 dark:border-white/5",
        index < 4 && "lg:border-b border-black/5 dark:border-white/5"
      )}>
      {index < 4 && (
        <div
          className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-light-primary/5 dark:from-dark-primary/5 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div
          className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-light-primary/5 dark:from-dark-primary/5 to-transparent pointer-events-none" />
      )}
      <div
        className="mb-4 relative z-10 px-10 text-light-secondary dark:text-dark-secondary group-hover/feature:text-light-primary dark:group-hover/feature:text-dark-primary transition-colors duration-200">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div
          className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-black/10 dark:bg-white/10 group-hover/feature:bg-light-primary dark:group-hover/feature:bg-dark-primary transition-all duration-200 origin-center" />
        <span
          className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-light-primary-text dark:text-dark-primary-text">
          {title}
        </span>
      </div>
      <p
        className="text-sm text-light-secondary-text dark:text-dark-secondary-text max-w-xs relative z-10 px-10 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
