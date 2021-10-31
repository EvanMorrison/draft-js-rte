import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Style from './example.style';
import Toast from './index';
import Button from '../button';
import { isEmpty } from 'lodash';

const ToastExample = props => {
  const [toasts, setToasts] = useState(props.toasts ?? []);

  useEffect(() => {
    setToasts(props.toasts ?? []);
  }, [props.toasts]);

  const handleClickAddToast = () => {
    // this handles whether the component is being rendered in the demo app or in instascreen's theme examples
    if (typeof props.handleClickAddToast === 'function') {
      props.handleClickAddToast();
    } else {
      let type;
      const types = ['primary', 'info', 'success', 'warning', 'danger'];
      const path = window.location.pathname.split('/');
      let color = path.pop();
      if (types.includes(color)) {
        type = color.replace('danger', 'error');
      } else {
        color = path.pop();
        if (types.includes(color)) {
          type = color.replace('danger', 'error');
        }
      }

      setToasts(toasts => [
        ...toasts,
        {
          id: moment().valueOf(),
          type,
          message:
            'Toast notification color can be primary, success, info, warning, or danger depending on its purpose.',
          timeout: 4000,
        },
      ]);
    }
  };

  const handleEnter = id => {
    props.handleEnter?.(id);
  };

  const handleRemove = id => {
    props.handleRemove?.(id);
    if (!props.handleRemove) {
      setToasts(toasts => toasts.filter(t => t.id !== id));
    }
  };
  return (
    <>
      <Button onClick={handleClickAddToast}>New Toast</Button>
      {!isEmpty(toasts) && (
        <Style css={props.bottom ? { bottom: 50 } : { top: 50 }}>
          {props.bottom
            ? toasts
                .map(t => t)
                .reverse()
                .map(toast => <Toast key={toast.id} {...toast} onExit={handleRemove} onEnter={handleEnter} bottom />)
            : toasts.map(toast => <Toast key={toast.id} {...toast} onExit={handleRemove} onEnter={handleEnter} top />)}
        </Style>
      )}
    </>
  );
};

export default ToastExample;
