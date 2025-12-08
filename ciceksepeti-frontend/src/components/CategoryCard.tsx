import React from 'react';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  color: string;
  textColor: string;
  icon: React.ReactNode; 
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, subtitle, color, textColor, icon }) => (
  <div className={`${color} rounded-2xl p-6 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow group h-full flex flex-col justify-center`}>
    <div className="z-10 relative">
      <h3 className={`text-2xl font-bold ${textColor} mb-1 group-hover:scale-105 transition-transform origin-left`}>{title}</h3>
      <p className={`text-sm font-medium ${textColor} opacity-80`}>{subtitle}</p>
      <button className={`mt-4 bg-white/50 hover:bg-white ${textColor} text-xs font-bold py-2 px-4 rounded-full transition-colors backdrop-blur-sm`}>
        İncele
      </button>
    </div>
    {icon}
  </div>
);

export default CategoryCard;