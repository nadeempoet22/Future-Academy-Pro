import React from 'react';
import { Category } from '../types';
import {
  BookOpen,
  Globe2,
  Landmark,
  Laptop,
  Moon,
  Microscope,
  Compass,
  Calculator,
  Award,
  FileCheck2,
  GraduationCap,
  Atom,
  FlaskConical,
  Dna,
  ShieldAlert,
  BookMarked,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
  onStartCategoryQuiz: (categoryName: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Landmark,
  Globe2,
  BookOpen,
  Laptop,
  Moon,
  Microscope,
  Compass,
  Calculator,
  Award,
  FileCheck2,
  GraduationCap,
  Atom,
  FlaskConical,
  Dna,
  ShieldAlert,
  BookMarked
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onSelectCategory,
  onStartCategoryQuiz
}) => {
  return (
    <div className="py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/20">
            Subject & Exam Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            Browse All MCQs Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose a category to view solved MCQs, topic notes, take practice quizzes, or add new MCQs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {categories.map(cat => {
          const IconComp = iconMap[cat.iconName] || BookOpen;

          return (
            <div
              key={cat.id}
              className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                    {cat.questionCount} MCQs
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {cat.subcategories.map(sub => (
                      <span
                        key={sub.id}
                        className="text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 px-2 py-0.5 rounded-md"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onSelectCategory(cat.name)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1"
                >
                  View MCQs
                </button>
                <button
                  onClick={() => onStartCategoryQuiz(cat.name)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                >
                  Take Quiz <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
