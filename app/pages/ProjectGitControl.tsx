import { useMatches } from 'react-router-dom';
import PageHeader from '../components/page-shared/PageHeader';
import PageContent from '../components/page-shared/PageContent';
import { ipcRenderer } from 'electron';

const ProjectGitControl = () => {
  const matches = useMatches();
  const activeMatch = matches[matches.length - 1] as { handle: { pageTitle: string } };
  const pageTitle = activeMatch?.handle?.pageTitle;

  let directories = [];

  const handleNewProject = async () => {
    console.log("Yeni proje oluşturuluyor");

    try {
      directories = await window.electronAPI.selectDirectories();
      // renderDirectories();
      console.log(directories)
      if (directories.length > 0) {
        // commitContainer.style.display = 'block';
        // searchContainer.style.display = 'block';
      }
    } catch (error) {
      console.error('Klasör seçme hatası:', error);
      alert('Klasör seçme sırasında bir hata oluştu.');
    }

  };

  return (
    <>
      {/* Page Header - sayfanın en üstünde */}
      <PageHeader
        title={pageTitle}
        description="Manage your git repositories easily."
        actionButton={{
          title: "Select Project Folders",
          icon: (
            <svg
              className="hi-mini hi-plus inline-block size-5 opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          ),
          onClick: handleNewProject
        }}
      />

      <PageContent>
        <div>

        </div>
      </PageContent>
    </>
  );
};

export default ProjectGitControl;