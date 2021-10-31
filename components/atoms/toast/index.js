import Icon from '../icon';
import PropTypes from 'prop-types';
import { animated, useSpring } from 'react-spring';
import React, { useEffect, useRef, useState } from 'react';
import Style, { enterOverlay, progress, timerBar } from './toast.style';
import { isNil, merge } from 'lodash';

const Animated = animated(Style);

// custom hook for handling the countdown to exit
const useTimer = (duration = 8000) => {
  const [countdown, setCountdown] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval;
    if (!isNil(countdown) && isRunning) {
      interval = setInterval(() => {
        setCountdown(current => current - 1000);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [countdown, isRunning]);

  return [countdown, isRunning, setIsRunning];
};

const Toast = ({ onEnter, onExit, ...props }) => {
  const [exit, setExit] = useState(false);
  const multiButtonRef = useRef(props.actions?.length > 1 || props.actionRequired);
  const ref = useRef();

  // call the onEnter callback once on first render.
  const idRef = useRef(props.id);
  const onEnterRef = useRef(onEnter);
  useEffect(() => {
    onEnterRef.current(idRef.current);
  }, []);

  const onExitRef = useRef();
  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  const enterProps = {
    from: { opacity: 0, transform: 'translate(0, -80px) scale(1, 1)', marginBottom: 0, height: 'auto' },
    to: {
      height: 'auto',
      opacity: 1,
      transform: 'translate(0, 0px) scale(1, 1)',
      marginBottom: 10,
      paddingTop: props.messageBar ? 8 : 14,
      paddingBottom: props.messageBar ? 8 : 14,
    },
  };
  if (props.bottom) {
    merge(enterProps, {
      from: { transform: 'translate(0, 80px) scale(1, 1)' },
      to: { transform: 'translate(0, 0px) scale(1, 1)', marginTop: 10 },
    });
  }
  if (props.enterInPlace) {
    merge(enterProps, {
      from: { transform: 'translate(0, 0px) scale(0, 0)' },
      to: { transform: 'translate(0, 0px) scale(1, 1)', marginBottom: 0, marginTop: 0 },
    });
  }

  const [springProps, setSpring] = useSpring(() => ({
    ...enterProps,
    config: { tension: 180, friction: 20, clamp: !!props.enterInPlace },
    onRest: () => {
      springProps.height.setValue(ref.current.offsetHeight);
    },
  }));

  // set a timer for the toast's original duration. A timeout of null has unlimited duration.
  const [countdown, isRunning, setIsRunning] = useTimer(
    props.actionRequired || props.actions?.length > 1 ? null : props.timeout
  );
  useEffect(() => {
    if (!isNil(countdown) && countdown <= 0) {
      if (!props.timer) {
        setExit(true);
      } else {
        setIsRunning(false);
        setExit(true);
      }
    }
  }, [countdown, props.timer, setIsRunning, setSpring]);

  // the countdown pauses while the mouse hovers over the toast.
  const handleHover = e => {
    if (props.pauseOnHover) {
      setIsRunning(false);
    }
  };

  const timeoutRef = useRef(props.timeout);

  // the countdown resumes when the mouse leaves the toast.
  const handleHoverEnd = () => {
    if (props.pauseOnHover) {
      timeoutRef.current = countdown;
      setIsRunning(true);
    }
  };

  // set the exit animation, with callback to remove the toast on completion
  useEffect(() => {
    if (exit) {
      const exitProps = {
        to: {
          opacity: 0,
          transform: 'translate(0, -60px) scale(1, 1)',
          height: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
        },
      };
      if (props.enterInPlace) {
        merge(exitProps, { to: { transform: 'translate(0, -60px) scale(1, 1)' } });
      }
      if (props.bottom) {
        merge(exitProps, { to: { transform: 'translate(0, 60px) scale(1, 1)', top: 60, marginTop: 0 } });
      }
      if (props.exitInPlace) {
        merge(exitProps, { to: { transform: 'translate(0, 0px), scale(1, 0)' } });
      }

      setSpring({
        ...exitProps,
        config: {
          friction: 25,
        },
        delay: 150,
        onRest: () => {
          onExitRef.current(idRef.current);
        },
      });
    }
  }, [exit, props.bottom, props.enterInPlace, props.exitInPlace, setSpring]);

  // User clicks the close icon to dismiss the toast
  const handleClickDismiss = () => {
    if (!props.dismissOnClick || props.actions?.length) {
      setSpring({
        to: {
          transform: 'translate(0, 0) scale(0, 0)',
          height: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
        },
        config: { clamp: true, tension: 280 },
        onRest: () => onExitRef.current(props.id),
      });
    }
  };

  // programmatically dismiss the toast early by setting its timeout to 0.
  useEffect(() => {
    if (props.timeout === 0) {
      setExit(true);
    }
  }, [props.timeout]);

  const renderAction = () => {
    if (!props.actions) return null;

    return props.actions.map?.(action => {
      if (React.isValidElement(action)) return action;

      return (
        <button
          key={action.label}
          className='action-default'
          onClick={() => {
            if (action.label !== 'Change Type') setExit(true);
            const actionKey = Object.keys(action).find(k => k !== 'label');
            if (typeof action[actionKey] === 'function') action[actionKey](props.id);
          }}
        >
          {action.label}
        </button>
      );
    });
  };

  const renderTimer = () => {
    const timer = props.timer || props.timerBar || props.timerTime;
    const bar = props.timer || props.timerBar;
    const time = props.timer || props.timerTime;

    if (!timer || countdown === null) return null;

    const minutes = Math.floor(countdown / 60000);
    const seconds = (countdown / 1000) % 60;

    return (
      <>
        {time && (
          <span>
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        )}
        {bar && (
          <div
            css={[
              timerBar,
              isRunning && {
                animation: `${timeoutRef.current / 1000}s linear ${progress(
                  (timeoutRef.current / props.timeout) * 100
                )}`,
              },
              !isRunning &&
                countdown > 0 && {
                  width: `${(countdown / props.timeout) * 100}%`,
                },
            ]}
          ></div>
        )}
      </>
    );
  };

  const classes = [
    props.type,
    multiButtonRef.current && 'multi-button',
    props.actions && props.actionRequired && 'action-required',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {props.actions?.length && props.actionRequired && (
        <div
          className='toast-overlay'
          css={[
            {
              position: 'fixed',
              top: 0,
              left: 0,
              opacity: 1,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.8)',
              animation: `200ms ease-in-out ${enterOverlay}`,
            },
            exit && {
              opacity: 0,
              transition: 'opacity 300ms 200ms ease-in-out',
            },
          ]}
        ></div>
      )}
      <Animated
        ref={ref}
        className={classes}
        onClick={props.dismissOnClick && !props.actions?.length ? () => setExit(true) : () => {}}
        style={springProps}
        css={[
          props.timer &&
            !props.actions && {
              '.action': {
                display: 'none',
              },
            },
          props.dismissOnClick &&
            !props.actions?.length && {
              cursor: 'pointer',
            },
          !props.enterInPlace &&
            !exit && {
              transformOrigin: 'top right',
            },
          props.exitInPlace &&
            exit && {
              transformOrigin: 'top center',
            },
          props.className,
        ]}
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverEnd}
        onTouchStart={handleHover}
        onTouchEnd={handleHoverEnd}
      >
        <div className='message'>{props.message}</div>
        <div className='timer'>{renderTimer()}</div>
        <div className='action'>{renderAction()}</div>
        <div className='dismiss' onClick={handleClickDismiss}>
          <Icon name='times-lgt' />
        </div>
      </Animated>
    </>
  );
};

