
type PageContentProps = {};

const PageContent = ({ children }) => {
  return (
    <div className="container mx-auto p-4 lg:p-8 xl:max-w-7xl">
      <div className="rounded-xl border-2 border-gray-200 bg-gray-50 px-10 py-10 text-gray-400 dark:border-gray-700 dark:bg-gray-800">
        {children}
      </div>
    </div>
  );
};

export default PageContent;