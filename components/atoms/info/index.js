import PropTypes from 'prop-types';
import React from 'react';
import Style from './info.style';
import { isNil } from 'lodash';

const Info = ({ info }) => !isNil(info) && <Style className='info-note'>{info}</Style>;

Info.componentDescription = 'Information.';
Info.componentKey = 'info';
Info.componentName = 'Form field note';

Info.propTypes = {
  /** Content to display as info. */
  info: PropTypes.node,
};

export default Info;
