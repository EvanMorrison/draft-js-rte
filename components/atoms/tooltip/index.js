import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Style from './tooltip.style.js';

const Tooltip = props => {
  // ref to the tooltip
  const ref = useRef(null);
  // ref to the element the tooltip points to
  const anchorRef = useRef(null);
  // if the anchor is resized, update the tooltip positioning
  const observerRef = useRef(null);
  useEffect(() => {
    observerRef.current = 
    new ResizeObserver(() => {
      const { x, y } = mouseRef.current;
      const newAnchorRect = anchorRef.current.getBoundingClientRect();
      const isMouseOverAnchor = () => {
        if (
          newAnchorRect.left <= x &&
          newAnchorRect.right >= x &&
          newAnchorRect.top <= y &&
          newAnchorRect.bottom >= y
        ) {
          return true;
        }
        return false;
      };
      if (isMouseOverAnchor()) {
        shouldOpen.current = true;
      } else {
        shouldOpen.current = false;
        setShow(false);
      }
      setAnchorBox(newAnchorRect);
    })
  }, []);

  // ref to a container element the tooltip should not overflow to the left or right (for top and bottom positions only)
  const containerRef = useRef(null);
  // the amount by which a centered (top or bottom) tooltip would overflow outside the container.
  // Negative values overflow on the left, positive values overflow on the right.
  const [overflow, setOverflow] = useState(0);

  const mouseRef = useRef({});
  const shouldOpen = useRef(false);
  const [show, setShow] = useState(false);
  const [anchorBox, setAnchorBox] = useState({ x: 0, y: 0 });

  // use a ref for this prop so it doesn't have to be included in other useEffect dependency arrays
  const propsAnchorRef = useRef(props.anchor);
  useEffect(() => {
    propsAnchorRef.current = props.anchor;
  }, [props.anchor]);

  // set or find the anchor element for the tooltip
  // defaults to the nearest positioned ancestor
  useEffect(() => {
    if (propsAnchorRef.current?.getBoundingClientRect) {
      anchorRef.current = propsAnchorRef;
    } else {
      anchorRef.current =
        document.querySelector(propsAnchorRef.current) ?? ref.current?.offsetParent ?? ref.current?.parentNode;
    }

    const observer = observerRef.current;
    if (anchorRef.current) {
      observer.observe(anchorRef.current);
    }

    const showFn = () => {
      shouldOpen.current = true;
      setAnchorBox(anchorRef.current.getBoundingClientRect());
    };

    const handleMouseMove = e => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!anchorRef.current?.contains(e.target) || ref.current?.contains(e.target)) {
        shouldOpen.current = false;
        setShow(false);
      }
    };

    const handleWheel = e => {
      if (anchorRef.current?.contains(e.target)) {
        setAnchorBox(anchorRef.current?.getBoundingClientRect());
      } else {
        shouldOpen.current = false;
        setShow(false);
      }
    };

    anchorRef.current?.addEventListener('mouseenter', showFn);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel);

    return () => {
      anchorRef.current?.removeEventListener('mouseenter', showFn);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      observer.disconnect();
    };
  }, []);

  // set or find the container element that the tooltip should not overflow
  // defaults to document.body
  useEffect(() => {
    if (props.container?.getBoundingClientRect) {
      containerRef.current = props.container;
    } else {
      containerRef.current = document.querySelector(props.container) ?? {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        }),
      };
    }
  }, [props.container]);

  // determine if the tooltip position needs to be adjusted so it doesn't overflow the edge of the container or screen
  useEffect(() => {
    if (anchorBox.width) {
      const refBox = ref.current.getBoundingClientRect();
      const containerBox = containerRef.current.getBoundingClientRect();
      if (/^top$|^bottom$/.test(props.orientation)) {
        const leftOffset = containerBox.left - (anchorBox.left + anchorBox.width / 2 - refBox.width / 2);
        const rightOffset = containerBox.right - (anchorBox.right - anchorBox.width / 2 + refBox.width / 2);

        if (leftOffset > 0) {
          setOverflow(leftOffset + 6);
        } else if (rightOffset < 0) {
          setOverflow(rightOffset - 6);
        } else {
          setOverflow(0);
        }
      } else {
        const topOffset = containerBox.top - (anchorBox.top + anchorBox.height / 2 - refBox.height / 2);
        const bottomOffset = containerBox.bottom - (anchorBox.bottom - anchorBox.height / 2 + refBox.height / 2);

        if (topOffset > 0) {
          setOverflow(topOffset + 6);
        } else if (bottomOffset < 0) {
          setOverflow(bottomOffset - 6);
        } else {
          setOverflow(0);
        }
      }
    }

    if (shouldOpen.current) {
      setShow(true);
    }
  }, [anchorBox, props.orientation, props.children]);

  const tipPos = ref.current?.getBoundingClientRect() ?? {};
  const pointerInner = props.size === 'sm' ? 6 : 10;
  const pointerOuter = props.size === 'sm' ? 8 : 12;

  return (
    <Style
      className={`tooltip ${props.orientation} ${props.size}`}
      ref={ref}
      css={[
        {
          position: anchorRef.current ? 'fixed' : 'absolute',
          opacity: 0,
          visibility: 'hidden',
          transition: '300ms ease',
          transitionProperty: 'opacity visibility',
        },
        show && {
          opacity: 1,
          visibility: 'visible',
          transition: '300ms 200ms ease',
        },
        /^top$|^bottom$/.test(props.orientation) && {
          ':before': {
            left: `calc(50% - ${pointerOuter}px - ${overflow}px)`,
          },
          ':after': {
            left: `calc(50% - ${pointerInner}px - ${overflow}px)`,
          },
        },
        /^left$|^right$/.test(props.orientation) && {
          ':before': {
            top: `calc(50% - ${pointerOuter}px - ${overflow}px)`,
          },
          ':after': {
            top: `calc(50% - ${pointerInner}px - ${overflow}px)`,
          },
        },
        props.orientation === 'top' && {
          top: `${anchorBox.top - tipPos.height - pointerOuter}px`,
          left: `${anchorBox.left + anchorBox.width / 2 + overflow - tipPos.width / 2}px`,
        },
        props.orientation === 'bottom' && {
          top: `${anchorBox.top + anchorBox.height + pointerOuter}px`,
          left: `${anchorBox.left + anchorBox.width / 2 + overflow - tipPos.width / 2}px`,
        },
        props.orientation === 'left' && {
          top: `${anchorBox.top + anchorBox.height / 2 + overflow - tipPos.height / 2}px`,
          left: `${anchorBox.left - tipPos.width - pointerOuter}px`,
        },
        props.orientation === 'right' && {
          top: `${anchorBox.top + anchorBox.height / 2 + overflow - tipPos.height / 2}px`,
          left: `${anchorBox.left + anchorBox.width + pointerOuter}px`,
        },
        {
          maxWidth: props.maxWidth,
        },
        {
          [`&.tooltip.${props.orientation}.${props.size}`]: props.className,
        },
      ]}
      data-testid={show ? 'tooltip-in' : 'tooltip-out'}
    >
      {props.children}
    </Style>
  );
};

Tooltip.componentDescription = 'Informational tooltip.';
Tooltip.componentKey = 'tooltip';
Tooltip.componentName = 'Tooltip';
Tooltip.propTypes = {
  container: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  maxWidth: PropTypes.number,
  orientation: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

Tooltip.defaultProps = {
  maxWidth: 380,
  orientation: 'top',
  size: 'md',
};

export default Tooltip;
