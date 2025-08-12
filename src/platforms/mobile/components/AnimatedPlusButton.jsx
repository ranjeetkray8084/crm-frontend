import React, { useState } from 'react';
import './AnimatedPlusButton.css';

const AnimatedPlusButton = ({ onClick, size = 56, className = '' }) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(true);

        // Reset animation after it completes
        setTimeout(() => {
            setIsClicked(false);
        }, 300);

        // Call the provided onClick handler
        if (onClick) {
            onClick();
        }
    };

    return (
        <button
            className={`animated-plus-button ${isClicked ? 'clicked' : ''} ${className}`}
            onClick={handleClick}
            style={{ width: size, height: size }}
            aria-label="Add"
        >
            <div className="plus-icon">
                <span className="horizontal-line"></span>
                <span className="vertical-line"></span>
            </div>
        </button>
    );
};

export default AnimatedPlusButton;