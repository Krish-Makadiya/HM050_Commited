"use client";
import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Testimonial = React.forwardRef(
  ({ name, role, company, testimonial, rating = 5, image, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/5 bg-light-surface/50 dark:bg-dark-surface/50 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-sm group",
          className
        )}
        {...props}>

        {/* Hover Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-light-primary/5 via-transparent to-light-secondary/5 dark:from-dark-primary/5 dark:to-dark-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Quote Icon */}
        <div
          className="absolute right-6 top-6 text-6xl font-serif text-light-primary/10 dark:text-dark-primary/10 select-none transform group-hover:scale-110 transition-transform duration-500">
          "
        </div>

        <div className="relative z-10 flex flex-col gap-6 justify-between h-full">
          {rating > 0 && (
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={18}
                  className={cn(index < rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200 dark:fill-gray-800 dark:text-gray-800")} />
              ))}
            </div>
          )}

          <p className="text-lg leading-relaxed text-light-primary-text/80 dark:text-dark-primary-text/80 font-medium">
            {testimonial}
          </p>

          <div className="flex items-center gap-4 pt-4 border-t border-black/5 dark:border-white/5">
            {image && (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-light-primary/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Avatar className="h-12 w-12 border-2 border-white dark:border-zinc-800 relative z-10">
                  <AvatarImage src={image} alt={name} />
                  <AvatarFallback>{name[0]}</AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="flex flex-col">
              <h3 className="font-bold text-light-primary-text dark:text-dark-primary-text text-base">{name}</h3>
              <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                {role}
                {company && <span className="opacity-70 ml-1 font-medium text-light-primary dark:text-dark-primary">@ {company}</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
)
Testimonial.displayName = "Testimonial"

export { Testimonial }