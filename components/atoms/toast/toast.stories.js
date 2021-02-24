import { storiesOf } from '@storybook/react';
import moment from 'moment';
import React, { useCallback, useState } from 'react';
import ToastExample from './example';
import Toast from './index';
import { boolean, number, object, text, select } from '@storybook/addon-knobs';

const Wrapper = props => {
  const [toasts, setToasts] = useState([]);

  const handleClickAddToast = () => {
    const id = moment().valueOf();
    const toast = { ...props, message: props.message ?? 'Toast!', id };
    if (toast.type === 'none') delete toast.type;

    let actions;
    if (props.actionCount === 1 && props.actionRequired) {
      actions = [{ label: 'OK' }];
    } else if (props.actionCount === 1) {
      actions = [{ label: 'Change Type', action: changeType }];
    }
    if (props.actionCount >= 2) {
      actions = [{ label: 'Cancel' }, { label: 'OK' }];
    }
    toast.actions = actions;
    if (actions?.length && toast.actionRequired) {
      setToasts(toasts => [...toasts.map(t => ({ ...t, timeout: 0 })), toast]);
    } else {
      setToasts(toasts => [...toasts, toast]);
    }
  };

  const handleEnter = id => {
    console.log('onEnter callback, toast added: id', id);
  };

  const handleRemove = useCallback(id => {
    setToasts(toasts => toasts.filter(t => t.id !== id));
  }, []);

  const changeType = id => {
    setToasts(toasts =>
      toasts.map(t => {
        if (id === t.id) {
          const types = ['primary', 'success', 'info', 'warning', 'error'];
          let index = types.findIndex(type => type === t.type);
          index = (index + 1) % 5;
          return { ...t, type: types[index] };
        }
        return t;
      })
    );
  };

  return (
    <ToastExample
      toasts={toasts}
      handleClickAddToast={handleClickAddToast}
      handleEnter={handleEnter}
      handleRemove={handleRemove}
      bottom={props.position === 'bottom'}
    />
  );
};

storiesOf('Atoms', module).add(
  'Toast',
  () => (
    <Wrapper
      message={text('message', 'Saved successfully.')}
      type={select('type', ['primary', 'success', 'info', 'warning', 'error'], 'primary')}
      timer={boolean('timer (both)', false)}
      timerBar={boolean('timerBar', false)}
      timerTime={boolean('timerTime', false)}
      actionCount={select('sample actions', [0, 1, 2], 0)}
      actions={object('sample actions prop', [
        {
          action: '() => {do something}',
          label: 'Accept',
        },
      ])}
      actionRequired={boolean('actionRequired', false)}
      timeout={number('timeout', 4000)}
      pauseOnHover={boolean('pauseOnHover', true)}
      enterInPlace={boolean('enterInPlace', false)}
      exitInPlace={boolean('exitInPlace', false)}
      dismissOnClick={boolean('dismissOnClick', false)}
      position={select('position', ['top', 'bottom'], 'top')}
    />
  ),
  {
    info: {
      propTables: [Toast],
      propTablesExclude: [ToastExample, Wrapper],
    },
  }
);
