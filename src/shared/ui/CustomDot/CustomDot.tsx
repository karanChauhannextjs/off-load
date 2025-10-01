
const CustomDot = (props: any) => {
  const { cx, cy, value, payload, isMobileScreen, onHover, onClick } = props;
  return (
    <>
      {value && (
        <circle
          cx={cx}
          cy={cy}
          r={isMobileScreen ? 6 : 4}
          stroke="#fff"
          strokeWidth={2}
          fill="#000" // Color of the dot
          onMouseEnter={(e) =>
            onHover(e, {
              cx,
              cy,
              value: payload.value,
              date: payload.date,
              index: payload.index,
            })
          }
          onMouseLeave={(e) => onHover(e, null)} // Reset tooltip on hover out
          onClick={(e)=>{
            onClick(e, {
              cx,
              cy,
              value: payload.value,
              date: payload.date,
              index: payload.index,
            });
          }}
        />
      )}
    </>
  );
};
export default CustomDot;