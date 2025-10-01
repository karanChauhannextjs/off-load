import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import styles from './ImageWithLoader.module.scss';
import {AppModal, useAppModalSimpleHandlers} from "@shared/ui/AppModal/AppModal.tsx";

interface ImageWithLoaderProps {
  url: string;
}

const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ url }) => {
  const modalHandlers = useAppModalSimpleHandlers();
  const [imageSrc, setImageSrc] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageSrc(img.src);
      setLoading(false);
    };
  }, [url]);

  const handleOpenImage = () => {
    modalHandlers.show()
  };

  return (
    <div className={styles.wrapper}>
      {loading ? (
        <Skeleton className={styles.imgSkeleton} />
      ) : (
        <img
          className={styles.chatImage}
          src={imageSrc}
          alt="Image"
          onClick={handleOpenImage}
        />
      )}
      <AppModal className={styles.modal} width={700} {...modalHandlers}>
        <div className={styles.imageWrapper}>
          <img className={styles.image} src={imageSrc} alt="img" />
        </div>
      </AppModal>
    </div>
  );
};

export default ImageWithLoader;
