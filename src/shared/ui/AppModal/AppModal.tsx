'use client';

import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import classes from './AppModal.module.scss';
import { AppModalProps } from '@shared/ui/AppModal/AppModal.types.ts';

interface UseAppModalSimpleHandlersProps {
  onClose?: (metaData?: any) => void;
}

export const useAppModalSimpleHandlers = (
  props?: UseAppModalSimpleHandlersProps,
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [metaData, setMetaData] = useState<any>(null);

  return {
    isVisible,
    metaData,
    show: (metadata?: any) => {
      setIsVisible(true);
      setMetaData(metadata);
    },
    close: () => {
      setIsVisible(false);
      setMetaData(null);
    },
    onClose: (metadata: any) => {
      setIsVisible(false);
      !!props?.onClose && props.onClose(metadata);
    },
  };
};

export const AppModal: React.FC<AppModalProps> = ({
  width,
  onClose,
  metaData,
  children,
  isVisible = false,
  closeIcon = true,
  withBorder = true,
  disableClosingModal,
  className,
  setStateAction,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const onCloseHandler = (e: React.MouseEvent | KeyboardEvent) => {
    if (!disableClosingModal) {
      if (setStateAction) {
        setStateAction(false);
      }
      if (modalRef.current) {
        if (
          !(modalRef.current as HTMLElement).contains(e.target as HTMLElement)
        ) {
          close(e);
        }
      }
    }
  };

  const close = (e: React.MouseEvent | KeyboardEvent) => {
    if (setStateAction) {
      setStateAction(false);
    }
    e.preventDefault();
    e.stopPropagation();
    onClose(metaData);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode === 27 || e.code === 'Escape') {
      onCloseHandler(e);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={classes.modalWrapper}
          id={'appModal'}
          transition={{ duration: 0.125 }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 170, damping: 21 }}
            className={classes.overlay}
            onClick={onCloseHandler}
          >
            <div className={classes.container}>
              <div
                ref={modalRef}
                style={{ width: width }}
                className={classNames(className, [
                  classes.mainModal,
                  {
                    [classes.withCloseIcon]: closeIcon,
                    [classes.withBorder]: withBorder,
                  },
                ])}
                onClick={(e)=> e.stopPropagation()}
              >
                {closeIcon && (
                  <span
                    className={classNames(classes.closeIcon, 'icon-plus')}
                    onClick={() => {
                      onClose?.(metaData);
                      if (setStateAction) {
                        setStateAction(false);
                      }
                    }}
                  />
                )}
                <div className={classes.modalMain}>{children}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

AppModal.defaultProps = {
  closeIcon: true,
  isVisible: false,
  disableClosingModal: false,
} as AppModalProps;
