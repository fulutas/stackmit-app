import LottieAnimation from "@/app/components/LottieAnimation"
import selectFoldersAnimation from '../../assets/select-folders-lottie.json'

const PageIntro = () => {

  return (
    <div className='flex flex-col justify-center items-center'>
      <LottieAnimation src={selectFoldersAnimation} loop autoplay style={{ height: 400, width: 450 }} />
      <p className="text-[18px] text-white">Select and start managing project files.</p>
    </div>
  )
}

export default PageIntro