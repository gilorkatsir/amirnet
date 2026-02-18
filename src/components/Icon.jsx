import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ name, size = 24, fill = false, style = {}, className = '' }) => (
    <span
        className={`material-symbols-outlined ${className}`}
        style={{
            fontSize: size,
            fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
            userSelect: 'none',
            ...style
        }}
    >
        {name}
    </span>
);

Icon.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
    fill: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string
};

export default Icon;
