import { useMatches } from 'react-router-dom';
import PageHeader from '../../components/page-shared/PageHeader';
import PageContent from '../../components/page-shared/PageContent';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import PageIntro from './PageIntro';
import DirectoryList, { DirectoryInfo } from './DirectoryList';
import LoadingProjectFolder from './LoadingProjectFolder';
import { PiFilesDuotone } from "react-icons/pi";

declare global {
  interface Window {
    gitLib: any;
  }
}

const ProjectGitControl = () => {
  const matches = useMatches();
  const activeMatch = matches[matches.length - 1] as { handle: { pageTitle: string } };
  const pageTitle = activeMatch?.handle?.pageTitle;

  const [directories, setDirectories] = useState<DirectoryInfo[]>([]);
  const [loadingProjectFolder, setLoadingProjectFolder] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer.on('loading-start', () => {
      setLoadingProjectFolder(true)
      setDirectories([])
    });
    window.electron.ipcRenderer.on('loading-end', () => setLoadingProjectFolder(false));
  }, []);

  const newProject = async () => {
    try {
      const directoryList = await window.gitLib.selectDirectories();
      setDirectories(directoryList);
      if (directoryList.length > 0) toast.success('Folders successfully selected.');
    } catch (error) {
      console.error('Klasör seçme hatası:', error);
      toast.error('An error occurred during folder selection and processing.');
    }
  };

  return (
    <>
      <PageHeader
        title={pageTitle}
        description="Manage your git repositories easily."
        actionButton={{
          title: "Select Project Folders",
          icon: <PiFilesDuotone size={20} />,
          onClick: newProject
        }}
      />

      <PageContent>
        {directories.length > 0 && <DirectoryList directories={directories} setDirectories={setDirectories} />}
        {!loadingProjectFolder && directories.length === 0 && <PageIntro />}
        {loadingProjectFolder && <LoadingProjectFolder />}
      </PageContent>
    </>
  );
};

export default ProjectGitControl;
