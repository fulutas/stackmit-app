import LottieAnimation from "@/app/components/LottieAnimation"
import loadingProjectFoldersAnimation from '../../assets/loading-project-folders-lottie.json'

const LoadingProjectFolder = () => {

  return (
    <div className='flex flex-col justify-center items-center'>
      <LottieAnimation src={loadingProjectFoldersAnimation} loop autoplay style={{ height: 400, width: 450 }} />
      <p className="text-[18px] text-white">Loading project files, please wait...</p>
    </div>
  )
}

export default LoadingProjectFolder