import React, { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  actionButton?: {
    title: string;
    icon?: ReactNode;
    onClick: () => void;
  };
};

const PageHeader = ({ title, description, actionButton }: PageHeaderProps) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 w-full">
      <div className="container mx-auto p-4 lg:p-8 xl:max-w-7xl">
        <div className="space-y-2 py-2 text-center sm:flex sm:items-center sm:justify-between sm:space-y-0 sm:text-left lg:py-0">
          <div className="grow">
            <h1 className="mb-1 text-xl font-bold">{title}</h1>
            {description && (
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {description}
              </h2>
            )}
          </div>
          {actionButton && (
            <div className="flex flex-none items-center justify-center gap-2 rounded-sm px-2 py-3 sm:justify-end sm:bg-transparent sm:px-0">
              <button
                onClick={actionButton.onClick}
                className="inline-flex items-center justify-center gap-2 cursor-pointer rounded-lg border border-blue-700 bg-blue-700 px-3 py-2 text-sm leading-5 font-semibold text-white hover:border-blue-600 hover:bg-blue-600 hover:text-white focus:ring-3 focus:ring-blue-400/50 active:border-blue-700 active:bg-blue-700 dark:focus:ring-blue-400/90"
              >
                {actionButton.icon && actionButton.icon}
                <span>{actionButton.title}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;