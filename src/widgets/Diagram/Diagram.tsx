import React, { useEffect, useState } from 'react';
import styles from './Diagram.module.scss';
import { DiagramProps } from './Diagram.types.ts';
import cn from 'classnames';
import { Line, LineChart, XAxis } from 'recharts';
import { addWeeks, isSameWeek } from 'date-fns';
import { getWeekRange } from '@utils/helpers.ts';
import CustomDot from '@shared/ui/CustomDot/CustomDot.tsx';
import CustomTooltip from '@shared/ui/CustomTooltip/CustomTooltip.tsx';
import { useLocation } from 'react-router-dom';
import Bubble from '@assets/images/bubleDefault.png';

const Diagram: React.FC<DiagramProps> = (props) => {
  const location = useLocation();
  const {
    data,
    weekAverage,
    widthWeeks = true,
    className = true,
    linesWrapperClassName,
    setCurrentWeekOffset,
    isFeelingSelected
  } = props;
  const today = new Date();
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 425,
  );
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const [visibleDefaultBuuble, setVisibleDefaultBuuble] = useState(false);
  const [hoveredDot, setHoveredDot] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState(today);
  const [currentOffset, setCurrentOffset] = useState(0);
  const isNextDisabled = isSameWeek(today, currentWeek, { weekStartsOn: 1 });
  // 30.7 , 10.7 , 28.7, 8.7
  const bubblePositionX = location?.pathname.includes('shared-clients')
    ? 10.7
    : 8.7;

  const handleHover = (_: any, dot: any) => {
    if (dot) {
      setHoveredDot(dot);
    } else {
      setHoveredDot(null);
    }
  };

  const changeWeek = (direction: number) => {
    setCurrentOffset((prev) => prev + direction);
    setCurrentWeek(addWeeks(currentWeek, direction));
    setHoveredDot(null);
  };

  useEffect(() => {
    if (setCurrentWeekOffset) {
      setCurrentWeekOffset(currentOffset);
    }
  }, [currentOffset]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 425);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setVisibleDefaultBuuble(true);
    }, 1500);
  },[]);


  // const nonNullCrValues = data
  //   .map((item: any) => item.cr)
  //   .filter((value: any) => value !== null);
  //
  // const areAllNonNullCrSame = nonNullCrValues.every(
  //   (value: any) => value === nonNullCrValues[0],
  // );

  return (
    <div className={cn(styles.diagramWrapper, className)}>
      <div className={styles.averageWrapper}>
        <span className={styles.average}>{weekAverage}</span>
        <span className={styles.moodLabel}>AVERAGE MOOD</span>
      </div>
      {widthWeeks && (
        <div className={styles.dateWrapper}>
          <span
            className={styles.iconWrap}
            onClick={() => {
              changeWeek(-1);
            }}
          >
            <i className={cn('icon-left-arrow', styles.arrowIcon)} />
          </span>
          <div className={styles.weekDate}>{getWeekRange(currentWeek)}</div>
          <span
            className={styles.iconWrap}
            onClick={() => {
              if (!isNextDisabled) {
                changeWeek(1);
              }
            }}
          >
            <i
              className={cn('icon-right-arrow', {
                [styles.disabledArrow]: isNextDisabled,
              })}
            />
          </span>
        </div>
      )}
      <div className={cn(styles.linesWrapper, linesWrapperClassName)}>
        {(!user?.uuid && location.pathname.includes('feed')) && visibleDefaultBuuble && (
          <img src={Bubble} alt="" className={styles.buble} />
        )}
        <svg
          preserveAspectRatio="xMinYMin meet"
          viewBox="0 0 700 240"
          style={{
            position: 'fixed',
            top: -Number.MAX_SAFE_INTEGER,
            left: -Number.MAX_SAFE_INTEGER,
            visibility: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <filter id="drop-shadow" filterUnits="userSpaceOnUse">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
              <feOffset in="blur" dx="0" dy="5" result="offsetBlur" />
              <feFlood floodColor="rgba(0, 0, 0, 0.4)" result="offsetColor" />
              <feComposite
                in="offsetColor"
                in2="offsetBlur"
                operator="in"
                result="shadow"
              />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        {hoveredDot && (
          <CustomTooltip
            x={
              hoveredDot.cx -
              hoveredDot.index *
                (isMobileScreen
                  ? location?.pathname?.includes('shared-clients')
                    ? bubblePositionX + 17.5
                    : bubblePositionX + 19.7
                  : bubblePositionX)
            }
            y={hoveredDot.cy}
            value={hoveredDot.value}
            date={hoveredDot.date}
            isMobileScreen={isMobileScreen}
          />
        )}
        {(isFeelingSelected || !user?.uuid)  && (
          <LineChart
            width={700}
            height={isMobileScreen ? 240 : 215}
            data={data}
            dataKey={'d'}
            className={styles.mainLine}
          >
            <XAxis dataKey={'d'} className={styles.lineDefault} />
            <Line
              connectNulls
              type="monotone"
              dataKey="pr"
              tooltipType={'none'}
              stroke="#33333333"
              strokeWidth={5}
              dot={false}
              activeDot={false}
            />
            <Line
              connectNulls
              type="monotone"
              dataKey="cr"
              stroke="#FFFFFF"
              strokeWidth={6}
              style={{ filter: 'url(#drop-shadow)' }}
              dot={(props) => (
                <CustomDot
                  {...props}
                  isMobileScreen={isMobileScreen}
                  onClick={handleHover}
                  onHover={handleHover}
                />
              )}
            />
          </LineChart>
        )}
        {isFeelingSelected === false && user?.uuid && (
          <div className={styles.emptyStateWrapper}>
            <span>No mood data yet</span>
          </div>
        )}
      </div>
      <div className={styles.weeksWrapper}>
        {widthWeeks && (
          <div className={styles.weeksRow}>
            <span className={styles.currentWeek}>
              <span className={cn(styles.dot, styles.currentDot)}></span>
              current week
            </span>
            <span className={styles.prevWeek}>
              <span className={cn(styles.dot, styles.prevDot)}></span>
              previous week
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
export default Diagram;
