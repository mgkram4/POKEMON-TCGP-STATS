"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();
  
  const navItems = [
    { path: '/', label: 'Tier List' },
    { path: '/matchups', label: 'Matchup Analysis' },
    { path: '/deck-stats', label: 'Deck Statistics' },
    { path: '/meta-trends', label: 'Meta Trends' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`py-4 px-3 text-sm font-medium border-b-2 ${
                pathname === item.path
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 