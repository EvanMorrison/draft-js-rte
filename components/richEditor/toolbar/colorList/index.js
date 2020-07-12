import React from 'react';
import Styled from './color.style';

const ColorPicker = props => {
  const { list, dropdownWidth } = props;
  const count = list.length;
  const styleProps = { count, dropdownWidth, columns: 5 };
  return (
    <Styled {...styleProps}>
      <div className='group'>
        <div className='heading'>TEXT</div>
        {list.slice(0, count / 2).map(c => (
          <div
            className='swatch'
            key={c.type}
            style={{ backgroundColor: c.display.name }}
            onClick={() => props.handleSubmit(c.type)}
          ></div>
        ))}
        <div className='reset' onClick={() => props.handleSubmit('color.unset')}>
          reset
        </div>
      </div>
      <div className='group'>
        <div className='heading'>BACKGROUND</div>
        {list.slice(count / 2).map(c => (
          <div
            className='swatch'
            key={c.type}
            style={{ backgroundColor: c.display.name }}
            onClick={() => props.handleSubmit(c.type)}
          ></div>
        ))}
        <div className='reset' onClick={() => props.handleSubmit('backgroundColor.unset')}>
          reset
        </div>
      </div>
    </Styled>
  );
};

export default ColorPicker;
