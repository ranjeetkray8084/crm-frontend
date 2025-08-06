import React from 'react';
import NoteCard from './NoteCard';

const NoteCardList = ({
    notes = [],
    onEdit,
    onDelete,
    onUpdateStatus,
    onUpdatePriority,
    onAddRemark,
    onViewRemarks
}) => {
    return (
        <div className="space-y-4">
            {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-gray-500 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <svg
                        className="w-12 h-12 mb-2 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3 -3v6m-9 4.5a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21.75 18V6A2.25 2.25 0 0 0 19.5 3.75h-13.5A2.25 2.25 0 0 0 3.75 6v12z" />
                    </svg>
                    <p>No notes available.</p>
                </div>
            ) : (
                notes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onUpdateStatus={onUpdateStatus}
                        onUpdatePriority={onUpdatePriority}
                        onAddRemark={onAddRemark}
                        onViewRemarks={onViewRemarks}
                    />
                ))
            )}
        </div>
    );
};

export default NoteCardList;
