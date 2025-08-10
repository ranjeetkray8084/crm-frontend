import { Edit, MessageCircle, Eye, Trash2 } from 'lucide-react';
import ThreeDotMenu from '../../common/ThreeDotMenu';

const NoteActions = ({ note, onEdit, onDelete, onAddRemark, onViewRemarks }) => {
  return (
    <ThreeDotMenu
      item={note}
      actions={[
        { label: 'Edit Note', icon: <Edit size={16} />, onClick: () => onEdit(note.id) },
        { label: 'Add Remark', icon: <MessageCircle size={16} />, onClick: () => onAddRemark(note.id) },
        { label: 'View Remarks', icon: <Eye size={16} />, onClick: () => onViewRemarks(note.id) },
        { label: 'Delete Note', icon: <Trash2 size={16} />, onClick: () => onDelete(note.id), danger: true }
      ]}
    />
  );
};

export default NoteActions;
