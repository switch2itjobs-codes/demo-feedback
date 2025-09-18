"use client";
import React from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar-1";

export type Testimonial = {
  date: string;
  reviewType: string;
  review: string;
  rating: number;
  name: string;
  image?: string;
};

type TestimonialsColumnProps = {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
  paused?: boolean;
};

export const TestimonialsColumn: React.FC<TestimonialsColumnProps> = (
  props,
) => {
  function avatarForName(name: string | undefined, index: number): string {
    const femaleUrls = [
      "https://bundui-images.netlify.app/avatars/01.png",
      "https://bundui-images.netlify.app/avatars/03.png",
      "https://bundui-images.netlify.app/avatars/05.png",
      "https://bundui-images.netlify.app/avatars/07.png",
      "https://bundui-images.netlify.app/avatars/09.png",
      "https://bundui-images.netlify.app/avatars/11.png",
      "https://bundui-images.netlify.app/avatars/13.png",
      "https://bundui-images.netlify.app/avatars/15.png",
    ];
    const maleUrls = [
      "https://bundui-images.netlify.app/avatars/02.png",
      "https://bundui-images.netlify.app/avatars/04.png",
      "https://bundui-images.netlify.app/avatars/06.png",
      "https://bundui-images.netlify.app/avatars/08.png",
      "https://bundui-images.netlify.app/avatars/10.png",
      "https://bundui-images.netlify.app/avatars/12.png",
      "https://bundui-images.netlify.app/avatars/14.png",
      "https://bundui-images.netlify.app/avatars/16.png",
    ];

    const gender = guessGender(name);
    const pool = gender === "female" ? femaleUrls : maleUrls;
    return pool[index % pool.length];
  }

  function guessGender(name?: string): "male" | "female" {
    if (!name) return "male";
    const n = name.trim().toLowerCase();
    const female = new Set([
      "priya",
      "sneha",
      "kavya",
      "ananya",
      "neha",
      "zainab",
      "aliza",
      "sana",
      "briana",
      "saman",
    ]);
    const male = new Set([
      "rohan",
      "amit",
      "arjun",
      "deepak",
      "kiran",
      "hassan",
      "omar",
      "bilal",
      "farhan",
      "hassan",
    ]);
    if (female.has(n.split(" ")[0])) return "female";
    if (male.has(n.split(" ")[0])) return "male";
    if (n.endsWith("a")) return "female";
    return "male";
  }

  function badgeClass(type?: string): string {
    const t = (type || "").toLowerCase();
    if (t.includes("demo")) return "bg-green-50 text-green-800 border-green-200";
    if (t.includes("sales")) return "bg-yellow-50 text-yellow-800 border-yellow-200";
    if (t.includes("support")) return "bg-blue-50 text-blue-800 border-blue-200";
    if (t.includes("course")) return "bg-orange-50 text-orange-800 border-orange-200";
    return "bg-neutral-50 text-neutral-700 border-neutral-200";
  }

  function initials(fullName?: string): string {
    if (!fullName) return "U";
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts[1]?.[0] ?? "";
    return `${first}${last}`.toUpperCase() || "U";
  }

  return (
    <div className={`flex flex-col gap-6 pb-6 bg-white ${props.className || ''}`}>
      <motion.div
        animate={props.paused ? undefined : { translateY: "-50%" }}
        transition={props.paused ? undefined : {
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        style={props.paused ? { transform: "translateY(0%)" } : undefined}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ review, image, name, reviewType, rating, date }, i) => (
              <div
                className="p-10 rounded-3xl border border-neutral-200 bg-white shadow-md shadow-black/5 max-w-xs w-full text-neutral-900"
                key={`${index}-${i}`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1" aria-label={`${rating} star rating`}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={s < Math.round(rating) ? "h-4 w-4 fill-yellow-400 text-yellow-400" : "h-4 w-4 text-neutral-300"} />
                    ))}
                  </div>
                  <div className="mt-1 -ml-0.5">
                    <span
                      className={
                        "inline-flex items-center rounded-full border px-[0.6rem] py-[0.325rem] text-sm font-semibold tracking-tight leading-none " +
                        badgeClass(reviewType)
                      }
                    >
                      {reviewType}
                    </span>
                  </div>
                  <div className="text-neutral-800 -ml-0.5">{review}</div>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <Avatar className="size-10">
                    <AvatarImage src={image || avatarForName(name, i)} />
                    <AvatarFallback>{initials(name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="font-medium tracking-tight leading-5 text-neutral-900">{name}</div>
                    <div className="leading-5 tracking-tight text-neutral-500">
                      {new Date(date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

export default TestimonialsColumn;


