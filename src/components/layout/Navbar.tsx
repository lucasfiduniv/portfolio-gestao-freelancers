'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, ClipboardList, FileText, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon, text, active, onClick }: NavItemProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} onClick={onClick}>
          <div className={cn(
            'flex items-center px-4 py-3 mb-2 rounded-md text-sm font-medium transition-colors',
            active ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
          )}>
            <div className="mr-3">{icon}</div>
            <span className="hidden md:inline">{text}</span>
          </div>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="md:hidden">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { href: '/', icon: <Home size={20} />, text: 'Dashboard' },
    { href: '/projetos', icon: <ClipboardList size={20} />, text: 'Projetos' },
    { href: '/relatorios', icon: <BarChart2 size={20} />, text: 'Relatórios' },
    { href: '/faturas', icon: <FileText size={20} />, text: 'Faturas' },
  ];

  // Toggle mobile menu
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      {/* Mobile menu button - visible only on small screens */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="rounded-full shadow-md"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>
      
      {/* Navbar - desktop always visible, mobile conditional */}
      <nav className={cn(
        "fixed inset-y-0 left-0 bg-card border-r w-16 md:w-60 p-3 flex flex-col z-40 transition-transform duration-300",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center justify-between mb-6 mt-2">
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold mr-2">
              W
            </div>
            <h1 className="text-xl font-bold hidden md:block">WorkFlowr</h1>
          </Link>
        </div>
        
        <div className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              text={item.text}
              active={pathname === item.href}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
        </div>
        
        <div className="mt-auto pt-4 border-t flex items-center justify-between">
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="sm"
            className="hidden md:flex"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Resetar Sistema
          </Button>
        </div>
      </nav>
    </>
  );
}