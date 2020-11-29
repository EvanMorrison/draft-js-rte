import React, { useState } from 'react';

const rows = Array(8).fill(1);
const grid = Array(8).fill([...rows]);

const TableGrid = props => {
  const [size, setSize] = useState({ cols: 0, rows: 0 });

  const handleHover = (i, j) => {
    setSize({ cols: j + 1, rows: i + 1 });
  };

  const handleSelect = () => {
    props.handleSubmit(size);
  };

  const grayCell = {
    border: '1px solid rgba(150, 150, 150, 1)',
    background: 'rgba(200, 200, 200, 0.4)',
  };

  const blueCell = {
    border: '1px solid rgba(0, 125, 250, 0.8)',
    background: 'rgba(0, 125, 250, 0.4)',
  };
  return (
    <div>
      <div css={{ margin: '10px 10px 5px' }}>
        {grid.map((row, i) => (
          <div
            key={i}
            css={{ display: 'flex', width: 136, justifyContent: 'space-between', padding: 1, cursor: 'pointer' }}
          >
            {row.map((cell, j) => {
              const isSelected = i <= size.rows - 1 && j <= size.cols - 1;
              return (
                <div
                  key={`${i}-${j}`}
                  css={[{ flex: '0 0 15px', height: 15 }, grayCell, isSelected && blueCell]}
                  onMouseEnter={() => handleHover(i, j)}
                  onClick={handleSelect}
                ></div>
              );
            })}
          </div>
        ))}
      </div>
      <div css={{ margin: 10, fontSize: 12 }}>
        Insert table size: {size.cols} x {size.rows}
      </div>
    </div>
  );
};

export default TableGrid;