// prettier-ignore
Toast.componentDescription = 'Flash message notification & user confirmation widget.';
Toast.componentKey = 'toast';
Toast.componentName = 'Toast';

// prettier-ignore
Toast.propTypes = {
  /** A list of objects with button labels and callback functions to be called when the user clicks the action label. */
  actions: PropTypes.arrayOf(PropTypes.shape({
    action: PropTypes.func,
    label: PropTypes.node,
  })),
  /** Whether an action is required to dismiss the toast. Hides the close icon and addes a window overlay behind the toast. Has no effect if there are no actions. */
  actionRequired: PropTypes.bool,
  /** The message to be displayed. */
  message: PropTypes.node,
  /** Whether the notification will be displayed as a message bar instead of a toast */
  messageBar: PropTypes.bool,
  /** Whether to pause the timeout countdown on hover. */
  pauseOnHover: PropTypes.bool,
  /** The duration in ms the toast should be displayed. Null is indefinite duration. If taost is multi-button or actionRequired is true, there is no timeout, the toast will only be dismissed on a button  click. */
  timeout: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** A shortcut to setting both timerBar and timerTime to true. Has no effect for multi-button or actionRequired toasts. */
  timer: PropTypes.bool,
  /** Whether to show the timerBar. Automatically true if timer is true. Has no effect for multi-button or actionRequired toasts. */
  timerBar: PropTypes.bool,
  /** Whether to show the timer countdown. Automatically true if timer is true. Has no effect for multi-button or actionRequired toasts. */
  timerTime: PropTypes.bool,
  /** The type determines the toast's color. Leaving type undefined uses the primary color. */
  type: PropTypes.oneOf(['success', 'info', 'warning', 'error', 'primary']),
  /** Whether the toast can be dismissed by clicking anywhere in it. */
  dismissOnClick: PropTypes.bool,
  /** Whether the toast container is anchored at the bottom of the window. */
  bottom: PropTypes.bool,
  /** Changes the enter animation to not have vertical motion. For use when configured as header-bar notification rather than toast. */
  enterInPlace: PropTypes.bool,
  /** Changes the exit animation to not have vertical motion. For use when configured as header-bar notification rather than toast. */
  exitInPlace: PropTypes.bool,
  /** Callback function invoked when the toast first renders. */
  onEnter: PropTypes.func,
  /** Callback function invoked when the timeout expires. */
  onExit: PropTypes.func,
};

Toast.defaultProps = {
  message: '',
  pauseOnHover: true,
  timeout: 8000,
  onEnter: () => {},
  onExit: () => {},
};

export default Toast;
