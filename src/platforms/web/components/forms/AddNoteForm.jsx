import React, { useState, useEffect } from 'react';


const NoteForm = ({ companyId, userId, createNote }) => {
    const [noteType, setNoteType] = useState('NOTE');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [visibility, setVisibility] = useState('ONLY_ME');
    const [priority, setPriority] = useState('PRIORITY_A');
    const [content, setContent] = useState('');
    const [specificUsers, setSpecificUsers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);

    useEffect(() => {
        if (visibility === 'SPECIFIC_USERS' || visibility === 'SPECIFIC_ADMIN') {
            const fetchUsers = async () => {
                try {
                    const res = await fetch(`/api/users/company/${companyId}`);
                    if (res.ok) {
                        const allUsers = await res.json();
                        const filteredUsers = allUsers.filter(u =>
                            visibility === 'SPECIFIC_USERS' ? u.role === 'USER' : u.role === 'ADMIN'
                        );
                        setAvailableUsers(filteredUsers);
                    }
                } catch (error) {
                    console.error("Failed to load users:", error);
                }
            };
            fetchUsers();
        }
    }, [visibility, companyId]);

    const handleUserSelection = (userId) => {
        setSpecificUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const noteData = {
            userId,
            type: noteType,
            content,
            dateTime: noteType === 'EVENT' ? `${eventDate}T${eventTime}:00` : null,
            visibility,
            visibleUserIds: specificUsers,
            priority,
        };
        await createNote(noteData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={noteType} onChange={(e) => setNoteType(e.target.value)} className="p-2 border rounded-md w-full">
                    <option value="NOTE">Note</option>
                    <option value="EVENT">Event</option>
                </select>

                {noteType === 'EVENT' && (
                    <div className="flex gap-2">
                        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="p-2 border rounded-md w-1/2" />
                        <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} required className="p-2 border rounded-md w-1/2" />
                    </div>
                )}

                <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="p-2 border rounded-md w-full">
                    <option value="ONLY_ME">Only Me</option>
                    <option value="ALL_USERS">All Users</option>
                    <option value="SPECIFIC_USERS">Specific Users</option>
                    <option value="SPECIFIC_ADMIN">Specific Admins</option>
                    <option value="ALL_ADMIN">All Admins</option>
                </select>

                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="p-2 border rounded-md w-full">
                    <option value="PRIORITY_A">Priority A</option>
                    <option value="PRIORITY_B">Priority B</option>
                    <option value="PRIORITY_C">Priority C</option>
                </select>
            </div>

            {(visibility === 'SPECIFIC_USERS' || visibility === 'SPECIFIC_ADMIN') && (
                <div className="p-2 border rounded-md max-h-40 overflow-y-auto">
                    <h3 className="font-semibold text-gray-700 mb-2">Select Users</h3>
                    {availableUsers.map(user => (
                        <div key={user.userId} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`user-${user.userId}`}
                                value={user.userId}
                                onChange={() => handleUserSelection(user.userId)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                            <label htmlFor={`user-${user.userId}`}>{user.name}</label>
                        </div>
                    ))}
                </div>
            )}

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                required
                className="p-2 border rounded-md w-full h-24"
            />

            <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700">
                Add Note
            </button>
        </form>
    );
};

export default NoteForm;
