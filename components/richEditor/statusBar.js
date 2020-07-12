import React from 'react';
import ScrollMessage from './toolbar/scrollMessage';
import { offColor as colorHelper } from 'off-color';

const ProgressBar = props => {
  return(
    <div css={{
      position: 'relative',
      marginLeft: 12,
      width: 100,
      height: 12,
      border: '1px solid #555',
      borderRadius: 3,
      background: '#fff',
    }}>
      <span css={theme => ({
        position: 'absolute',
        display: 'inline-block',
        background: theme.colors.success,
        width: (props.html.length / props.maxLength) * 100 + '%',
        height: '100%',
      })}>
      </span>
    </div>
  )
}

const StatusBar = props => {
  return(
    <div css={theme => ({
      height: 18,
      lineHeight: '18px',
      fontSize: '12px',
      padding: '0 12px',
      border: `1px solid ${theme.colors.richTextBorder}`,
      background: colorHelper(theme.colors.blockSectionHeader).rgba(0.2),
      borderRadius: '0 0 3px 3px',
      borderTop: 'none',
      display: 'flex',
    })}>
      <div css={theme => ({
        marginRight: 12,
        borderRight: `1px solid ${theme.colors.richTextBorder}`,
        paddingRight: 12,
        display: 'flex',
        alignItems: 'center',
      })}>
        Length - {props.html?.length ?? 0} total ({props.text?.length ?? 0} plaint text) 
        {props.maxLength && <ProgressBar {...props} />}
      </div>
      {!props.noScrollMessage && props.hasScrolling && <ScrollMessage scrollBottom={props.scrollBottom} />}
    </div>
  )
}

export default StatusBar;
