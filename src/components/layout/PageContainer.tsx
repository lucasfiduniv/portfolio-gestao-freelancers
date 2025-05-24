import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageContainer({ 
  children, 
  className, 
  title,
  description,
  actions
}: PageContainerProps) {
  return (
    <div className="min-h-screen bg-background pt-4 md:pt-8 md:ml-60 ml-0">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="flex justify-between items-start mb-6 flex-col md:flex-row md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex-shrink-0 flex space-x-2">
              {actions}
            </div>
          )}
        </div>
        <div className={cn("space-y-4", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}