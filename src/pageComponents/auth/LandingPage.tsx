import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

export const LandingPage: React.FC = () => {
  const [imageAnimationFrames, setImageAnimationFrames] = useState<number>(-1);
  const counter = useRef(0);

  useEffect(() => {
    if (imageAnimationFrames === -1) {
      return;
    } else {
      if (imageAnimationFrames < 11) {
        counter.current += 1;
        const id = setInterval(
          () => setImageAnimationFrames((imageAnimationFrames) => imageAnimationFrames + 1),
          150,
        );

        return () => clearTimeout(id);
      } else {
        setImageAnimationFrames(-1);
        signIn();
      }
    }
  }, [imageAnimationFrames]);
  return (
    <>
      {imageAnimationFrames !== -1 ? (
        <div className='flex h-screen justify-center bg-neutral-900 py-10'>
          <img src={`/cautionAnimation/${imageAnimationFrames}.png`} alt='g0lem' className='' />
        </div>
      ) : (
        <div className='min-h-screen bg-red-200 pb-10'>
          <div className='landingParent flex  flex-col items-center pt-12'>
            <h1 className='title '>g0lem</h1>
            <div className='bg-neutral-50 py-5 pr-4'>
              <div className='landingContainer glitchAndJerk ml-1 mr-4'>
                <Image src={'/logoNoHat.png'} alt='g0lem' height={500} width={300} />
              </div>
            </div>

            <div className='landingContainer my-4 cursor-not-allowed px-2'>
              <div className='specialLandingText'>Access Restricted</div>
            </div>
            <div
              className='flex cursor-pointer items-center justify-center gap-x-4'
              onClick={() => {
                setImageAnimationFrames(1);
              }}
            >
              <div className='landingContainer specialLandingText h-fit px-2 hover:scale-125'>
                ENTER
              </div>
              <div className='landingContainer'>
                <img src={`/switch.png`} alt='switch' className='h-32 hover:rotate-180' />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
