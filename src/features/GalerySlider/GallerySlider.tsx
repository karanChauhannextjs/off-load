import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import styles from './GallarySlider.module.scss';
import { GallarySliderProps } from './GallarySlider.types.ts';

const GallerySlider: React.FC<GallarySliderProps> = (props) => {
  const { className, video, images, onPlayVideo } = props;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [changed, setChanged] = useState(false);
  const [counter, setCounter] = useState(0);
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );

  const dataLength = Number(video?.length) + Number(images?.length);

  const prevHide = currentIndex === 0 && !changed;
  // @ts-ignore
  const nextHide = currentIndex === 1 || (images?.length + video?.length < 2);

  // @ts-ignore
  const galleryData = [...video, ...images];

  const handlePrevious = () => {
    setCounter((prev) => prev - 1);
    if (currentIndex === 0) {
      setChanged(false);
    }
    if (!prevHide && currentIndex > 0)
      setCurrentIndex((prevIndex) => prevIndex - 1);
  };

  const handleNext = () => {
    if (galleryData.length > 1 && counter < galleryData.length - 1) {
      setCounter((prev) => prev + 1);
      if (currentIndex === 0) {
        setChanged(true);
        if (!nextHide && changed) {
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }
      }
    }
  };

  useEffect(() => {
    if (currentIndex < 0) {
      setChanged(false);
    }
  }, [currentIndex]);

  // const handlePlayVideo = () => {
  //   window.open(video?.[0]?.video,'_self' );
  // };

  // const handleOpenImage = (src: string) => {
  //   window.open(src);
  // };

  const handleVideoClick = () => {
    const videoElement = videoRef.current;

    if (videoElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if ((videoElement as any).webkitEnterFullscreen) {
        (videoElement as any).webkitEnterFullscreen();
      } else if ((videoElement as any).webkitRequestFullscreen) {
        (videoElement as any).webkitRequestFullscreen();
      } else if ((videoElement as any).mozRequestFullScreen) {
        (videoElement as any).mozRequestFullScreen();
      } else if ((videoElement as any).msRequestFullscreen) {
        (videoElement as any).msRequestFullscreen();
      }

      videoElement.play().catch((err) => {
        console.error('Video playback error:', err);
      });
    }
  };

  const handleFullscreenChange = () => {
    const isFullscreen =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;

    if (!isFullscreen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange,
      );
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  let visibleCards = Array.from(
    { length: galleryData.length > 1 ? 2 : 1 },
    (_, i) => (currentIndex + i) % dataLength,
  );

  if(isMobileScreen){
    visibleCards = []
    galleryData.forEach((item:any,i) => {
      console.log(item)
      visibleCards.push(i)
    })
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [videoRef]);

  return (
    <div
      className={cn(
        styles.wrapper,
        {
          [styles.notFirst]: currentIndex > 0 || changed,
        },
        className,
      )}
    >
      <div className={styles.bodyWrapper}>
        <div
          className={cn(styles.arrowWrapper, styles.left, {
            [styles.hided]: prevHide,
          })}
          onClick={handlePrevious}
        >
          <i className={cn('icon-left-arrow')} />
        </div>

        {visibleCards.map((item) => {
          return (
            <div key={item} className={cn(styles.card)}>
              {galleryData?.[item]?.video ? (
                <div className={styles.videoWrapper}>
                  <video
                    ref={videoRef}
                    playsInline
                    // poster={galleryData?.[item]?.thumbnail}
                    className={styles.video}
                    autoPlay
                  >
                    <source src={galleryData?.[item]?.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <img
                  className={styles.backImage}
                  src={galleryData?.[item]?.image}
                  alt="Image"
                  style={{ maxWidth: '100%' }}
                  // onClick={() => handleOpenImage(galleryData?.[item]?.image)}
                />
              )}
              {galleryData?.[item]?.video && (
                <div
                  onClick={isMobileScreen ? handleVideoClick : onPlayVideo}
                  className={styles.playWrapper}
                >
                  <i className={cn('icon-play', styles.playIcon)} />
                </div>
              )}
            </div>
          );
        })}
        <div
          className={cn(styles.arrowWrapper, styles.right, {
          [styles.hided]: nextHide,
        })}
          onClick={handleNext}
        >
          <i className={cn('icon-right-arrow')} />
        </div>
      </div>
    </div>
  );
};
export default GallerySlider;
