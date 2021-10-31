import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../atoms/icon';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { offColor as colorHelper } from 'off-color';

const ProgressBar = ({ handleShowProgress, ...props }) => {
  const theme = useTheme();
  const colors = useRef(theme.colors);
  const [opacity, setOpacity] = useState(0.2);
  const [barColor, setBarColor] = useState(theme.colors.success);
  useEffect(() => {
    const percent = (props.html?.length / props.maxLength) * 100;
    setOpacity(Math.max(0.2, (percent ?? 0) / 100));
    if (percent > 98) {
      setBarColor(colors.current.danger);
    } else if (percent > 90) {
      setBarColor(colors.current.warning);
    } else if (percent > 60) {
      setBarColor(colors.current.success);
    } else {
      setBarColor(colors.current.success);
    }
    if (percent > 60) {
      handleShowProgress?.(true);
    } else {
      handleShowProgress?.(false);
    }
  }, [handleShowProgress, props.html, props.maxLength]);

  return (
    <div
      css={{
        position: 'relative',
        width: 125,
        height: 14,
        border: `1px solid ${barColor}`,
        borderRadius: 3,
        background: '#fff',
      }}
    >
      <span
        css={{
          position: 'absolute',
          display: 'inline-block',
          background: barColor,
          opacity,
          width: (props.html?.length / props.maxLength) * 100 + '%',
          maxWidth: '100%',
          height: '100%',
        }}
      >
        <span
          css={theme => ({
            color: theme.colors.textOnDanger,
            lineHeight: '10px',
            position: 'absolute',
            left: '10%',
            top: 0,
          })}
        >
          {(props.html?.length / props.maxLength) * 100 >= 100 ? 'max length exceeded' : ''}
        </span>
      </span>
    </div>
  );
};

const ScrollMessageStyle = styled.div`
  &.message {
    flex: 1;
    transition: all 0.2s;
    opacity: 0;
    height: 0;

    div {
      background: #ffcf8f;
      text-align: center;
      font-weight: bold;
      font-size: 12px;
      width: 100%;
      height: 100%;
      border-radius: 0 0 3px 3px;
    }
  }

  &.message.show {
    opacity: 1;
    height: 21px;
  }
`;

const ScrollMessage = props => {
  const [message, setMessage] = useState(false);

  useEffect(() => {
    setMessage(true);
  }, [message]);

  const classes = ['message', message && 'show', props.scrollBottom && 'scroll-bottom'].filter(Boolean).join(' ');

  return (
    <ScrollMessageStyle className={classes}>
      <div>
        Scroll to see all content{' '}
        <span className='fa-layers'>
          <span
            css={[
              {
                opacity: 1,
                transition: 'opacity 0.2s',
              },
              props.scrollTop && {
                opacity: 0,
              },
            ]}
          >
            <Icon name='long-arrow-up-reg' />
          </span>
          <span
            css={[
              {
                opactiy: 1,
                transition: 'opacity 0.2s',
              },
              props.scrollBottom && {
                opacity: 0,
              },
            ]}
          >
            <Icon name='long-arrow-down-reg' />
          </span>
        </span>
      </div>
    </ScrollMessageStyle>
  );
};

const StatusBar = props => {
  const [showProgress, setShowProgress] = useState(false);

  const handleShowProgress = useCallback(show => {
    setShowProgress(show);
  }, []);

  return (
    <div
      css={theme => ({
        height: 22,
        lineHeight: '22px',
        fontSize: '10px',
        border: `1px solid ${theme.colors.richTextBorder}`,
        background: colorHelper(theme.colors.blockSectionHeader).rgba(0.2),
        borderRadius: '0 0 3px 3px',
        borderTop: 'none',
        display: 'flex',
      })}
    >
      {props.maxLength && (
        <div
          css={[
            {
              display: 'flex',
              alignItems: 'center',
              opacity: 0,
              width: 0,
              padding: 0,
              transition: 'all 0.3s',
            },
            showProgress && {
              opacity: 1,
              width: 150,
              padding: '0 12px',
            },
          ]}
        >
          <ProgressBar {...props} handleShowProgress={handleShowProgress} />
        </div>
      )}
      {!props.noScrollMessage && (
        <div css={{ flex: 1 }}>
          {props.hasScrolling && <ScrollMessage scrollTop={props.scrollTop} scrollBottom={props.scrollBottom} />}
        </div>
      )}
    </div>
  );
};

export default StatusBar;
