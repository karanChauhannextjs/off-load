import React from "react";
import styles from "@widgets/Diagram/Diagram.module.scss";
import Checkin1 from '@assets/svg/checkin1.svg';
import Checkin2 from '@assets/svg/checkin2.svg';
import Checkin3 from '@assets/svg/checkin3.svg';
import Checkin4 from '@assets/svg/checkin4.svg';
import Checkin5 from '@assets/svg/checkin5.svg';

export interface CustomTooltipProps {
  x?: any;
  y?: any;
  value?: any;
  date?: any;
  isMobileScreen?: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = (props: any) => {
  const { x, y, value, date, isMobileScreen } = props;
  const checkinImages = [Checkin1, Checkin2, Checkin3, Checkin4, Checkin5];
  const stylesTool: any = {
    tooltip: {
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      backgroundColor: '#FBE39C',
      borderRadius: '10px',
      gap: '2px',
      maxWidth: '60px',
      minWidth: '52px',
      width: '100%',
      height: '48px',
      padding: '6px',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      pointerEvents: 'none',
      transform: 'translate(-50%, -100%)',
    },
    row: {
      gap: '3px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    value: {
      fontFamily: 'Gilroy-Bold',
      fontSize: '18px',
      margin: 0,
    },
    date: {
      fontSize: '12px',
      color: '#777',
      display: 'flex',
      alignSelf:'center'
    },
    tooltipArrow: {
      position: 'absolute',
      bottom: '-10px',
      left: '50%',
      transform: 'translateX(-50%) translateY(-3px)',
      width: '0',
      height: '0',
      borderLeft: '10px solid transparent',
      borderRight: '10px solid transparent',
      borderTop: '10px solid #FBE39C',
    },
    icon:{
      display:'flex',
      height:'min-content',
      width:'min-content',
    }
  };

  const bubblePositionY = isMobileScreen ? -10 * value + 43.5 : -3 * value + 12.5

  return (
    <div style={{ ...stylesTool.tooltip, top: y - bubblePositionY, left: x, zIndex: 99 }}>
      <div style={{ ...stylesTool.row }}>
        <span style={stylesTool.value}>{value}</span>
        <div style={stylesTool.icon}>
          <img className={styles.feedIcon} src={checkinImages[Math.round(value) - 1]} alt="Feel"/>
        </div>
      </div>
      <span style={stylesTool.date}>{date.toUpperCase()}</span>
      <div style={{ ...stylesTool.tooltipArrow }}></div>
    </div>
  );
};
export default CustomTooltip;