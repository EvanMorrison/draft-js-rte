import React, { useEffect, useState } from 'react';
import Icon from '../../../atoms/icon';
import Style from './scrollMessage.style';

const ScrollMessage = props => {
  const [message, setMessage] = useState(false);

  useEffect(() => {
    setMessage(true);
  }, [message]);

  const classes = [
    'message',
    message && 'show',
    props.scrollBottom && 'scroll-bottom',
  ].filter(Boolean).join(' ');

  return (
    <Style className={classes}>
      <div>Scroll for more <Icon name="arrow-down-sld" /></div>
    </Style>
  );
};

export default ScrollMessage;
