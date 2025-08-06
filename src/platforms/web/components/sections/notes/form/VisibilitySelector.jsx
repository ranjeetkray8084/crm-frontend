import React from 'react';

const visibilityOptions = {
    DIRECTOR: [
        { value: 'ONLY_ME', label: '🔒 Only Me' },
        { value: 'ALL_USERS', label: '👥 All Users' },
        { value: 'SPECIFIC_USERS', label: '👤 Specific Users' },
        { value: 'ALL_ADMIN', label: '🛡️ All Admins' },
        { value: 'SPECIFIC_ADMIN', label: '👨‍💼 Specific Admins' },
    ],
    ADMIN: [
        { value: 'ONLY_ME', label: '🔒 Only Me' },
        { value: 'ME_DIRECTOR', label: '🎯 Me and DIrector' },
        { value: 'ALL_USERS', label: '👥 All Users' },
        { value: 'SPECIFIC_USERS', label: '👤 Specific Users' }
    ],
    USER: [
        { value: 'ONLY_ME', label: '🔒 Only Me' },
        { value: 'ME_DIRECTOR', label: '🎯 Me and Director' },
        { value: 'ME_ADMIN', label: '🛡️ Me and Admin ' }
    ]
};

const VisibilitySelector = ({ role, value, onChange, disabled }) => {
    const options = visibilityOptions[role?.toUpperCase()] || [];

    return (
        <div className="space-y-2 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 transition-colors duration-200 hover:text-green-600">
                <svg className="w-4 h-4 text-green-500 transition-transform duration-200 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Visibility
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                disabled={disabled}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
};

export default VisibilitySelector;
